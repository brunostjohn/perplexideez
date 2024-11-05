import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { Document } from "@langchain/core/documents";
import { htmlToText } from "html-to-text";
import pdfParse from "pdf-parse";

export const fetchDocumentsFromLinks = async (links: string[]) => {
  const splitter = new RecursiveCharacterTextSplitter();
  const documents = await Promise.all(
    links.map(async (link) => {
      link = link.startsWith("http://") || link.startsWith("https://") ? link : `https://${link}`;

      try {
        const linkFetched = await fetchAndHandleLink(link, splitter);
        return linkFetched;
      } catch (e) {
        return new Document({
          pageContent: `Failed to retrieve content from the link: ${(e as Error).message}`,
          metadata: {
            title: "Failed to retrieve content",
            url: link,
          },
        });
      }
    })
  );

  return documents.flat();
};

const fetchAndHandleLink = async (link: string, splitter: RecursiveCharacterTextSplitter) => {
  const response = await fetch(link);
  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const isPdf = response.headers.get("content-type") === "application/pdf";

  if (isPdf) return parseAndHandlePDF(buffer, link, splitter);

  const parsedText = htmlToText(buffer.toString("utf8"), {
    selectors: [
      {
        selector: "a",
        options: {
          ignoreHref: true,
        },
      },
    ],
  })
    .replace(/(\r\n|\n|\r)/gm, " ")
    .replace(/\s+/g, " ")
    .trim();

  const splittedText = await splitter.splitText(parsedText);
  const title = buffer.toString("utf8").match(/<title>(.*?)<\/title>/)?.[1];

  const linkDocs = splittedText.map((text) => {
    return new Document({
      pageContent: text,
      metadata: {
        title: title || link,
        url: link,
      },
    });
  });

  return linkDocs;
};

const parseAndHandlePDF = async (
  buffer: Buffer,
  link: string,
  splitter: RecursiveCharacterTextSplitter
) => {
  const pdfText = await pdfParse(buffer);
  const parsedText = pdfText.text
    .replace(/(\r\n|\n|\r)/gm, " ")
    .replace(/\s+/g, " ")
    .trim();

  const splittedText = await splitter.splitText(parsedText);
  const title = "PDF Document";

  const linkDocs = splittedText.map((text) => {
    return new Document({
      pageContent: text,
      metadata: {
        title: title,
        url: link,
      },
    });
  });

  return linkDocs;
};
