<script lang="ts">
  import { AdditionalSourcesPanel, SourcePanel } from ".";

  interface Source {
    imageUrl?: string | null;
    faviconUrl?: string | null;
    title: string;
    url: string;
  }

  interface Props {
    sources?: Source[] | null;
  }

  const { sources }: Props = $props();
</script>

<ul class="mb-6 grid grid-cols-3 gap-2">
  {#if sources}
    {#each sources.slice(0, 2) as source}
      <SourcePanel {source} />
    {/each}
    <AdditionalSourcesPanel {sources} displayedCount={2} />
  {/if}
</ul>
