<script lang="ts">
  interface Props {
    source: {
      imageUrl?: string | null;
      faviconUrl?: string | null;
      title: string;
      url: string;
    };
  }

  const { source }: Props = $props();
</script>

<li
  class="flex flex-col overflow-hidden rounded-md bg-muted/50 p-4 transition-all hover:bg-muted/75"
>
  <a class="contents" href={source.url}>
    {#if source.imageUrl}
      <img
        src={source.imageUrl}
        alt="abcd"
        class="mb-2 h-12 w-full rounded-md bg-muted object-cover"
      />
    {/if}

    <p class="overflow-elipsis mb-2 overflow-hidden text-ellipsis text-nowrap">
      {source.title}
    </p>
    <div class="align-center flex items-center gap-1">
      <img
        src={source.faviconUrl}
        alt="abcd"
        class="aspect-square h-4 w-4 rounded-full object-cover"
      />
      <p class="text-sm text-muted-foreground">
        {new URL(source.url).host.replace("www.", "")}
      </p>
    </div>
  </a>
</li>
