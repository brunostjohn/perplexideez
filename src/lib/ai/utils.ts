// @ts-expect-error - no types
import dot from "compute-dot";
import cosineSimilarity from "compute-cosine-similarity";
import type { BaseMessage } from "@langchain/core/messages";
import { env } from "$env/dynamic/private";

export const computeSimilarity = (x: number[], y: number[]) => {
  const similarityMeasure = env.SIMILARITY_MEASURE ?? "cosine";

  if (similarityMeasure === "cosine") return cosineSimilarity(x, y);

  if (similarityMeasure === "dot") return dot(x, y);

  throw new Error("Invalid similarity measure");
};

export const formatChatHistoryAsString = (history: BaseMessage[]) =>
  history.map((message) => `${message._getType()}: ${message.content}`).join("\n");
