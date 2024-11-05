import type { LayoutLoad } from "./$types";
import { browser } from "$app/environment";
import { QueryClient } from "@tanstack/svelte-query";

export const load: LayoutLoad = async () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        enabled: browser,
        experimental_prefetchInRender: true,
      },
    },
  });

  return { queryClient };
};
