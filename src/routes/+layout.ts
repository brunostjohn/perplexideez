import type { LayoutLoad } from "./$types";
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
          url: "https://www.example.ie/og-image.jpg",
          alt: "Og Image Alt",
          width: 800,
          height: 600,
          secureUrl: "https://www.example.ie/og-image.jpg",
          type: "image/jpeg",
        },
      ],
    },
  }) satisfies MetaTagsProps;

  return { queryClient, baseMetaTags };
};
