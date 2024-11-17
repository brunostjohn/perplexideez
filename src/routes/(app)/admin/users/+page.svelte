<script lang="ts">
  import { columns, DataTable } from "$lib/components/admin/users";
  import { trpc } from "$lib/trpc";

  const usersQuery = trpc()?.users.createQuery();
</script>

{#if $usersQuery?.data}
  <DataTable data={$usersQuery?.data} {columns} />
{/if}
