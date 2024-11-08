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
      console.log("attempting to stream respnose!");
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

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      try {
        const parsed = JSON.parse(value) as {
          type: "response" | "sources" | "doneSources";
          data: string;
        };
        if (parsed.type === "response") {
          data.streamedContent += parsed.data;
        }
        if (parsed.type === "doneSources") {
          refetch?.();
        }
      } catch {
        console.warn(value);
        if (import.meta.env.DEV) console.warn("Failed to parse JSON! This could be fine.");
        break;
      }
    }
    data.isStreaming = false;
  };

  return data;
};
