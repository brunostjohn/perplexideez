import { env } from "$env/dynamic/private";
import { PrismaClient } from "@prisma/client";
import type { createChatSchema } from "$lib/trpc/router";
import * as Prisma from "@prisma/client";
import type { z } from "zod";

export const db = new PrismaClient({
  datasourceUrl: env.DATABASE_URL,
});

export const convertZodEnumToDbModel = (
  enumValue: z.infer<typeof createChatSchema>["modelType"]
) => {
  switch (enumValue) {
    case "speed":
      return Prisma.ModelType.Speed;
    case "balanced":
      return Prisma.ModelType.Balanced;
    case "quality":
      return Prisma.ModelType.Quality;
  }

  throw new Error("Invalid model type");
};

export const convertDbEnumToZodModel = (
  enumValue: Prisma.ModelType
): z.infer<typeof createChatSchema>["modelType"] => {
  switch (enumValue) {
    case Prisma.ModelType.Speed:
      return "speed";
    case Prisma.ModelType.Balanced:
      return "balanced";
    case Prisma.ModelType.Quality:
      return "quality";
  }

  throw new Error("Invalid model type");
};

export const convertZodEnumToDbFocusMode = (
  enumValue: z.infer<typeof createChatSchema>["focusMode"]
) => {
  switch (enumValue) {
    case "all":
      return Prisma.FocusMode.All;
    case "academic":
      return Prisma.FocusMode.Academic;
    case "writing":
      return Prisma.FocusMode.Writing;
    case "wolframalpha":
      return Prisma.FocusMode.WolframAlpha;
    case "youtube":
      return Prisma.FocusMode.Youtube;
    case "reddit":
      return Prisma.FocusMode.Reddit;
  }

  throw new Error("Invalid focus mode");
};
