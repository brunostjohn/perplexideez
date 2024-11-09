<script lang="ts">
  import { SearchBox } from "$lib/components/search";
  import type { PageServerData } from "./$types";

  interface Props {
    data: PageServerData;
  }
  const { data }: Props = $props();
  const { llmSpeed, llmBalanced, llmQuality } = $derived(data);
</script>

<main class="align-center flex h-full w-full flex-col items-center justify-center">
  <SearchBox {llmSpeed} {llmBalanced} {llmQuality} />
</main>
