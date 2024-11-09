import { env } from "$env/dynamic/public";
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

  return { oauthName: env.PUBLIC_OIDC_NAME, pageMetaTags };
};

export const actions = { default: signIn } satisfies Actions;
