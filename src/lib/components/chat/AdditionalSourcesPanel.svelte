<script lang="ts">
  import * as Dialog from "$lib/components/ui/dialog";

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

<Dialog.Root>
  <Dialog.Trigger>
    {#snippet child({ props })}
      <button {...props} class="flex flex-col rounded-md bg-muted/50 p-4 hover:bg-muted/75">
        <div
          class="align-center flex flex-wrap items-center justify-start gap-2 overflow-hidden pb-2"
        >
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
      </button>
    {/snippet}
  </Dialog.Trigger>
  <Dialog.Content class="max-h-[80%] overflow-y-auto">
    <ul class="grid grid-cols-2 flex-col gap-2 overflow-x-hidden">
      {#each sources.slice(2) as source}
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
      {/each}
    </ul>
  </Dialog.Content>
</Dialog.Root>
