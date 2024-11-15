<script lang="ts">
  import { SendHorizonal } from "lucide-svelte";
  import * as Tooltip from "$lib/components/ui/tooltip";
  import FocusMode from "./FocusMode.svelte";
  import SelectModel from "./SelectModel.svelte";
  import { onMount, tick } from "svelte";
  import { trpc } from "$lib/trpc";
  import { toast } from "svelte-sonner";
  import { goto } from "$app/navigation";
  import { getQueryKey } from "trpc-svelte-query-adapter";
  import { cn } from "$lib/utils";
  import { useDebounce } from "runed";

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      e.stopPropagation();
      onSubmit();
    }

    const target = e.target as HTMLTextAreaElement;

    target.style.height = target.scrollHeight + "px";
  };

  let searchArea = $state<HTMLTextAreaElement>();

  onMount(() => {
    tick().then(() => searchArea?.focus());
  });

  let focusMode = $state<"all" | "academic" | "writing" | "wolframalpha" | "youtube" | "reddit">(
    "all"
  );
  let modelType = $state<"balanced" | "speed" | "quality">("balanced");

  const chatMutation = trpc()?.createChat.createMutation();
  const toastChill = useDebounce(
    () =>
      toast.error("Please enter a question.", {
        dismissable: true,
      }),
    () => 200
  );
  const onSubmit = async () => {
    if (!searchAreaContent.trim().length) {
      toastChill();
    }
    if (!searchArea || !searchArea.value || !chatMutation || !$chatMutation) return;

    try {
      const key = getQueryKey(trpc()!.listChats);
      const utils = trpc()!.createUtils();

      const { id } = await $chatMutation.mutateAsync({
        query: searchArea.value,
        modelType,
        focusMode,
      });
      await Promise.all([
        await utils.invalidate(undefined, { queryKey: key }),

        await goto(`/chat/${id}`),
      ]);
    } catch {
      toast.error("Failed to create chat.");
    }
  };

  interface Props {
    llmSpeed: string;
    llmBalanced: string;
    llmQuality: string;
  }

  const { llmSpeed, llmBalanced, llmQuality }: Props = $props();

  let searchAreaContent = $state<string>("");
</script>

<div
  class="flex w-full max-w-[90%] flex-col rounded-lg border bg-muted/30 p-6 pb-3 pl-3 sm:max-w-[75%] md:max-w-[60%]"
>
  <textarea
    bind:this={searchArea}
    bind:value={searchAreaContent}
    onkeydown={handleKeyDown}
    placeholder="Ask anything..."
    class="max-h-24 w-full resize-none bg-transparent pl-3 text-lg placeholder:text-lg placeholder:text-muted-foreground focus:outline-none lg:max-h-36 xl:max-h-48"
  ></textarea>
  <div class="align-center flex w-full items-center justify-between">
    <FocusMode bind:value={focusMode} />
    <div class="align-center flex items-center gap-2">
      <SelectModel bind:value={modelType} {llmSpeed} {llmBalanced} {llmQuality} />
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
              onclick={onSubmit}
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
