import { system, logger, getStorage } from "./shared/core";
import { gui } from "./shared/gui-global";
import { store } from "./shared/store";

// ACTIONS
const logg = logger.MakeLogger("background.js");

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
  gui.setIconColour(state, tabId);
  gui.setIconText(state, tabId);
}

// LISTENERS

function onChangeEnabled(changes: { [x: string]: { newValue: any } }) {
  if (changes["isEnabled"] == null) return;
  const isEnabled = changes["isEnabled"].newValue;
  logg.log(`onIconEnabled: tab=ALL, isEnabled=${isEnabled}`);
  setIcon(isEnabled);
}

function onIconEnabled(
  request: { iconIsEnabled: any; queryString: any },
  sender: MessageSender,
  sendResponse: (data: any) => void
): boolean {
  if (request.iconIsEnabled == null) return;
  const isEnabled = request.iconIsEnabled;
  const tabId = sender.tab.id;
  logg.log(`onIconEnabled: tab=${tabId}, isEnabled=${isEnabled}`);
  setIcon(isEnabled, tabId);
}

function onTabChangeUrl(tabId: any, changeInfo: { url: any }, tab: any) {
  if (!changeInfo.url) return;
  logg.log(`tab: ${tabId}, url changed to: ${changeInfo.url}`);
  store
    .isEnabled()
    .then(() => {
      sendCheckCommand(tabId, changeInfo.url);
    })
    .catch((err) => logg.log("onTabChangeUrl", err));
}

async function onTabChangeActive(activeInfo: { tabId: any }) {
  const tabId = activeInfo.tabId;
  logg.log(`onTabChangeActive, tab: ${tabId}, is the new ActiveTab`);
  try {
    await store.isEnabled()
    const tabUrl = await store.getTabUrl(tabId)
    await store.isNotBlackListed(tabUrl)
    sendTabNowActiveCommand(tabId)
    setIcon(true, tabId);    
  } catch (error) {
    setIcon(false, tabId);
  }
}

async function makeRequest(
  url: RequestInfo,
  isJson: boolean
): Promise<string | any> {
  logg.log("makeRequest", { url, isJson });
  const res = await fetch(url);
  if (isJson) {
    return res.json();
  } else {
    return res.text();
  }
}

function onRequestBackgroundHN(
  request: { isHn: any; queryString: any },
  sender: MessageSender,
  sendResponse: (data: any) => void
): boolean {
  if (!request.isHn) return;
  var queryString = request.queryString;
  const requestUrl = "https://hn.algolia.com/api/v1/search?" + queryString;
  makeRequest(requestUrl, true).then((data) => sendResponse(data));
  return true; // Will respond asynchronously.
}

function onRequestBackgroundReddit(
  request: { isReddit: any; queryString: any },
  sender: MessageSender,
  sendResponse: (data: any) => void
) {
  if (!request.isReddit) return;
  var queryString = request.queryString;
  const requestUrl = "https://old.reddit.com/search?" + queryString;
  makeRequest(requestUrl, false).then((data) => sendResponse(data));
  return true; // Will respond asynchronously.
}

system.tabs.onUpdated.addListener(onTabChangeUrl);
system.tabs.onActivated.addListener(onTabChangeActive);
system.storage.onChanged.addListener(onChangeEnabled);
system.runtime.onMessage.addListener(onIconEnabled);
system.runtime.onMessage.addListener(onRequestBackgroundHN);
system.runtime.onMessage.addListener(onRequestBackgroundReddit);

async function onStartUp() {
  const list = await getStorage({ isEnabled: true });
  setIcon(list["isEnabled"]);
}
onStartUp();
