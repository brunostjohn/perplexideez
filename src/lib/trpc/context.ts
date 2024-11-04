import type { RequestEvent } from "@sveltejs/kit";

export async function createContext(event: RequestEvent) {
  return {
    event,
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
