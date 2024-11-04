import { svelteQueryWrapper } from "trpc-svelte-query-adapter";
import type { QueryClient } from "@tanstack/svelte-query";
import type { Router } from "./router";
import { createTRPCClient, type TRPCClientInit } from "trpc-sveltekit";
import { browser } from "$app/environment";

let browserClient: ReturnType<typeof svelteQueryWrapper<Router>>;

export function trpc(init?: TRPCClientInit, queryClient?: QueryClient) {
  if (browser && browserClient) return browserClient;
  if (!browser) return;
  const client = svelteQueryWrapper<Router>({
    client: createTRPCClient<Router>({ init }),
    queryClient,
  });
  if (browser) browserClient = client;
  return client;
}
