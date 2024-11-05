<script>
  import { AudioLines, Copy, RotateCw } from "lucide-svelte";
</script>

<div class="align-center mb-6 mt-4 flex items-center justify-center gap-4 pr-10">
  <button
    class="align-center flex items-center justify-center gap-1 text-sm text-muted-foreground transition-all hover:text-primary"
  >
    <RotateCw class="size-4" />
    <p>Rewrite</p>
  </button>

  <button class="ml-auto text-muted-foreground transition-all hover:text-primary">
    <Copy class="size-4" />
  </button>
  <button class="text-muted-foreground transition-all hover:text-primary">
    <AudioLines class="size-4" />
  </button>
</div>
