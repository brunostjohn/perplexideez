<script lang="ts">
  import * as Sidebar from "$lib/components/ui/sidebar";
  import Command from "lucide-svelte/icons/command";
</script>

<Sidebar.MenuButton class="w-fit px-1.5">
  <div
    class="flex aspect-square size-5 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground"
  >
    <Command class="size-3" />
  </div>
  <span class="truncate font-semibold">Perplexideez</span>
</Sidebar.MenuButton>
