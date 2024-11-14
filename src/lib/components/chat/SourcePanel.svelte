<script lang="ts">
  import { cn } from "$lib/utils";
  import SmartImageLoader from "./SmartImageLoader.svelte";

  interface Props {
    source: {
      imageUrl?: string | null;
      faviconUrl?: string | null;
      title: string;
      url: string;
    };
  }

  const { source }: Props = $props();

  const hasThumbnail = $derived(!!source.imageUrl);
  let showThumbnail = $state(true);
  const hasFavicon = $derived(!!source.faviconUrl);
  let showFavicon = $state(true);
</script>

<li
  class="flex flex-col overflow-hidden rounded-md bg-muted/50 p-4 transition-all hover:bg-muted/75"
>
  <a class="contents" href={source.url} target="_blank">
    {#if hasThumbnail && showThumbnail}
      <SmartImageLoader
        src={source.imageUrl}
        alt={source.title}
        class="mb-2 h-12 w-full rounded-md bg-muted"
        imageClass="object-cover"
      />
    {/if}

    <p
      class={cn(
        "mb-2 overflow-hidden",
        source.imageUrl ? "text-ellipsis text-nowrap" : "overflow-elipsis"
      )}
    >
      {source.title}
    </p>
    <div class="align-center flex items-center gap-1">
      {#if hasFavicon && showFavicon}
        <SmartImageLoader
          src={source.faviconUrl}
          alt={`${new URL(source.url).host.replace("www.", "")} favicon`}
          class="aspect-square h-4 min-h-4 w-4 min-w-4 rounded-full"
          imageClass="object-cover"
        />
      {/if}
      <p class="text-sm text-muted-foreground">
        {new URL(source.url).host.replace("www.", "")}
      </p>
    </div>
  </a>
</li>
