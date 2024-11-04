<script lang="ts" module>
  import Blocks from "lucide-svelte/icons/blocks";
  import Calendar from "lucide-svelte/icons/calendar";
  import MessageCircleQuestion from "lucide-svelte/icons/message-circle-question";
  import Settings2 from "lucide-svelte/icons/settings-2";
  import Trash2 from "lucide-svelte/icons/trash-2";

  const data = {
    favorites: [
      {
        name: "Project Management & Task Tracking",
        url: "#",
        emoji: "📊",
      },
      {
        name: "Family Recipe Collection & Meal Planning",
        url: "#",
        emoji: "🍳",
      },
      {
        name: "Fitness Tracker & Workout Routines",
        url: "#",
        emoji: "💪",
      },
      {
        name: "Book Notes & Reading List",
        url: "#",
        emoji: "📚",
      },
      {
        name: "Sustainable Gardening Tips & Plant Care",
        url: "#",
        emoji: "🌱",
      },
      {
        name: "Language Learning Progress & Resources",
        url: "#",
        emoji: "🗣️",
      },
      {
        name: "Home Renovation Ideas & Budget Tracker",
        url: "#",
        emoji: "🏠",
      },
      {
        name: "Personal Finance & Investment Portfolio",
        url: "#",
        emoji: "💰",
      },
      {
        name: "Movie & TV Show Watchlist with Reviews",
        url: "#",
        emoji: "🎬",
      },
      {
        name: "Daily Habit Tracker & Goal Setting",
        url: "#",
        emoji: "✅",
      },
    ],
  };
</script>

<script lang="ts">
  import NavFavorites from "$lib/components/nav-favorites.svelte";
  import NavMain from "$lib/components/nav-main.svelte";
  import * as Sidebar from "$lib/components/ui/sidebar/index.js";
  import type { ComponentProps } from "svelte";
  import UserMenu from "./UserMenu.svelte";
  import AppLogo from "./AppLogo.svelte";

  let { ref = $bindable(null), ...restProps }: ComponentProps<typeof Sidebar.Root> = $props();
</script>

<Sidebar.Root bind:ref class="border-r-0" {...restProps}>
  <Sidebar.Header>
    <AppLogo />
    <NavMain />
  </Sidebar.Header>
  <Sidebar.Content>
    <NavFavorites favorites={data.favorites} />
  </Sidebar.Content>
  <Sidebar.Footer>
    <UserMenu />
  </Sidebar.Footer>
  <Sidebar.Rail />
</Sidebar.Root>
