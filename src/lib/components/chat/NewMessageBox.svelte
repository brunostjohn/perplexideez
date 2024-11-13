<script lang="ts">
  import * as Tooltip from "$lib/components/ui/tooltip";
  import { cn } from "$lib/utils";
  import { SendHorizonal } from "lucide-svelte";
  import { useDebounce } from "runed";
  import { toast } from "svelte-sonner";

  interface Props {
    onSubmit?: (content: string) => void;
  }

  const { onSubmit }: Props = $props();

  let searchAreaContent = $state<string>("");

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      e.stopPropagation();
      handleSubmit();
    }

    const target = e.target as HTMLTextAreaElement;

    target.style.height = target.scrollHeight + "px";
  };

  const toastChill = useDebounce(
    () =>
      toast.error("Please enter a question.", {
        dismissable: true,
      }),
    () => 200
  );

  const handleSubmit = () => {
    if (!searchAreaContent.trim().length) {
      toastChill();
    }
    onSubmit?.(searchAreaContent);
  };
</script>

<div class="align-center flex w-full items-center rounded-full border bg-muted/30 px-3 py-3">
  <textarea
    placeholder="Ask anything..."
    rows="1"
    bind:value={searchAreaContent}
    onkeydown={handleKeyDown}
    class="max-h-24 w-full resize-none bg-transparent pl-3 text-lg placeholder:text-lg placeholder:text-muted-foreground focus:outline-none lg:max-h-36 xl:max-h-48"
  ></textarea>

  <Tooltip.Root>
    <Tooltip.Trigger>
      {#snippet child({ props })}
        <button
          {...props}
          disabled={!searchAreaContent.trim().length}
          class={cn(
            "rounded-full  p-2 transition-all",
            searchAreaContent.trim().length
              ? "bg-blue-500 hover:bg-blue-400 active:scale-95"
              : "bg-gray-500"
          )}
          onclick={handleSubmit}
        >
          <SendHorizonal class="size-4" />
        </button>
      {/snippet}
    </Tooltip.Trigger>
    <Tooltip.Content>Send</Tooltip.Content>
  </Tooltip.Root>
</div>
