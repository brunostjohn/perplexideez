import { db } from "$lib/db";
import { log } from "$lib/log.js";
import { componentToPng, OGImageShared, resolveEmoji } from "$lib/og";
import { error } from "@sveltejs/kit";

export const GET = async ({ params: { id } }) => {
  try {
    const chat = await db.chat.findFirst({
      where: {
        id,
      },
      select: {
        imageResults: { select: { imageUrl: true }, take: 1 },
        emoji: true,
        title: true,
        messages: {
          select: { content: true, role: true },
          where: { role: "User" },
          take: 1,
          orderBy: { createdAt: "desc" },
        },
      },
    });
    if (!chat) return error(404, "Share not found");
    const emoji = chat.emoji ? await resolveEmoji(chat.emoji) : undefined;
    return await componentToPng({
      component: OGImageShared,
      width: 1200,
      height: 630,
      options: {
        props: {
          chatEmojiBase64: emoji,
          chatTitle: chat.title ?? chat.messages[0].content!,
          imageUrl: chat.imageResults[0].imageUrl,
        },
      },
    });
  } catch (e) {
    log.error({ error: e }, "Failed to render image");
    return error(500, "Failed to render image");
  }
};
