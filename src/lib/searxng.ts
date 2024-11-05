import { env } from "$env/dynamic/private";

interface SearxngSearchOptions {
  categories?: string[];
  engines?: string[];
  language?: string;
  pageno?: number;
}

interface SearxngSearchResult {
  title: string;
  url: string;
  img_src?: string;
  thumbnail_src?: string;
  thumbnail?: string;
  content?: string;
  author?: string;
  iframe_src?: string;
}

export const searchSearxng = async (query: string, opts?: SearxngSearchOptions) => {
  const url = new URL(`${env.SEARXNG_URL}/search?format=json`);
  url.searchParams.append("q", query);

  if (opts) {
    Object.keys(opts).forEach((key) => {
      // @ts-expect-error - cba to fix this
      if (Array.isArray(opts[key])) {
        // @ts-expect-error - same here
        url.searchParams.append(key, opts[key].join(","));
        return;
      }
      // @ts-expect-error - and here
      url.searchParams.append(key, opts[key]);
    });
  }

  const response = await fetch(url.toString());
  const responseJson = await response.json();
  const results: SearxngSearchResult[] = responseJson.results;
  const suggestions: string[] = responseJson.suggestions;

  return { results, suggestions };
};
