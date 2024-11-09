<script lang="ts">
  import "../app.css";
  import type { Snippet } from "svelte";
  import { ModeWatcher } from "mode-watcher";
  import { QueryClientProvider } from "@tanstack/svelte-query";
  import type { LayoutData } from "./$types";
  import { Toaster } from "$lib/components/ui/sonner";
  import { MetaTags, deepMerge } from "svelte-meta-tags";
  import { page } from "$app/stores";

  interface Props {
    children?: Snippet;
    data: LayoutData;
  }

  const { children, data } = $props();
  const metaTags = $derived(deepMerge(data.baseMetaTags, $page.data.pageMetaTags));
</script>

<MetaTags {...metaTags} />

<QueryClientProvider client={data.queryClient}>
  <ModeWatcher />
  <Toaster />
  {@render children?.()}
</QueryClientProvider>
