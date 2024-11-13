<script lang="ts">
  import type { PageServerData } from "./$types";

  interface Props {
    data: PageServerData;
  }

  const { data }: Props = $props();
</script>
