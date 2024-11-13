import type { BaseMessage } from "@langchain/core/messages";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { RunnableLambda, RunnableMap, RunnableSequence } from "@langchain/core/runnables";
import type { ChatOllama } from "@langchain/ollama";
import type { ChatOpenAI } from "@langchain/openai";
import { formatChatHistoryAsString } from "../utils";
import { PromptTemplate } from "@langchain/core/prompts";
import { searchSearxng } from "$lib/searxng";
import { log } from "$lib/log";
import { llmVideoSearch } from "../llms";

interface VideoSearchChainInput {
  chat_history: BaseMessage[];
  query: string;
}

const stringParser = new StringOutputParser();

export const handleVideoSearch = async (input: VideoSearchChainInput) =>
  createVideoSearchChain(llmVideoSearch).invoke(input);

const createVideoSearchChain = (llm: ChatOpenAI | ChatOllama) => {
  llm.temperature = 0;
  return RunnableSequence.from([
    RunnableMap.from({
      chat_history: ({ chat_history }: VideoSearchChainInput) =>
        formatChatHistoryAsString(chat_history),
      query: ({ query }: VideoSearchChainInput) => query,
    }),
    PromptTemplate.fromTemplate(VideoSearchChainPrompt),
    llm,
    stringParser,
    RunnableLambda.from(async (input: string) => {
      log.trace({ input }, "Searching videos");
      const res = await searchSearxng(input, {
        engines: ["youtube"],
      });

      const results = res.results
        .map(({ thumbnail_src, iframe_src, length, views, title, url }) => {
          if (!(thumbnail_src && iframe_src && title && url)) return null;

          return {
            thumbnail_src,
            iframe_src,
            length,
            views,
            title,
            url,
          };
        })
        .filter(Boolean);

      return results.slice(0, 10);
    }),
  ]);
};

const VideoSearchChainPrompt = `
You will be given a conversation below and a follow up question. You need to rephrase the follow-up question so it is a standalone question that can be used by the LLM to search Youtube for videos.
You need to make sure the rephrased question agrees with the conversation and is relevant to the conversation. Say only the rephrased question. Do not include the conversation in your response. Do not include any other information in your response. Only the rephrased question.

Example:
1. Follow up question: How does a car work?
Rephrased: How does a car work?

2. Follow up question: What is the theory of relativity?
Rephrased: What is theory of relativity

3. Follow up question: How does an AC work?
Rephrased: How does an AC work

Conversation:
{chat_history}

Follow up question: {query}
Rephrased question:
`;
