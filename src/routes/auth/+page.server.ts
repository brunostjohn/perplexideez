import { env } from "$env/dynamic/public";
import { env as envPrivate } from "$env/dynamic/private";
import type { Actions } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { signIn } from "$lib/auth";
import type { MetaTagsProps } from "svelte-meta-tags";

export const load: PageServerLoad = async () => {
  const pageMetaTags = Object.freeze({
    title: "Sign In",
    openGraph: {
      title: "Sign In",
    },
  }) satisfies MetaTagsProps;

  return {
    oauthName: env.PUBLIC_OIDC_NAME,
    pageMetaTags,
    disableSignUp: envPrivate.DISABLE_SIGN_UP === "true",
    disablePasswordLogin: envPrivate.DISABLE_PASSWORD_LOGIN === "true",
  };
};

export const actions = { default: signIn } satisfies Actions;
