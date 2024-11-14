<script lang="ts">
  import { SignUpForm } from "$lib/components/auth";
  import type { PageServerData } from "./$types";

  interface Props {
    data: PageServerData;
  }

  const { data }: Props = $props();
</script>

<div class="flex h-screen w-full items-center justify-center px-4">
  {#if data.formValidated}
    <SignUpForm formValidated={data.formValidated} />
  {/if}
</div>
