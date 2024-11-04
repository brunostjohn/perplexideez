<script lang="ts">
  import { page } from "$app/stores";
  import * as Sidebar from "$lib/components/ui/sidebar/index.js";
  import { SearchIcon } from "lucide-svelte";
</script>

<Sidebar.Menu>
  <Sidebar.MenuItem>
    <Sidebar.MenuButton isActive={$page.url.pathname === "/"}>
      {#snippet child({ props })}
        <a href="/" {...props}>
          <SearchIcon />
          <span>New Search</span>
        </a>
      {/snippet}
    </Sidebar.MenuButton>
  </Sidebar.MenuItem>
</Sidebar.Menu>
