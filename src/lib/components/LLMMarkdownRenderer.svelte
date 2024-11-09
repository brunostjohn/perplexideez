<script lang="ts">
  import SvelteMarkdown from "svelte-markdown";
  import { Heading, ListItem, Source as SourceRender } from "./markdown";
  import { marked, type TokenizerExtension } from "marked";
  import { MessageSectionTitle } from "./chat";
  import { MessageCircleQuestion } from "lucide-svelte";
  import { cn } from "$lib/utils";

  interface Source {
    imageUrl?: string | null;
    faviconUrl?: string | null;
    title: string;
    url: string;
    originalIndex: number;
  }

  interface Props {
    source: string;
    usedSources?: Source[];
    isStreaming?: boolean;
  }

  const { source, usedSources, isStreaming }: Props = $props();

  const renderers = {
    heading: Heading,
    listitem: ListItem,
    source: SourceRender,
    // this is criminal bullshit but the d.ts file is wrong
  } as unknown as any;

  const sourceExt: TokenizerExtension = {
    name: "source",
    level: "inline" as const,
    tokenizer: (src: string) => {
      const rule = /^\[\d{1,3}\]/;
      const matches = rule.exec(src);

      if (matches) {
        const sourceIndex = parseInt(matches[0].slice(1, -1));
        return {
          type: "source",
          raw: `[${sourceIndex.toString()}]`,
          source: usedSources?.find(({ originalIndex }) => originalIndex === sourceIndex),
          text: sourceIndex.toString(),
        };
      }

      return;
    },
  };

  marked.use({ extensions: [sourceExt], gfm: false, pedantic: true });

  const options = { ...marked.defaults, gfm: false, pedantic: true };
</script>

<MessageSectionTitle
  icon={MessageCircleQuestion}
  isLoading={isStreaming}
  opacity={isStreaming || source.trim() !== "" ? 1 : 0}>Answer</MessageSectionTitle
>
<div class={cn("flex flex-col gap-2 pr-10", isStreaming ? "pb-10" : "")}>
  {#key source}
    <SvelteMarkdown {source} {renderers} {options} />
  {/key}
</div>
