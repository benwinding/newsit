import { front } from "./front";
import { ButtonResult } from "./models";

export async function onRequestBackgroundHN(tabId: number): Promise<ButtonResult> {
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
    hits: {
      url: string;
      num_comments: number;
      objectID: string;
    }[];
  }
  const res: HnJsonRes = await makeRequest(requestUrl, true);
  if (res.nbHits == 0) {
    console.log("Hacker News API: No urls found");
    return {
      text: "-",
    };
  }
  let allhits = res.hits;
  let num_of_comments = 0;
  let result_id = null;
  for (let hit of allhits) {
    const hitUrl = hit.url;
    if (
      isMatchTwoUrls(hitUrl, searchUrl) &&
      hit.num_comments >= num_of_comments
    ) {
      num_of_comments = hit.num_comments;
      result_id = hit.objectID;
    }
  }
  if (result_id == null) {
    console.log("Hacker News API: No urls matches found");
    return {
      text: "-",
    };
  }
  const linkUrl = `https://news.ycombinator.com/item?id=${result_id}`;
  const responseData = {
    text: num_of_comments + "",
    link: linkUrl,
  };
  return responseData;
}

export async function onRequestBackgroundReddit(tabId: number): Promise<ButtonResult> {
  const t = await front.getTab(tabId);
  const searchUrl = t.url;
  const blocked = await front.isBlackListed(searchUrl);
  if (blocked) {
    console.log("Reddit API: Url blocked");
    return {
      text: '-'
    };
  }
  const queryString = "sort=top&q=" + encodeURIComponent("url:" + searchUrl);
  const requestUrl = "https://old.reddit.com/search?" + queryString;
  const data = await makeRequest(requestUrl, false);
  const html = document.createElement('html');
  html.innerHTML = data;
  // const html = $($.parseHTML(data));
  const searchResultsComments = html.querySelectorAll("a.search-comments");
  if (searchResultsComments.length == 0) {
    console.log("Reddit API: No urls matches found");
    return {
      text: '-'
    };
  }
  const firstCommentsLink = searchResultsComments[0] as any;
  const commentTextArr = firstCommentsLink.text.split(" ");
  const num_of_comments = commentTextArr.length > 1 ? commentTextArr[0] : 0;

  firstCommentsLink.hostname = "reddit.com";
  return {
    link: firstCommentsLink.href,
    text: num_of_comments + '',
  };
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

function stripUrl(urlString: string) {
  const url = new URL(urlString);
  return url.host + url.pathname + url.search;
}

function isMatchTwoUrls(url1: string, url2: string) {
  return stripUrl(url1) == stripUrl(url2);
}
