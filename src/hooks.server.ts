import { redirect, type Handle } from "@sveltejs/kit";
import { sequence } from "@sveltejs/kit/hooks";
import { handle as handleAuth } from "$lib/auth";
import { createTRPCHandle } from "trpc-sveltekit";
import { router } from "$lib/trpc/router";
import { createContext } from "$lib/trpc/context";

const ALLOWED_UNAUTHENTICATED_PATHS = ["/auth", "/api/auth"];

export const handle: Handle = sequence(
  handleAuth,
  createTRPCHandle({ router, createContext }),
  async ({ event, resolve }) => {
    const {
      url: { pathname },
      locals: { auth },
    } = event;

    const session = await auth();

    if (session) {
      return resolve(event);
    }

    if (ALLOWED_UNAUTHENTICATED_PATHS.some((path) => pathname.startsWith(path))) {
      return resolve(event);
    }

    if (pathname === "/") {
      return redirect(307, "/auth");
    }

    return redirect(307, `/auth?redirect=${encodeURIComponent(pathname)}&protected=true`);
  }
);
