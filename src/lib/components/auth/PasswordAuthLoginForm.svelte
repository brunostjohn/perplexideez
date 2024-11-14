<script lang="ts">
  import * as Form from "$lib/components/ui/form";
  import { Input } from "$lib/components/ui/input";
  import { superForm, type Infer, type SuperValidated } from "sveltekit-superforms";
  import { zodClient } from "sveltekit-superforms/adapters";
  import { signIn } from "@auth/sveltekit/client";
  import {
    passwordAuthLoginFormSchema,
    type PasswordAuthLoginFormSchema,
  } from "./passwordAuthLoginFormSchema";
  import { LoaderCircle, WatchIcon } from "lucide-svelte";
  import { handleSignInErrors } from "./handleSignInErrors.svelte";

  interface Props {
    formValidated: SuperValidated<Infer<PasswordAuthLoginFormSchema>>;
    disabled: boolean;
  }

  const { formValidated, disabled }: Props = $props();

  const form = superForm(formValidated, {
    validators: zodClient(passwordAuthLoginFormSchema),

    onSubmit: async ({ cancel, formData, controller }) => {
      cancel();
      controller.abort();
      const email = formData.get("email")?.toString() ?? "";
      const password = formData.get("password")?.toString() ?? "";

      await signIn("credentials", { email, password, callbackUrl: "/" });
    },
  });

  handleSignInErrors();

  const { form: formData, enhance, delayed } = form;
</script>

<form method="POST" use:enhance class="mb-2">
  <Form.Field {form} name="email">
    <Form.Control>
      {#snippet children({ props })}
        <Form.Label>Email</Form.Label>
        <Input {...props} bind:value={$formData.email} readonly={disabled || $delayed} />
      {/snippet}
    </Form.Control>
    <Form.FieldErrors />
  </Form.Field>
  <Form.Field {form} name="password">
    <Form.Control>
      {#snippet children({ props })}
        <Form.Label>Password</Form.Label>
        <Input
          {...props}
          bind:value={$formData.password}
          type="password"
          readonly={disabled || $delayed}
        />
      {/snippet}
    </Form.Control>
    <Form.FieldErrors />
  </Form.Field>
  <Form.Button class="mt-4 w-full" disabled={disabled || $delayed}
    >{#if $delayed || disabled}<LoaderCircle class="animate-spin" />Please wait{:else}Sign in{/if}</Form.Button
  >
</form>
