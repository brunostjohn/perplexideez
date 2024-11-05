<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import * as Popover from "$lib/components/ui/popover";
  import * as Sidebar from "$lib/components/ui/sidebar";
  import * as Tooltip from "$lib/components/ui/tooltip";
  import { ExternalLink, Ellipsis, Star, Link, Trash } from "lucide-svelte";

  let open = $state(false);
</script>

<div class="flex items-center gap-2 text-sm">
  <div class="hidden font-medium text-muted-foreground md:inline-block">
    Last message on 8th October
  </div>
  <Tooltip.Root>
    <Tooltip.Trigger>
      {#snippet child({ props })}
        <Button {...props} variant="ghost" size="icon" class="h-7 w-7">
          <Star />
        </Button>
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
          <Sidebar.Group class="border-b last:border-none">
            <Sidebar.GroupContent class="gap-0">
              <Sidebar.Menu>
                <Sidebar.MenuItem>
                  <Sidebar.MenuButton>
                    <Star /> <span>Add to favourites</span>
                  </Sidebar.MenuButton>
                </Sidebar.MenuItem>
              </Sidebar.Menu>
            </Sidebar.GroupContent>
          </Sidebar.Group>
          <Sidebar.Group class="border-b last:border-none">
            <Sidebar.GroupContent class="gap-0">
              <Sidebar.Menu>
                <Sidebar.MenuItem>
                  <Sidebar.MenuButton>
                    <ExternalLink /> <span>Share</span>
                  </Sidebar.MenuButton>
                </Sidebar.MenuItem>
                <Sidebar.MenuItem>
                  <Sidebar.MenuButton>
                    <Link /> <span>Copy Link</span>
                  </Sidebar.MenuButton>
                </Sidebar.MenuItem>
              </Sidebar.Menu>
            </Sidebar.GroupContent>
          </Sidebar.Group>
          <Sidebar.Group class="border-b last:border-none">
            <Sidebar.GroupContent class="gap-0">
              <Sidebar.Menu>
                <Sidebar.MenuItem>
                  <Sidebar.MenuButton>
                    <Trash /> <span>Delete</span>
                  </Sidebar.MenuButton>
                </Sidebar.MenuItem>
              </Sidebar.Menu>
            </Sidebar.GroupContent>
          </Sidebar.Group>
        </Sidebar.Content>
      </Sidebar.Root>
    </Popover.Content>
  </Popover.Root>
</div>
