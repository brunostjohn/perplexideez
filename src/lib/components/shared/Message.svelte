<script lang="ts">
  import { LLMMarkdownRenderer } from "..";
  import Sources from "../chat/Sources.svelte";

  interface Source {
    imageUrl?: string | null;
    faviconUrl?: string | null;
    title: string;
    url: string;
    originalIndex: number;
  }

  interface Props {
    humanMessage: {
      content?: string | null;
    };
    aiMessage?: {
      content?: string | null;
      sources: Source[];
    };
  }

  const { humanMessage, aiMessage }: Props = $props();
</script>

<div>
  <h1 class="mb-6 text-3xl font-bold">{humanMessage.content}</h1>

  <Sources sources={aiMessage?.sources} alternativeSizing />

  <LLMMarkdownRenderer source={aiMessage?.content!} usedSources={aiMessage?.sources} />
</div>
