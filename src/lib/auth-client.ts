import { env } from "$env/dynamic/public";
import { createAuthClient } from "better-auth/svelte";

export const authClient = createAuthClient({
  baseURL: env.PUBLIC_BASE_URL,
});
