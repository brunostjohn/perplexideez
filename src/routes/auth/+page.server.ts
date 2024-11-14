import { env } from "$env/dynamic/public";
import { env as envPrivate } from "$env/dynamic/private";
import { error, type Actions } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { signIn } from "$lib/auth";
import type { MetaTagsProps } from "svelte-meta-tags";
import { superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";
import { passwordAuthLoginFormSchema } from "$lib/components/auth";
import { RateLimiter } from "sveltekit-rate-limiter/server";

export const load: PageServerLoad = async (event) => {
  const pageMetaTags = Object.freeze({
    title: "Sign In",
    openGraph: {
      title: "Sign In",
    },
  }) satisfies MetaTagsProps;

  const disablePasswordLogin = envPrivate.DISABLE_PASSWORD_LOGIN === "true";

  await limiter.cookieLimiter?.preflight(event);

  return {
    oauthName: env.PUBLIC_OIDC_NAME,
    pageMetaTags,
    disableSignUp: envPrivate.DISABLE_SIGN_UP === "true",
    disablePasswordLogin,
    formValidated: disablePasswordLogin
      ? null
      : await superValidate(zod(passwordAuthLoginFormSchema)),
  };
};

const limiter = new RateLimiter({
  IP: [10, "h"],
  IPUA: [5, "m"],
  cookie: {
    name: "authCredentialsLimiter-perplexideez",
    secret: envPrivate.RATE_LIMIT_SECRET!,
    rate: [2, "m"],
    preflight: true,
  },
});

export const actions = {
  default: async (event) => {
    if (await limiter.isLimited(event)) return error(429);

    return await signIn(event);
  },
} satisfies Actions;
