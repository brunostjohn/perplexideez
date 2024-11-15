<script lang="ts">
  import Icon from "$lib/components/Icon.svelte";
  import { SearchBox } from "$lib/components/search";
  import type { PageServerData } from "./$types";

  interface Props {
    data: PageServerData;
  }
  const { data }: Props = $props();
  const { llmSpeed, llmBalanced, llmQuality } = $derived(data);
</script>

<main class="align-center flex h-full w-full flex-col items-center justify-center">
  <div class="align-center flex w-full flex-col items-center justify-center gap-6 pb-24 sm:pb-32">
    <Icon class="size-24 sm:size-32" />
    <SearchBox {llmSpeed} {llmBalanced} {llmQuality} />
  </div>
</main>
