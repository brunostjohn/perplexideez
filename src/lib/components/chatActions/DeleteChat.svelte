<script lang="ts">
  import * as Dialog from "$lib/components/ui/dialog";
  import type { Snippet } from "svelte";
  import { Button } from "../ui/button";
  import { trpc } from "$lib/trpc";
  import { LoaderCircle } from "lucide-svelte";
  import { goto } from "$app/navigation";
  import { page } from "$app/stores";
  import { toast } from "svelte-sonner";

  interface Props {
    child: Snippet<[{ props: any }]>;
    chatId: string;
  }

  const { child: cSnippet, chatId }: Props = $props();

  let open = $state(false);
  const deleteChatMutation = trpc()?.yeetChat.createMutation({
    onSuccess: () => {
      const utils = trpc()?.createUtils();
      if ($page.url.pathname.startsWith(`/chat/${chatId}`)) {
        goto("/");
      }
      toast.success("Chat deleted successfully");
      utils?.listChats.invalidate();
      open = false;
      utils?.chat.invalidate({ chatId });
    },
    onError: (err) => {
      toast.error("Failed to delete chat");
      console.error(err);
    },
  });
</script>

<Dialog.Root bind:open>
  <Dialog.Trigger>
    {#snippet child({ props })}
      {@render cSnippet({ props })}
    {/snippet}
  </Dialog.Trigger>
  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title>Are you sure sure?</Dialog.Title>
      <Dialog.Description>
        This action cannot be undone. This will permanently delete the chat. You will lose all
        messages in this chat.
      </Dialog.Description>
    </Dialog.Header>
    <Dialog.Footer>
      <Button
        disabled={$deleteChatMutation?.isPending}
        variant="ghost"
        onclick={() => {
          open = false;
        }}>Cancel</Button
      >
      <Button
        variant="destructive"
        disabled={$deleteChatMutation?.isPending}
        onclick={() => $deleteChatMutation?.mutate({ chatId })}
      >
        {#if $deleteChatMutation?.isPending}
          <LoaderCircle class="size-6 animate-spin" /> Deleting...
        {:else}
          Delete Chat
        {/if}
      </Button>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>
