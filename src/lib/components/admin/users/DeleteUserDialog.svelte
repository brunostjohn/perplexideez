<script lang="ts">
  import * as Dialog from "$lib/components/ui/dialog";

  interface Props {
    open?: boolean;
    userId: string;
  }
  import { Button } from "$lib/components/ui/button";
  import { trpc } from "$lib/trpc";

  let { open = $bindable(false), userId }: Props = $props();

  const deleteUserMutation = trpc()?.deleteUser.createMutation();

  const handleDeleteUser = async () => {
    await $deleteUserMutation?.mutateAsync({ userId });
    const utils = trpc()?.createUtils();
    await utils?.users.invalidate();
    await utils?.users.refetch();
  };
</script>

<Dialog.Root bind:open>
  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title>Are you sure absolutely sure?</Dialog.Title>
      <Dialog.Description>
        This action cannot be undone. This will permanently delete this account and remove its data.
      </Dialog.Description>
    </Dialog.Header>
    <Dialog.Footer>
      <Button variant="ghost" onclick={() => (open = false)}>Cancel</Button>
      <Button variant="destructive" onclick={handleDeleteUser}>Delete user</Button>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>
