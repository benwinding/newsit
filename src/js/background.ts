// ACTIONS

import {
  onRequestBackgroundHN,
  onRequestBackgroundReddit,
} from "./browser/api";
import { system } from "./browser/browser";
import { front } from "./browser/front";
import { MessageApi } from "./browser/messages";

async function onTabChangeUrl(tabId: any, changeInfo: { url: any }, tab: any) {
  if (!changeInfo.url) return;
  console.log(`tab: ${tabId}, url changed to: ${changeInfo.url}`);
  const isEnabled = await front.getIsAllEnabled();
  if (!isEnabled) return;
  const url = changeInfo.url;
  const isBlackListed = await front.isBlackListed(url);
  if (isBlackListed) return;
  MessageApi.emitEvent("request_hn", url);
  MessageApi.emitEvent("request_reddit", url);
}

async function onTabChangeActive(activeInfo: { tabId: any }) {
  const tabId = activeInfo.tabId;
  console.log(`onTabChangeActive, tab: ${tabId}, is the new ActiveTab`);
  const result = await front.getStorage({ isEnabled: true });
  if (!result.isEnabled) return;
  MessageApi.emitEvent("request_hn");
  MessageApi.emitEvent("request_reddit");
}

system.tabs.onUpdated.addListener(onTabChangeUrl);
system.tabs.onActivated.addListener(onTabChangeActive);

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
MessageApi.onEvent("change_icon_enable", (enabled, s) => {
  console.log('on change_icon_enable', {enabled, s});
  const iconPath = enabled ? "./img/icon.png" : "./img/icon-grey.png";
  const iconP = front.getLocalAssetUrl(iconPath);
  system.browserAction.setIcon({ path: iconP });
});

async function onStartUp() {
  const isEnabled = await front.getIsAllEnabled();
  MessageApi.emitEvent("change_icon_enable", isEnabled);
}
onStartUp();
