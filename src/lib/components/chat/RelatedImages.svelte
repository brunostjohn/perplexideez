<script lang="ts">
  import type { ImageResult } from "@prisma/client";
  import { onDestroy } from "svelte";
  import { createMediaStore } from "svelte-media-queries";
  import SmartImageLoader from "./SmartImageLoader.svelte";

  interface Props {
    results: ImageResult[];
  }

  const { results }: Props = $props();
  const matches = createMediaStore("(min-width: 1280px)");
  const matchesSm = createMediaStore("(min-width: 640px)");

  onDestroy(() => {
    matches.destroy();
    matchesSm.destroy();
  });
</script>

<div class="grid grid-cols-3 gap-2 overflow-hidden sm:grid-cols-4 xl:grid-cols-2 xl:pr-4">
  {#each results.slice(0, $matchesSm ? 3 : 2) as result}
    <SmartImageLoader
      src={result.thumbnailUrl}
      alt={result.title}
      class="group aspect-video h-full w-full rounded-md transition-all"
      imageClass="group-hover:scale-[103%] object-cover"
    />
  {/each}
  {#if results.length > 3}
    <div
      class="grid aspect-video grid-cols-4 grid-rows-2 gap-1 overflow-hidden rounded-md bg-muted p-1.5 transition-all hover:scale-[103%] xl:grid-cols-3"
    >
      {#each results.slice(3, $matches ? 6 : 10) as result}
        <SmartImageLoader
          src={result.thumbnailUrl}
          alt={result.title}
          class="h-full w-full rounded-md"
          imageClass="object-cover"
        />
      {/each}
      {#if results.length > 6}
        <div
          class="align-center flex h-full w-full items-center justify-center rounded-md p-0.5 text-muted"
        >
          <div
            class="align-center flex aspect-square h-full max-h-8 w-auto max-w-8 items-center justify-center rounded-full bg-muted-foreground/20 p-0.5"
          >
            <p class="text-center text-xs text-muted-foreground">+{results.length - 6}</p>
          </div>
        </div>
      {/if}
    </div>
  {/if}
</div>
