<script lang="ts">
  import { MessageCircleQuestion, Plus } from "lucide-svelte";
  import { Separator } from "../ui/separator";
  import { MessageSectionTitle } from ".";
  import { Skeleton } from "../ui/skeleton";

  interface Props {
    suggestions?: string[];
    handleSuggestion?: (suggestion: string) => void;
  }

  const { suggestions, handleSuggestion }: Props = $props();

  const randomIntFromInterval = (min: number, max: number) =>
    Math.floor(Math.random() * (max - min + 1) + min);
</script>

<MessageSectionTitle icon={MessageCircleQuestion} isLoading={!suggestions?.length}
  >Follow Up</MessageSectionTitle
>
<ul class="align-center group flex w-full flex-col items-start justify-center gap-2">
  {#if suggestions?.length}
    {#each suggestions as suggestion, i}
      <li
        class="align-center group my-2 flex w-full items-center justify-between text-muted-foreground transition-all hover:text-primary"
      >
        <button
          class="contents"
          onclick={() => {
            handleSuggestion?.(suggestion);
          }}
        >
          <p class="mr-2 text-left text-sm">
            {suggestion}
          </p>
          <Plus class="size-4 min-h-4 min-w-4" />
        </button>
      </li>
      {#if i !== suggestions.length - 1}
        <Separator class="mx-auto opacity-50" />
      {/if}
    {/each}
  {:else}
    <li
      class="align-center group my-2 flex w-full items-center justify-between text-muted-foreground transition-all hover:text-primary"
    >
      <Skeleton class="h-3" style={`width: ${randomIntFromInterval(50, 100)}%;`} />
      <Plus class="size-4 min-h-4 min-w-4" />
    </li>
    <Separator class="mx-auto opacity-50" />
    <li
      class="align-center group my-2 flex w-full items-center justify-between text-muted-foreground transition-all hover:text-primary"
    >
      <Skeleton class="h-3" style={`width: ${randomIntFromInterval(50, 100)}%;`} />
      <Plus class="size-4 min-h-4 min-w-4" />
    </li>
    <Separator class="mx-auto opacity-50" />
    <li
      class="align-center group my-2 flex w-full items-center justify-between text-muted-foreground transition-all hover:text-primary"
    >
      <Skeleton class="h-3" style={`width: ${randomIntFromInterval(50, 100)}%;`} />
      <Plus class="size-4 min-h-4 min-w-4" />
    </li>
    <li
      class="align-center group my-2 flex w-full items-center justify-between text-muted-foreground transition-all hover:text-primary"
    >
      <Skeleton class="h-3" style={`width: ${randomIntFromInterval(50, 100)}%;`} />
      <Plus class="size-4 min-h-4 min-w-4" />
    </li>
  {/if}
</ul>
