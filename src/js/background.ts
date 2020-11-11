// ACTIONS
// const logg = logger.MakeLogger("background.js");

import { system } from "./browser/browser";
import { front } from "./browser/front";
import { MessageApi } from "./browser/messages";
import { ButtonResult } from "./browser/models";

type MessageSender = chrome.runtime.MessageSender;

function sendCheckCommand(tabId: number, url: any) {
  const request = {
    action: "check",
    url: url,
  };
  system.tabs.sendMessage(tabId, request);
}

function sendTabNowActiveCommand(tabId: number) {
  const request = {
    action: "nowActive",
  };
  system.tabs.sendMessage(tabId, request);
}

function setIcon(state: boolean, tabId?: number) {
  // gui.setIconColour(state, tabId);
  // gui.setIconText(state, tabId);
}

// LISTENERS

function onChangeEnabled(isEnabled: boolean) {
  setIcon(isEnabled);
}

async function onIconEnabled(isEnabled: boolean, tabId: number) {
  // logg.log(`onIconEnabled: tab=${tabId}, isEnabled=${isEnabled}`);
  setIcon(isEnabled, tabId);
}

function onTabChangeUrl(tabId: any, changeInfo: { url: any }, tab: any) {
  if (!changeInfo.url) return;
  // logg.log(`tab: ${tabId}, url changed to: ${changeInfo.url}`);
  // store
  //   .isEnabled()
  //   .then(() => {
  //     sendCheckCommand(tabId, changeInfo.url);
  //   })
  // .catch((err) => logg.log("onTabChangeUrl", err));
}

async function onTabChangeActive(activeInfo: { tabId: any }) {
  const tabId = activeInfo.tabId;
  // logg.log(`onTabChangeActive, tab: ${tabId}, is the new ActiveTab`);
  // try {
  //   await front.isEnabled()
  //   const tabUrl = await front.getTabUrl(tabId)
  //   await front.isNotBlackListed(tabUrl)
  //   sendTabNowActiveCommand(tabId)
  //   setIcon(true, tabId);
  // } catch (error) {
  //   setIcon(false, tabId);
  // }
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

async function onRequestBackgroundHN(tabId: number): Promise<ButtonResult> {
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

async function onRequestBackgroundReddit(tabId: number): Promise<ButtonResult> {
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

system.tabs.onUpdated.addListener(onTabChangeUrl);
system.tabs.onActivated.addListener(onTabChangeActive);
// system.storage.onChanged.addListener(onChangeEnabled);

// MessageApi.onEvent("change_icon_enable", onIconEnabled);
MessageApi.onEvent("request_hn", (d, s) =>
  onRequestBackgroundHN(s.tab.id).then((res) =>
    MessageApi.emitEventToTab("result_from_hn", s.tab.id, res)
  )
);
MessageApi.onEvent("request_reddit", (d, s) =>
  onRequestBackgroundReddit(s.tab.id).then((res) =>
    MessageApi.emitEventToTab("result_from_reddit", s.tab.id, res)
  )
);
// MessageApi.subscribeTo("request_reddit", onRequestBackgroundReddit);

async function onStartUp() {
  const list = await front.getStorage({ isEnabled: true });
  setIcon(list["isEnabled"]);
}
onStartUp();

function stripUrl(urlString: string) {
  const url = new URL(urlString);
  return url.host + url.pathname + url.search;
}

function isMatchTwoUrls(url1: string, url2: string) {
  return stripUrl(url1) == stripUrl(url2);
}
