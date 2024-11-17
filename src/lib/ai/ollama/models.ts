import { ollama } from "./client";

export const getModels = async () => {
  const models = await ollama!.list();

  return models.models.map(({ name }) => name);
};
