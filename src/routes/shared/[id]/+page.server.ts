import type { MetaTagsProps } from "svelte-meta-tags";
import type { PageServerLoad } from "./$types";
import { db } from "$lib/db";
import { error, redirect } from "@sveltejs/kit";
import { env as envPublic } from "$env/dynamic/public";
import { log } from "$lib/log";

export const load: PageServerLoad = async ({ params: { id }, locals: { auth }, cookies }) => {
  const session = await auth();

  let viewedChats = [] as Array<string>;
  const viewedChatsCookie = cookies.get("viewedChats");
  if (viewedChatsCookie)
    try {
      viewedChats = JSON.parse(viewedChatsCookie);
    } catch (error) {
      console.error("Error parsing viewedChats cookie:", error);
    }

  const sharedLink = await db.sharedLink.findFirst({
    where: { id },
    select: { chatId: true, views: true, chat: { select: { id: true } }, requiredAuth: true },
  });
  if (!sharedLink) return error(404, "Shared link not found");
  if (sharedLink.requiredAuth && !session)
    return redirect(307, "/auth?redirect=/shared/" + id + "&shared=true");

  let views = sharedLink.views;
  if (!viewedChats.includes(sharedLink.chat.id)) {
    await db.sharedLink.update({
      where: { id },
      data: { views: { increment: 1 } },
    });
    views++;
    viewedChats.push(sharedLink.chat.id);
    cookies.set("viewedChats", JSON.stringify(viewedChats), {
      maxAge: 60 * 60 * 24 * 365,
      path: "/",
      httpOnly: true,
    });
  }

  return {
    chat: getChat(id, views),
    pageMetaTags: await getMetaTags(id, !!session),
    id,
  };
};

const getChat = async (sharedLinkId: string, views: number) => {
  try {
    return await __getChat(sharedLinkId, views);
  } catch (e) {
    log.error({ error: e }, "Failed to get chat");
    throw e;
  }
};

const __getChat = async (sharedLinkId: string, views: number) => {
  const sharedLink = await db.sharedLink.findFirst({
    where: {
      id: sharedLinkId,
    },
    select: {
      chatId: true,
      enabled: true,
      requiredAuth: true,
      views: true,
    },
  });

  if (!sharedLink || !sharedLink?.enabled) return error(404, "Shared link not found");

  const chat = await db.chat.findFirst({
    where: {
      id: sharedLink.chatId,
    },
    select: {
      id: true,
      emoji: true,
      title: true,
      createdAt: true,
      user: { select: { name: true } },
      messages: {
        select: {
          content: true,
          role: true,
          sources: {
            select: {
              title: true,
              imageUrl: true,
              originalIndex: true,
              faviconUrl: true,
              url: true,
            },
          },
        },
        where: { pending: false },
      },
      imageResults: true,
      videoResults: true,
    },
  });

  return { ...chat, visibilityPublic: !sharedLink.requiredAuth, views };
};

const getMetaTags = async (sharedLinkId: string, isAuthenticated: boolean) => {
  const sharedLink = await db.sharedLink.findFirst({
    where: {
      id: sharedLinkId,
    },
    select: {
      chatId: true,
      enabled: true,
      requiredAuth: true,
    },
  });

  if (!sharedLink || !sharedLink?.enabled || (sharedLink.requiredAuth && !isAuthenticated))
    return {};

  const chat = await db.chat.findFirst({
    where: {
      id: sharedLink.chatId,
    },
    select: { emoji: true, title: true, user: { select: { name: true } } },
  });
  if (!chat) return error(404, "Chat not found");

  const pageMetaTags: MetaTagsProps = Object.freeze({
    title: `${(chat.emoji?.replaceAll("\n", "") ?? "") + " "}${chat.title?.replaceAll("\n", "")}`,
    description: `${chat.user.name ?? "Someone"} shared a chat with you.`,
    openGraph: {
      title: `${chat.emoji?.replaceAll("\n", "")} ${chat.title?.replaceAll("\n", "")}`,
      author: chat.user.name,
      description: `${chat.user.name ?? "Someone"} shared a chat with you.`,
      images: [
        {
          url: `${envPublic.PUBLIC_BASE_URL}/shared/${sharedLinkId}/og.png`,
          alt: `${chat.emoji?.replaceAll("\n", "")} ${chat.title?.replaceAll("\n", "")}`,
          width: 1200,
          height: 630,
          secureUrl: `${envPublic.PUBLIC_BASE_URL}/shared/${sharedLinkId}/og.png`,
          type: "image/png",
        },
      ],
    },
    twitter: {
      cardType: "summary_large_image" as const,
      image: `${envPublic.PUBLIC_BASE_URL}/shared/${sharedLinkId}/og.png`,
      title: `${chat.emoji?.replaceAll("\n", "")} ${chat.title?.replaceAll("\n", "")}`,
      description: `${chat.user.name ?? "Someone"} shared a chat with you.`,
      creator: chat.user.name ?? "",
      site: "Perplexideez",
      imageAlt: `${chat.emoji?.replaceAll("\n", "")} ${chat.title?.replaceAll("\n", "")}`,
    },
  });

  return pageMetaTags;
};
