<script lang="ts">
  import { BookCopy, MessageCircleQuestion } from "lucide-svelte";
  import {
    FollowUpQuestions,
    MessageAccessories,
    MessageSectionTitle,
    MessageSidebar,
    NewMessageBox,
    Sources,
  } from ".";
  import { LLMMarkdownRenderer } from "..";
  import { Separator } from "../ui/separator";

  interface Source {
    imageUrl?: string | null;
    faviconUrl?: string | null;
    title: string;
    url: string;
  }

  interface MessagePair {
    humanQuery: {
      content: string;
    };
    aiResponse?: {
      content?: string | null;
      pending: boolean;
      id: string;
      sources: Source[];
    };
  }

  interface Props {
    messagePair: MessagePair;
  }

  const { messagePair }: Props = $props();
</script>

<div class="flex h-full gap-8">
  <div class="h-full w-[70%] pb-10">
    <h1 class="mb-6 text-4xl font-bold">{messagePair.humanQuery.content}</h1>

    {#if messagePair.aiResponse}
      <MessageSectionTitle icon={BookCopy}>Sources</MessageSectionTitle>
      <Sources sources={messagePair.aiResponse.sources} />

      <MessageSectionTitle icon={MessageCircleQuestion}>Answer</MessageSectionTitle>
      <div class="flex flex-col gap-2 pr-10">
        <LLMMarkdownRenderer
          source={(messagePair.aiResponse.isStreaming && messagePair.aiResponse.pending
            ? messagePair.aiResponse.streamedContent
            : messagePair.aiResponse.content) ?? ""}
        />
      </div>
      <MessageAccessories />

      <MessageSectionTitle icon={MessageCircleQuestion}>Follow Up</MessageSectionTitle>
      <FollowUpQuestions />
      <div class="mt-8 pb-10 pr-10">
        <NewMessageBox />
      </div>
    {/if}
  </div>
  <Separator orientation="vertical" class="mt-12 h-[32rem] max-h-[32rem] !min-h-[auto]" />
  <div class="mt-12 w-[30%]">
    <MessageSidebar />
  </div>
</div>
