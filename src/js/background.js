import { core, sys } from "./shared/core";
import { gui } from "./shared/gui-global";
import { store } from "./shared/store";

// ACTIONS
const logg = core.logger.MakeLogger("background.js");

function sendCheckCommand(tabId, url) {
  const request = {
    action: "check",
    url: url,
  };
  sys.tabs.sendMessage(tabId, request);
}

function sendTabNowActiveCommand(tabId) {
  const request = {
    action: "nowActive",
  };
  sys.tabs.sendMessage(tabId, request);
}

function setIcon(state, tabId) {
  gui.setIconColour(state, tabId);
  gui.setIconText(state, tabId);
}

// LISTENERS

function onChangeEnabled(changes) {
  if (changes["isEnabled"] == null) return;
  const isEnabled = changes["isEnabled"].newValue;
  logg.log(`onIconEnabled: tab=ALL, isEnabled=${isEnabled}`);
  setIcon(isEnabled);
}

function onIconEnabled(request, sender, sendResponse) {
  if (request.iconIsEnabled == null) return;
  const isEnabled = request.iconIsEnabled;
  let tabId;
  if (request.tabId) tabId = request.tabId;
  else tabId = sender.tab.id;
  logg.log(`onIconEnabled: tab=${tabId}, isEnabled=${isEnabled}`);
  setIcon(isEnabled, tabId);
}

function onStartUp() {
  core
    .getStorage({ isEnabled: true })
    .then((list) => {
      setIcon(list["isEnabled"]);
    })
    .catch((err) => logg.log('onStartUp', err));
}

function onTabChangeUrl(tabId, changeInfo, tab) {
  if (!changeInfo.url) return;
  logg.log(`tab: ${tabId}, url changed to: ${changeInfo.url}`);
  store
    .isEnabled()
    .then(() => {
      sendCheckCommand(tabId, changeInfo.url);
    })
    .catch((err) => logg.log('onTabChangeUrl', err));
}

function onTabChangeActive(activeInfo) {
  const tabId = activeInfo.tabId;
  logg.log(`onTabChangeActive, tab: ${tabId}, is the new ActiveTab`);
  store
    .isEnabled()
    .then(() => store.getTabUrl(tabId))
    .then((tabUrl) => store.isNotBlackListed(tabUrl))
    .then(() => sendTabNowActiveCommand(tabId))
    .then(() => {
      setIcon(true, tabId);
    })
    .catch((err) => {
      setIcon(false, tabId);
      logg.log('onTabChangeActive', err);
    });
}

function makeRequest(url, isJson, sendCallback) {
  logg.log("makeRequest", { url, isJson });
  fetch(url)
    .then((res) => {
      if (isJson) {
        return res.json();
      } else {
        return res.text();
      }
    })
    .then((data) => {
      sendCallback(data);
    })
    .catch((error) => log.error('makeRequest', error));
}

function onRequestBackgroundHN(request, sender, sendResponse) {
  if (!request.isHn) return;
  var queryString = request.queryString;
  const requestUrl = "https://hn.algolia.com/api/v1/search?" + queryString;
  makeRequest(requestUrl, true, sendResponse);
  return true; // Will respond asynchronously.
}

function onRequestBackgroundReddit(request, sender, sendResponse) {
  if (!request.isReddit) return;
  var queryString = request.queryString;
  const requestUrl = "https://old.reddit.com/search?" + queryString;
  makeRequest(requestUrl, false, sendResponse);
  return true; // Will respond asynchronously.
}

sys.tabs.onUpdated.addListener(onTabChangeUrl);
sys.tabs.onActivated.addListener(onTabChangeActive);
sys.storage.onChanged.addListener(onChangeEnabled);
sys.runtime.onMessage.addListener(onIconEnabled);
sys.runtime.onMessage.addListener(onRequestBackgroundHN);
sys.runtime.onMessage.addListener(onRequestBackgroundReddit);

onStartUp();
