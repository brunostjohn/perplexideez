<script lang="ts">
  import type { Snippet } from "svelte";
  import { cn } from "$lib/utils";
  import { page } from "$app/stores";

  interface Props {
    // lucide types bad again
    icon: any;
    children: Snippet;
    href: string;
  }

  const { icon: Icon, children, href }: Props = $props();

  const isActive = $derived($page.url.pathname === href);
</script>

<li>
  <a
    {href}
    class={cn(
      "align-center flex items-center gap-1 font-semibold transition-all",
      isActive ? "text-primary" : "text-muted-foreground hover:text-primary"
    )}
  >
    <Icon class="size-6" />
    {@render children?.()}
  </a>
</li>
