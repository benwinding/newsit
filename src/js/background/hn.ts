import { ButtonResult } from "../shared/models";
import { stripUrl } from "./url-matcher";
import { alist } from "../shared/allowlist";
import { getTabUrl, logger, makeRequest, processResults, ResultItem } from "./api";
import fromNow from "fromnow";

export async function onRequestBackgroundHN(
  tabId: number
): Promise<ButtonResult> {
  const searchUrl = await getTabUrl(tabId);
  const searchUrlStripped = stripUrl(searchUrl);
  const blocked = await alist.IsUrlBlackListed(searchUrlStripped);
  if (blocked) {
    logger.log("Hacker News API: Url blocked");
    return {
      text: "-",
    };
  }
  const queryString = `query=${encodeURIComponent(
    searchUrlStripped
  )}&restrictSearchableAttributes=url`;
  const requestUrl = "https://hn.algolia.com/api/v1/search?" + queryString;
  interface HnJsonRes {
    nbHits: number;
    hits: HnHit[];
  }
  const res: HnJsonRes = await makeRequest(requestUrl, true);
  if (res.nbHits == 0) {
    logger.log("Hacker News API: No urls found");
    return {
      text: "-",
    };
  }
  const itemsAll = res.hits.map(translateHnToItem);
  const itemsResults = processResults(itemsAll, searchUrlStripped);
  logger.log("Reddit API: parsing api", { response: res, resultsTranslated: itemsAll, resultsButton: itemsResults });
  return itemsResults;
}

export interface HnHit {
  url: string;
  created_at: string;
  author: string;
  title: string;
  num_comments: number;
  points: number;
  objectID: string;
}

export function translateHnToItem(h: HnHit): ResultItem {
  const fromNowStr = fromNow(h.created_at);
  const fromNowFirst = fromNowStr.split(",").shift() + " ago";
  return {
    submitted_url: h.url,
    submitted_date: fromNowFirst,
    submitted_upvotes: h.points,
    submitted_title: h.title,
    submitted_by: h.author,
    comments_count: h.num_comments,
    comments_link: `https://news.ycombinator.com/item?id=${h.objectID}`,
  };
}
