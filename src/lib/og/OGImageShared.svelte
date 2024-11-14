<script lang="ts">
  import Icon from "$lib/components/Icon.svelte";

  interface Props {
    chatEmojiBase64?: string;
    chatTitle?: string;
    imageUrl?: string;
  }

  const { chatEmojiBase64, chatTitle, imageUrl }: Props = $props();
</script>

<div class="flex h-full w-full bg-[#0c0c0c] font-['Inter']">
  <div class="flex {imageUrl ? 'w-[60%]' : 'w-full'} flex-col p-6 pr-4">
    {#if chatEmojiBase64}
      <img
        src={chatEmojiBase64}
        alt="Perplexideez"
        class="h-20 w-20 rounded-md"
        style="object-fit:cover;"
      />
    {/if}
    <p class="text-6xl font-[800] text-white">
      {chatTitle}
    </p>

    <div class="align-center mt-auto flex h-fit w-fit items-center">
      <Icon class="mr-2 h-10 w-10" />
      <p class="text-2xl font-[600] text-white">Perplexideez</p>
    </div>
  </div>
  {#if imageUrl}
    <img src={imageUrl} alt="Perplexideez" class="h-full w-[40%]" style="object-fit:cover;" />
  {/if}
</div>
