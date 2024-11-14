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

const createLLM = (model: string) =>
  isOpenAI
    ? new ChatOpenAI(
        {
          model,
          ...commonOpenAIModelArgs,
        },
        commonOpenAIClientArgs
      )
    : new ChatOllama({
        model,
        ...commonOllamaModelArgs,
      });

if (
  !building &&
  (!env.LLM_SPEED_MODEL ||
    !env.LLM_BALANCED_MODEL ||
    !env.LLM_QUALITY_MODEL ||
    !env.LLM_EMOJI_MODEL ||
    !env.LLM_TITLE_MODEL ||
    !env.LLM_IMAGE_SEARCH_MODEL ||
    !env.LLM_VIDEO_SEARCH_MODEL)
) {
  log.error("Missing required LLM models, please set them in the environment. Exiting...");
  process.exit(1);
}

export const llmSpeed = createLLM(env.LLM_SPEED_MODEL);
export const llmBalanced = createLLM(env.LLM_BALANCED_MODEL);
export const llmQuality = createLLM(env.LLM_QUALITY_MODEL);
export const llmEmoji = createLLM(env.LLM_EMOJI_MODEL);
export const llmTitle = createLLM(env.LLM_TITLE_MODEL);
export const llmImageSearch = createLLM(env.LLM_IMAGE_SEARCH_MODEL);
export const llmVideoSearch = createLLM(env.LLM_VIDEO_SEARCH_MODEL);

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
        env.LLM_IMAGE_SEARCH_MODEL,
        env.LLM_VIDEO_SEARCH_MODEL,
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
