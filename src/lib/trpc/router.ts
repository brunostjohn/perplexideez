import { t } from "$lib/trpc/t";

export const router = t.router({
  greeting: t.procedure.query(async () => {}),
});

export const createCaller = t.createCallerFactory(router);

export type Router = typeof router;
