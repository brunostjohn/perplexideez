import { building } from "$app/environment";
import { env } from "$env/dynamic/private";
import { log } from "$lib/log";
import { ChatOllama, type ChatOllamaInput } from "@langchain/ollama";
import {
  ChatOpenAI,
  type ChatOpenAIFields,
  type ClientOptions,
  type LegacyOpenAIInput,
} from "@langchain/openai";
import { Ollama } from "ollama";

const commonOllamaModelArgs: Partial<ChatOllamaInput> = {
  baseUrl: env.OLLAMA_URL,
  temperature: 0.7,
};

const commonOpenAIModelArgs: Partial<ChatOpenAIFields> = {
  temperature: 0.7,
};

const commonOpenAIClientArgs: Partial<ClientOptions & LegacyOpenAIInput> = {
  baseURL: env.OPENAI_BASE_URL,
  apiKey: env.OPENAI_API_KEY,
};

const isOpenAI = env.LLM_MODE === "openai";

export const llmSpeed = isOpenAI
  ? new ChatOpenAI(
      {
        model: env.LLM_SPEED_MODEL,
        ...commonOpenAIModelArgs,
      },
      commonOpenAIClientArgs
    )
  : new ChatOllama({
      model: env.LLM_SPEED_MODEL,
      ...commonOllamaModelArgs,
    });

export const llmBalanced = isOpenAI
  ? new ChatOpenAI(
      {
        model: env.LLM_BALANCED_MODEL,
        ...commonOpenAIModelArgs,
      },
      commonOpenAIClientArgs
    )
  : new ChatOllama({
      model: env.LLM_BALANCED_MODEL,
      ...commonOllamaModelArgs,
    });

export const llmQuality = isOpenAI
  ? new ChatOpenAI(
      {
        model: env.LLM_QUALITY_MODEL,
        ...commonOpenAIModelArgs,
      },
      commonOpenAIClientArgs
    )
  : new ChatOllama({
      model: env.LLM_QUALITY_MODEL,
      ...commonOllamaModelArgs,
    });

export const llmEmoji = isOpenAI
  ? new ChatOpenAI(
      {
        model: env.LLM_EMOJI_MODEL,
        ...commonOpenAIModelArgs,
      },
      commonOpenAIClientArgs
    )
  : new ChatOllama({
      model: env.LLM_EMOJI_MODEL,
      ...commonOllamaModelArgs,
    });

export const llmTitle = isOpenAI
  ? new ChatOpenAI(
      {
        model: env.LLM_TITLE_MODEL,
        ...commonOpenAIModelArgs,
      },
      commonOpenAIClientArgs
    )
  : new ChatOllama({
      model: env.LLM_TITLE_MODEL,
      ...commonOllamaModelArgs,
    });

export const ollama = !isOpenAI
  ? new Ollama({
      host: env.OLLAMA_URL,
    })
  : null;

if (!building && isOpenAI) {
  log.info("Using OpenAI models");
}

if (!building && !isOpenAI) {
  ollama
    ?.list()
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
