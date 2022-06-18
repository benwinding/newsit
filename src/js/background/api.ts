import { ButtonResult, OtherResult } from "../shared/models";
import { doUrlsMatch } from "./url-matcher";

import { system } from "../shared/browser";
import { MakeLogger } from "../shared/logger";
import { store } from "../shared/store";
import { ResultItem } from "../shared/ResultItem";

export const logger = MakeLogger("api", store);

export function processResults(
  itemsAll: ResultItem[],
  searchUrl: string
): ButtonResult {
  const itemsMatches = itemsAll.filter((h) =>
    doUrlsMatch(h.submitted_url, searchUrl)
  );
  if (!itemsMatches.length) {
    logger.log("Hacker News API: No urls matches found");
    return {
      text: "-",
    };
  }
  itemsMatches.sort((a, b) => b.comments_count - a.comments_count);
  const mostComments = itemsMatches[0];

  const otherResults: OtherResult[] = itemsMatches.map((r) => {
    const other: OtherResult = {
      post_url: r.submitted_url,
      post_title: r.submitted_title,
      post_upvotes: r.submitted_upvotes,
      post_date: r.submitted_date,
      post_by: r.submitted_by,
      comments_count: r.comments_count,
      comments_link: r.comments_link,
    };
    return other;
  });

  const responseData: ButtonResult = {
    text: mostComments.comments_count + "",
    link: mostComments.comments_link,
    other_results: otherResults,
  };
  return responseData;
}

export async function getTabUrl(tabId: number) {
  const t = await system.tabs.get(tabId);
  const url = t.url;
  return url;
}

export async function makeRequest(
  url: RequestInfo,
  isJson: boolean
): Promise<string | any> {
  logger.log("makeRequest", { url, isJson });
  const res = await fetch(url);
  if (isJson) {
    return res.json();
  } else {
    return res.text();
  }
}
