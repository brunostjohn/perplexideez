<script lang="ts">
  import { Clapperboard, Image } from "lucide-svelte";

  import type { ImageResult, VideoResult } from "@prisma/client";
  import RelatedImages from "./RelatedImages.svelte";
  import RelatedVideos from "./RelatedVideos.svelte";

  interface Props {
    imageResults: ImageResult[];
    videoResults: VideoResult[];
  }

  const { imageResults, videoResults }: Props = $props();
</script>

{#if imageResults?.length}
  <div class="align-center mb-2 flex items-center gap-2">
    <Image class="size-6" />
    <h3 class="text-lg font-semibold">Related Images</h3>
  </div>
  <RelatedImages results={imageResults} />
{/if}
{#if videoResults?.length}
  <div class="align-center flex items-center gap-2">
    <Clapperboard class="size-6" />
    <h3 class="text-lg font-semibold">Related Videos</h3>
  </div>
  <RelatedVideos results={videoResults} />
{/if}
