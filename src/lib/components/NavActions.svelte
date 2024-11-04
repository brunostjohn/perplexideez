<script lang="ts" module>
  import Link from "lucide-svelte/icons/link";
  import Trash from "lucide-svelte/icons/trash";

  const data = [
    [
      {
        label: "Add to favourites",
        icon: Star,
      },
    ],
    [
      {
        label: "Share",
        icon: ExternalLink,
      },
      {
        label: "Copy Link",
        icon: Link,
      },
    ],
    [
      {
        label: "Delete",
        icon: Trash,
      },
    ],
  ];
</script>

<script lang="ts">
  import { Button } from "$lib/components/ui/button/index.js";
  import * as Popover from "$lib/components/ui/popover/index.js";
  import * as Sidebar from "$lib/components/ui/sidebar/index.js";
  import * as Tooltip from "$lib/components/ui/tooltip/index.js";
  import Ellipsis from "lucide-svelte/icons/ellipsis";
  import Star from "lucide-svelte/icons/star";
  import { ExternalLink } from "lucide-svelte";

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
          {#each data as group, index (index)}
            <Sidebar.Group class="border-b last:border-none">
              <Sidebar.GroupContent class="gap-0">
                <Sidebar.Menu>
                  {#each group as item, index (index)}
                    <Sidebar.MenuItem>
                      <Sidebar.MenuButton>
                        <item.icon /> <span>{item.label}</span>
                      </Sidebar.MenuButton>
                    </Sidebar.MenuItem>
                  {/each}
                </Sidebar.Menu>
              </Sidebar.GroupContent>
            </Sidebar.Group>
          {/each}
        </Sidebar.Content>
      </Sidebar.Root>
    </Popover.Content>
  </Popover.Root>
</div>
