import { PrismaAdapter } from "@auth/prisma-adapter";
import { SvelteKitAuth } from "@auth/sveltekit";
import Credentials from "@auth/sveltekit/providers/credentials";
import { db } from "$lib/db";
import { env } from "$env/dynamic/private";
import { env as envPublic } from "$env/dynamic/public";
import { verify } from "argon2";

export const { handle, signIn, signOut } = SvelteKitAuth({
  adapter: PrismaAdapter(db),
  trustHost: true,
  providers: [
    {
      id: "generic-oauth",
      name: envPublic.PUBLIC_OIDC_NAME!,
      type: (env.OIDC_TYPE as "oauth" | "oidc") ?? "oidc",
      issuer: env.OIDC_ISSUER,
      clientId: env.OIDC_CLIENT_ID,
      clientSecret: env.OIDC_CLIENT_SECRET,
    },
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      authorize: async ({ email, password }) => {
        if (env.DISABLE_PASSWORD_LOGIN === "true") {
          throw new Error("Password login is disabled");
        }

        if (typeof password !== "string" || typeof email !== "string") {
          throw new Error("Invalid email or password");
        }
        const user = await db.user.findFirst({
          where: {
            email,
          },
        });
        if (!user?.pwSalt) throw new Error("Invalid email or password");
        if (user.pwHash && (await verify(user.pwHash, password))) return user;

        throw new Error("Invalid email or password");
      },
    }),
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
