<script>
  import { Plus } from "lucide-svelte";
  import { Separator } from "../ui/separator";
</script>

<ul class="align-center flex flex-col items-start justify-center gap-2 pr-10">
  {#each Array.from({ length: 6 }) as _}
    <li
      class="align-center group my-2 flex w-full items-center justify-between text-muted-foreground transition-all hover:text-primary"
    >
      <p class="text-sm">
        How do different project management software tools compare in terms of features?
      </p>
      <Plus class="size-4" />
    </li>
    <Separator class="mx-auto opacity-50" />
  {/each}
</ul>
