import type { BaseMessage } from "@langchain/core/messages";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { RunnableLambda, RunnableMap, RunnableSequence } from "@langchain/core/runnables";
import type { ChatOllama } from "@langchain/ollama";
import type { ChatOpenAI } from "@langchain/openai";
import { formatChatHistoryAsString } from "../utils";
import { PromptTemplate } from "@langchain/core/prompts";
import { searchSearxng } from "$lib/searxng";

const stringParser = new StringOutputParser();

export const handleImageSearch = async (
  input: ImageSearchChainInput,
  llm: ChatOpenAI | ChatOllama
) => createImageSearchChain(llm).invoke(input);

interface ImageSearchChainInput {
  chat_history: BaseMessage[];
  query: string;
}

const createImageSearchChain = (llm: ChatOpenAI | ChatOllama) =>
  RunnableSequence.from([
    RunnableMap.from({
      chat_history: ({ chat_history }: ImageSearchChainInput) =>
        formatChatHistoryAsString(chat_history),
      query: ({ query }: ImageSearchChainInput) => query,
    }),
    PromptTemplate.fromTemplate(imageSearchChainPrompt),
    llm,
    stringParser,
    RunnableLambda.from(async (input: string) => {
      const res = await searchSearxng(input, {
        engines: ["bing images", "google images"],
      });
      const images = res.results
        .map(({ img_src, url, title, thumbnail_src, content }) => {
          if (!(img_src && url && title && thumbnail_src && content)) return null;

          return {
            img_src,
            url,
            title,
            thumbnail_src,
            content,
          };
        })
        .filter(Boolean);

      return images.slice(0, 10);
    }),
  ]);

const imageSearchChainPrompt = `
You will be given a conversation below and a follow up question. You need to rephrase the follow-up question so it is a standalone question that can be used by the LLM to search the web for images.
You need to make sure the rephrased question agrees with the conversation and is relevant to the conversation.

Example:
1. Follow up question: What is a cat?
Rephrased: A cat

2. Follow up question: What is a car? How does it works?
Rephrased: Car working

3. Follow up question: How does an AC work?
Rephrased: AC working

Conversation:
{chat_history}

Follow up question: {query}
Rephrased question:
`;
