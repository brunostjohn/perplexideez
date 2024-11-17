import { openai } from "./client";

export const getModels = async () => {
  const models = await openai!.models.list();

  return models.data.map(({ id }) => id);
};
