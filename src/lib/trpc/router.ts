import {
  convertDbEnumToZodModel,
  convertZodEnumToDbFocusMode,
  convertZodEnumToDbModel,
  db,
} from "$lib/db";
import * as Prisma from "@prisma/client";
import { t } from "$lib/trpc/t";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { log } from "$lib/log";
import cuid from "cuid";

export const createChatSchema = z.object({
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
      log.debug({ query, focusMode, modelType }, "Creating chat");
      const dbModelType = convertZodEnumToDbModel(modelType);
      const dbFocusMode = convertZodEnumToDbFocusMode(focusMode);

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
          messages: {
            create: {
              pending: false,
              content: query,
              role: Prisma.ChatRole.User,
            },
          },
        },
      });

      return { id: chat.id };
    }
  ),
  sharedLink: t.procedure
    .input(z.object({ chatId: z.string() }))
    .query(async ({ input: { chatId } }) => {
      const chat = await db.chat.findFirst({
        where: {
          id: chatId,
        },
        select: {
          sharedLink: true,
        },
      });

      if (!chat) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      if (!chat.sharedLink) {
        return null;
      }

      return chat.sharedLink;
    }),
  upsertSharedLink: t.procedure
    .input(
      z.object({
        chatId: z.string(),
        requiredAuth: z.boolean().optional(),
        rerollId: z.boolean().optional(),
        enabled: z.boolean().optional(),
      })
    )
    .mutation(
      async ({
        input: { chatId, requiredAuth, rerollId = false, enabled },
        ctx: {
          user: { id },
        },
      }) => {
        const chat = await db.chat.findFirst({
          where: {
            id: chatId,
            userId: id ?? "",
          },
          select: { sharedLink: true },
        });

        if (!chat) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }

        const sharedLink = await db.sharedLink.upsert({
          where: {
            chatId,
          },
          update: {
            requiredAuth,
            id: rerollId ? cuid() : chat.sharedLink?.id,
            enabled,
          },
          create: {
            chatId,
            requiredAuth,
            enabled,
          },
        });

        return sharedLink.id;
      }
    ),
  createMessage: t.procedure.input(z.object({ chatId: z.string(), content: z.string() })).mutation(
    async ({
      input: { chatId, content },
      ctx: {
        user: { id },
      },
    }) => {
      log.debug({ chatId, content }, "Creating message");
      const chat = await db.chat.findFirst({
        where: {
          id: chatId,
          userId: id,
        },
      });

      if (!chat) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const message = await db.message.create({
        data: {
          chatId,
          content,
          role: Prisma.ChatRole.User,
          pending: false,
        },
      });

      return { id: message.id };
    }
  ),
  listChats: t.procedure.input(z.object({ isFavourites: z.boolean() })).query(
    async ({
      ctx: {
        user: { id },
      },
      input: { isFavourites },
    }) => {
      log.debug("Listing chats");
      const chats = await db.chat.findMany({
        where: {
          userId: id,
          isFavorite: isFavourites ? true : false,
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
  sources: t.procedure.input(z.object({ messageIds: z.array(z.string()) })).query(
    async ({
      input: { messageIds },
      ctx: {
        user: { id },
      },
    }) => {
      const messages = await db.message.findMany({
        where: {
          id: {
            in: messageIds,
          },
          chat: {
            userId: id,
          },
        },
        select: { id: true, sources: true },
      });

      const messageEntries = messages.map(({ id, sources }) => [id, sources] as const);

      return Object.fromEntries(messageEntries);
    }
  ),
  chat: t.procedure.input(z.object({ chatId: z.string() })).query(
    async ({
      input: { chatId },
      ctx: {
        user: { id },
      },
    }) => {
      const chat = await db.chat.findFirst({
        where: {
          id: chatId,
          userId: id,
        },
        include: {
          messages: { include: { sources: true }, orderBy: { createdAt: "asc" } },
          imageResults: true,
          videoResults: true,
        },
      });

      if (!chat) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return chat;
    }
  ),
  yeetChat: t.procedure.input(z.object({ chatId: z.string() })).mutation(
    async ({
      input: { chatId },
      ctx: {
        user: { id },
      },
    }) => {
      log.debug({ chatId }, "Deleting chat");
      await db.chat.delete({
        where: {
          id: chatId,
          userId: id,
        },
      });
    }
  ),
  chatName: t.procedure.input(z.object({ chatId: z.string() })).query(
    async ({
      input: { chatId },
      ctx: {
        user: { id },
      },
    }) => {
      const chat = await db.chat.findFirst({
        where: {
          id: chatId,
          userId: id,
        },
        select: {
          title: true,
          emoji: true,
        },
      });

      if (!chat) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return chat;
    }
  ),
  chatLastUpdated: t.procedure.input(z.object({ chatId: z.string() })).query(
    async ({
      input: { chatId },
      ctx: {
        user: { id },
      },
    }) => {
      const chat = await db.chat.findFirst({
        where: {
          id: chatId,
          userId: id,
        },
        select: {
          messages: {
            orderBy: {
              createdAt: "desc",
            },
          },
        },
      });

      if (!chat) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return chat.messages[0].createdAt;
    }
  ),
  chatFavourite: t.procedure.input(z.object({ chatId: z.string() })).query(
    async ({
      input: { chatId },
      ctx: {
        user: { id },
      },
    }) => {
      const chat = await db.chat.findFirst({
        where: {
          id: chatId,
          userId: id,
        },
        select: {
          isFavorite: true,
        },
      });

      if (!chat) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return chat.isFavorite;
    }
  ),
  chatSetFavourite: t.procedure
    .input(z.object({ chatId: z.string(), isFavorite: z.boolean() }))
    .mutation(
      async ({
        input: { chatId, isFavorite },
        ctx: {
          user: { id },
        },
      }) => {
        await db.chat.update({
          where: {
            id: chatId,
            userId: id,
          },
          data: {
            isFavorite,
          },
        });
      }
    ),
  setModelType: t.procedure
    .input(z.object({ modelType: z.enum(["speed", "balanced", "quality"]) }))
    .mutation(
      async ({
        input: { modelType },
        ctx: {
          user: { id },
        },
      }) => {
        await db.user.update({
          where: {
            id,
          },
          data: {
            lastSelectedModelType: convertZodEnumToDbModel(modelType),
          },
        });
      }
    ),
  lastSelectedModelType: t.procedure.query(
    async ({
      ctx: {
        user: { id },
      },
    }) => {
      const user = await db.user.findFirst({
        where: {
          id,
        },
        select: {
          lastSelectedModelType: true,
        },
      });

      if (!user?.lastSelectedModelType) return;

      return convertDbEnumToZodModel(user?.lastSelectedModelType);
    }
  ),
  users: t.procedure.query(
    async ({
      ctx: {
        user: { role, id: userId },
      },
    }) => {
      if (role !== "Admin") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const users = await db.user.findMany({
        select: {
          id: true,
          email: true,
          name: true,
          pwHash: true,
          role: true,
        },
        orderBy: {
          email: "asc",
        },
      });

      return users.map(({ id, email, role, name, pwHash }) => ({
        id,
        email,
        role,
        name,
        isMe: id === userId,
        authType: pwHash ? ("password" as const) : ("oauth" as const),
      }));
    }
  ),
  toggleRole: t.procedure.input(z.object({ userId: z.string() })).mutation(
    async ({
      input: { userId },
      ctx: {
        user: { role },
      },
    }) => {
      if (role !== "Admin") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      const user = await db.user.findFirst({
        where: {
          id: userId,
        },
        select: {
          role: true,
        },
      });
      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }
      const newRole = user.role === "Admin" ? "User" : "Admin";
      await db.user.update({
        where: {
          id: userId,
        },
        data: {
          role: newRole,
        },
      });
    }
  ),
  deleteUser: t.procedure.input(z.object({ userId: z.string() })).mutation(
    async ({
      input: { userId },
      ctx: {
        user: { role },
      },
    }) => {
      if (role !== "Admin") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      await db.user.delete({
        where: {
          id: userId,
        },
      });
    }
  ),
});

export const createCaller = t.createCallerFactory(router);

export type Router = typeof router;
