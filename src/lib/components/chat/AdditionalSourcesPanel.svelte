<script lang="ts">
  interface Source {
    imageUrl?: string | null;
    faviconUrl?: string | null;
    title: string;
    url: string;
  }

  interface Props {
    sources: Source[];
    displayedCount: number;
  }

  const { sources, displayedCount }: Props = $props();
</script>

<div class="flex flex-col rounded-md bg-muted/50 p-4">
  <div class="align-center flex flex-wrap items-center justify-start gap-2 overflow-hidden pb-2">
    {#each sources.slice(displayedCount, 13) as source}
      <img
        src={source.faviconUrl}
        alt="abcd"
        class="aspect-square h-6 w-6 rounded-full bg-muted object-cover"
      />
    {/each}
    {#if sources.slice(2).length > 11}
      <div
        class="align-center flex aspect-square h-6 w-6 items-center justify-center rounded-full bg-muted"
      >
        <p class="text-center text-xs">
          +{sources.slice(2).length - 11}
        </p>
      </div>
    {/if}
  </div>
  <p class="mt-auto text-sm text-muted-foreground">
    View {sources.length - 2} more
  </p>
</div>
