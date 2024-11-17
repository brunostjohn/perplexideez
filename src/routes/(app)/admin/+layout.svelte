<script lang="ts">
  import { AdminSectionLink } from "$lib/components/admin";
  import { Settings, User } from "lucide-svelte";
  import type { Snippet } from "svelte";

  interface Props {
    children?: Snippet;
  }

  const { children }: Props = $props();
</script>

<div class="mx-auto h-full max-w-screen-lg">
  <h1 class="mb-12 text-4xl font-bold">Admin Settings</h1>
  <div class="flex">
    <aside class="h-full w-[25%]">
      <ul class="flex flex-col gap-4">
        <AdminSectionLink href="/admin" icon={Settings}>General</AdminSectionLink>
        <AdminSectionLink href="/admin/users" icon={User}>Users</AdminSectionLink>
      </ul>
    </aside>
    <div class="h-full w-[75%]">
      {@render children?.()}
    </div>
  </div>
</div>
