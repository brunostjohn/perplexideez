import { env } from "$env/dynamic/private";
import { OllamaEmbeddings } from "@langchain/ollama";

export const embeddings = new OllamaEmbeddings({
  baseUrl: env.OLLAMA_URL,
  model: env.LLM_EMBEDDINGS_MODEL,
});
