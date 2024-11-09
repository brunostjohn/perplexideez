<script lang="ts">
  import * as Sidebar from "$lib/components/ui/sidebar";
  import Command from "lucide-svelte/icons/command";
  import Icon from "./Icon.svelte";
</script>

<Sidebar.MenuButton class="w-fit px-1.5">
  <div class="align-center flex items-center justify-center">
    <Icon class="size-6" />
  </div>
  <span class="truncate font-semibold">Perplexideez</span>
</Sidebar.MenuButton>
