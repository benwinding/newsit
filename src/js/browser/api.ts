import { ButtonResult, OtherResult } from "./models";
import { doUrlsMatch } from "./url-matcher";

import { alist } from "./allowlist-manager";
import { system } from "./browser";
import { MakeLogger } from "../shared/logger";

const logger = MakeLogger('api');

interface ResultItem {
  submitted_url: string;
  submitted_date: string;
  submitted_upvotes: number;
  submitted_title: string;
  comments_count: number;
  comments_link: string;
}

interface HnHit {
  url: string;
  created_at: string;
  title: string;
  num_comments: number;
  points: number;
  objectID: string;
}

function translateHnToItem(h: HnHit): ResultItem {
  return {
    submitted_url: h.url,
    submitted_date: h.created_at,
    submitted_upvotes: h.points,
    submitted_title: h.title,
    comments_count: h.num_comments,
    comments_link: `https://news.ycombinator.com/item?id=${h.objectID}`,
  };
}

function querySafe<T extends HTMLElement>(
  el: HTMLElement,
  search: string,
  attr: keyof T
): string {
  const res = el.querySelector(search) as T;
  const attrVal = res ? res[attr] : "";
  return attrVal + "";
}

function translateRedditToItem(el: HTMLDivElement): ResultItem {
  const url = querySafe<HTMLAnchorElement>(el, ".search-link", "href");
  const commentsText = querySafe<HTMLAnchorElement>(
    el,
    ".search-comments",
    "text"
  );
  const commentsLink = querySafe<HTMLAnchorElement>(
    el,
    ".search-comments",
    "href"
  );
  const postTitle = querySafe<HTMLAnchorElement>(
    el,
    ".search-title",
    "text"
  );
  const postDate = querySafe<HTMLAnchorElement>(
    el,
    ".search-time time",
    "innerText"
  );
  const postPointsText = querySafe<HTMLAnchorElement>(
    el,
    ".search-score",
    "innerText"
  );
  const commentsCount = +commentsText.split(" ").shift();
  const postPoints = +postPointsText.split(" ").shift();
  const r: ResultItem = {
    submitted_url: url,
    submitted_title: postTitle,
    submitted_date: postDate,
    submitted_upvotes: postPoints,
    comments_count: commentsCount,
    comments_link: commentsLink,
  };
  return r;
}

function processResults(
  itemsAll: ResultItem[],
  searchUrl: string
): ButtonResult {
  const itemsMatches = itemsAll.filter((h) => doUrlsMatch(h.submitted_url, searchUrl));
  if (!itemsMatches.length) {
    logger.log("Hacker News API: No urls matches found");
    return {
      text: "-",
    };
  }
  itemsMatches.sort((a, b) => b.comments_count - a.comments_count);
  const mostComments = itemsMatches[0];

  const otherResults: OtherResult[] = itemsMatches.map(r => {
    const other: OtherResult = {
      post_url: r.submitted_url,
      post_title: r.submitted_title,
      post_upvotes: r.submitted_upvotes,
      post_date: r.submitted_date,
      comments_count: r.comments_count,
      comments_link: r.comments_link,
    };
    return other;
  })

  const responseData: ButtonResult = {
    text: mostComments.comments_count + "",
    link: mostComments.comments_link,
    other_results: otherResults
  };
  return responseData;
}

async function getTabUrl(tabId: number) {
  const t = await system.tabs.get(tabId);
  const url = t.url;
  return url;
}

export async function onRequestBackgroundHN(
  tabId: number
): Promise<ButtonResult> {
  const searchUrl = await getTabUrl(tabId);
  const blocked = await alist.IsUrlBlackListed(searchUrl);
  if (blocked) {
    logger.log("Hacker News API: Url blocked");
    return {
      text: "-",
    };
  }
  const queryString = `query=${encodeURIComponent(
    searchUrl
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
  const itemsResults = processResults(itemsAll, searchUrl);
  return itemsResults;
}

export async function onRequestBackgroundReddit(
  tabId: number
): Promise<ButtonResult> {
  const searchUrl = await getTabUrl(tabId);
  const blocked = await alist.IsUrlBlackListed(searchUrl);
  if (blocked) {
    logger.log("Reddit API: Url blocked");
    return {
      text: "-",
    };
  }
  const queryString = "sort=top&q=" + encodeURIComponent("url:" + searchUrl);
  const requestUrl = "https://old.reddit.com/search?" + queryString;
  const data = await makeRequest(requestUrl, false);
  const html = document.createElement("html");
  html.innerHTML = data;
  const results = html.querySelectorAll(".search-result-link");
  if (results.length == 0) {
    html.remove();
    logger.log("Reddit API: No urls matches found");
    return {
      text: "-",
    };
  }
  const itemsAll = Array.from(results).map(translateRedditToItem);
  const itemsResults = processResults(itemsAll, searchUrl);
  html.remove();
  return itemsResults;
}

async function makeRequest(
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
