import { system, logger } from "./core";

const logg = logger.MakeLogger("api.js");

function stripUrl(urlString: string) {
  const url = new URL(urlString);
  return url.host + url.pathname + url.search;
}

function getCurrentUrl() {
  const initurl = location.href;
  const stripped = stripUrl(initurl);
  return stripped;
}

function isMatchTwoUrls(url1: string, url2: string) {
  return stripUrl(url1) == stripUrl(url2);
}

function makeRequestInBackground<T>(
  queryString: string,
  isReddit?: boolean
): Promise<T> {
  const msg = { queryString: queryString, isReddit: isReddit, isHn: !isReddit };
  return new Promise((resolve, reject) =>
    system.runtime.sendMessage(msg, (data: any) => {
      resolve(data);
    })
  );
}

// Returns a promise of the links
export async function findReddit(urlString: string) {
  const location = new URL(urlString);
  const inithost = location.host;
  const omitlist = ["news.ycombinator.com", "reddit.com"];
  if (omitlist.indexOf(inithost) >= 0) {
    return Promise.reject("Reddit API: Not going to search Reddit on Reddit");
  }
  const searchUrl = getCurrentUrl();
  const queryString = "sort=top&q=" + encodeURIComponent("url:" + searchUrl);

  logg.log("findReddit", { queryString });
  const data = await makeRequestInBackground(queryString, true);
  logg.log("findReddit", { data });
  const html = $($.parseHTML(data));
  const searchResultsComments = html.find("a.search-comments");
  if (searchResultsComments.length == 0) {
    return Promise.reject("Reddit API: No results found");
  }
  const firstCommentsLink = searchResultsComments[0] as any;
  const commentTextArr = firstCommentsLink.text.split(" ");
  const num_of_comments = commentTextArr.length > 1 ? commentTextArr[0] : 0;

  firstCommentsLink.hostname = "reddit.com";
  return {
    link: firstCommentsLink.href,
    comments: num_of_comments,
  };
}

export async function findHn(urlString: string) {
  const location = new URL(urlString);
  const inithost = location.host;
  const omitlist = ["news.ycombinator.com"];
  if (omitlist.indexOf(inithost) >= 0) {
    return Promise.reject(
      "Hacker News API: Not going to search domain: Hacker News"
    );
  }
  const searchUrl = getCurrentUrl();
  const queryString = `query=${encodeURIComponent(
    searchUrl
  )}&restrictSearchableAttributes=url`;

  logg.log("findHn", { queryString });
  interface HnApi {
    nbHits: number;
    hits: {
      url: string;
      num_comments: number;
      objectID: string;
    }[];
  }
  const data = await makeRequestInBackground<HnApi>(queryString, false);
  logg.log("findHn", { data });
  if (data.nbHits == 0) {
    return Promise.reject("Hacker News API: No urls found");
  }
  let allhits = data.hits;
  let num_of_comments = 0;
  let result_id = null;
  const thisUrl = document.location.href;
  for (let hit of allhits) {
    const hitUrl = hit.url;
    if (
      isMatchTwoUrls(hitUrl, thisUrl) &&
      hit.num_comments >= num_of_comments
    ) {
      num_of_comments = hit.num_comments;
      result_id = hit.objectID;
    }
  }
  if (result_id == null) {
    return Promise.reject("Hacker News API: No url matches found");
  }
  const linkUrl = `https://news.ycombinator.com/item?id=${result_id}`;
  return {
    link: linkUrl,
    comments: num_of_comments,
  };
}
