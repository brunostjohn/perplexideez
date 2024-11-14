<script lang="ts">
  import * as Card from "$lib/components/ui/card";
  import Icon from "$lib/components/Icon.svelte";
  import PasswordAuthSignUpForm from "./PasswordAuthSignUpForm.svelte";
  import type { Infer, SuperValidated } from "sveltekit-superforms";
  import type { PasswordAuthSignUpFormSchema } from "./passwordAuthSignUpFormSchema";

  interface Props {
    formValidated: SuperValidated<Infer<PasswordAuthSignUpFormSchema>>;
  }

  const { formValidated }: Props = $props();
</script>

<Card.Root class="mx-auto w-full max-w-sm">
  <Card.Header>
    <Icon class="size-10" />
    <Card.Title class="text-2xl">Perplexideez</Card.Title>
    <Card.Description>Sign up.</Card.Description>
  </Card.Header>
  <Card.Content>
    <PasswordAuthSignUpForm {formValidated} />
  </Card.Content>
</Card.Root>
