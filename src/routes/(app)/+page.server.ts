import type { MetaTagsProps } from "svelte-meta-tags";
import type { PageServerLoad } from "./$types";
import { env } from "$env/dynamic/private";

export const load: PageServerLoad = async () => {
  const pageMetaTags = Object.freeze({
    title: "Search",
    openGraph: {
      title: "Search",
    },
  }) satisfies MetaTagsProps;

  const llmSpeed = env.LLM_SPEED_MODEL;
  const llmBalanced = env.LLM_BALANCED_MODEL;
  const llmQuality = env.LLM_QUALITY_MODEL;

  return { pageMetaTags, llmSpeed, llmBalanced, llmQuality };
};
