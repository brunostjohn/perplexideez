import { trpc } from "$lib/trpc";

interface Options {
  chatId: string;
  lastMessage: {
    role: "User" | "Assistant";
    pending?: boolean;
  };
  refetch?: () => void;
  enableStreaming?: boolean | (() => boolean);
  onStreamed?: () => void;
}

export const useStreamedResponse = ({
  chatId,
  lastMessage,
  refetch,
  enableStreaming,
  onStreamed,
}: Options) => {
  const data = $state({
    isStreaming: false,
    streamedContent: "",
  });

  const enableStreamingFn =
    typeof enableStreaming === "function" ? enableStreaming : () => enableStreaming;
  const enableStreamingValue = $derived(enableStreamingFn?.());

  $effect(() => {
    if (!enableStreamingValue || data.isStreaming) return;

    if (lastMessage.role === "User" || (lastMessage.role === "Assistant" && lastMessage.pending)) {
      onStreamed?.();
      streamAResponse();
    }
  });

  const streamAResponse = async () => {
    data.isStreaming = true;
    onStreamed?.();

    const response = await fetch(`/chat/${chatId}`, {
      method: "POST",
      credentials: "include",
    });
    const reader = response.body?.pipeThrough(new TextDecoderStream()).getReader();
    if (!reader) return;

    let isNotDone = true;
    const utils = trpc()?.createUtils();
    while (isNotDone) {
      const { done, value } = await reader.read();
      if (done) break;
      try {
        const parsed = value
          .split("\n")
          .filter((v) => v.startsWith("{") && v.endsWith("}"))
          .map(
            (v) =>
              JSON.parse(v) as {
                type: "response" | "sources" | "doneSources" | "doneTitleEmoji" | "doneResponse";
                data: string;
              }
          );

        let emptyTokens = 0;

        for (const val of parsed) {
          if (val.type === "doneResponse") {
            console.log("got done!");
            isNotDone = false;
          }
          if (val.type === "response") {
            data.streamedContent += val.data;
            if (!val.data.length) emptyTokens++;
          }
          if (val.type === "doneSources") {
            refetch?.();
          }
          if (val.type === "doneTitleEmoji") {
            utils?.chatName.invalidate({ chatId });
            utils?.chatName.refetch({ chatId });
            utils?.listChats.invalidate();
            utils?.listChats.refetch();
          }
        }
      } catch {
        console.warn(value);
        if (import.meta.env.DEV) console.warn("Failed to parse JSON! This could be fine.");
        break;
      }
    }
    await utils?.chat.invalidate({ chatId });
    await utils?.chat.refetch({ chatId });
    utils?.chatName.invalidate({ chatId });
    utils?.chatName.refetch({ chatId });
    utils?.listChats.invalidate();
    utils?.listChats.refetch();
    data.isStreaming = false;
  };

  return data;
};
