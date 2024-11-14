<script lang="ts">
  import { page } from "$app/stores";
  import { LoginForm } from "$lib/components/auth";
  import { toast } from "svelte-sonner";
  import type { PageServerData } from "./$types";

  const hasRedirected = $derived($page.url.searchParams.get("protected") === "true");
  const hasSignedOut = $derived($page.url.searchParams.get("signedOut") === "true");
  const disabledAuthMethod = $derived($page.url.searchParams.get("disabledAuthMethod") === "true");

  $effect(() => {
    if (!hasRedirected) return;

    toast.info("You must be logged in to view that page.");
  });

  $effect(() => {
    if (!hasSignedOut) return;

    toast.success("You have been signed out.");
  });

  $effect(() => {
    if (!disabledAuthMethod) return;

    toast.error("This authentication method has been disabled.");
  });

  interface Props {
    data: PageServerData;
  }

  const { data }: Props = $props();
</script>

<div class="flex h-screen w-full items-center justify-center px-4">
  <LoginForm
    oauthName={data.oauthName}
    disablePasswordLogin={data.disablePasswordLogin}
    disableSignUp={data.disableSignUp}
    formValidated={data.formValidated}
  />
</div>
