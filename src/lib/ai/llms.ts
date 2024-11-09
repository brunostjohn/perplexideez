import { building } from "$app/environment";
import { env } from "$env/dynamic/private";
import { log } from "$lib/log";
import { ChatOllama, type ChatOllamaInput } from "@langchain/ollama";
import { Ollama } from "ollama";

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

export const llmEmoji = new ChatOllama({
  model: env.LLM_EMOJI_MODEL,
  ...commonModelArgs,
});

export const llmTitle = new ChatOllama({
  model: env.LLM_TITLE_MODEL,
  ...commonModelArgs,
});

export const ollama = new Ollama({
  host: env.OLLAMA_URL,
});

if (!building) {
  ollama
    .list()
    .then(({ models }) => {
      log.trace({ models }, "Fetched models from Ollama");
      const requiredModels = [
        env.LLM_SPEED_MODEL,
        env.LLM_BALANCED_MODEL,
        env.LLM_QUALITY_MODEL,
        env.LLM_EMOJI_MODEL,
        env.LLM_TITLE_MODEL,
      ];
      const missingModels = requiredModels.filter(
        (model) => !models.filter(({ name }) => name === model).length
      );
      if (missingModels.length) {
        log.error(
          { missingModels },
          "Missing models from Ollama, please pull them first. Exiting..."
        );
        process.exit(1);
      }
      log.info("All required models are available");
    })
    .catch(() => {
      log.error("Failed to fetch models from Ollama");
      process.exit(1);
    });
}
