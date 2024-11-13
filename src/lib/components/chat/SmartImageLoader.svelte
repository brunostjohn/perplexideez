<script lang="ts">
  import { cn } from "$lib/utils";

  interface Props {
    src?: string | null;
    alt: string;
    class?: string;
    imageClass?: string;
    loading?: "lazy" | "eager";
  }

  const { src, alt, class: className, imageClass, loading = "lazy" }: Props = $props();
  let showImage = $state(false);
  let loaded = $state(false);
</script>

<div class={cn("relative z-0 overflow-hidden bg-muted", className)}>
  <div
    class={cn(
      "absolute inset-0 left-0 top-0 z-0 h-full w-full overflow-hidden bg-muted",
      loaded ? "" : "animate-pulse"
    )}
  ></div>
  <img
    {src}
    {alt}
    {loading}
    class={cn(
      "absolute inset-0 left-0 top-0 z-[1] h-full w-full overflow-hidden object-cover transition-all",
      imageClass,
      showImage ? "opacity-100" : "opacity-0"
    )}
    onload={() => {
      loaded = true;
      showImage = true;
    }}
    onerror={() => {
      loaded = true;
      showImage = false;
    }}
  />
</div>
