import { db } from "$lib/db";
import { error } from "@sveltejs/kit";
import * as Prisma from "@prisma/client";
import {
  basicWebSearch,
  generateEmoji,
  generateSuggestions,
  generateTitle,
  handleImageSearch,
  handleVideoSearch,
} from "$lib/ai/agents";
import { embeddings } from "$lib/ai/embedding";
import { llmBalanced, llmEmoji, llmQuality, llmSpeed, llmTitle } from "$lib/ai/llms";
import type { ChatOllama } from "@langchain/ollama";
import { AIMessage, type BaseMessage, HumanMessage } from "@langchain/core/messages";
import ogs from "open-graph-scraper";
import { log } from "$lib/log";
import type { ChatOpenAI } from "@langchain/openai";

export const POST = async ({ locals: { auth }, params: { id } }) => {
  const session = await auth();
  if (!session || !session.user) return error(401, "Unauthorized");

  const chat = await db.chat.findFirst({
    where: {
      id,
      userId: session.user.id,
    },
    include: {
      messages: { orderBy: { createdAt: "asc" } },
      imageResults: true,
      videoResults: true,
    },
  });

  log.trace(chat, "streaming chat");
  if (!chat) return error(404, "Chat not found");

  const { messages, focusMode } = chat;
  const lastMessage = messages[messages.length - 1];

  if (!lastMessage) return error(400, "No messages in chat");

  await handleDanglingMessages(messages, chat.id, lastMessage.id);

  if (lastMessage.role === "Assistant" && !lastMessage.pending)
    return error(400, "Assistant already sent a message");

  const { llmType, llm, messageHistory, lastUserMessage } = await prepareStream(chat, messages);

  try {
    const stream = await createLLMStream(
      focusMode,
      messageHistory,
      llm,
      lastUserMessage,
      llmType,
      chat,
      messages
    );

    return new Response(stream, {
      headers: {
        "content-type": "text/event-stream",
      },
    });
  } catch (e) {
    log.error(e, "Failed to create stream");
    return error(500, "Failed to create stream");
  }
};

const prepareStream = async (chat: Prisma.Chat, messages: Prisma.Message[]) => {
  const [llmType, llm] = dispatchLLM(chat.modelType);
  log.debug({ llmType, chatId: chat.id }, "Dispatching LLM");
  const messageHistory = createBaseMessageFromDbChat(messages);
  const lastUserMessage = messages.filter(({ role }) => role === Prisma.ChatRole.User).pop();
  log.trace({ lastUserMessage }, "Last user message");

  return { llmType, llm, messageHistory, lastUserMessage };
};

const createLLMStream = async (
  focusMode: Prisma.FocusMode,
  messageHistory: BaseMessage[],
  llm: ChatOllama | ChatOpenAI,
  lastUserMessage: Prisma.Message | undefined,
  llmType: "speed" | "balanced" | "quality",
  chat: Prisma.Chat,
  messages: Prisma.Message[]
) => {
  log.debug({ chatId: chat.id }, "Dispatching stream");
  const events = await dispatchStream(
    focusMode,
    messageHistory,
    llm,
    lastUserMessage!.content!,
    llmType
  );

  let fullMessage = "";
  log.trace({ chatId: chat.id }, "Creating new message");
  const newMessage = await db.message.create({
    data: {
      chatId: chat.id,
      role: Prisma.ChatRole.Assistant,
      pending: true,
      aiModel: llm.model,
    },
  });

  log.debug({ aiModel: llm.model, chatId: chat.id }, "Sending message to LLM");

  return new ReadableStream({
    start: (controller) => {
      events.on("data", (data) =>
        handleResponseData(
          data,
          controller,
          newMessage.id,
          (stringAppend) => (fullMessage += stringAppend)
        )
      );
      events.on("error", (error) => {
        controller.error(JSON.stringify(error) + "\n");
      });
      events.on("done", async (data) =>
        handleDoneResponse(
          data,
          newMessage.id,
          messages,
          llm,
          controller,
          fullMessage,
          chat.id,
          lastUserMessage!.content!
        )
      );
    },
    cancel: () => {
      events.removeAllListeners();
    },
  });
};

const handleResponseData = (
  data: any,
  controller: ReadableStreamDefaultController,
  newMessageId: string,
  appendCb: (stringAppend: string) => void
) => {
  if (data.type === "response") {
    controller.enqueue(JSON.stringify(data) + "\n");
    appendCb(data.data);
  }
  if (data.type === "sources") {
    handleSources(data, newMessageId)
      .then(() => controller.enqueue(JSON.stringify({ type: "doneSources" }) + "\n"))
      .catch(console.error);
  }
};

const handleDoneResponse = async (
  data: any,
  newMessageId: string,
  savedMessages: Prisma.Message[],
  llm: ChatOllama | ChatOpenAI,
  controller: ReadableStreamDefaultController,
  fullMessage: string,
  chatId: string,
  lastUserMessageContent: string
) => {
  if (data.type === "response") {
    const savedMessages = await handleEndResponse(controller, newMessageId, chatId, fullMessage);
    const baseMessages = createBaseMessageFromDbChat(savedMessages);

    await handleSuggestions(chatId, newMessageId, llm, baseMessages);
    await handleTitleEmojis(newMessageId, lastUserMessageContent, fullMessage, chatId, controller);
    await handleImages(newMessageId, chatId, lastUserMessageContent, llm, baseMessages);
    await handleVideos(newMessageId, chatId, lastUserMessageContent, llm, baseMessages);

    controller.close();
  }
};

const handleDanglingMessages = async (
  messages: Prisma.Message[],
  chatId: string,
  lastMessageId: string
) => {
  if (messages.find(({ role, pending }) => role === Prisma.ChatRole.Assistant && pending)) {
    await db.message.deleteMany({
      where: {
        chatId: chatId,
        role: Prisma.ChatRole.Assistant,
        pending: true,
        id: {
          not: lastMessageId,
        },
      },
    });
    log.debug({ chatId: chatId }, "Deleted dangling pending assistant messages");
  }
};

const handleEndResponse = async (
  controller: ReadableStreamDefaultController,
  newMessageId: string,
  chatId: string,
  fullMessage: string
) => {
  controller.enqueue(JSON.stringify({ type: "doneResponse" }) + "\n");
  log.debug({ messageId: newMessageId }, "Updating message with generated content");
  await db.message.update({
    where: {
      id: newMessageId,
    },
    data: {
      content: fullMessage,
      pending: false,
    },
  });

  const messages = await db.message.findMany({
    where: {
      chatId: chatId,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  return messages;
};

const handleSuggestions = async (
  chatId: string,
  newMessageId: string,
  llm: ChatOllama | ChatOpenAI,
  latestMessages: BaseMessage[]
) => {
  log.debug({ chatId: chatId }, "Generating follow-up suggestions");
  const suggestions = await generateSuggestions(
    {
      chat_history: latestMessages,
    },
    llm
  );
  log.trace(suggestions, "Generated follow-up suggestions");
  await db.message.update({
    where: {
      id: newMessageId,
    },
    data: {
      suggestions,
    },
  });
};

const handleTitleEmojis = async (
  newMessageId: string,
  lastUserMessageContent: string,
  fullMessage: string,
  chatId: string,
  controller: ReadableStreamDefaultController
) => {
  const title = await handleTitle(newMessageId, lastUserMessageContent, fullMessage);
  const emojiInContext = title ? await generateEmoji(llmEmoji, title) : undefined;
  log.trace({ emojiInContext, lengthEmojiInContext: emojiInContext?.length }, "Emoji in context");
  const emojiSeparated = emojiInContext?.split("<emoji>")[1]?.split("</emoji>")[0];
  const emoji = emojiInContext?.length === 1 ? emojiInContext : emojiSeparated;
  log.trace({ emoji }, "Extracted emoji");
  await db.chat.update({
    where: {
      id: chatId,
    },
    data: {
      title: title?.replaceAll("\n", ""),
      emoji: emoji?.replaceAll("\n", ""),
    },
  });

  log.debug({ messageId: newMessageId }, "Generated title and emoji");
  controller.enqueue(JSON.stringify({ type: "doneTitleEmoji" }) + "\n");
};

const createBaseMessageFromDbChat = (messages: Prisma.Message[]) =>
  messages.map(({ role, content }) =>
    role === Prisma.ChatRole.User
      ? new HumanMessage({ content: content! })
      : new AIMessage({ content: content! })
  );

const handleVideos = async (
  newMessageId: string,
  chatId: string,
  lastMessageContent: string,
  llm: ChatOllama | ChatOpenAI,
  chatHistory: BaseMessage[]
) => {
  const videoResultCount = await db.videoResult.count({
    where: {
      chatId: chatId,
    },
  });

  if (videoResultCount > 0) {
    log.debug({ messageId: newMessageId }, "Videos already exist");
    return;
  }

  log.debug({ messageId: newMessageId }, "Searching for videos");
  const videos = await handleVideoSearch({
    chat_history: chatHistory,
    query: lastMessageContent,
  });
  log.trace(videos, "Videos");
  const normalisedVideos = videos
    .filter((video) => video)
    // @ts-expect-error - this must exist by now
    .map(({ thumbnail_src, iframe_src, length, views, title, url }) => ({
      thumbnailUrl: thumbnail_src,
      iframeSrc: iframe_src,
      length,
      views,
      title,
      url,
      chatId: chatId,
    }));
  log.trace(normalisedVideos, "Normalised videos");
  await db.videoResult.createMany({ data: normalisedVideos });
  log.debug({ messageId: newMessageId }, "Finished searching for videos");
};

const handleImages = async (
  newMessageId: string,
  chatId: string,
  lastMessageContent: string,
  llm: ChatOllama | ChatOpenAI,
  chatHistory: BaseMessage[]
) => {
  const imageResponseCount = await db.imageResult.count({
    where: {
      chatId: chatId,
    },
  });

  if (imageResponseCount > 0) {
    log.debug({ messageId: newMessageId }, "Images already exist");
    return;
  }

  log.debug({ messageId: newMessageId }, "Searching for images");
  const images = await handleImageSearch({
    chat_history: chatHistory,
    query: lastMessageContent,
  });
  log.trace(images, "Images");
  const normalisedImages = images
    .filter((image) => image)
    // @ts-expect-error - this must exist by now
    .map(({ img_src, url, title, thumbnail_src, content }) => ({
      title,
      url,
      imageUrl: img_src,
      thumbnailUrl: thumbnail_src,
      content,
      chatId: chatId,
    }));
  log.trace(normalisedImages, "Normalised images");
  await db.imageResult.createMany({ data: normalisedImages });
  log.debug({ messageId: newMessageId }, "Finished searching for images");
};

const handleTitle = async (
  newMessageId: string,
  lastUserMessageContent: string,
  fullMessage: string
) => {
  log.debug({ messageId: newMessageId }, "Generating title");
  const titleInContext = await generateTitle(llmTitle, lastUserMessageContent, fullMessage);
  log.trace({ titleInContext }, "Title in context");
  const title = titleInContext.split("<title>")[1]?.split("</title>")[0];
  log.trace({ title }, "Extracted title");
  return title;
};

const handleSources = async ({ data: sources }: Sources, messageId: string) => {
  log.debug({ messageId }, "Handling sources");
  const sourcesNormalised = await Promise.all(
    sources.map(async ({ pageContent, metadata: { title, url } }, i) => {
      try {
        const ogData = await ogs({
          url,
        });

        if (!ogData.result.success) {
          return {
            pageContent,
            title,
            url,
            messageId,
            originalIndex: i,
          };
        }

        let imageUrl = ogData.result.ogImage?.filter((image) => image.url)[0]?.url;
        if (imageUrl?.startsWith("/")) imageUrl = new URL(url).origin + imageUrl;
        const faviconUrl = `https://t0.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${encodeURIComponent(
          url
        )}&size=256`;

        return {
          pageContent,
          title,
          url,
          messageId,
          originalIndex: i,
          imageUrl,
          faviconUrl,
        };
      } catch {
        log.error({ url, title }, "Failed to fetch OpenGraph data for source");
        return {
          pageContent,
          title,
          url,
          messageId,
          originalIndex: i,
        };
      }
    })
  );

  await db.source.createMany({
    data: sourcesNormalised,
  });
};

const dispatchLLM = (modelType: Prisma.ModelType) => {
  switch (modelType) {
    case Prisma.ModelType.Speed:
      return ["speed", llmSpeed] as const;
    case Prisma.ModelType.Balanced:
      return ["balanced", llmBalanced] as const;
    case Prisma.ModelType.Quality:
      return ["quality", llmQuality] as const;
  }

  throw new Error("Invalid model type");
};

interface BaseResponse<T> {
  type: "response" | "sources" | "done";
  data: T;
}

interface ResponseChunk extends BaseResponse<string> {
  type: "response";
  data: string;
}

interface Source {
  pageContent: string;
  metadata: {
    title: string;
    url: string;
  };
}

interface Sources extends BaseResponse<Source[]> {
  type: "sources";
  data: Source[];
}

const dispatchStream = async (
  focusMode: Prisma.FocusMode,
  messageHistory: BaseMessage[],
  llm: ChatOllama | ChatOpenAI,
  query: string,
  llmType: "speed" | "balanced" | "quality"
) => {
  switch (focusMode) {
    case Prisma.FocusMode.All: {
      return basicWebSearch(query, messageHistory, llm, embeddings, llmType);
    }
    default: {
      throw new Error("Invalid focus mode");
    }
  }
};
