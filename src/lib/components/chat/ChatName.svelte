<script lang="ts">
  import { Separator } from "$lib/components/ui/separator";
  import * as Breadcrumb from "$lib/components/ui/breadcrumb";
  import { trpc } from "$lib/trpc";
  import { reactiveQueryArgs } from "$lib/utils.svelte";

  interface Props {
    chatId: string;
  }

  const { chatId }: Props = $props();

  const chatNameQuery = trpc()?.chatName.createQuery(reactiveQueryArgs(() => ({ chatId })));
</script>

{#if $chatNameQuery?.data && $chatNameQuery?.data?.title}
  <Separator orientation="vertical" class="mr-2 h-4" />
  <Breadcrumb.Root>
    <Breadcrumb.List>
      <Breadcrumb.Item>
        <Breadcrumb.Page class="line-clamp-1 text-muted-foreground">
          {$chatNameQuery?.data?.title}
        </Breadcrumb.Page>
      </Breadcrumb.Item>
    </Breadcrumb.List>
  </Breadcrumb.Root>
{/if}
