import { ButtonResult } from "../shared/models";
import { alist } from "../shared/allowlist";
import { getTabUrl, logger, makeRequest, processResults, ResultItem } from "./api";

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
  const cleanHTML = window.DOMPurify.sanitize(data);
  html.innerHTML = cleanHTML;
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
  logger.log("Reddit API: parsing api", { response: data, html, resultsHtml: results, resultsTranslated: itemsAll, resultsButton: itemsResults });
  html.remove();
  return itemsResults;
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

export function translateRedditToItem(el: HTMLDivElement): ResultItem {
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
  const postTitle = querySafe<HTMLAnchorElement>(el, ".search-title", "text");
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
  const postAuthor = querySafe<HTMLAnchorElement>(
    el,
    ".search-author a",
    "text"
  );
  const commentsCount = +commentsText.replace(',', '').split(" ").shift();
  const postPoints = +postPointsText.split(" ").shift();
  const r: ResultItem = {
    raw_html: el.innerHTML,
    submitted_url: url,
    submitted_title: postTitle,
    submitted_date: postDate,
    submitted_upvotes: postPoints,
    submitted_by: postAuthor,
    comments_count: commentsCount,
    comments_link: commentsLink,
  };
  return r;
}
