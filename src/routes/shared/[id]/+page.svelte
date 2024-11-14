<script lang="ts">
  import Icon from "$lib/components/Icon.svelte";
  import { BadgePlus, ExternalLink, Eye, LoaderCircle, Lock, PersonStanding } from "lucide-svelte";
  import type { PageServerData } from "./$types";
  import moment from "moment";
  import { InfoChip, Message } from "$lib/components/shared";
  import Separator from "$lib/components/ui/separator/separator.svelte";
  import ScrollArea from "$lib/components/ui/scroll-area/scroll-area.svelte";

  interface Props {
    data: PageServerData;
  }

  const { data }: Props = $props();
  const { chat } = $derived(data);

  const getTimeMoment = (newTime: Date) => {
    const time = moment(newTime);

    if (time.isBefore(moment().subtract(7, "days"))) {
      return `on ${time.format("MMM D")}`;
    }

    if (time.isBefore(moment().subtract(1, "days"))) {
      return `on ${time.format("dddd")}`;
    }

    if (time.isBefore(moment().subtract(1, "years"))) {
      return `on ${time.format("MMM D YYYY")}`;
    }

    return time.fromNow();
  };

  function* chunkify<T>(itr: Iterable<T>, size: number) {
    let chunk = [];
    for (const v of itr) {
      chunk.push(v);
      if (chunk.length === size) {
        yield chunk;
        chunk = [];
      }
    }
    if (chunk.length) yield chunk;
  }

  const messagesChunked = <T,>(msgs: T[]) => chunkify(msgs, 2).toArray();
</script>

<svelte:head>
  <link type="application/json+oembed" href="/shared/{data.id}/oembed.json" />
  <meta name="theme-color" content="#7289DA" />
</svelte:head>

<ScrollArea
  class="mx-auto h-full max-h-full w-full max-w-screen-xl overflow-y-auto overflow-x-hidden p-4 xl:p-0"
  viewportClasses="px-4 py-6"
>
  <div class="align-center mb-8 flex items-center gap-1">
    {#await chat}
      <LoaderCircle class="size-8 animate-spin" />
    {:then}
      <Icon class="size-8" />
    {/await}
    <p class="text-lg font-semibold">Perplexideez</p>
  </div>
  {#await chat then { title, user, createdAt, messages, visibilityPublic, emoji, views }}
    {#if emoji}
      <p class="emoji mb-2 text-4xl">{emoji}</p>
    {/if}
    <h1 class="mb-4 text-4xl font-bold">
      {title}
    </h1>
    <div class="align-center flex items-center gap-6">
      <InfoChip icon={ExternalLink}>
        Shared by {user.name}
      </InfoChip>
      <InfoChip icon={BadgePlus}>
        Created {getTimeMoment(createdAt)}
      </InfoChip>
      <InfoChip icon={visibilityPublic ? PersonStanding : Lock}>
        {visibilityPublic ? "Public" : "Private"}</InfoChip
      >
      <InfoChip icon={Eye} class="ml-auto">{views} views</InfoChip>
    </div>
    <Separator class="mt-6" />
    <div class="mt-6 flex flex-col gap-10">
      {#each messagesChunked(messages) as message}
        {@const humanMessage = message.find(({ role }) => role === "User")!}
        {@const aiMessage = message.find(({ role }) => role === "Assistant")}
        <Message {humanMessage} {aiMessage} />
      {/each}
    </div>
  {:catch error}
    <p>{error.message}</p>
  {/await}
</ScrollArea>

<style>
  @font-face {
    font-family: "Apple Color Emoji";
    src: url("/AppleColorEmoji.ttf") format("truetype");
  }

  .emoji {
    font-family: "Apple Color Emoji";
  }
</style>
