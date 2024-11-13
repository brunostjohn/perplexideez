<script lang="ts">
  import { page } from "$app/stores";
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
  import * as Sidebar from "$lib/components/ui/sidebar/index.js";
  import { useSidebar } from "$lib/components/ui/sidebar/index.js";
  import { trpc } from "$lib/trpc";
  import ArrowUpRight from "lucide-svelte/icons/arrow-up-right";
  import Ellipsis from "lucide-svelte/icons/ellipsis";
  import Link from "lucide-svelte/icons/link";
  import Trash2 from "lucide-svelte/icons/trash-2";
  import { DeleteChat } from "./chatActions";
  import { toast } from "svelte-sonner";
  import { LoaderCircle } from "lucide-svelte";
  import { reactiveQueryArgs } from "$lib/utils.svelte";

  interface Props {
    isFavourites?: boolean;
  }

  const { isFavourites = false }: Props = $props();

  const chatsQuery = trpc()?.listChats.createQuery(
    reactiveQueryArgs(() => ({ isFavourites })),
    {
      refetchInterval: 2000,
    }
  );

  const sidebar = useSidebar();

  let copyingLink = $state(false);

  let openMap = $state<{ [key: string]: boolean }>({});

  $effect.pre(() => {
    if ($chatsQuery?.data) {
      for (const chat of $chatsQuery.data) {
        if (openMap[chat.id] === undefined) {
          openMap[chat.id] = false;
        }
      }
    }
  });

  const handleCopyLink = async (chatId: string) => {
    copyingLink = true;
    await navigator.clipboard.writeText(`${window.location.origin}/chat/${chatId}`);
    copyingLink = false;
    openMap[chatId] = false;
    toast.success("Link copied to clipboard.");
  };
</script>

{#if !isFavourites || $chatsQuery?.data?.length}
  <Sidebar.Group class="group-data-[collapsible=icon]:hidden">
    <Sidebar.GroupLabel>{isFavourites ? "Favourites" : "Searches"}</Sidebar.GroupLabel>
    <Sidebar.Menu>
      {#if $chatsQuery?.data}
        {#each $chatsQuery?.data as item (item.id)}
          <Sidebar.MenuItem>
            <Sidebar.MenuButton isActive={$page.url.pathname.startsWith(`/chat/${item.id}`)}>
              {#snippet child({ props })}
                <a href={`/chat/${item.id}`} title={item.title} {...props}>
                  {#if item.emoji}
                    <span class="emoji">{item.emoji}</span>
                  {/if}
                  <span>{item.title}</span>
                </a>
              {/snippet}
            </Sidebar.MenuButton>
            <DropdownMenu.Root bind:open={openMap[item.id]}>
              <DropdownMenu.Trigger>
                {#snippet child({ props })}
                  <Sidebar.MenuAction showOnHover {...props}>
                    <Ellipsis />
                    <span class="sr-only">More</span>
                  </Sidebar.MenuAction>
                {/snippet}
              </DropdownMenu.Trigger>
              <DropdownMenu.Content
                class="w-56 rounded-lg"
                side={sidebar.isMobile ? "bottom" : "right"}
                align={sidebar.isMobile ? "end" : "start"}
              >
                <DropdownMenu.Item onclick={() => handleCopyLink(item.id)} disabled={copyingLink}>
                  {#if copyingLink}
                    <LoaderCircle class="animate-spin text-muted-foreground" />
                    <span>Copying Link...</span>
                  {:else}
                    <Link class="text-muted-foreground" />
                    <span>Copy Link</span>
                  {/if}
                </DropdownMenu.Item>
                <DropdownMenu.Item onclick={() => window.open(`/chat/${item.id}`, "_blank")}>
                  <ArrowUpRight class="text-muted-foreground" />
                  <span>Open in New Tab</span>
                </DropdownMenu.Item>
                <DropdownMenu.Separator />
                <DeleteChat chatId={item.id}>
                  {#snippet child({ props })}
                    <DropdownMenu.Item {...props}>
                      <Trash2 class="text-muted-foreground" />
                      <span>Delete</span>
                    </DropdownMenu.Item>
                  {/snippet}
                </DeleteChat>
              </DropdownMenu.Content>
            </DropdownMenu.Root>
          </Sidebar.MenuItem>
        {/each}
        {#if $chatsQuery?.data.length > 10}
          <Sidebar.MenuItem>
            <Sidebar.MenuButton class="text-sidebar-foreground/70">
              <Ellipsis />
              <span>More</span>
            </Sidebar.MenuButton>
          </Sidebar.MenuItem>
        {/if}
      {/if}
    </Sidebar.Menu>
  </Sidebar.Group>
{/if}

<style>
  @font-face {
    font-family: "Apple Color Emoji";
    src: url("/AppleColorEmoji.ttf") format("truetype");
  }

  .emoji {
    font-family: "Apple Color Emoji";
  }
</style>
