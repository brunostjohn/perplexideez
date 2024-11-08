<script lang="ts">
  import { BookCopy } from "lucide-svelte";
  import { AdditionalSourcesPanel, MessageSectionTitle, SourcePanel } from ".";
  import Skeleton from "../ui/skeleton/skeleton.svelte";

  interface Source {
    imageUrl?: string | null;
    faviconUrl?: string | null;
    title: string;
    url: string;
  }

  interface Props {
    sources?: Source[] | null;
    isStreaming?: boolean;
  }

  const { sources, isStreaming }: Props = $props();
</script>

<MessageSectionTitle icon={BookCopy} isLoading={isStreaming && !sources}
  >Sources</MessageSectionTitle
>
{#if sources && sources.length}
  <ul class="mb-6 grid grid-cols-3 gap-2">
    {#each sources.slice(0, 2) as source}
      <SourcePanel {source} />
    {/each}
    <AdditionalSourcesPanel {sources} displayedCount={2} />
  </ul>
{:else}
  <div class="mb-6 grid w-full grid-cols-3 gap-2 transition-all">
    {#each Array.from({ length: 3 }) as _}
      <Skeleton class="h-[8.78rem] w-full" />
    {/each}
  </div>
{/if}
