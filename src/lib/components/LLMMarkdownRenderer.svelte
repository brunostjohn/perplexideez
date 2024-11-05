<script lang="ts">
  import SvelteMarkdown from "svelte-markdown";
  import { Heading, ListItem } from "./markdown";

  interface Props {
    source: string;
  }

  const { source }: Props = $props();

  const renderers = {
    heading: Heading,
    listitem: ListItem,
    // this is criminal bullshit but the d.ts file is wrong
  } as unknown as any;
</script>

<SvelteMarkdown {source} {renderers} />
