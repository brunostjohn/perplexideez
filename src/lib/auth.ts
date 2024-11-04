import { PrismaAdapter } from "@auth/prisma-adapter";
import { SvelteKitAuth } from "@auth/sveltekit";
import { db } from "$lib/db";
import { env } from "$env/dynamic/private";
import { env as envPublic } from "$env/dynamic/public";

export const { handle, signIn, signOut } = SvelteKitAuth({
  adapter: PrismaAdapter(db),
  providers: [
    {
      id: "generic-oauth",
      name: envPublic.PUBLIC_OIDC_NAME!,
      type: (env.OIDC_TYPE as "oauth" | "oidc") ?? "oidc",
      issuer: env.OIDC_ISSUER,
      clientId: env.OIDC_CLIENT_ID,
      clientSecret: env.OIDC_CLIENT_SECRET,
    },
  ],
  pages: {
    signIn: `${envPublic.PUBLIC_BASE_URL}/auth`,
  },
  logger: {
    error: console.error,
    warn: console.warn,
    info: console.info,
  },
  callbacks: {
    // @ts-expect-error - cba to fix this
    session: async ({ session, user }) => {
      return { session, user };
    },
  },
});
