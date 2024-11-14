import { db } from "$lib/db";
import { log } from "$lib/log.js";
import { componentToPng, OGImageShared, resolveEmoji } from "$lib/og";
import { error } from "@sveltejs/kit";

export const GET = async ({ params: { id } }) => {
  try {
    const chat = await db.chat.findFirst({
      where: {
        sharedLink: { id },
      },
      select: {
        imageResults: { select: { imageUrl: true }, take: 3 },
        emoji: true,
        title: true,
        messages: {
          select: { content: true, role: true },
          where: { role: "User" },
          take: 1,
          orderBy: { createdAt: "desc" },
        },
        sharedLink: { select: { requiredAuth: true } },
      },
    });
    if (!chat) return error(404, "Share not found");
    if (chat.sharedLink?.requiredAuth) return error(401, "Unauthorized");
    const emoji = chat.emoji ? await resolveEmoji(chat.emoji) : undefined;

    const renderWithImage = async (imageNumber: number) =>
      await componentToPng({
        component: OGImageShared,
        width: 1200,
        height: 630,
        options: {
          props: {
            chatEmojiBase64: emoji,
            chatTitle: chat.title ?? chat.messages[0].content!,
            imageUrl: chat.imageResults[imageNumber].imageUrl,
          },
        },
      });

    for (let i = 0; i < 3; i++) {
      try {
        return await renderWithImage(i);
      } catch (e) {
        log.error({ error: e }, "Failed to render with image");
      }
    }

    return await componentToPng({
      component: OGImageShared,
      width: 1200,
      height: 630,
      options: {
        props: {
          chatEmojiBase64: emoji,
          chatTitle: chat.title ?? chat.messages[0].content!,
        },
      },
    });
  } catch (e) {
    log.error({ error: e }, "Failed to render image");
    return error(500, "Failed to render image");
  }
};
