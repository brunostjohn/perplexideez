<script lang="ts">
  import type { Component, Snippet } from "svelte";

  interface Props {
    // should be
    // icon: Component<{ class: string }>;
    // is this because lucide types are fucked
    icon: any;
    children?: Snippet;
  }

  const { icon: Icon, children }: Props = $props();
</script>

<div class="align-center mb-4 flex items-center gap-2">
  <Icon class="size-6" />
  <h2 class="text-2xl font-semibold">
    {@render children?.()}
  </h2>
</div>
