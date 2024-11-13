<script lang="ts">
  import * as HoverCard from "$lib/components/ui/hover-card";
  import SmartImageLoader from "../chat/SmartImageLoader.svelte";

  interface Source {
    imageUrl?: string | null;
    faviconUrl?: string | null;
    title: string;
    url: string;
    originalIndex: number;
  }

  interface Props {
    raw: string;
    source: Source;
  }

  const { raw, source }: Props = $props();
  const rawTrimmed = $derived(raw.slice(1, -1));
</script>

<HoverCard.Root>
  <HoverCard.Trigger
    href={source?.url}
    target="_blank"
    class="inline rounded-sm align-sub text-xs text-muted-foreground underline decoration-transparent underline-offset-4 hover:decoration-muted focus-visible:outline-2 focus-visible:outline-offset-8 focus-visible:outline-black"
    rel="noreferrer noopener"
  >
    {rawTrimmed}
  </HoverCard.Trigger>
  <HoverCard.Content
    class="w-64 bg-transparent backdrop-blur-lg backdrop-brightness-50 backdrop-saturate-150"
  >
    {#if source}
      <a class="contents" href={source.url}>
        <div class="flex flex-col">
          {#if source.imageUrl}
            <SmartImageLoader
              src={source.imageUrl}
              alt={source.title}
              class="mb-2 h-32 w-full rounded-md bg-muted"
              imageClass="object-cover"
            />
          {/if}

          <p class="overflow-elipsis mb-2 overflow-hidden text-ellipsis text-nowrap">
            {source.title}
          </p>
          <div class="align-center flex items-center gap-1">
            <SmartImageLoader
              src={source.faviconUrl}
              alt={`${new URL(source.url).host.replace("www.", "")} favicon`}
              class="aspect-square h-4 w-4 rounded-full"
              imageClass="object-cover"
            />
            <p class="text-sm text-muted-foreground">
              {new URL(source.url).host.replace("www.", "")}
            </p>
          </div>
        </div>
      </a>
    {:else}
      <p class="text-muted-foreground">Sources loading...</p>
    {/if}
  </HoverCard.Content>
</HoverCard.Root>
