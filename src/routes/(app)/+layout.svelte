<script lang="ts">
  import type { Snippet } from "svelte";
  import AppSidebar from "$lib/components/AppSidebar.svelte";
  import NavActions from "$lib/components/NavActions.svelte";
  import * as Sidebar from "$lib/components/ui/sidebar";
  import { ScrollArea } from "$lib/components/ui/scroll-area";
  import { page } from "$app/stores";
  import type { LayoutServerData } from "./$types";
  import { cn } from "$lib/utils";
  import { ChatName } from "$lib/components/chat";

  interface Props {
    children?: Snippet;
    data: LayoutServerData;
  }

  const { children, data }: Props = $props();

  let isScrollDivScrolledToTop = $state(true);

  $effect(() => {
    if ($page.url.pathname === "/") isScrollDivScrolledToTop = true;
  });

  const handleScroll = (e: UIEvent) => {
    isScrollDivScrolledToTop = (e.target as HTMLDivElement)?.scrollTop === 0;
  };

  const isChatPage = $derived($page.url.pathname.startsWith("/chat/"));
  const chatId = $derived(isChatPage ? $page.url.pathname.split("/")[2]! : null);
</script>

<Sidebar.Provider>
  <AppSidebar user={data.user} />
  <Sidebar.Inset class="relative h-screen max-h-screen overflow-hidden">
    <header
      class={cn(
        "absolute left-0 top-0 z-[1] flex h-14 w-full shrink-0 items-center gap-2 bg-transparent backdrop-blur-lg backdrop-saturate-150",
        isScrollDivScrolledToTop ? "" : "backdrop-brightness-[40%]"
      )}
    >
      <div class="flex flex-1 items-center gap-2 px-3">
        <Sidebar.Trigger />
        {#if isChatPage && chatId}
          <ChatName {chatId} />
        {/if}
      </div>
      {#if isChatPage && chatId}
        <div class="ml-auto px-3">
          <NavActions {chatId} />
        </div>
      {/if}
    </header>
    <ScrollArea
      class="flex flex-1 flex-col gap-4 overflow-y-auto overflow-x-hidden"
      viewportClasses="px-4 pb-10 pt-16"
      scrollbarYClasses="z-[2]"
      onscroll={handleScroll}
    >
      {@render children?.()}
    </ScrollArea>
  </Sidebar.Inset>
</Sidebar.Provider>
