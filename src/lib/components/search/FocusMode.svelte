<script lang="ts">
  import * as Popover from "$lib/components/ui/popover";
  import { cn } from "$lib/utils";
  import {
    Earth,
    Focus,
    GraduationCap,
    MessageCircle,
    BadgePercent,
    Youtube,
    MessageSquareMore,
  } from "lucide-svelte";
  import { type Component } from "svelte";

  const focusOptions = [
    {
      name: "All",
      description: "Searches across all of the internet.",
      icon: Earth,
      value: "all",
    },
    {
      name: "Academic",
      description: "Searches in published academic papers.",
      icon: GraduationCap,
      value: "academic",
    },
    {
      name: "Writing",
      description: "Chat without searching the web.",
      value: "writing",
      icon: MessageCircle,
    },
    {
      name: "Woflram Alpha",
      description: "Computational knowledge engine.",
      value: "wolframalpha",
      icon: BadgePercent,
    },
    {
      name: "Youtube",
      description: "Search and watch videos.",
      value: "youtube",
      icon: Youtube,
    },
    {
      name: "Reddit",
      description: "Search for discussions and opinions.",
      value: "reddit",
      icon: MessageSquareMore,
    },
  ];

  interface Props {
    value?: string;
    open?: boolean;
  }

  let { value = $bindable("all"), open = $bindable(false) }: Props = $props();
</script>

{#snippet focusOption({
  name,
  description,
  icon: Icon,
  value: elementValue,
}: {
  name: string;
  description: string;
  icon: Component<{ class?: string }>;
  value: string;
})}
  <button
    onclick={() => {
      value = elementValue;
      open = false;
    }}
    class={cn(
      "group flex h-full w-full max-w-[170px] flex-col overflow-hidden rounded-md p-3 !outline-none !ring-0 !ring-transparent transition-all hover:bg-muted/75",
      value === elementValue ? "bg-muted/75" : ""
    )}
  >
    <div
      class={cn(
        "align-center mb-2 flex items-center gap-2",
        value === elementValue ? "text-blue-400" : ""
      )}
    >
      <Icon class="aspect-square size-6 min-h-6 min-w-6" />
      <p class="text-base font-semibold">{name}</p>
    </div>
    <p class="text-left text-xs text-muted-foreground">{description}</p>
  </button>
{/snippet}

<Popover.Root bind:open>
  <Popover.Trigger>
    {#snippet child({ props })}
      <button
        {...props}
        class={cn(
          "align-center flex items-center justify-center gap-1.5 rounded-md p-2 text-muted-foreground !outline-none !ring-0 !ring-transparent transition-all hover:bg-muted-foreground/20 hover:text-primary active:scale-[0.95]",
          open ? "text-primary" : ""
        )}
      >
        <Focus class="size-6" />
        <p>Focus</p>
      </button>
    {/snippet}
  </Popover.Trigger>
  <Popover.Content class="grid w-full grid-cols-3 gap-1 overflow-hidden p-4">
    {#each focusOptions as option}
      {@render focusOption(option as unknown as any)}
    {/each}
  </Popover.Content>
</Popover.Root>
