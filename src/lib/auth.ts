import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { genericOAuth } from "better-auth/plugins";
import { db } from "$lib/db";
import { env } from "$env/dynamic/private";

export const auth = betterAuth({
  database: prismaAdapter(db, {
    provider: "postgresql",
  }),
  plugins: [
    genericOAuth({
      config: [
        {
          providerId: env.OIDC_PROVIDER_ID!,
          clientId: env.OIDC_CLIENT_ID!,
          clientSecret: env.OIDC_CLIENT_SECRET!,
          discoveryUrl: env.OIDC_DISCOVERY_URL!,
          scopes: env.OIDC_SCOPES!.split(" "),
        },
      ],
    }),
  ],
});
