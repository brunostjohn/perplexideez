import { db } from "$lib/db";
import { error } from "@sveltejs/kit";
import * as Prisma from "@prisma/client";
import { basicWebSearch, generateEmoji, generateSuggestions, generateTitle } from "$lib/ai/agents";
import { embeddings } from "$lib/ai/embedding";
import { llmBalanced, llmQuality, llmSpeed } from "$lib/ai/llms";
import type { ChatOllama } from "@langchain/ollama";
import { AIMessage, BaseMessage, HumanMessage } from "@langchain/core/messages";
import ogs from "open-graph-scraper";

export const POST = async ({ locals: { auth }, params: { id } }) => {
  const session = await auth();
  if (!session || !session.user) return error(401, "Unauthorized");

  const chat = await db.chat.findFirst({
    where: {
      id,
      userId: session.user.id,
    },
    include: {
      messages: true,
    },
  });
  console.log(chat);
  if (!chat) return error(404, "Chat not found");

  const { messages, focusMode } = chat;
  const lastMessage = messages[messages.length - 1];

  if (!lastMessage) return error(400, "No messages in chat");
  if (messages.find(({ role, pending }) => role === Prisma.ChatRole.Assistant && pending)) {
    await db.message.deleteMany({
      where: {
        chatId: chat.id,
        role: Prisma.ChatRole.Assistant,
        pending: true,
        id: {
          not: lastMessage.id,
        },
      },
    });
  }

  if (lastMessage.role === "Assistant" && !lastMessage.pending)
    return error(400, "Assistant already sent a message");

  const [llmType, llm] = dispatchLLM(chat.modelType);
  const messageHistory = messages
    .filter(({ content }) => content)
    .map(({ role, content }) =>
      role === Prisma.ChatRole.User
        ? new HumanMessage({ content: content! })
        : new AIMessage({ content: content! })
    );
  const lastUserMessage = messages.filter(({ role }) => role === Prisma.ChatRole.User).pop();
  const events = await dispatchStream(
    focusMode,
    messageHistory,
    llm,
    lastUserMessage!.content!,
    llmType
  );

  let fullMessage = "";
  const newMessage = await db.message.create({
    data: {
      chatId: chat.id,
      role: Prisma.ChatRole.Assistant,
      pending: true,
    },
  });

  const stream = new ReadableStream({
    start: (controller) => {
      events.on("data", (data) => {
        if (data.type === "response") {
          controller.enqueue(JSON.stringify(data));
          fullMessage += data.data;
        }
        if (data.type === "sources") {
          handleSources(data, newMessage.id)
            .then(() => controller.enqueue(JSON.stringify({ type: "doneSources", data: "" })))
            .catch(console.error);
        }
      });
      events.on("error", (error) => {
        controller.error(JSON.stringify(error));
      });
      events.on("done", async (data) => {
        if (data.type === "response") {
          await db.message.update({
            where: {
              id: newMessage.id,
            },
            data: {
              content: fullMessage,
              pending: false,
            },
          });

          const messages = await db.message.findMany({
            where: {
              chatId: chat.id,
            },
            orderBy: {
              createdAt: "desc",
            },
          });

          console.log("Generating suggestions");
          const suggestions = await generateSuggestions(
            {
              chat_history: messages
                .filter(({ content }) => content)
                .map(({ role, content }) =>
                  role === Prisma.ChatRole.User
                    ? new HumanMessage({ content: content! })
                    : new AIMessage({ content: content! })
                ),
            },
            llm
          );
          console.log("Suggestions:", suggestions);
          await db.message.update({
            where: {
              id: newMessage.id,
            },
            data: {
              suggestions,
            },
          });

          console.log("Generating title and emoji");
          // it's for sure defined atp
          const titleInContext = await generateTitle(llm, lastUserMessage!.content!, fullMessage);
          console.log("Title in context:", titleInContext);
          const title = titleInContext.split("<title>")[1]?.split("</title>")[0];
          console.log("Title:", title);
          const emojiInContext = title ? await generateEmoji(llm, title) : null;
          console.log("Emoji in context:", emojiInContext);
          const emoji = emojiInContext?.split("<emoji>")[1]?.split("</emoji>")[0];
          console.log("Emoji:", emoji);
          await db.chat.update({
            where: {
              id: chat.id,
            },
            data: {
              title,
              emoji,
            },
          });
        }
      });
    },
    cancel: () => {
      events.removeAllListeners();
    },
  });

  return new Response(stream, {
    headers: {
      "content-type": "text/event-stream",
    },
  });
};

const handleSources = async ({ data: sources }: Sources, messageId: string) => {
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
  llm: ChatOllama,
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
