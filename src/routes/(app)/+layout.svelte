<script lang="ts">
  import type { Snippet } from "svelte";
  import AppSidebar from "$lib/components/AppSidebar.svelte";
  import NavActions from "$lib/components/NavActions.svelte";
  import * as Breadcrumb from "$lib/components/ui/breadcrumb";
  import { Separator } from "$lib/components/ui/separator";
  import * as Sidebar from "$lib/components/ui/sidebar";
  import { page } from "$app/stores";
  import type { LayoutServerData } from "./$types";
  import { cn } from "$lib/utils";
  import { trpc } from "$lib/trpc";
  import { reactiveQueryArgs } from "$lib/utils.svelte";

  interface Props {
    children?: Snippet;
    data: LayoutServerData;
  }

  const { children, data }: Props = $props();

  let scrollDiv = $state<HTMLDivElement>();
  let isScrollDivScrolledToTop = $state(false);

  $effect(() => {
    if ($page.url.pathname === "/") isScrollDivScrolledToTop = true;
  });

  const handleScroll = () => {
    isScrollDivScrolledToTop = scrollDiv?.scrollTop === 0;
  };

  const isChatPage = $derived($page.url.pathname.startsWith("/chat/"));
  const chatId = $derived(isChatPage ? $page.url.pathname.split("/")[2]! : null);

  const chatNameQuery = trpc()?.chatName.createQuery(
    reactiveQueryArgs(() => ({ chatId: chatId ?? "" })),
    reactiveQueryArgs(() => ({ enabled: !!chatId }))
  );
</script>

<Sidebar.Provider>
  <AppSidebar user={data.user} />
  <Sidebar.Inset class="relative h-screen max-h-screen overflow-hidden">
    <header
      class={cn(
        "absolute left-0 top-0 flex h-14 w-full shrink-0 items-center gap-2 bg-transparent backdrop-blur-lg backdrop-saturate-150",
        isScrollDivScrolledToTop ? "" : "backdrop-brightness-50"
      )}
    >
      <div class="flex flex-1 items-center gap-2 px-3">
        <Sidebar.Trigger />
        {#if isChatPage && chatId && $chatNameQuery?.data && $chatNameQuery?.data?.title}
          <Separator orientation="vertical" class="mr-2 h-4" />
          <Breadcrumb.Root>
            <Breadcrumb.List>
              <Breadcrumb.Item>
                <Breadcrumb.Page class="line-clamp-1 text-muted-foreground">
                  {$chatNameQuery?.data?.title}
                </Breadcrumb.Page>
              </Breadcrumb.Item>
            </Breadcrumb.List>
          </Breadcrumb.Root>
        {/if}
      </div>
      {#if isChatPage && chatId}
        <div class="ml-auto px-3">
          <NavActions {chatId} />
        </div>
      {/if}
    </header>
    <div
      class="flex flex-1 flex-col gap-4 overflow-y-auto overflow-x-hidden px-4 pb-10 pt-16"
      bind:this={scrollDiv}
      onscroll={handleScroll}
    >
      {@render children?.()}
    </div>
  </Sidebar.Inset>
</Sidebar.Provider>
