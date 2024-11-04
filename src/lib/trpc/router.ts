import { db } from "$lib/db";
import { t } from "$lib/trpc/t";
import * as Prisma from "@prisma/client";
import { z } from "zod";

const createChatSchema = z.object({
  query: z.string().min(1, "You must provide a query."),
  focusMode: z.enum(["all", "academic", "writing", "wolframalpha", "youtube", "reddit"]),
  modelType: z.enum(["speed", "balanced", "quality"]),
});

export const router = t.router({
  createChat: t.procedure.input(createChatSchema).mutation(
    async ({
      ctx: {
        user: { id },
      },
      input: { query, focusMode, modelType },
    }) => {
      const dbModelType = convertZodEnumToDbModel(modelType);
      const dbFocusMode = convertZodEnumToDbFocusMode(focusMode);

      console.log(id);

      const chat = await db.chat.create({
        data: {
          modelType: dbModelType,
          focusMode: dbFocusMode,
          title: query,
          user: {
            connect: {
              id,
            },
          },
        },
      });

      return { id: chat.id };
    }
  ),
  listChats: t.procedure.query(
    async ({
      ctx: {
        user: { id },
      },
    }) => {
      const chats = await db.chat.findMany({
        where: {
          userId: id,
        },
        orderBy: {
          updatedAt: "desc",
        },
        select: {
          id: true,
          title: true,
          emoji: true,
        },
      });

      return chats;
    }
  ),
});

export const createCaller = t.createCallerFactory(router);

export type Router = typeof router;

const convertZodEnumToDbModel = (enumValue: z.infer<typeof createChatSchema>["modelType"]) => {
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

const convertZodEnumToDbFocusMode = (enumValue: z.infer<typeof createChatSchema>["focusMode"]) => {
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
