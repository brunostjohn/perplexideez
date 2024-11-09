<script lang="ts">
  import type { PageServerData } from "./$types";
  import { trpc } from "$lib/trpc";
  import { reactiveQueryArgs } from "$lib/utils.svelte";
  import { Message } from "$lib/components/chat";

  interface Props {
    data: PageServerData;
  }

  const { data }: Props = $props();
  const { id: chatId } = $derived(data);

  const chatQuery = trpc()?.chat.createQuery(
    reactiveQueryArgs(() => ({
      chatId,
    })),
    reactiveQueryArgs(() => ({
      refetchInterval: 10000,
    }))
  );

  function* chunkify<T>(itr: Iterable<T>, size: number) {
    let chunk = [];
    for (const v of itr) {
      chunk.push(v);
      if (chunk.length === size) {
        yield chunk;
        chunk = [];
      }
    }
    if (chunk.length) yield chunk;
  }

  const messagesChunked = $derived(
    $chatQuery?.data ? chunkify($chatQuery!.data!.messages, 2).toArray() : []
  );
</script>

{#if $chatQuery?.data}
  <main class="mx-auto h-full w-full max-w-[94%] flex-col gap-2">
    {#each messagesChunked as messages}
      {@const humanMessage = messages.find(({ role }) => role === "User")!}
      {@const aiMessage = messages.find(({ role }) => role === "Assistant")}
      <Message
        {chatId}
        isLoading={$chatQuery.isLoading}
        messagePair={{
          humanQuery: { content: humanMessage?.content ?? "", role: "User" },
          aiResponse: aiMessage
            ? {
                role: "Assistant",
                content: aiMessage.content,
                pending: aiMessage.pending ?? false,
                id: aiMessage.id,
                sources: aiMessage.sources,
                suggestions: aiMessage.suggestions,
              }
            : undefined,
        }}
      />
    {/each}
  </main>
{/if}
