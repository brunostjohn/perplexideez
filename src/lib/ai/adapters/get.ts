import { env } from "$env/dynamic/private";
import { db } from "$lib/db";
import { ollamaAdapter } from "../ollama";
import { openAiAdapter } from "../openai";
import { isOpenAI } from "./checks";

export const getActiveAdapter = () => (isOpenAI ? openAiAdapter : ollamaAdapter);

export const getModelNameFromKey = async (key: string, prefix?: string) => {
  const correctedKey = `${prefix ? `${prefix}_` : ""}${key.toUpperCase()}_MODEL`;
  const envKey = env[correctedKey];
  const { value } =
    (await db.configuration.findFirst({
      where: {
        key: correctedKey,
      },
    })) ?? {};

  if (!value && !envKey) {
    throw new Error(`Model ${key} not found`);
  }

  return (value ?? envKey) as string;
};

export const getLLMForKey = async (key: string) => {
  const modelName = await getModelNameFromKey(key, "LLM");
  return getActiveAdapter().getLLM(modelName);
};

export const getEmbeddingsForKey = async (key: string) => {
  const modelName = await getModelNameFromKey(key, "TEXT_EMBEDDINGS");
  return getActiveAdapter().getEmbeddings(modelName);
};
