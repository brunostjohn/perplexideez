import { env } from "$env/dynamic/private";
import { error, redirect, type Actions } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { RateLimiter } from "sveltekit-rate-limiter/server";
import { fail, superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";
import { passwordAuthSignUpFormSchema } from "$lib/components/auth";
import { db } from "$lib/db";
import { argon2id, hash } from "argon2";

const limiter = new RateLimiter({
  IP: [10, "h"],
  IPUA: [5, "m"],
  cookie: {
    name: "authCredentialsLimiter-perplexideez",
    secret: env.RATE_LIMIT_SECRET!,
    rate: [2, "m"],
    preflight: true,
  },
});

export const load: PageServerLoad = async (event) => {
  if (env.DISABLE_SIGN_UP === "true") {
    return redirect(307, "/auth?disabledAuthMethod=true");
  }

  await limiter?.cookieLimiter?.preflight(event);

  const disabled = env.DISABLE_SIGN_UP === "true" || env.DISABLE_PASSWORD_LOGIN === "true";

  return {
    formValidated: disabled ? null : await superValidate(zod(passwordAuthSignUpFormSchema)),
  };
};

export const actions = {
  default: async (event) => {
    if (await limiter.isLimited(event)) return error(429);
    const form = await superValidate(event, zod(passwordAuthSignUpFormSchema));
    if (!form.valid) {
      return fail(400, {
        form,
      });
    }
    const { name, email, password, confirmPassword } = form.data;
    if (password !== confirmPassword) {
      return fail(400, {
        form: {
          ...form,
          errors: {
            confirmPassword: "The passwords did not match",
          },
        },
      });
    }

    const potentialUser = await db.user.findFirst({
      where: {
        email,
      },
    });
    if (potentialUser) {
      return fail(400, {
        form: {
          ...form,
          errors: {
            email: "A user with this email already exists",
          },
        },
      });
    }

    const pwHash = await hash(password, {
      type: argon2id,
      memoryCost: 19456,
      parallelism: 1,
      timeCost: 2,
    });

    await db.user.create({
      data: {
        name,
        email,
        pwHash,
      },
    });

    return redirect(307, "/auth?signedUp=true");
  },
} satisfies Actions;
