import { front } from "./front";
import { ButtonResult } from "./models";
import { doUrlsMatch } from "./url-matcher";

interface ResultItem {
  url: string;
  comments: number;
  comments_link: string;
}

interface HnHit {
  url: string;
  num_comments: number;
  objectID: string;
}

function translateHnToItem(h: HnHit): ResultItem {
  return {
    url: h.url,
    comments: h.num_comments,
    comments_link: `https://news.ycombinator.com/item?id=${h.objectID}`,
  }
}

function querySafe<T extends HTMLElement>(el: HTMLElement, search: string, attr: keyof T): string {
  const res = el.querySelector(search) as T;
  const attrVal = res ? res[attr] : '';
  return attrVal+'';
}

function translateRedditToItem(el: HTMLDivElement): ResultItem {
  const url = querySafe<HTMLAnchorElement>(el, '.search-link', 'href')
  const commentsText = querySafe<HTMLAnchorElement>(el, '.search-comments', 'text')
  const commentsLink = querySafe<HTMLAnchorElement>(el, '.search-comments', 'href')
  const commentsCount = +commentsText.split(' ').shift();
  return {
    url: url,
    comments: commentsCount,
    comments_link: commentsLink,
  }
}

function processResults(itemsAll: ResultItem[], searchUrl: string): ButtonResult {
  const itemsMatches = itemsAll.filter((h) => doUrlsMatch(h.url, searchUrl));
  if (!itemsMatches.length) {
    console.log("Hacker News API: No urls matches found");
    return {
      text: "-",
    };
  }
  itemsMatches.sort((a, b) => b.comments - a.comments);
  const mostComments = itemsMatches[0];

  const responseData = {
    text: mostComments.comments + "",
    link: mostComments.comments_link,
  };
  return responseData;
}

export async function onRequestBackgroundHN(
  tabId: number
): Promise<ButtonResult> {
  const t = await front.getTab(tabId);
  const searchUrl = t.url;
  const blocked = await front.isBlackListed(searchUrl);
  if (blocked) {
    console.log("Hacker News API: Url blocked");
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
    console.log("Hacker News API: No urls found");
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
  const t = await front.getTab(tabId);
  const searchUrl = t.url;
  const blocked = await front.isBlackListed(searchUrl);
  if (blocked) {
    console.log("Reddit API: Url blocked");
    return {
      text: "-",
    };
  }
  const queryString = "sort=top&q=" + encodeURIComponent("url:" + searchUrl);
  const requestUrl = "https://old.reddit.com/search?" + queryString;
  const data = await makeRequest(requestUrl, false);
  const html = document.createElement("html");
  html.innerHTML = data;
  const results = html.querySelectorAll('.search-result-link');
  if (results.length == 0) {
    console.log("Reddit API: No urls matches found");
    return {
      text: "-",
    };
  }
  const itemsAll = Array.from(results).map(translateRedditToItem);
  const itemsResults = processResults(itemsAll, searchUrl);
  return itemsResults;
}

async function makeRequest(
  url: RequestInfo,
  isJson: boolean
): Promise<string | any> {
  console.log("makeRequest", { url, isJson });
  const res = await fetch(url);
  if (isJson) {
    return res.json();
  } else {
    return res.text();
  }
}
