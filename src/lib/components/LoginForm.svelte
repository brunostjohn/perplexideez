<script lang="ts">
  import { Button } from "$lib/components/ui/button/index.js";
  import * as Card from "$lib/components/ui/card/index.js";
  import { LoaderCircle } from "lucide-svelte";
  import { signIn } from "@auth/sveltekit/client";
  import Input from "./ui/input/input.svelte";
  import Label from "./ui/label/label.svelte";
  import Separator from "./ui/separator/separator.svelte";
  import Icon from "./Icon.svelte";
  import { cn } from "$lib/utils";

  interface Props {
    oauthName: string;
    disableSignUp?: boolean;
    disablePasswordLogin?: boolean;
  }

  const { oauthName, disableSignUp = false, disablePasswordLogin = false }: Props = $props();

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
    {#if !disablePasswordLogin}
      <form class={cn(disableSignUp ? "mb-6" : "mb-2")}>
        <Label for="email">Email</Label>
        <Input type="email" placeholder="Email" class="mb-2 mt-1" />
        <Label for="password">Password</Label>
        <Input type="password" placeholder="Password" class="mb-4 mt-1" />
        <Button type="submit" class="w-full">Sign in</Button>
      </form>
      {#if !disableSignUp}
        <Button class="mb-4 w-full" variant="ghost">Create an account</Button>
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
