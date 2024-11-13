<script lang="ts">
  import { BookCopy } from "lucide-svelte";
  import { AdditionalSourcesPanel, MessageSectionTitle, SourcePanel } from ".";
  import Skeleton from "../ui/skeleton/skeleton.svelte";
  import { createMediaStore } from "svelte-media-queries";
  import { cn } from "$lib/utils";
  import { onDestroy } from "svelte";

  interface Source {
    imageUrl?: string | null;
    faviconUrl?: string | null;
    title: string;
    url: string;
  }

  interface Props {
    sources?: Source[] | null;
    isStreaming?: boolean;
    alternativeSizing?: boolean;
  }

  const { sources, isStreaming, alternativeSizing = false }: Props = $props();
  const matches2Xl = createMediaStore("(min-width: 1536px)");
  const matchesXl = createMediaStore("(min-width: 1280px)");
  const matchesMd = createMediaStore("(min-width: 768px)");

  const show4 = $derived(
    (!alternativeSizing && ($matches2Xl || !$matchesXl)) || (alternativeSizing && $matchesMd)
  );

  onDestroy(() => {
    matches2Xl.destroy();
    matchesXl.destroy();
    matchesMd.destroy();
  });
</script>

<MessageSectionTitle icon={BookCopy} isLoading={isStreaming && !sources}
  >Sources</MessageSectionTitle
>
{#if sources && sources.length}
  <ul
    class={cn(
      "mb-6 grid gap-2",
      alternativeSizing
        ? "grid-cols-3 md:grid-cols-4"
        : "grid-cols-4 xl:grid-cols-3 2xl:grid-cols-4"
    )}
  >
    {#each sources.slice(0, show4 ? 3 : 2) as source}
      <SourcePanel {source} />
    {/each}
    <AdditionalSourcesPanel {sources} displayedCount={2} />
  </ul>
{:else}
  <div
    class={cn(
      "mb-6 grid w-full gap-2 transition-all ",
      alternativeSizing
        ? "grid-cols-3 md:grid-cols-4"
        : "grid-cols-4 xl:grid-cols-3 2xl:grid-cols-4"
    )}
  >
    {#each Array.from({ length: show4 ? 4 : 3 }) as _}
      <Skeleton class="h-[8.78rem] w-full" />
    {/each}
  </div>
{/if}
