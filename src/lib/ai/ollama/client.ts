import { Ollama } from "ollama";
import { env } from "$env/dynamic/private";
import { building } from "$app/environment";
import { log } from "$lib/log";
import { isOpenAI } from "$lib/ai/adapters";

if (!building && !isOpenAI && !env.OLLAMA_URL) {
  log.error("Missing required Ollama URL, please set it in the environment.");
}

export const ollama = !isOpenAI
  ? new Ollama({
      host: env.OLLAMA_URL,
    })
  : null;
