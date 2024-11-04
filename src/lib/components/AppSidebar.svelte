<script lang="ts" module>
  const data = {
    chats: [
      {
        name: "Project Management & Task Tracking",
        url: "/chat/210398",
        emoji: "📊",
      },
      {
        name: "Family Recipe Collection & Meal Planning",
        url: "/chat/1203948",
        emoji: "🍳",
      },
      {
        name: "Fitness Tracker & Workout Routines",
        url: "/chat/1039483",
        emoji: "💪",
      },
      {
        name: "Book Notes & Reading List",
        url: "/chat/24332",
        emoji: "📚",
      },
      {
        name: "Sustainable Gardening Tips & Plant Care",
        url: "/chat/13094",
        emoji: "🌱",
      },
      {
        name: "Language Learning Progress & Resources",
        url: "/chat/230948",
        emoji: "🗣️",
      },
      {
        name: "Home Renovation Ideas & Budget Tracker",
        url: "/chat/1304",
        emoji: "🏠",
      },
      {
        name: "Personal Finance & Investment Portfolio",
        url: "/chat/2304982",
        emoji: "💰",
      },
      {
        name: "Movie & TV Show Watchlist with Reviews",
        url: "/chat/039842",
        emoji: "🎬",
      },
      {
        name: "Daily Habit Tracker & Goal Setting",
        url: "/chat/309482",
        emoji: "✅",
      },
    ],
  };
</script>

<script lang="ts">
  import NavChats from "$lib/components/NavChats.svelte";
  import NavMain from "$lib/components/NavMain.svelte";
  import * as Sidebar from "$lib/components/ui/sidebar";
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
    <NavChats chats={data.chats} />
  </Sidebar.Content>
  <Sidebar.Footer>
    <UserMenu />
  </Sidebar.Footer>
  <Sidebar.Rail />
</Sidebar.Root>
