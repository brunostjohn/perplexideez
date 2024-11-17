<script lang="ts">
  import { Ellipsis } from "lucide-svelte";
  import { Button } from "$lib/components/ui/button";
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
  import DeleteUserDialog from "./DeleteUserDialog.svelte";
  import { trpc } from "$lib/trpc";

  interface Props {
    id: string;
    isMe: boolean;
    role: "Admin" | "User";
  }
  const { id, isMe, role }: Props = $props();

  let showDeleteUserModal = $state(false);

  const toggleRoleMutation = trpc()?.toggleRole.createMutation();

  const handleToggleRole = async () => {
    await $toggleRoleMutation?.mutateAsync({ userId: id });
    const utils = trpc()?.createUtils();
    await utils?.users.invalidate();
    await utils?.users.refetch();
  };
</script>

{#if !isMe}
  <DeleteUserDialog userId={id} open={showDeleteUserModal} />

  <DropdownMenu.Root>
    <DropdownMenu.Trigger>
      {#snippet child({ props })}
        <Button {...props} variant="ghost" size="icon" class="relative size-8 p-0">
          <span class="sr-only">Open menu</span>
          <Ellipsis class="size-4" />
        </Button>
      {/snippet}
    </DropdownMenu.Trigger>
    <DropdownMenu.Content>
      <DropdownMenu.Group>
        <DropdownMenu.GroupHeading>Actions</DropdownMenu.GroupHeading>
        <DropdownMenu.Item
          onSelect={() => (showDeleteUserModal = true)}
          class="text-destructive-foreground"
        >
          Delete user
        </DropdownMenu.Item>
        <DropdownMenu.Item onSelect={handleToggleRole}>
          {#if role === "Admin"}
            Change role to user
          {:else}
            Change role to admin
          {/if}
        </DropdownMenu.Item>
      </DropdownMenu.Group>
    </DropdownMenu.Content>
  </DropdownMenu.Root>
{/if}
