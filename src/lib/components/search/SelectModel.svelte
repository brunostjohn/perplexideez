<script lang="ts">
  import * as Popover from "$lib/components/ui/popover";
  import { trpc } from "$lib/trpc";
  import { cn } from "$lib/utils";
  import { Gauge, ChevronDown, Check, Scale } from "lucide-svelte";
  import { onMount } from "svelte";

  interface Props {
    open?: boolean;
    value?: string;
    llmSpeed: string;
    llmBalanced: string;
    llmQuality: string;
  }

  let {
    open = $bindable(false),
    value = $bindable("balanced"),
    llmSpeed,
    llmBalanced,
    llmQuality,
  }: Props = $props();

  const models = [
    {
      name: "Speed",
      icon: Gauge,
      className: "text-yellow-400",
      value: "speed",
      description: "Prioritise speed and get the quickest possible answer.",
      modelName: llmSpeed,
    },
    {
      name: "Balanced",
      icon: Scale,
      className: "text-blue-400",
      value: "balanced",
      description: "Find the right balance between speed and accuracy.",
      modelName: llmBalanced,
    },
    {
      name: "Quality",
      icon: Check,
      className: "text-green-400",
      value: "quality",
      description: "Get the most thorough and accurate answer.",
      modelName: llmQuality,
    },
  ] as const;

  const currentlySelected = $derived(models.find((model) => model.value === value)!);

  const lastSelectedModelTypeMutation = trpc()?.setModelType.createMutation();
  const lastSelectedModelType = trpc()?.lastSelectedModelType.createQuery(undefined, {
    refetchInterval: 10000,
  });
  onMount(() => {
    $lastSelectedModelType?.promise.then((modelType) => {
      if (!modelType) return;
      value = modelType;
    });
  });

  const handleUpdateLastSelectedModelType = async (modelType: "quality" | "balanced" | "speed") => {
    await $lastSelectedModelTypeMutation?.mutateAsync({ modelType });
  };
</script>

{#snippet modelOption(model: (typeof models)[number])}
  <button
    class={cn(
      "group h-full w-full rounded-md p-3 !outline-none !ring-0 !ring-transparent transition-all hover:bg-muted/75",
      value === model.value ? "bg-muted/75" : ""
    )}
    onclick={() => {
      value = model.value;
      open = false;
      handleUpdateLastSelectedModelType(model.value);
    }}
  >
    <div class="align-center mb-1 flex items-center gap-2">
      <model.icon class={cn("size-6", model.className)} />
      <div class="align-center flex w-full items-center justify-between text-left">
        <p class="font-semibold">{model.name}</p>
        <p class="text-xs text-muted-foreground">{model.modelName}</p>
      </div>
    </div>
    <p class="text-left text-sm text-muted-foreground">{model.description}</p>
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
        <currentlySelected.icon class={cn("size-6", currentlySelected.className)} />
        <p>{currentlySelected.name}</p>
        <ChevronDown class={cn("size-4 transition-all", open ? "rotate-180" : "")} />
      </button>
    {/snippet}
  </Popover.Trigger>
  <Popover.Content class="flex flex-col gap-1">
    {#each models as model}
      {@render modelOption(model)}
    {/each}
  </Popover.Content>
</Popover.Root>
