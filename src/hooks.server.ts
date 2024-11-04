import type { Handle } from "@sveltejs/kit";
import { sequence } from "@sveltejs/kit/hooks";
import { svelteKitHandler } from "better-auth/svelte-kit";
import { auth } from "$lib/auth";
import { createTRPCHandle } from "trpc-sveltekit";
import { router } from "$lib/trpc/router";
import { createContext } from "$lib/trpc/context";

export const handle: Handle = sequence(
  createTRPCHandle({ router, createContext }),
  async ({ event, resolve }) => svelteKitHandler({ event, resolve, auth })
);
