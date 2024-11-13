<script lang="ts">
  import type { PageServerData } from "./$types";
  import { trpc } from "$lib/trpc";
  import { reactiveQueryArgs } from "$lib/utils.svelte";
  import { Message, MessageSidebar } from "$lib/components/chat";
  import { Separator } from "$lib/components/ui/separator";

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
      refetchInterval: 1000,
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

  const messagesLength = $derived(messagesChunked.length);
</script>

{#if $chatQuery?.data}
  <main class="mx-auto h-full w-full max-w-screen-xl flex-col gap-2 px-4 xl:px-0">
    <div class="flex h-full flex-col gap-8 xl:flex-row-reverse">
      <div class="xl:mt-12 xl:w-[30%]">
        <MessageSidebar
          imageResults={$chatQuery?.data.imageResults}
          videoResults={$chatQuery?.data.videoResults}
        />
      </div>
      <Separator
        orientation="vertical"
        class="mt-12 hidden h-[32rem] max-h-[32rem] !min-h-[auto] xl:block"
      />
      <div class="flex flex-col gap-8 pb-10 xl:w-[70%] xl:pl-4">
        {#each messagesChunked as messages, i}
          {@const humanMessage = messages.find(({ role }) => role === "User")!}
          {@const aiMessage = messages.find(({ role }) => role === "Assistant")}
          <Message
            {messagesLength}
            {i}
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
      </div>
    </div>
  </main>
{/if}
