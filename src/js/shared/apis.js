import { core, sys } from "./core";

const logg = core.logger.MakeLogger("api.js");

export const apis = {
  findHn: findHn,
  findReddit: findReddit,
};

function stripUrl(urlString) {
  const url = new URL(urlString);
  return url.host + url.pathname + url.search;
}

function getCurrentUrl() {
  const initurl = location.href;
  const stripped = stripUrl(initurl);
  return stripped;
}

function isMatchTwoUrls(url1, url2) {
  return stripUrl(url1) == stripUrl(url2);
}

function makeRequestInBackground(queryString, isReddit) {
  const msg = { queryString: queryString };
  if (isReddit) {
    msg.isReddit = true;
  } else {
    msg.isHn = true;
  }
  return new Promise((resolve, reject) =>
    sys.runtime.sendMessage(msg, (data) => {
      resolve(data);
    })
  );
}

// Returns a promise of the links
function findReddit(urlString) {
  const location = new URL(urlString);
  const inithost = location.host;
  const omitlist = ["news.ycombinator.com", "reddit.com"];
  if (omitlist.indexOf(inithost) >= 0) {
    return Promise.reject("Reddit API: Not going to search Reddit on Reddit");
  }
  const searchUrl = getCurrentUrl();
  const queryString = "sort=top&q=" + encodeURIComponent("url:" + searchUrl);

  logg.log("findReddit", { queryString });
  return makeRequestInBackground(queryString, true)
    .then((data) => {
      logg.log("findReddit", { data });
      const html = $($.parseHTML(data));
      const searchResultsComments = html.find("a.search-comments");
      if (searchResultsComments.length == 0) {
        return Promise.reject("Reddit API: No results found");
      }
      const firstCommentsLink = searchResultsComments[0];
      const commentTextArr = firstCommentsLink.text.split(" ");
      const num_of_comments = commentTextArr.length > 1 ? commentTextArr[0] : 0;

      firstCommentsLink.hostname = "reddit.com";
      return {
        link: firstCommentsLink.href,
        comments: num_of_comments,
      };
    })
    .catch((err) => {
      return Promise.reject(err);
    });
}

function findHn(urlString) {
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
  return makeRequestInBackground(queryString, false)
    .then((data) => {
      logg.log("findHn", { data });
      if (data["nbHits"] == 0) {
        return Promise.reject("Hacker News API: No urls found");
      }
      let allhits = data["hits"];
      let num_of_comments = 0;
      let result_id = null;
      const thisUrl = document.location.href;
      for (let hit of allhits) {
        const hitUrl = hit["url"];
        if (
          isMatchTwoUrls(hitUrl, thisUrl) &&
          hit["num_comments"] >= num_of_comments
        ) {
          num_of_comments = hit["num_comments"];
          result_id = hit["objectID"];
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
    })
    .catch((err) => {
      return Promise.reject(err);
    });
}
