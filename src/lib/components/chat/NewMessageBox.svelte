<script lang="ts">
  import * as Tooltip from "$lib/components/ui/tooltip";
  import { SendHorizonal } from "lucide-svelte";
</script>

<div class="align-center flex w-full items-center rounded-full border bg-muted/30 px-3 py-3">
  <textarea
    placeholder="Ask anything..."
    rows="1"
    class="max-h-24 w-full resize-none bg-transparent pl-3 text-lg placeholder:text-lg placeholder:text-muted-foreground focus:outline-none lg:max-h-36 xl:max-h-48"
  ></textarea>

  <Tooltip.Root>
    <Tooltip.Trigger>
      {#snippet child({ props })}
        <button
          {...props}
          class="rounded-full bg-blue-500 p-2 transition-all hover:bg-blue-400 active:scale-95"
        >
          <SendHorizonal class="size-4" />
        </button>
      {/snippet}
    </Tooltip.Trigger>
    <Tooltip.Content>Send</Tooltip.Content>
  </Tooltip.Root>
</div>
