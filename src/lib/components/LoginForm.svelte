<script lang="ts">
  import { SignIn } from "@auth/sveltekit/components";
  import { Button } from "$lib/components/ui/button/index.js";
  import * as Card from "$lib/components/ui/card/index.js";
  import { LoaderCircle } from "lucide-svelte";
  import { signIn } from "@auth/sveltekit/client";

  interface Props {
    oauthName: string;
  }

  const { oauthName }: Props = $props();

  let isLoading = $state(false);

  const handleSignIn = async () => {
    isLoading = true;
    await signIn("generic-oauth", {
      callbackUrl: "/",
    });
    isLoading = false;
  };
</script>

<Card.Root class="mx-auto w-full max-w-sm">
  <Card.Header>
    <Card.Title class="text-2xl">Perplexideez</Card.Title>
    <Card.Description>Please sign in to continue.</Card.Description>
  </Card.Header>
  <Card.Content>
    <Button variant="outline" class="w-full" disabled={isLoading} onclick={handleSignIn}>
      {#if isLoading}
        <LoaderCircle class="animate-spin" /> Please wait...
      {:else}
        Sign in with {oauthName}
      {/if}
    </Button>
  </Card.Content>
</Card.Root>
