import { LineListOutputParser } from "$lib/ai/outputParsers";
import type { ChatOllama } from "@langchain/ollama";
import { formatChatHistoryAsString } from "$lib/ai/utils";
import { PromptTemplate } from "@langchain/core/prompts";
import { RunnableMap, RunnableSequence } from "@langchain/core/runnables";
import type { BaseMessage } from "@langchain/core/messages";
import type { ChatOpenAI } from "@langchain/openai";

interface SuggestionGeneratorInput {
  chat_history: BaseMessage[];
}

const outputParser = new LineListOutputParser({
  key: "suggestions",
});

export const generateSuggestions = (
  input: SuggestionGeneratorInput,
  llm: ChatOllama | ChatOpenAI
) => {
  llm.temperature = 0;
  const suggestionGeneratorChain = createSuggestionGeneratorChain(llm);
  return suggestionGeneratorChain.invoke(input);
};

const createSuggestionGeneratorChain = (llm: ChatOllama | ChatOpenAI) => {
  return RunnableSequence.from([
    RunnableMap.from({
      chat_history: (input: SuggestionGeneratorInput) =>
        formatChatHistoryAsString(input.chat_history),
    }),
    PromptTemplate.fromTemplate(suggestionGeneratorPrompt),
    llm,
    outputParser,
  ]);
};

const suggestionGeneratorPrompt = `
You are an AI suggestion generator for an AI powered search engine. You will be given a conversation below. You need to generate 4-5 suggestions based on the conversation. The suggestion should be relevant to the conversation that can be used by the user to ask the chat model for more information.
You need to make sure the suggestions are relevant to the conversation and are helpful to the user. Keep a note that the user might use these suggestions to ask a chat model for more information. 
Make sure the suggestions are medium in length and are informative and relevant to the conversation.

Provide these suggestions separated by newlines between the XML tags <suggestions> and </suggestions>. For example:

<suggestions>
Tell me more about SpaceX and their recent projects
What is the latest news on SpaceX?
Who is the CEO of SpaceX?
</suggestions>

Conversation:
{chat_history}
`;
