<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import * as Popover from "$lib/components/ui/popover";
  import * as Sidebar from "$lib/components/ui/sidebar";
  import * as Tooltip from "$lib/components/ui/tooltip";
  import { ExternalLink, Ellipsis, Star, Link, Trash, LoaderCircle } from "lucide-svelte";
  import DeleteChat from "./chatActions/DeleteChat.svelte";
  import { trpc } from "$lib/trpc";
  import { reactiveQueryArgs } from "$lib/utils.svelte";
  import moment from "moment";
  import { toast } from "svelte-sonner";

  interface Props {
    chatId: string;
  }

  const { chatId }: Props = $props();

  let open = $state(false);

  const chatUpdatedAtQuery = trpc()?.chatLastUpdated.createQuery(
    reactiveQueryArgs(() => ({ chatId }))
  );
  const chatUpdatedAtMoment = $derived(
    $chatUpdatedAtQuery?.data ? moment($chatUpdatedAtQuery?.data) : null
  );
  const chatUpdatedAtString = $derived.by(() => {
    if (!chatUpdatedAtMoment) return;

    if (chatUpdatedAtMoment.isBefore(moment().subtract(7, "days"))) {
      return `on ${chatUpdatedAtMoment.format("MMM D")}`;
    }

    if (chatUpdatedAtMoment.isBefore(moment().subtract(1, "days"))) {
      return `on ${chatUpdatedAtMoment.format("dddd")}`;
    }

    if (chatUpdatedAtMoment.isBefore(moment().subtract(1, "years"))) {
      return `on ${chatUpdatedAtMoment.format("MMM D YYYY")}`;
    }

    return chatUpdatedAtMoment.fromNow();
  });

  const chatFavouriteQuery = trpc()?.chatFavourite.createQuery(
    reactiveQueryArgs(() => ({ chatId }))
  );
  const chatFavouriteMutation = trpc()?.chatSetFavourite.createMutation({
    onMutate: async ({ isFavorite }) => {
      const utils = trpc()?.createUtils();

      await utils?.chatFavourite.cancel({ chatId });
      const previousValue = !isFavorite;
      utils?.chatFavourite.setData({ chatId }, isFavorite);

      return { previousValue };
    },
    onError: (err, { isFavorite }) => {
      const utils = trpc()?.createUtils();
      utils?.chatFavourite.setData({ chatId }, !isFavorite);
      console.warn(err);
      toast.error("Failed to update favourite status.");
    },
    onSettled: () => {
      const utils = trpc()?.createUtils();
      utils?.chatFavourite.invalidate({ chatId });
    },
  });

  const handleUpdateFavourite = async () => {
    await $chatFavouriteMutation?.mutate({ chatId, isFavorite: !$chatFavouriteQuery?.data });
  };

  let copyingLink = $state(false);
  const handleCopyLink = async () => {
    copyingLink = true;
    await navigator.clipboard.writeText(window.location.href);
    copyingLink = false;
    toast.success("Link copied to clipboard.");
  };
</script>

<div class="flex items-center gap-2 text-sm">
  {#if chatUpdatedAtString}
    <div class="hidden font-medium text-muted-foreground md:inline-block">
      Last message {chatUpdatedAtString}
    </div>
  {/if}
  <Tooltip.Root>
    <Tooltip.Trigger>
      {#snippet child({ props })}
        {#if $chatFavouriteQuery?.data !== undefined}
          <Button
            {...props}
            variant="ghost"
            size="icon"
            class="h-7 w-7"
            onclick={handleUpdateFavourite}
          >
            <Star class={$chatFavouriteQuery?.data ? "fill-primary" : ""} />
          </Button>
        {/if}
      {/snippet}
    </Tooltip.Trigger>
    <Tooltip.Content>Add to favourites</Tooltip.Content>
  </Tooltip.Root>

  <Popover.Root bind:open>
    <Popover.Trigger>
      {#snippet child({ props })}
        <Button {...props} variant="ghost" size="icon" class="h-7 w-7 data-[state=open]:bg-accent">
          <Ellipsis />
        </Button>
      {/snippet}
    </Popover.Trigger>
    <Popover.Content class="w-56 overflow-hidden rounded-lg p-0" align="end">
      <Sidebar.Root collapsible="none" class="bg-transparent">
        <Sidebar.Content>
          {#if $chatFavouriteQuery?.data !== undefined}
            <Sidebar.Group class="border-b last:border-none">
              <Sidebar.GroupContent class="gap-0">
                <Sidebar.Menu>
                  <Sidebar.MenuItem>
                    {#if $chatFavouriteQuery?.data}
                      <Sidebar.MenuButton onclick={handleUpdateFavourite}>
                        <Star class="fill-primary" /> <span>Remove from favourites</span>
                      </Sidebar.MenuButton>
                    {:else}
                      <Sidebar.MenuButton onclick={handleUpdateFavourite}>
                        <Star /> <span>Add to favourites</span>
                      </Sidebar.MenuButton>
                    {/if}
                  </Sidebar.MenuItem>
                </Sidebar.Menu>
              </Sidebar.GroupContent>
            </Sidebar.Group>
          {/if}
          <Sidebar.Group class="border-b last:border-none">
            <Sidebar.GroupContent class="gap-0">
              <Sidebar.Menu>
                <Sidebar.MenuItem>
                  <Sidebar.MenuButton>
                    <ExternalLink /> <span>Share</span>
                  </Sidebar.MenuButton>
                </Sidebar.MenuItem>
                <Sidebar.MenuItem>
                  <Sidebar.MenuButton onclick={handleCopyLink} disabled={copyingLink}>
                    {#if copyingLink}
                      <LoaderCircle class="animate-spin" /> <span>Copying...</span>
                    {:else}
                      <Link /> <span>Copy Link</span>
                    {/if}
                  </Sidebar.MenuButton>
                </Sidebar.MenuItem>
              </Sidebar.Menu>
            </Sidebar.GroupContent>
          </Sidebar.Group>
          <Sidebar.Group class="border-b last:border-none">
            <Sidebar.GroupContent class="gap-0">
              <Sidebar.Menu>
                <Sidebar.MenuItem>
                  <DeleteChat {chatId}>
                    {#snippet child({ props })}
                      <Sidebar.MenuButton {...props}>
                        <Trash /> <span>Delete</span>
                      </Sidebar.MenuButton>
                    {/snippet}
                  </DeleteChat>
                </Sidebar.MenuItem>
              </Sidebar.Menu>
            </Sidebar.GroupContent>
          </Sidebar.Group>
        </Sidebar.Content>
      </Sidebar.Root>
    </Popover.Content>
  </Popover.Root>
</div>
