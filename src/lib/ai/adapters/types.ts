import type { ChatOllama, OllamaEmbeddings } from "@langchain/ollama";
import type { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";

export interface AiAdapter {
  getModels(): Promise<string[]>;
  getLLM(modelName: string): ChatOpenAI | ChatOllama;
  getEmbeddings(modelName: string): OllamaEmbeddings | OpenAIEmbeddings;
}
