<script lang="ts">
  import { SendHorizonal } from "lucide-svelte";
  import * as Tooltip from "$lib/components/ui/tooltip";
  import FocusMode from "./FocusMode.svelte";
  import SelectModel from "./SelectModel.svelte";
  import { onMount, tick } from "svelte";

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      e.stopPropagation();
    }

    const target = e.target as HTMLTextAreaElement;

    target.style.height = target.scrollHeight + "px";
  };

  let searchArea = $state<HTMLTextAreaElement>();

  onMount(() => {
    tick().then(() => searchArea?.focus());
  });
</script>

<div class="flex w-full max-w-[60%] flex-col rounded-lg border bg-muted/30 p-6 pb-3 pl-3">
  <textarea
    bind:this={searchArea}
    onkeydown={handleKeyDown}
    placeholder="Ask anything..."
    class="max-h-24 w-full resize-none bg-transparent pl-3 text-lg placeholder:text-lg placeholder:text-muted-foreground focus:outline-none lg:max-h-36 xl:max-h-48"
  ></textarea>
  <div class="align-center flex w-full items-center justify-between">
    <FocusMode />
    <div class="align-center flex items-center gap-2">
      <SelectModel />
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
  </div>
</div>
