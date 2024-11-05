<script lang="ts">
  import type { Snippet } from "svelte";

  interface Props {
    children?: Snippet;
  }

  const { children }: Props = $props();
</script>

<li class="ml-8 list-disc">
  {@render children?.()}
</li>
