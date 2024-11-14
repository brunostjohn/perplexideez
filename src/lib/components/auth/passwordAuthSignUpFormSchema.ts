import { z } from "zod";

export const passwordAuthSignUpFormSchema = z
  .object({
    name: z.string().min(1, "Please enter your name"),
    email: z.string().email(),
    password: z
      .string()
      .min(8, "Your password must be at least 8 characters")
      .refine((password) => /[A-Z]/.test(password), {
        message: "Your password must contain at least one uppercase letter",
      })
      .refine((password) => /[a-z]/.test(password), {
        message: "Your password must contain at least one lowercase letter",
      })
      .refine((password) => /[0-9]/.test(password), {
        message: "Your password must contain at least one number",
      })
      .refine((password) => /[!@#$%^&*]/.test(password), {
        message: "Your password must contain at least one special character",
      }),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .superRefine(({ password, confirmPassword }, ctx) => {
    if (password !== confirmPassword) {
      ctx.addIssue({
        code: "custom",
        message: "The passwords did not match",
        path: ["confirmPassword"],
      });
    }
  });
export type PasswordAuthSignUpFormSchema = typeof passwordAuthSignUpFormSchema;
