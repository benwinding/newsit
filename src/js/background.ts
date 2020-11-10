// ACTIONS
// const logg = logger.MakeLogger("background.js");

import { system } from "./browser/browser";
import { front } from "./browser/front";
import { MessageApi } from "./browser/messages";

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
  // logg.log("makeRequest", { url, isJson });
  const res = await fetch(url);
  if (isJson) {
    return res.json();
  } else {
    return res.text();
  }
}

async function onRequestBackgroundHN(data: string, tabId: number) {
  const t = await front.getTab(tabId);
  const searchUrl = t.url;
  const blocked = await front.isBlackListed(searchUrl);
  if (blocked) {
    return;
  }
  const queryString = `query=${encodeURIComponent(
    searchUrl
  )}&restrictSearchableAttributes=url`;
  const requestUrl = "https://hn.algolia.com/api/v1/search?" + queryString;
  interface HnJsonRes {
    nbHits: number,
    hits: {
      url: string,
      num_comments: number,
      objectID: string
    }[]
  }
  const res: HnJsonRes = await makeRequest(requestUrl, true);
  if (res.nbHits == 0) {
    throw new Error("Hacker News API: No urls found");
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
    throw new Error("Hacker News API: No url matches found");
  }
  const linkUrl = `https://news.ycombinator.com/item?id=${result_id}`;
  return {
    link: linkUrl,
    text: num_of_comments,
  };
}

async function onRequestBackgroundReddit(data: string, tabId: number) {
  const t = await front.getTab(tabId);
  const searchUrl = t.url;
  const blocked = await front.isBlackListed(searchUrl);
  if (blocked) {
    return;
  }
  const queryString = "sort=top&q=" + encodeURIComponent("url:" + searchUrl);
  const requestUrl = "https://old.reddit.com/search?" + queryString;
  const res = await makeRequest(requestUrl, false);
  return res;
}

system.tabs.onUpdated.addListener(onTabChangeUrl);
system.tabs.onActivated.addListener(onTabChangeActive);
// system.storage.onChanged.addListener(onChangeEnabled);

MessageApi.subscribeTo("change_icon_enable", onIconEnabled);
MessageApi.subscribeTo("request_hn", onRequestBackgroundHN);
MessageApi.subscribeTo("request_reddit", onRequestBackgroundReddit);

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