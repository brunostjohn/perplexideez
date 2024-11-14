import { env } from "$env/dynamic/public";
import { db } from "$lib/db";
import { error, json } from "@sveltejs/kit";

export const GET = async ({ params: { id } }) => {
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
      user: { select: { name: true } },
    },
  });
  if (!chat) return error(404, "Share not found");
  if (chat.sharedLink?.requiredAuth) return error(401, "Unauthorized");

  const oEmbedData = {
    title: `${chat.emoji ? chat.emoji?.replaceAll("\n", "") + " " : ""}${chat.title?.replaceAll("\n", "")}`,
    author_name: `Shared by ${chat.user.name}`,
    provider_name: "Perplexideez",
    provider_url: env.PUBLIC_BASE_URL,
  };

  return json(oEmbedData);
};
