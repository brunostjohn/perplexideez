<script lang="ts">
  import { LoaderCircle } from "lucide-svelte";
  import type { Component, Snippet } from "svelte";

  interface Props {
    // should be
    // icon: Component<{ class: string }>;
    // is this because lucide types are fucked
    icon: any;
    children?: Snippet;
    isLoading?: boolean;
    opacity?: number;
  }

  const { icon: Icon, children, isLoading = false, opacity = 1 }: Props = $props();
</script>

<div
  class="align-center mb-4 flex items-center gap-2 transition-all"
  style={`opacity: ${opacity};`}
>
  {#if isLoading}
    <LoaderCircle class="size-6 animate-spin" />
  {:else}
    <Icon class="size-6" />
  {/if}
  <h2 class="text-2xl font-semibold">
    {@render children?.()}
  </h2>
</div>
