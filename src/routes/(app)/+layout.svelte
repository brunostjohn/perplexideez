<script lang="ts">
  import type { Snippet } from "svelte";
  import AppSidebar from "$lib/components/AppSidebar.svelte";
  import NavActions from "$lib/components/NavActions.svelte";
  import * as Breadcrumb from "$lib/components/ui/breadcrumb";
  import { Separator } from "$lib/components/ui/separator";
  import * as Sidebar from "$lib/components/ui/sidebar";
  import { page } from "$app/stores";

  interface Props {
    children?: Snippet;
  }

  const { children }: Props = $props();
</script>

<Sidebar.Provider>
  <AppSidebar />
  <Sidebar.Inset>
    <header class="flex h-14 shrink-0 items-center gap-2">
      <div class="flex flex-1 items-center gap-2 px-3">
        <Sidebar.Trigger />
        {#if $page.url.pathname.startsWith("/chat/")}
          <Separator orientation="vertical" class="mr-2 h-4" />
          <Breadcrumb.Root>
            <Breadcrumb.List>
              <Breadcrumb.Item>
                <Breadcrumb.Page class="line-clamp-1">
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
    <div class="flex flex-1 flex-col gap-4 px-4 py-10">
      {@render children?.()}
    </div>
  </Sidebar.Inset>
</Sidebar.Provider>
