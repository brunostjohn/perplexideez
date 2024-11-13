import type { LayoutLoad } from "./$types";
import { env as envPublic } from "$env/dynamic/public";
import { browser } from "$app/environment";
import { QueryClient } from "@tanstack/svelte-query";
import { type MetaTagsProps } from "svelte-meta-tags";

export const load: LayoutLoad = async ({ url }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        enabled: browser,
        experimental_prefetchInRender: true,
      },
    },
  });

  const baseMetaTags = Object.freeze({
    title: "Home",
    titleTemplate: "%s | Perplexideez",
    description:
      "Perplexideez is an AI-powered platform that helps you find things on the web faster.",
    canonical: new URL(url.pathname, url.origin).href,
    openGraph: {
      type: "website",
      url: new URL(url.pathname, url.origin).href,
      locale: "en_IE",
      title: "Home - Perplexideez",
      description:
        "Perplexideez is an AI-powered platform that helps you find things on the web faster.",
      siteName: "Perplexideez",
      images: [
        {
          url: `${envPublic.PUBLIC_BASE_URL}/og-image.png`,
          alt: "Perplexideez",
          width: 1200,
          height: 630,
          secureUrl: `${envPublic.PUBLIC_BASE_URL}/og-image.png`,
          type: "image/png",
        },
      ],
    },
  }) satisfies MetaTagsProps;

  return { queryClient, baseMetaTags };
};
