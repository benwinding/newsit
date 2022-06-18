import { ResultItem } from "./shared/ResultItem";

export function parseRedditHtml(data: string): ResultItem[] {
  const html = document.createElement("html");
  const cleanHTML = window.DOMPurify.sanitize(data);
  html.innerHTML = cleanHTML;
  const results = html.querySelectorAll(".search-result-link");
  const itemsAll = Array.from(results).map(translateRedditToItem);
  return itemsAll;
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
