import { db } from "$lib/db";
import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import type { MetaTagsProps } from "svelte-meta-tags";

export const load: PageServerLoad = async ({ params: { id }, locals: { auth } }) => {
  const session = await auth();
  if (!session) return error(401, "Unauthorized");
  const { user } = session;
  if (!user) return error(401, "Unauthorized");

  const chat = await db.chat.findFirst({
    where: {
      id,
      userId: user.id,
    },
    select: {
      title: true,
      emoji: true,
    },
  });
  if (!chat) return error(404, "Chat not found");

  const pageMetaTags = Object.freeze({
    title: `${(chat.emoji ?? "") + " "}${chat.title}`,
    description: `Chat about ${chat.title}`,
    openGraph: {
      title: `${chat.emoji} ${chat.title}`,
      description: `Chat about ${chat.title}`,
    },
  }) satisfies MetaTagsProps;

  return {
    pageMetaTags,
    id,
  };
};
