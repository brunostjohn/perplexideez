<script lang="ts">
  import { Separator } from "$lib/components/ui/separator";
  import {
    AudioLines,
    BookCopy,
    Bot,
    Clapperboard,
    Copy,
    Image,
    MessageCircleQuestion,
    Plus,
    RotateCw,
    SendHorizonal,
  } from "lucide-svelte";
  import type { PageData } from "./$types";
  import * as Tooltip from "$lib/components/ui/tooltip";
  import { trpc } from "$lib/trpc";
  import SvelteMarkdown from "svelte-markdown";
  import { Heading, ListItem } from "$lib/components/markdown";

  interface Props {
    data: PageData;
  }

  const { data }: Props = $props();
  const { id: chatId } = $derived(data);
  let isStreaming = $state(false);
  const chatQuery = $derived(
    trpc()?.chat.createQuery(
      { chatId },
      {
        enabled: !isStreaming,
      }
    )
  );
  let latestMessage = $state("");
  let streamedOnce = $state(false);

  $effect(() => {
    if (streamedOnce || !$chatQuery?.data || isStreaming) return;

    const { messages } = $chatQuery.data;
    if (messages.length === 0) return;

    const lastMessage = messages[messages.length - 1];

    if (lastMessage.role === "User" || (lastMessage.role === "Assistant" && lastMessage.pending)) {
      console.log("attempting to stream respnose!");
      streamAResponse();
    }
  });

  const sourcesQueries = $derived(
    trpc()?.sources.createQuery({
      // @ts-expect-error - how deep is YOUR type instantiation?
      messageIds: $chatQuery?.data?.messages?.map(({ id }) => id) ?? [],
    })
  );

  const streamAResponse = async () => {
    isStreaming = true;
    streamedOnce = true;

    const response = await fetch(`/chat/${chatId}`, {
      method: "POST",
      credentials: "include",
    });
    const reader = response.body?.pipeThrough(new TextDecoderStream()).getReader();
    if (!reader) return;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      try {
        const parsed = JSON.parse(value) as { type: "response" | "sources"; data: string };
        if (parsed.type === "response") {
          latestMessage += parsed.data;
        }
      } catch {
        if (import.meta.env.DEV) console.warn("Failed to parse JSON! This could be fine.");
      }
    }
    isStreaming = false;

    const utils = trpc()?.createUtils();
    utils?.chat.refetch({ chatId });
  };
</script>

{#if $chatQuery?.data}
  {@const chat = $chatQuery.data}
  {@const newest = chat.messages[chat.messages.length - 1]}
  <main class="mx-auto flex h-full w-full max-w-[94%] gap-8">
    <div class="h-full w-[70%] pb-10">
      <h1 class="mb-6 text-4xl font-bold">{chat.title}</h1>

      <div class="align-center mb-4 flex items-center gap-2">
        <BookCopy class="size-6" />
        <h2 class="text-2xl font-semibold">Sources</h2>
      </div>

      <ul class="mb-6 grid grid-cols-3 gap-2">
        {#if $sourcesQueries?.data}
          {@const freshestSources = $sourcesQueries?.data[newest.id]}
          {#each freshestSources.splice(0, 2) as source}
            <li
              class="flex flex-col overflow-hidden rounded-md bg-muted/50 p-4 transition-all hover:bg-muted/75"
            >
              <a class="contents" href={source.url}>
                <p class="overflow-elipsis mb-2 overflow-hidden text-ellipsis text-nowrap">
                  {source.title}
                </p>
                <div class="align-center flex items-center gap-1">
                  <img
                    src="https://t0.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url={encodeURIComponent(
                      source.url
                    )}&size=16"
                    alt="abcd"
                    class="aspect-square rounded-full object-cover"
                  />
                  <p class="text-sm text-muted-foreground">Boop</p>
                </div>
              </a>
            </li>
          {/each}
        {/if}
        <div class="flex flex-col rounded-md bg-muted/50 p-4">
          <div
            class="align-center flex flex-wrap items-center justify-start gap-1 overflow-hidden pb-2"
          >
            {#each Array.from({ length: 10 }) as _}
              <img
                src="https://t0.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://www.projectmanager.com/guides/project-tracker&size=16"
                alt="abcd"
                class="aspect-square rounded-full object-cover"
              />
            {/each}
          </div>
          <p class="mt-auto text-sm text-muted-foreground">View 12 more</p>
        </div>
      </ul>

      <div class="align-center mb-4 flex items-center gap-2">
        <Bot class="size-6" />
        <h2 class="text-2xl font-semibold">Answer</h2>
      </div>

      <div class="flex flex-col gap-2 pr-10">
        <SvelteMarkdown
          source={(isStreaming && !newest.pending
            ? latestMessage
            : chat.messages[chat.messages.length - 1].content) ?? ""}
          renderers={{
            heading: Heading,
            listitem: ListItem,
          }}
        />
      </div>
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
      <div class="align-center mb-4 flex items-center gap-2">
        <MessageCircleQuestion class="size-6" />
        <h2 class="text-2xl font-semibold">Follow Up</h2>
      </div>
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
      <div class="mt-8 pb-10 pr-10">
        <div
          class="align-center flex w-full items-center rounded-full border bg-muted/30 px-3 py-3"
        >
          <textarea
            placeholder="Ask anything..."
            rows="1"
            class="max-h-24 w-full resize-none bg-transparent pl-3 text-lg placeholder:text-lg placeholder:text-muted-foreground focus:outline-none lg:max-h-36 xl:max-h-48"
          ></textarea>

          <Tooltip.Root>
            <Tooltip.Trigger>
              {#snippet child({ props })}
                <button
                  {...props}
                  class="rounded-full bg-blue-500 p-2 transition-all hover:bg-blue-400 active:scale-95"
                >
                  <SendHorizonal class="size-4" />
                </button>
              {/snippet}
            </Tooltip.Trigger>
            <Tooltip.Content>Send</Tooltip.Content>
          </Tooltip.Root>
        </div>
      </div>
    </div>
    <Separator orientation="vertical" class="mt-12 h-[32rem] max-h-[32rem] !min-h-[auto]" />
    <div class="mt-12 w-[30%]">
      <div class="align-center mb-2 flex items-center gap-2">
        <Image class="size-6" />
        <h3 class="text-lg font-semibold">Related Images</h3>
      </div>
      <div class="mb-6 grid grid-cols-2 gap-2">
        <img
          src="https://businessmap.io/wp-content/uploads/website-images/strategic-execution/project_management_process_stages.png"
          class="aspect-video rounded-md object-cover transition-all hover:scale-[103%]"
          alt="abcd"
        />
        <img
          src="https://www.investopedia.com/thmb/QYWqTkyDW-yfpVsjmAP0Mf2bw2Y=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/project-management.asp-Final-0c4cd7f77aad40228e7311783c27f728.png"
          alt="abcd"
          class="aspect-video rounded-md object-cover transition-all hover:scale-[103%]"
        />
        <img
          src="https://instituteprojectmanagement.com/wp-content/uploads//2022/10/2_1.jpg"
          alt="abcd"
          class="aspect-video rounded-md object-cover transition-all hover:scale-[103%]"
        />
        <div
          class="grid aspect-video grid-cols-3 grid-rows-2 gap-1 overflow-hidden rounded-md bg-muted p-1.5 transition-all hover:scale-[103%]"
        >
          <img
            src="https://www.optimatraining.ie/wp-content/uploads/2022/01/Project-Management-Fundamentals-600x425.jpg"
            alt="abcd"
            class="h-full w-full rounded-md object-cover"
          />
          <img
            src="https://aquilacommercial.com/wp-content/uploads/2018/03/project-manager-definition.jpg"
            alt="abcd"
            class="h-full w-full rounded-md object-cover"
          />
          <img
            src="https://www.projectmanager.com/wp-content/uploads/2024/09/Gantt-chart-in-project-management-construction-project.png"
            alt="abcd"
            class="h-full w-full rounded-md object-cover"
          />
          <img
            src="https://media.licdn.com/dms/image/D4D12AQHAzpZZDBIkfA/article-cover_image-shrink_720_1280/0/1710486640359?e=2147483647&v=beta&t=_kP7RyfolRjZCXpwZO3GJqC4Trnozc_G8gP1uCmzilc"
            alt="abcd"
            class="h-full w-full rounded-md object-cover"
          />
          <img
            src="https://www.liquidplanner.com/wp-content/uploads/2019/04/HiRes-17-1024x615.jpg"
            alt="abcd"
            class="h-full w-full rounded-md object-cover"
          />
          <div
            class="align-center flex h-full w-full items-center justify-center rounded-md p-0.5 text-muted"
          >
            <div
              class="align-center flex aspect-square h-full w-auto items-center justify-center rounded-full bg-muted-foreground/20 p-0.5"
            >
              <p class="text-center text-xs text-muted-foreground">+7</p>
            </div>
          </div>
        </div>
      </div>
      <div class="align-center flex items-center gap-2">
        <Clapperboard class="size-6" />
        <h3 class="text-lg font-semibold">Related Videos</h3>
      </div>
    </div>
  </main>
{/if}
