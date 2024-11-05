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

  const chatsQuery = trpc()?.listChats.createQuery();

  const sidebar = useSidebar();
</script>

<Sidebar.Group class="group-data-[collapsible=icon]:hidden">
  <Sidebar.GroupLabel>Searches</Sidebar.GroupLabel>
  <Sidebar.Menu>
    {#if $chatsQuery?.data}
      {#each $chatsQuery?.data as item (item.id)}
        <Sidebar.MenuItem>
          <Sidebar.MenuButton isActive={$page.url.pathname.startsWith(`/chat/${item.id}`)}>
            {#snippet child({ props })}
              <a href={`/chat/${item.id}`} title={item.title} {...props}>
                {#if item.emoji}
                  <span>{item.emoji}</span>
                {/if}
                <span>{item.title}</span>
              </a>
            {/snippet}
          </Sidebar.MenuButton>
          <DropdownMenu.Root>
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
              <DropdownMenu.Item>
                <Link class="text-muted-foreground" />
                <span>Copy Link</span>
              </DropdownMenu.Item>
              <DropdownMenu.Item>
                <ArrowUpRight class="text-muted-foreground" />
                <span>Open in New Tab</span>
              </DropdownMenu.Item>
              <DropdownMenu.Separator />
              <DropdownMenu.Item>
                <Trash2 class="text-muted-foreground" />
                <span>Delete</span>
              </DropdownMenu.Item>
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
