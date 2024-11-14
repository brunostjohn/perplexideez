<script lang="ts">
  import { Button } from "$lib/components/ui/button/index.js";
  import * as Card from "$lib/components/ui/card/index.js";
  import { LoaderCircle } from "lucide-svelte";
  import { signIn } from "@auth/sveltekit/client";
  import Separator from "$lib/components/ui/separator/separator.svelte";
  import Icon from "$lib/components/Icon.svelte";
  import type { Infer, SuperValidated } from "sveltekit-superforms";
  import type { PasswordAuthLoginFormSchema } from "./passwordAuthLoginFormSchema";
  import PasswordAuthLoginForm from "./PasswordAuthLoginForm.svelte";

  interface Props {
    oauthName: string;
    disableSignUp?: boolean;
    disablePasswordLogin?: boolean;
    formValidated: SuperValidated<Infer<PasswordAuthLoginFormSchema>> | null;
  }

  const {
    oauthName,
    disableSignUp = false,
    disablePasswordLogin = false,
    formValidated,
  }: Props = $props();

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
    <Icon class="size-10" />
    <Card.Title class="text-2xl">Perplexideez</Card.Title>
    <Card.Description>Please sign in to continue.</Card.Description>
  </Card.Header>
  <Card.Content>
    {#if !disablePasswordLogin && formValidated}
      <PasswordAuthLoginForm {formValidated} disabled={isLoading} />
      {#if !disableSignUp}
        <Button class="mb-4 w-full" variant="ghost" href="/auth/signUp">Create an account</Button>
      {/if}
      <div class="align-center mb-6 flex w-full items-center justify-between overflow-hidden">
        <Separator class="w-[45%]" />
        <p class="text-xs font-semibold uppercase text-muted-foreground">Or</p>
        <Separator class="w-[45%]" />
      </div>
    {/if}
    <Button variant="outline" class="w-full" disabled={isLoading} onclick={handleSignIn}>
      {#if isLoading}
        <LoaderCircle class="animate-spin" /> Please wait...
      {:else}
        Sign in with {oauthName}
      {/if}
    </Button>
  </Card.Content>
</Card.Root>
