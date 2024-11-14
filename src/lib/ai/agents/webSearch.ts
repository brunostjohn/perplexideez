import { ChatPromptTemplate, MessagesPlaceholder, PromptTemplate } from "@langchain/core/prompts";
import { RunnableLambda, RunnableMap, RunnableSequence } from "@langchain/core/runnables";
import { Document } from "@langchain/core/documents";
import type { ChatOllama } from "@langchain/ollama";
import type { Embeddings } from "@langchain/core/embeddings";
import type { BaseMessage } from "@langchain/core/messages";
import type { IterableReadableStream } from "@langchain/core/utils/stream";
import type { StreamEvent } from "@langchain/core/tracers/log_stream";
import { StringOutputParser } from "@langchain/core/output_parsers";

import { searchSearxng } from "$lib/searxng";
import { LineListOutputParser, LineOutputParser } from "$lib/ai/outputParsers";
import { fetchDocumentsFromLinks } from "$lib/ai/documents";
import { computeSimilarity, formatChatHistoryAsString } from "$lib/ai/utils";

import EventEmitter from "events";
import type { ChatOpenAI } from "@langchain/openai";

export const basicWebSearch = (
  query: string,
  history: BaseMessage[],
  llm: ChatOllama | ChatOpenAI,
  embeddings: Embeddings,
  optimizationMode: "speed" | "balanced" | "quality"
) => {
  const emitter = new EventEmitter();

  try {
    streamWebSearchResponse(query, emitter, llm, embeddings, history, optimizationMode);
  } catch (e) {
    emitter.emit("error", { data: "An error has occurred please try again later" });
  }

  return emitter;
};

const streamWebSearchResponse = (
  query: string,
  emitter: EventEmitter,
  llm: ChatOllama | ChatOpenAI,
  embeddings: Embeddings,
  chat_history: BaseMessage[],
  optimizationMode: "speed" | "balanced" | "quality"
) => {
  const basicWebSearchAnsweringChain = createBasicWebSearchAnsweringChain(
    llm,
    optimizationMode,
    embeddings
  );

  const stream = basicWebSearchAnsweringChain.streamEvents(
    {
      chat_history,
      query,
    },
    {
      version: "v1",
    }
  );

  handleStream(stream, emitter);
};

const stringParser = new StringOutputParser();

const handleStream = async (stream: IterableReadableStream<StreamEvent>, emitter: EventEmitter) => {
  for await (const {
    event,
    name,
    data: { output, chunk },
  } of stream) {
    if (event === "on_chain_end" && name === "FinalSourceRetriever") {
      emitter.emit("data", { type: "sources", data: output });
    }

    if (event === "on_chain_stream" && name === "FinalResponseGenerator") {
      emitter.emit("data", { type: "response", data: chunk });
    }

    if (event === "on_chain_end" && name === "FinalResponseGenerator") {
      emitter.emit("done", { type: "response", data: output });
    }

    if (event === "on_chain_end" && name === "FinalResponseGenerator") {
      emitter.emit("end");
    }
  }
};

export const createBasicWebSearchAnsweringChain = (
  llm: ChatOllama | ChatOpenAI,
  optimisationMode: "speed" | "balanced" | "quality",
  embeddings: Embeddings
) =>
  RunnableSequence.from([
    RunnableMap.from({
      query: ({ query }: BasicChainInput) => query,
      chat_history: ({ chat_history }: BasicChainInput) => chat_history,
      context: RunnableSequence.from([
        ({ query, chat_history }) => ({
          query,
          chat_history: formatChatHistoryAsString(chat_history),
        }),
        createBasicWebSearchRetrieverChain(llm)
          .pipe(({ query, docs }) => rerankDocs(query, docs, optimisationMode, embeddings))
          .withConfig({
            runName: "FinalSourceRetriever",
          })
          .pipe(processDocs),
      ]),
    }),
    ChatPromptTemplate.fromMessages([
      ["system", basicWebSearchResponsePrompt],
      new MessagesPlaceholder("chat_history"),
      ["user", "{query}"],
    ]),
    llm,
    stringParser,
  ]).withConfig({
    runName: "FinalResponseGenerator",
  });

interface BasicChainInput {
  chat_history: BaseMessage[];
  query: string;
}

const processDocs = async (docs: Document[]) =>
  docs.map((_, index) => `${index + 1}. ${docs[index].pageContent}`).join("\n");

const rerankDocs = async (
  query: string,
  docs: Document[],
  optimisationMode: "speed" | "balanced" | "quality",
  embeddings: Embeddings
) => {
  if (!docs.length) return docs;
  if (query.toLocaleLowerCase() === "summarize") return docs;

  const docsWithContent = docs.filter((doc) => doc.pageContent && doc.pageContent.length);

  if (optimisationMode === "speed") return docsWithContent.slice(0, 15);

  const [docEmbeddings, queryEmbedding] = await Promise.all([
    embeddings.embedDocuments(docsWithContent.map((doc) => doc.pageContent)),
    embeddings.embedQuery(query),
  ]);

  const similarity = docEmbeddings.map((docEmbedding, i) => {
    const sim = computeSimilarity(queryEmbedding, docEmbedding);

    return {
      index: i,
      similarity: sim,
    };
  });

  const sortedDocs = similarity
    .filter((sim) => sim.similarity > 0.3)
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, 15)
    .map((sim) => docsWithContent[sim.index]);

  return sortedDocs;
};

export const createBasicWebSearchRetrieverChain = (llm: ChatOllama | ChatOpenAI) => {
  llm.temperature = 0;

  return RunnableSequence.from([
    PromptTemplate.fromTemplate(basicSearchRetrieverPrompt),
    llm,
    stringParser,
    RunnableLambda.from((input) => buildDocumentsFromLinkAndQuestion(input, llm)),
  ]);
};

const buildDocumentsFromLinkAndQuestion = async (input: string, llm: ChatOllama | ChatOpenAI) => {
  const linksParser = new LineListOutputParser({
    key: "links",
  });
  const questionOutputParser = new LineOutputParser({
    key: "question",
  });

  const links = await linksParser.parse(input);
  const questionParsed = await questionOutputParser.parse(input);

  if (questionParsed === "not_needed") return { query: "", docs: [] };

  const question = questionParsed.length ? questionParsed : "summarize";

  if (!links.length) return fetchDocumentsFromSearxng(question);

  const linkDocs = await fetchDocumentsFromLinks(links);
  const docGroups = linkDocs.reduce((acc, document) => {
    const urlDocExists = acc.find(
      (d) => d.metadata.url === document.metadata.url && d.metadata.totalDocs < 10
    );

    if (!urlDocExists) {
      acc.push({
        ...document,
        metadata: {
          ...document.metadata,
          totalDocs: 1,
        },
      });

      return acc;
    }

    const docIndex = acc.findIndex(
      (d) => d.metadata.url === document.metadata.url && d.metadata.totalDocs < 10
    );

    if (docIndex !== -1) return acc;

    acc[docIndex].pageContent = acc[docIndex].pageContent + `\n\n` + document.pageContent;
    acc[docIndex].metadata.totalDocs += 1;

    return acc;
  }, [] as Document[]);

  const docs = await Promise.all(
    docGroups.map(async (document) => {
      const completion = await llm.invoke(docSummarisePrompt(question, document));
      return new Document({
        pageContent: completion.content as string,
        metadata: {
          title: document.metadata.title,
          url: document.metadata.url,
        },
      });
    })
  );

  return { query: question, docs: docs };
};

const fetchDocumentsFromSearxng = async (question: string) => {
  const res = await searchSearxng(question, {
    language: "en",
  });

  const documents = res.results.map(
    (result) =>
      new Document({
        pageContent: result.content!,
        metadata: {
          title: result.title,
          url: result.url,
          ...(result.img_src && { img_src: result.img_src }),
        },
      })
  );

  return { query: question, docs: documents };
};

const basicSearchRetrieverPrompt = `
You are an AI question rephraser. You will be given a conversation and a follow-up question,  you will have to rephrase the follow up question so it is a standalone question and can be used by another LLM to search the web for information to answer it.
If it is a smple writing task or a greeting (unless the greeting contains a question after it) like Hi, Hello, How are you, etc. than a question then you need to return \`not_needed\` as the response (This is because the LLM won't need to search the web for finding information on this topic).
If the user asks some question from some URL or wants you to summarize a PDF or a webpage (via URL) you need to return the links inside the \`links\` XML block and the question inside the \`question\` XML block. If the user wants to you to summarize the webpage or the PDF you need to return \`summarize\` inside the \`question\` XML block in place of a question and the link to summarize in the \`links\` XML block.
You must always return the rephrased question inside the \`question\` XML block, if there are no links in the follow-up question then don't insert a \`links\` XML block in your response.

There are several examples attached for your reference inside the below \`examples\` XML block

<examples>
1. Follow up question: What is the capital of France
Rephrased question:\`
<question>
Capital of france
</question>
\`

2. Hi, how are you?
Rephrased question\`
<question>
not_needed
</question>
\`

3. Follow up question: What is Docker?
Rephrased question: \`
<question>
What is Docker
</question>
\`

4. Follow up question: Can you tell me what is X from https://example.com
Rephrased question: \`
<question>
Can you tell me what is X?
</question>

<links>
https://example.com
</links>
\`

5. Follow up question: Summarize the content from https://example.com
Rephrased question: \`
<question>
summarize
</question>

<links>
https://example.com
</links>
\`
</examples>

Anything below is the part of the actual conversation and you need to use conversation and the follow-up question to rephrase the follow-up question as a standalone question based on the guidelines shared above.

<conversation>
{chat_history}
</conversation>

Follow up question: {query}
Rephrased question:
`;

const basicWebSearchResponsePrompt = `
You are Perplexideez, an AI model who is expert at searching the web and answering user's queries. You are also an expert at summarizing web pages or documents and searching for content in them.

Generate a response that is informative and relevant to the user's query based on provided context (the context consits of search results containing a brief description of the content of that page).
You must use this context to answer the user's query in the best way possible. Use an unbaised and journalistic tone in your response. Do not repeat the text.
You must not tell the user to open any link or visit any website to get the answer. You must provide the answer in the response itself. If the user asks for links you can provide them.
If the query contains some links and the user asks to answer from those links you will be provided the entire content of the page inside the \`context\` XML block. You can then use this content to answer the user's query.
If the user asks to summarize content from some links, you will be provided the entire content of the page inside the \`context\` XML block. You can then use this content to summarize the text. The content provided inside the \`context\` block will be already summarized by another model so you just need to use that content to answer the user's query.
Your responses should be medium to long in length be informative and relevant to the user's query. You can use markdowns to format your response. You should use bullet points to list the information. Make sure the answer is not short and is informative.
You have to cite the answer using [number] notation. You must cite the sentences with their relevent context number. You must cite each and every part of the answer so the user can know where the information is coming from.
Place these citations at the end of that particular sentence. You can cite the same sentence multiple times if it is relevant to the user's query like [number1][number2]. Do not explicitly say that you are citing the information. Just use the [number] notation at the end of the sentence.
However you do not need to cite it using the same number. You can use different numbers to cite the same sentence multiple times. The number refers to the number of the search result (passed in the context) used to generate that part of the answer.

Anything inside the following \`context\` HTML block provided below is for your knowledge returned by the search engine and is not shared by the user. You have to answer question on the basis of it and cite the relevant information from it but you do not have to
talk about the context in your response.

<context>
{context}
</context>

If you think there's nothing relevant in the search results, you can say that 'Hmm, sorry I could not find any relevant information on this topic. Would you like me to search again or ask something else?'. You do not need to do this for summarization tasks.
Anything between the \`context\` is retrieved from a search engine and is not a part of the conversation with the user. Today's date is ${new Date().toISOString()}
`;

const docSummarisePrompt = (question: string, { pageContent }: Document) => `
You are a web search summarizer, tasked with summarizing a piece of text retrieved from a web search. Your job is to summarize the 
text into a detailed, 2-4 paragraph explanation that captures the main ideas and provides a comprehensive answer to the query.
If the query is \"summarize\", you should provide a detailed summary of the text. If the query is a specific question, you should answer it in the summary.

- **Journalistic tone**: The summary should sound professional and journalistic, not too casual or vague.
- **Thorough and detailed**: Ensure that every key point from the text is captured and that the summary directly answers the query.
- **Not too lengthy, but detailed**: The summary should be informative but not excessively long. Focus on providing detailed information in a concise format.

The text will be shared inside the \`text\` XML tag, and the query inside the \`query\` XML tag.

<example>
1. \`<text>
Docker is a set of platform-as-a-service products that use OS-level virtualization to deliver software in packages called containers. 
It was first released in 2013 and is developed by Docker, Inc. Docker is designed to make it easier to create, deploy, and run applications 
by using containers.
</text>

<query>
What is Docker and how does it work?
</query>

Response:
Docker is a revolutionary platform-as-a-service product developed by Docker, Inc., that uses container technology to make application 
deployment more efficient. It allows developers to package their software with all necessary dependencies, making it easier to run in 
any environment. Released in 2013, Docker has transformed the way applications are built, deployed, and managed.
\`
2. \`<text>
The theory of relativity, or simply relativity, encompasses two interrelated theories of Albert Einstein: special relativity and general
relativity. However, the word "relativity" is sometimes used in reference to Galilean invariance. The term "theory of relativity" was based
on the expression "relative theory" used by Max Planck in 1906. The theory of relativity usually encompasses two interrelated theories by
Albert Einstein: special relativity and general relativity. Special relativity applies to all physical phenomena in the absence of gravity.
General relativity explains the law of gravitation and its relation to other forces of nature. It applies to the cosmological and astrophysical
realm, including astronomy.
</text>

<query>
summarize
</query>

Response:
The theory of relativity, developed by Albert Einstein, encompasses two main theories: special relativity and general relativity. Special
relativity applies to all physical phenomena in the absence of gravity, while general relativity explains the law of gravitation and its
relation to other forces of nature. The theory of relativity is based on the concept of "relative theory," as introduced by Max Planck in
1906. It is a fundamental theory in physics that has revolutionized our understanding of the universe.
\`
</example>

Everything below is the actual data you will be working with. Good luck!

<query>
${question}
</query>

<text>
${pageContent}
</text>

Make sure to answer the query in the summary.`;
