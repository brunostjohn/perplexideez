import { env } from "$env/dynamic/private";
import { OllamaEmbeddings } from "@langchain/ollama";
import { OpenAIEmbeddings } from "@langchain/openai";

const isOpenAI = env.LLM_MODE === "openai";

export const embeddings = isOpenAI
  ? new OpenAIEmbeddings(
      {
        model: env.LLM_EMBEDDINGS_MODEL,
      },
      {
        baseURL: env.OPENAI_BASE_URL,
        apiKey: env.OPENAI_API_KEY,
      }
    )
  : new OllamaEmbeddings({
      baseUrl: env.OLLAMA_URL,
      model: env.LLM_EMBEDDINGS_MODEL,
    });
