<script lang="ts">
  import { trpc } from "$lib/trpc";
  import { FollowUpQuestions, MessageAccessories, MessageSidebar, NewMessageBox, Sources } from ".";
  import { LLMMarkdownRenderer } from "..";
  import { Separator } from "../ui/separator";
  import { useStreamedResponse } from "./hooks.svelte";

  interface Source {
    imageUrl?: string | null;
    faviconUrl?: string | null;
    title: string;
    url: string;
    originalIndex: number;
  }

  interface MessagePair {
    humanQuery: {
      content: string;
      role: "User";
    };
    aiResponse?: {
      content?: string | null;
      pending: boolean;
      id: string;
      sources: Source[];
      role: "Assistant";
      suggestions: string[];
    };
  }

  interface Props {
    messagePair: MessagePair;
    chatId: string;
    isLoading: boolean;
  }

  const { messagePair, chatId }: Props = $props();

  let streamedOnce = $state(false);

  const streamedResponse = useStreamedResponse({
    chatId,
    lastMessage: messagePair.aiResponse ?? messagePair.humanQuery,
    onStreamed: () => {
      streamedOnce = true;
    },
    refetch: () => {
      const utils = trpc()?.createUtils();
      utils?.chat.invalidate({ chatId });
      utils?.chat.refetch({ chatId });
    },
    enableStreaming: () => !streamedOnce,
  });

  $inspect({
    isStreaming: streamedResponse.isStreaming,
    dbContent: messagePair.aiResponse?.content,
  });
</script>

<div class="flex h-full gap-8">
  <div class="h-full w-[70%] pb-10">
    <h1 class="mb-6 text-4xl font-bold">{messagePair.humanQuery.content}</h1>

    {#if messagePair.aiResponse || streamedResponse.isStreaming}
      <Sources
        isStreaming={streamedResponse.isStreaming}
        sources={messagePair.aiResponse?.sources}
      />

      <LLMMarkdownRenderer
        isStreaming={streamedResponse.isStreaming}
        usedSources={messagePair.aiResponse?.sources}
        source={(streamedResponse.isStreaming || !messagePair.aiResponse?.content
          ? streamedResponse.streamedContent
          : messagePair.aiResponse?.content) ?? ""}
      />

      {#if !streamedResponse.isStreaming && messagePair.aiResponse}
        <MessageAccessories
          content={(streamedResponse.isStreaming || !messagePair.aiResponse?.content
            ? streamedResponse.streamedContent
            : messagePair.aiResponse?.content) ?? ""}
        />

        <FollowUpQuestions suggestions={messagePair.aiResponse.suggestions} />
        <div class="mt-8 pb-10 pr-10">
          <NewMessageBox />
        </div>
      {/if}
    {/if}
  </div>
  <Separator orientation="vertical" class="mt-12 h-[32rem] max-h-[32rem] !min-h-[auto]" />
  <div class="mt-12 w-[30%]">
    <MessageSidebar />
  </div>
</div>
