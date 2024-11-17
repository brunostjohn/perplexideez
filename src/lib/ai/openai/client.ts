import { env } from "$env/dynamic/private";
import OpenAI from "openai";
import { isOpenAI } from "$lib/ai/adapters";
import { building } from "$app/environment";
import { log } from "$lib/log";

if (!building && isOpenAI && (!env.OPENAI_API_KEY || !env.OPENAI_BASE_URL)) {
  log.error("Missing required OpenAI API key or base URL, please set them in the environment.");
}

export const openai = isOpenAI
  ? new OpenAI({
      apiKey: env.OPENAI_API_KEY,
      baseURL: env.OPENAI_BASE_URL,
    })
  : null;
