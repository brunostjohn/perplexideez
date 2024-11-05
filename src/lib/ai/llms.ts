import { env } from "$env/dynamic/private";
import { ChatOllama, type ChatOllamaInput } from "@langchain/ollama";

const commonModelArgs: Partial<ChatOllamaInput> = {
  baseUrl: env.OLLAMA_URL,
  temperature: 0.7,
};

export const llmSpeed = new ChatOllama({
  model: env.LLM_SPEED_MODEL,
  ...commonModelArgs,
});

export const llmBalanced = new ChatOllama({
  model: env.LLM_BALANCED_MODEL,
  ...commonModelArgs,
});

export const llmQuality = new ChatOllama({
  model: env.LLM_QUALITY_MODEL,
  ...commonModelArgs,
});
