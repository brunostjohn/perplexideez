<script lang="ts">
  import { cn } from "$lib/utils";
  import type { Snippet } from "svelte";

  interface Props {
    children?: Snippet;
    // lucide types still bad
    icon?: any;
    class?: string;
  }

  const { children, icon: Icon, class: className }: Props = $props();
</script>

<div class={cn("align-center flex items-center gap-2 text-muted-foreground", className)}>
  {#if Icon}
    <!-- svelte-ignore element_invalid_self_closing_tag -->
    <Icon class="size-5" />
  {/if}
  <p class="text-sm">
    {@render children?.()}
  </p>
</div>
