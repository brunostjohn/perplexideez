<script lang="ts">
  import type { VideoResult } from "@prisma/client";

  interface Props {
    results: VideoResult[];
  }

  const { results }: Props = $props();
</script>

<div class="mb-6 grid grid-cols-2 gap-2">
  {#each results.slice(0, 3) as result}
    <img
      src={result.thumbnailUrl}
      loading="lazy"
      alt={result.title}
      class="aspect-video rounded-md object-cover transition-all hover:scale-[103%]"
    />
  {/each}
  {#if results.length > 3}
    <div
      class="grid aspect-video grid-cols-3 grid-rows-2 gap-1 overflow-hidden rounded-md bg-muted p-1.5 transition-all hover:scale-[103%]"
    >
      {#each results.slice(3, 6) as result}
        <img
          src={result.thumbnailUrl}
          alt={result.title}
          class="h-full w-full rounded-md object-cover"
        />
      {/each}
      {#if results.length > 6}
        <div
          class="align-center flex h-full w-full items-center justify-center rounded-md p-0.5 text-muted"
        >
          <div
            class="align-center flex aspect-square h-full w-auto items-center justify-center rounded-full bg-muted-foreground/20 p-0.5"
          >
            <p class="text-center text-xs text-muted-foreground">+{results.length - 6}</p>
          </div>
        </div>
      {/if}
    </div>
  {/if}
</div>
