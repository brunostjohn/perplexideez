<script lang="ts">
  import { AudioLines, Copy, LoaderCircle, RotateCw } from "lucide-svelte";
  import { toast } from "svelte-sonner";

  import * as Tooltip from "$lib/components/ui/tooltip";

  interface Props {
    content: string;
  }

  let copyingContent = $state(false);
  const handleCopyContent = async () => {
    copyingContent = true;
    await navigator.clipboard.writeText(content);
    copyingContent = false;
    toast.success("Response copied to clipboard.");
  };

  const { content }: Props = $props();
</script>

<div class="align-center mb-6 mt-4 flex items-center justify-center gap-4">
  <!-- IMPLEMENT REWRITE -->
  <!-- <button
    class="align-center flex items-center justify-center gap-1 text-sm text-muted-foreground transition-all hover:text-primary"
  >
    <RotateCw class="size-4" />
    <p>Rewrite</p>
  </button> -->

  <Tooltip.Root>
    <Tooltip.Trigger>
      {#snippet child({ props })}
        <button
          {...props}
          class="ml-auto text-muted-foreground transition-all hover:text-primary"
          onclick={handleCopyContent}
        >
          {#if copyingContent}
            <LoaderCircle class="size-4 animate-spin" />
          {:else}
            <Copy class="size-4" />
          {/if}
        </button>
      {/snippet}
    </Tooltip.Trigger>
    <Tooltip.Content>Copy to clipboard</Tooltip.Content>
  </Tooltip.Root>
  <!-- IMPLEMENT TRANSCRIPTION -->
  <!-- <button class="text-muted-foreground transition-all hover:text-primary">
    <AudioLines class="size-4" />
  </button> -->
</div>
