import { env } from "$env/dynamic/private";
import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async () => {
  if (env.DISABLE_SIGN_UP === "true") {
    return redirect(307, "/auth?disabledAuthMethod=true");
  }
};
