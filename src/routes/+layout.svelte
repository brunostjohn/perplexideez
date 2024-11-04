<script lang="ts">
  import "../app.css";
  import type { Snippet } from "svelte";
  import { ModeWatcher } from "mode-watcher";
  import { QueryClientProvider } from "@tanstack/svelte-query";
  import type { LayoutData } from "./$types";

  interface Props {
    children?: Snippet;
    data: LayoutData;
  }

  const { children, data } = $props();
</script>

<QueryClientProvider client={data.queryClient}>
  <ModeWatcher />
  {@render children?.()}
</QueryClientProvider>
