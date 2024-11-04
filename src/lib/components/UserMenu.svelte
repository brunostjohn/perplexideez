<script lang="ts">
  import * as Avatar from "$lib/components/ui/avatar";
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
  import { cn } from "$lib/utils";
  import { ChevronDown, Settings, LogOut } from "lucide-svelte";

  let open = $state(false);
</script>

<DropdownMenu.Root bind:open>
  <DropdownMenu.Trigger>
    {#snippet child({ props })}
      <button
        {...props}
        class="align-center flex items-center justify-start gap-2 rounded-md p-2 !outline-transparent !ring-0 transition-all hover:bg-muted/50"
      >
        <Avatar.Root class="aspect-square min-h-8 min-w-8">
          <Avatar.Fallback>BSJ</Avatar.Fallback>
        </Avatar.Root>
        <div class="align-center flex flex-col items-start justify-center text-left">
          <p class="text-sm font-semibold">Bruno St John</p>
          <p class="text-xs text-muted-foreground">brunost.john@icloud.com</p>
        </div>
        <ChevronDown
          class={cn(
            "ml-auto size-4 text-muted-foreground transition-all",
            open ? "rotate-180 text-primary" : ""
          )}
        />
      </button>
    {/snippet}
  </DropdownMenu.Trigger>
  <DropdownMenu.Content class="min-w-56">
    <DropdownMenu.Group>
      <DropdownMenu.GroupHeading>My Account</DropdownMenu.GroupHeading>
      <DropdownMenu.Separator />
      <DropdownMenu.Group>
        <DropdownMenu.Item>
          <Settings class="mr-2 size-4" />
          <span>Settings</span>
        </DropdownMenu.Item>
      </DropdownMenu.Group>
    </DropdownMenu.Group>
    <DropdownMenu.Separator />
    <DropdownMenu.Group>
      <DropdownMenu.Item>
        <LogOut class="mr-2 size-4" />
        <span>Sign out</span>
      </DropdownMenu.Item>
    </DropdownMenu.Group>
  </DropdownMenu.Content>
</DropdownMenu.Root>
