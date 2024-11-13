<script lang="ts">
  import * as Dialog from "$lib/components/ui/dialog";
  import { Copy, Eye, LoaderCircle, RotateCw } from "lucide-svelte";
  import Button from "./ui/button/button.svelte";
  import Input from "./ui/input/input.svelte";
  import { toast } from "svelte-sonner";
  import { Switch } from "./ui/switch";
  import { Label } from "./ui/label";
  import { trpc } from "$lib/trpc";
  import { reactiveQueryArgs } from "$lib/utils.svelte";
  import { cn } from "$lib/utils";
  import Separator from "./ui/separator/separator.svelte";

  interface Props {
    chatId: string;
  }

  const { chatId }: Props = $props();

  const sharedLinkQuery = trpc()?.sharedLink.createQuery(reactiveQueryArgs(() => ({ chatId })));
  const sharedLinkMutation = trpc()?.upsertSharedLink.createMutation();

  let isMutating = $state(false);
  $sharedLinkQuery?.promise?.then((data) => {
    if (data) return;
    handleCreateLink();
  });

  const handleCreateLink = async () => {
    isMutating = true;
    await $sharedLinkMutation?.mutate({ chatId });
    const utils = trpc()?.createUtils();
    await utils?.sharedLink.invalidate({ chatId });
    await utils?.sharedLink.refetch({ chatId });
    isMutating = false;
  };

  const shareUrl = $derived.by(() => {
    const url = new URL(window.location.href);
    url.pathname = `/shared/${$sharedLinkQuery?.data?.id}`;

    return url.toString();
  });

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(shareUrl);
    toast.success("Link copied successfully.");
  };

  let showEnableSpinner = $state(false);
  let enableLink = $state($sharedLinkQuery?.data?.enabled ?? false);
  const handleEnableLink = async (enabled: boolean) => {
    showEnableSpinner = true;
    await $sharedLinkMutation?.mutateAsync({ chatId, enabled });
    const utils = trpc()?.createUtils();
    await utils?.sharedLink.invalidate({ chatId });
    await utils?.sharedLink.refetch({ chatId });
    showEnableSpinner = false;
  };
  let showAuthSpinner = $state(false);
  let requireAuth = $state($sharedLinkQuery?.data?.requiredAuth ?? false);
  const handleRequireAuth = async (required: boolean) => {
    showAuthSpinner = true;
    requireAuth = required;
    await $sharedLinkMutation?.mutateAsync({ chatId, requiredAuth: required });
    const utils = trpc()?.createUtils();
    await utils?.sharedLink.invalidate({ chatId });
    await utils?.sharedLink.refetch({ chatId });
    showAuthSpinner = false;
  };
  let showRerollSpinner = $state(false);
  const handleRerollId = async () => {
    showRerollSpinner = true;
    await $sharedLinkMutation?.mutateAsync({ chatId, rerollId: true });
    const utils = trpc()?.createUtils();
    await utils?.sharedLink.invalidate({ chatId });
    await utils?.sharedLink.refetch({ chatId });
    showRerollSpinner = false;
  };

  $effect(() => {
    $sharedLinkQuery?.promise.then((data) => {
      if (data) {
        enableLink = data.enabled;
        requireAuth = data.requiredAuth;
      }
    });
  });
</script>

<Dialog.Header>
  <Dialog.Title>Share this search</Dialog.Title>
  <Dialog.Description>
    Allow others to view this search by sharing the link below.
  </Dialog.Description>
</Dialog.Header>

{#if $sharedLinkQuery?.data}
  <div class="align-center flex items-center justify-center gap-2">
    <Input
      readonly
      value={shareUrl}
      class="!outline-none !outline-transparent !ring-0 !ring-transparent"
    />
    <Button variant="secondary" onclick={handleRerollId}>
      <RotateCw class={cn(showRerollSpinner ? "animate-spin" : "")} />
    </Button>
    <Button variant="secondary" onclick={handleCopyLink}>
      <Copy />
      Copy
    </Button>
  </div>
  <div class="align-center flex w-fit items-center justify-center gap-1 text-muted-foreground">
    <Eye class="size-6" />
    {$sharedLinkQuery?.data.views}
    {$sharedLinkQuery?.data.views === 1 ? "view" : "views"}
  </div>
  <Separator class="mb-2" />
  <div class="flex items-center space-x-2">
    <Switch id="enable" onCheckedChange={handleEnableLink} bind:checked={enableLink} />
    <Label for="enable">Enable link</Label>
    <LoaderCircle
      class={cn(
        "size-4 transition-all",
        showEnableSpinner ? "animate-spin opacity-100" : "opacity-0"
      )}
    />
  </div>
  <div class="flex items-center space-x-2">
    <Switch id="req-auth" onCheckedChange={handleRequireAuth} bind:checked={requireAuth} />
    <Label for="req-auth">Require authentication to view</Label>
    <LoaderCircle
      class={cn(
        "size-4 transition-all",
        showAuthSpinner ? "animate-spin opacity-100" : "opacity-0"
      )}
    />
  </div>
{:else}
  <div class="align-center flex items-center justify-center gap-2 text-muted-foreground">
    <LoaderCircle class="animate-spin" />
    <p>{isMutating ? "Creating link..." : "Please wait..."}</p>
  </div>
{/if}
