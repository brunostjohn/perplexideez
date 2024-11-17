import { env } from "$env/dynamic/private";

export const isOpenAI = env.LLM_MODE === "openai";
