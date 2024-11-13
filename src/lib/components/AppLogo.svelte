<script lang="ts">
  import * as Sidebar from "$lib/components/ui/sidebar";
  import Icon from "./Icon.svelte";
</script>

<Sidebar.MenuButton class="h-fit w-full !p-2 !px-1">
  <div class="align-center flex items-center justify-center">
    <Icon class="size-8" />
  </div>
  <span class="truncate text-lg font-semibold">Perplexideez</span>
</Sidebar.MenuButton>
