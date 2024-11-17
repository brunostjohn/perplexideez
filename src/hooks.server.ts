import { redirect, type Handle } from "@sveltejs/kit";
import { sequence } from "@sveltejs/kit/hooks";
import { handle as handleAuth } from "$lib/auth";
import { createTRPCHandle } from "trpc-sveltekit";
import { router } from "$lib/trpc/router";
import { createContext } from "$lib/trpc/context";
import { log } from "$lib/log";
import { createMetricsServer } from "$lib/metrics";

const ALLOWED_UNAUTHENTICATED_PATHS = ["/auth", "/api/auth", "/shared/", "/healthz"];
const ONLY_ADMIN_PATHS = ["/admin"];
const METRICS_SERVER = createMetricsServer();

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

    if (
      ONLY_ADMIN_PATHS.some((path) => pathname.startsWith(path)) &&
      // @ts-expect-error - role not defined in type
      !session?.user?.role === "Admin"
    ) {
      log.trace({ pathname }, "unauthenticated user redirected to /auth");
      return redirect(403, "/auth");
    }

    if (pathname === "/") {
      log.trace({ pathname }, "unauthenticated user redirected to /auth");
      return redirect(307, "/auth");
    }

    log.trace({ pathname }, "unauthenticated user redirected to /auth");
    return redirect(307, `/auth?redirect=${encodeURIComponent(pathname)}&protected=true`);
  }
);

export const handleError = async ({ event, error }) => {
  log.error({ event, error }, "Error");
};
