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

  interface Props {
    children?: Snippet;
    data: LayoutServerData;
  }

  const { children, data }: Props = $props();

  let scrollDiv = $state<HTMLDivElement>();
  let isScrollDivScrolledToTop = $state(false);

  const handleScroll = () => {
    isScrollDivScrolledToTop = scrollDiv?.scrollTop === 0;
  };
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
        {#if $page.url.pathname.startsWith("/chat/")}
          <Separator orientation="vertical" class="mr-2 h-4" />
          <Breadcrumb.Root>
            <Breadcrumb.List>
              <Breadcrumb.Item>
                <Breadcrumb.Page class="line-clamp-1 text-muted-foreground">
                  Project Management & Task Tracking
                </Breadcrumb.Page>
              </Breadcrumb.Item>
            </Breadcrumb.List>
          </Breadcrumb.Root>
        {/if}
      </div>
      {#if $page.url.pathname.startsWith("/chat/")}
        <div class="ml-auto px-3">
          <NavActions />
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
