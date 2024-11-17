import { PrismaAdapter } from "@auth/prisma-adapter";
import { SvelteKitAuth } from "@auth/sveltekit";
import Credentials from "@auth/sveltekit/providers/credentials";
import { db } from "$lib/db";
import { env } from "$env/dynamic/private";
import { env as envPublic } from "$env/dynamic/public";
import { verify } from "argon2";
import { passwordAuthLoginFormSchema } from "./components/auth";
import { log } from "./log";
import { encode as defaultEncode } from "@auth/core/jwt";
import cuid from "cuid";
import { building } from "$app/environment";
import { skipCSRFCheck } from "@auth/core";

if (!building && !env.RATE_LIMIT_SECRET) {
  log.error("RATE_LIMIT_SECRET is not set");
  process.exit(1);
}

const hasOIDCEnvVariables =
  envPublic.PUBLIC_OIDC_NAME && env.OIDC_ISSUER && env.OIDC_CLIENT_ID && env.OIDC_CLIENT_SECRET;

if (!building && !hasOIDCEnvVariables && env.DISABLE_PASSWORD_LOGIN === "true") {
  log.error("No auth methods are enabled");
  process.exit(1);
}

if (!building && !hasOIDCEnvVariables) {
  log.warn("No OIDC env variables are set, only password login will be enabled.");
}

const disableCredentials = env.DISABLE_PASSWORD_LOGIN === "true";

const adapter = PrismaAdapter(db);

export const { handle, signIn, signOut } = SvelteKitAuth({
  adapter,
  trustHost: true,
  debug: log.level === "trace" || log.level === "debug",
  useSecureCookies: (env.USE_SECURE_COOKIES ?? "true") === "true" ? undefined : false,
  skipCSRFCheck: env.SKIP_CSRF_CHECK === "true" ? skipCSRFCheck : undefined,
  providers: [
    ...(hasOIDCEnvVariables
      ? [
          {
            id: "generic-oauth",
            name: envPublic.PUBLIC_OIDC_NAME!,
            type: (env.OIDC_TYPE as "oauth" | "oidc") ?? "oidc",
            issuer: env.OIDC_ISSUER,
            clientId: env.OIDC_CLIENT_ID,
            clientSecret: env.OIDC_CLIENT_SECRET,
          },
        ]
      : []),
    ...(disableCredentials
      ? []
      : [
          Credentials({
            credentials: {
              email: {},
              password: {},
            },
            authorize: async (credentials) => {
              if (env.DISABLE_PASSWORD_LOGIN === "true") {
                throw new Error("Password login is disabled");
              }
              const { email, password } = await passwordAuthLoginFormSchema.parseAsync(credentials);

              const user = await db.user.findFirst({
                where: {
                  email,
                },
              });
              if (!user?.pwHash) {
                log.trace(user);
                log.warn(`User ${email} tried to sign in but has no password hash, rejecting`);
                return null;
              }
              if (user.pwHash && (await verify(user.pwHash, password))) {
                log.trace(user, `User ${email} signed in`);
                return user;
              }

              log.warn(`User ${email} tried to sign in but the password was incorrect`);

              return null;
            },
          }),
        ]),
  ],
  pages: {
    signIn: "/auth",
  },
  logger: {
    error: (error) => log.error(error, "Error in auth"),
    warn: (code) => log.warn(code, "Warning in auth"),
    info: (info: any) => log.info(info, "Info in auth"),
  },
  callbacks: {
    // @ts-expect-error - cba to fix this
    session: async ({ session, user }) => {
      return { session, user };
    },
    jwt: async ({ token, user, account }) => {
      if (account?.provider === "credentials") {
        token.credentials = true;
      }
      return token;
    },
  },
  jwt: {
    encode: async function (params) {
      if (params.token?.credentials) {
        const sessionToken = cuid();

        if (!params.token.sub) {
          throw new Error("No user ID found in token");
        }

        const createdSession = await adapter?.createSession?.({
          sessionToken: sessionToken,
          userId: params.token.sub,
          expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        });

        if (!createdSession) {
          throw new Error("Failed to create session");
        }

        return sessionToken;
      }
      return defaultEncode(params);
    },
  },
});
