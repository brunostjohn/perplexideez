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
  const matchesSm = createMediaStore("(min-width: 640px)");

  const show4 = $derived(
    (!alternativeSizing && ($matches2Xl || !$matchesXl)) || (alternativeSizing && $matchesMd)
  );

  onDestroy(() => {
    matches2Xl.destroy();
    matchesXl.destroy();
    matchesMd.destroy();
    matchesSm.destroy();
  });
</script>

<MessageSectionTitle icon={BookCopy} isLoading={isStreaming && !sources}
  >Sources</MessageSectionTitle
>
{#if sources && sources.length}
  <ul
    class={cn(
      "mb-6 grid grid-cols-1 grid-rows-2 gap-2 sm:grid-rows-1",
      alternativeSizing
        ? "sm:grid-cols-3 md:grid-cols-4"
        : "sm:grid-cols-4 xl:grid-cols-3 2xl:grid-cols-4"
    )}
  >
    {#if $matchesSm}
      {#each sources.slice(0, show4 ? 3 : 2) as source}
        <SourcePanel {source} />
      {/each}
      <AdditionalSourcesPanel {sources} displayedCount={show4 ? 3 : 2} />
    {:else}
      <SourcePanel source={sources[0]} />
      <AdditionalSourcesPanel {sources} displayedCount={1} />
    {/if}
  </ul>
{:else}
  <div
    class={cn(
      "mb-6 grid w-full grid-cols-1 grid-rows-2 gap-2 transition-all",
      alternativeSizing
        ? "sm:grid-cols-3 md:grid-cols-4"
        : "sm:grid-cols-4 xl:grid-cols-3 2xl:grid-cols-4"
    )}
  >
    {#if $matchesSm}
      {#each Array.from({ length: show4 ? 4 : 3 }) as _}
        <Skeleton class="h-[8.78rem] w-full" />
      {/each}
    {:else}
      <Skeleton class="h-[8.78rem] w-full" />
      <Skeleton class="h-[8.78rem] w-full" />
    {/if}
  </div>
{/if}
