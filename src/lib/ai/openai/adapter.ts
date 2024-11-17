import {
  ChatOpenAI,
  OpenAIEmbeddings,
  type ChatOpenAIFields,
  type ClientOptions,
  type LegacyOpenAIInput,
} from "@langchain/openai";
import type { AiAdapter } from "../adapters";
import { getModels } from "./models";
import { env } from "$env/dynamic/private";

export const commonOpenAIModelArgs: Partial<ChatOpenAIFields> = {
  temperature: 0.7,
};

export const commonOpenAIClientArgs: Partial<ClientOptions & LegacyOpenAIInput> = {
  baseURL: env.OPENAI_BASE_URL,
  apiKey: env.OPENAI_API_KEY,
};

export const openAiAdapter: AiAdapter = {
  getModels,
  getLLM: (modelName: string) =>
    new ChatOpenAI({ ...commonOpenAIModelArgs, model: modelName }, commonOpenAIClientArgs),
  getEmbeddings: (modelName: string) =>
    new OpenAIEmbeddings({ ...commonOpenAIModelArgs, model: modelName }, commonOpenAIClientArgs),
};
