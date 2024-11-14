import { z } from "zod";

export const passwordAuthLoginFormSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Please enter your password"),
});

export type PasswordAuthLoginFormSchema = typeof passwordAuthLoginFormSchema;
