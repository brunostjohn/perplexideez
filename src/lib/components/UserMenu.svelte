<script lang="ts">
  import * as Avatar from "$lib/components/ui/avatar";
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
  import { cn } from "$lib/utils";
  import { signOut } from "@auth/sveltekit/client";
  import { ChevronDown, Settings, LogOut } from "lucide-svelte";

  let open = $state(false);

  interface Props {
    user: { name?: string; email: string; image?: string };
  }

  const { user }: Props = $props();

  const handleSignOut = async () => {
    await signOut({
      callbackUrl: "/auth?signOut=true",
    });
  };
</script>

<DropdownMenu.Root bind:open>
  <DropdownMenu.Trigger>
    {#snippet child({ props })}
      <button
        {...props}
        class="align-center flex items-center justify-start gap-2 rounded-md p-2 !outline-transparent !ring-0 transition-all hover:bg-muted/50"
      >
        <Avatar.Root class="aspect-square min-h-8 min-w-8">
          <Avatar.Image loading="lazy" src={user.image} alt={user.name} />
          {#if user.name}
            <Avatar.Fallback>
              {user.name
                .split(" ")
                .map((name) => name[0])
                .join("")}
            </Avatar.Fallback>
          {/if}
        </Avatar.Root>
        <div class="align-center flex flex-col items-start justify-center text-left">
          {#if user.email && user.name}
            <p class="text-sm font-semibold">{user.name}</p>
            <p class="text-xs text-muted-foreground">{user.email}</p>
          {:else}
            <p class="text-sm font-semibold">{user.email}</p>
          {/if}
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
    <!-- <DropdownMenu.Group>
      <DropdownMenu.GroupHeading>My Account</DropdownMenu.GroupHeading>
      <DropdownMenu.Separator />
      <DropdownMenu.Group>
        <DropdownMenu.Item>
          <Settings class="mr-2 size-4" />
          <span>Settings</span>
        </DropdownMenu.Item>
      </DropdownMenu.Group>
    </DropdownMenu.Group>
    <DropdownMenu.Separator /> -->
    <DropdownMenu.Group>
      <DropdownMenu.Item onSelect={handleSignOut}>
        <LogOut class="mr-2 size-4" />
        <span>Sign out</span>
      </DropdownMenu.Item>
    </DropdownMenu.Group>
  </DropdownMenu.Content>
</DropdownMenu.Root>
