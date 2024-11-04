<script lang="ts">
  import NavChats from "$lib/components/NavChats.svelte";
  import NavMain from "$lib/components/NavMain.svelte";
  import * as Sidebar from "$lib/components/ui/sidebar";
  import type { ComponentProps } from "svelte";
  import UserMenu from "./UserMenu.svelte";
  import AppLogo from "./AppLogo.svelte";

  let {
    ref = $bindable(null),
    user,
    ...restProps
  }: ComponentProps<typeof Sidebar.Root> & {
    user: { name?: string; email: string; image?: string };
  } = $props();
</script>

<Sidebar.Root bind:ref class="border-r-0" {...restProps}>
  <Sidebar.Header>
    <AppLogo />
    <NavMain />
  </Sidebar.Header>
  <Sidebar.Content>
    <NavChats />
  </Sidebar.Content>
  <Sidebar.Footer>
    <UserMenu {user} />
  </Sidebar.Footer>
  <Sidebar.Rail />
</Sidebar.Root>
