import { ChatOllama, OllamaEmbeddings, type ChatOllamaInput } from "@langchain/ollama";
import type { AiAdapter } from "../adapters";
import { getModels } from "./models";
import { env } from "$env/dynamic/private";

export const commonOllamaModelArgs: Partial<ChatOllamaInput> = {
  baseUrl: env.OLLAMA_URL,
  temperature: 0.7,
};

export const ollamaAdapter: AiAdapter = {
  getModels,
  getLLM: (modelName: string) => new ChatOllama({ ...commonOllamaModelArgs, model: modelName }),
  getEmbeddings: (modelName: string) =>
    new OllamaEmbeddings({ baseUrl: env.OLLAMA_URL, model: modelName }),
};
