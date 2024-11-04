import { env } from "$env/dynamic/public";
import type { Actions } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { signIn } from "$lib/auth";

export const load: PageServerLoad = async () => ({ oauthName: env.PUBLIC_OIDC_NAME });

export const actions = { default: signIn } satisfies Actions;
