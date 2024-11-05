<script lang="ts">
  import type { PageData } from "./$types";
  import { trpc } from "$lib/trpc";
  import { reactiveQueryArgs } from "$lib/utils.svelte";
  import { Message } from "$lib/components/chat";

  interface Props {
    data: PageData;
  }

  const { data }: Props = $props();
  const { id: chatId } = $derived(data);
  let isStreaming = $state(false);

  const chatQuery = trpc()?.chat.createQuery(
    reactiveQueryArgs(() => ({
      chatId,
    })),
    reactiveQueryArgs(() => ({
      refetchInterval: isStreaming ? 1000 : false,
    }))
  );
  let latestMessage = $state("");
  let streamedOnce = $state(false);

  $effect(() => {
    if (streamedOnce || !$chatQuery?.data || isStreaming) return;

    const { messages } = $chatQuery.data;
    if (messages.length === 0) return;

    const lastMessage = messages[messages.length - 1];

    if (lastMessage.role === "User" || (lastMessage.role === "Assistant" && lastMessage.pending)) {
      console.log("attempting to stream respnose!");
      streamAResponse();
    }
  });

  // @ts-expect-error - how deep is YOUR type instantiation?
  const messageIds = $derived($chatQuery?.data?.messages?.map(({ id }) => id) ?? []);

  const streamAResponse = async () => {
    isStreaming = true;
    streamedOnce = true;

    const response = await fetch(`/chat/${chatId}`, {
      method: "POST",
      credentials: "include",
    });
    const reader = response.body?.pipeThrough(new TextDecoderStream()).getReader();
    if (!reader) return;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      try {
        const parsed = JSON.parse(value) as {
          type: "response" | "sources" | "doneSources";
          data: string;
        };
        if (parsed.type === "response") {
          latestMessage += parsed.data;
        }
        if (parsed.type === "doneSources") {
          $chatQuery?.refetch();
        }
      } catch {
        if (import.meta.env.DEV) console.warn("Failed to parse JSON! This could be fine.");
      }
    }
    isStreaming = false;
  };

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
</script>

{#if $chatQuery?.data}
  <main class="mx-auto h-full w-full max-w-[94%] flex-col gap-2">
    {#each chunkify($chatQuery.data.messages, 2) as [humanMessage, aiMessage]}
      <Message
        messagePair={{
          humanQuery: { content: humanMessage.content! },
          aiResponse: aiMessage
            ? {
                content: aiMessage.content,
                pending: aiMessage.pending ?? false,
                id: aiMessage.id,
                sources: aiMessage.sources,
              }
            : undefined,
        }}
      />
    {/each}
  </main>
{/if}
