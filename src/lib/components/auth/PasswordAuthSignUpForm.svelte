<script lang="ts">
  import { superForm, type Infer, type SuperValidated } from "sveltekit-superforms";
  import {
    passwordAuthSignUpFormSchema,
    type PasswordAuthSignUpFormSchema,
  } from "./passwordAuthSignUpFormSchema";
  import { zodClient } from "sveltekit-superforms/adapters";
  import * as Form from "$lib/components/ui/form";
  import { Input } from "$lib/components/ui/input";
  import { LoaderCircle } from "lucide-svelte";
  import { toast } from "svelte-sonner";

  interface Props {
    formValidated: SuperValidated<Infer<PasswordAuthSignUpFormSchema>>;
  }

  const { formValidated }: Props = $props();
  const form = superForm(formValidated, {
    validators: zodClient(passwordAuthSignUpFormSchema),
    onError: ({ result: { error } }) => {
      toast.error("There was an error signing up.", {
        description: error.message,
      });
    },
  });
  const { form: formData, enhance, delayed } = form;
</script>

<form method="POST" use:enhance class="mb-2">
  <Form.Field {form} name="name">
    <Form.Control>
      {#snippet children({ props })}
        <Form.Label>Name</Form.Label>
        <Input {...props} bind:value={$formData.name} readonly={$delayed} />
      {/snippet}
    </Form.Control>
    <Form.FieldErrors />
  </Form.Field>
  <Form.Field {form} name="email">
    <Form.Control>
      {#snippet children({ props })}
        <Form.Label>Email</Form.Label>
        <Input {...props} bind:value={$formData.email} readonly={$delayed} />
      {/snippet}
    </Form.Control>
    <Form.FieldErrors />
  </Form.Field>
  <Form.Field {form} name="password">
    <Form.Control>
      {#snippet children({ props })}
        <Form.Label>Password</Form.Label>
        <Input {...props} bind:value={$formData.password} type="password" readonly={$delayed} />
      {/snippet}
    </Form.Control>
    <Form.FieldErrors />
  </Form.Field>
  <Form.Field {form} name="confirmPassword">
    <Form.Control>
      {#snippet children({ props })}
        <Form.Label>Password</Form.Label>
        <Input
          {...props}
          bind:value={$formData.confirmPassword}
          type="password"
          readonly={$delayed}
        />
      {/snippet}
    </Form.Control>
    <Form.FieldErrors />
  </Form.Field>
  <Form.Button class="mt-4 w-full" disabled={$delayed}
    >{#if $delayed}<LoaderCircle class="animate-spin" />Please wait{:else}Sign in{/if}</Form.Button
  >
</form>
