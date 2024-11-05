import type { RequestEvent } from "@sveltejs/kit";
import { TRPCError } from "@trpc/server";

export async function createContext(event: RequestEvent) {
  const {
    locals: { auth },
  } = event;

  const session = await auth();

  if (!session) throw new TRPCError({ code: "UNAUTHORIZED" });
  if (!session.user) throw new TRPCError({ code: "FORBIDDEN" });

  return {
    event,
    session,
    user: session.user,
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
