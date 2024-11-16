<script lang="ts">
  import { trpc } from "$lib/trpc";
  import { FollowUpQuestions, MessageAccessories, NewMessageBox, Sources } from ".";
  import { LLMMarkdownRenderer } from "..";
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
      aiModel?: string;
    };
  }

  interface Props {
    messagePair: MessagePair;
    chatId: string;
    isLoading: boolean;
    messagesLength: number;
    i: number;
  }

  const { messagePair, chatId, messagesLength, i }: Props = $props();
  const isLast = $derived(i === messagesLength - 1);
  let streamedOnce = $state(false);

  const streamedResponse = useStreamedResponse({
    chatId,
    lastMessage: messagePair.aiResponse ?? messagePair.humanQuery,
    onStreamed: () => {
      streamedOnce = true;
    },
    refetch: async () => {
      const utils = trpc()?.createUtils();
      await utils?.chat.invalidate({ chatId });
      await utils?.chat.refetch({ chatId });
    },
    enableStreaming: () => !streamedOnce,
  });

  const createMessageMutation = trpc()?.createMessage.createMutation();

  const handleSubmit = async (content: string) => {
    if (!createMessageMutation || !chatId || !content?.trim()?.length) return;

    await $createMessageMutation?.mutateAsync({
      chatId,
      content,
    });
    const utils = trpc()?.createUtils();
    await utils?.chat.invalidate({ chatId });
    await utils?.chat.refetch({ chatId });
  };
</script>

<div>
  <h1 class="mb-6 text-4xl font-bold">{messagePair.humanQuery.content}</h1>

  {#if messagePair.aiResponse || streamedResponse.isStreaming}
    <Sources isStreaming={streamedResponse.isStreaming} sources={messagePair.aiResponse?.sources} />
    
    <LLMMarkdownRenderer
      isStreaming={streamedResponse.isStreaming}
      usedSources={messagePair.aiResponse?.sources}
      source={(streamedResponse.isStreaming || !messagePair.aiResponse?.content
        ? streamedResponse.streamedContent
        : messagePair.aiResponse?.content) ?? ""}
      aiModel={messagePair.aiResponse?.aiModel}
    />

    {#if !streamedResponse.isStreaming && messagePair.aiResponse}
      <MessageAccessories
        content={(streamedResponse.isStreaming || !messagePair.aiResponse?.content
          ? streamedResponse.streamedContent
          : messagePair.aiResponse?.content) ?? ""}
      />

      {#if isLast}
        <FollowUpQuestions
          suggestions={messagePair.aiResponse.suggestions}
          handleSuggestion={handleSubmit}
        />
        <div class="mt-8 pb-10">
          <NewMessageBox onSubmit={handleSubmit} />
        </div>
      {/if}
    {/if}
  {/if}
</div>
