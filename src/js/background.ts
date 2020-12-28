import {
  onRequestBackgroundHN,
  onRequestBackgroundReddit,
} from "./browser/api";
import { createBackgroundController } from "./background.controller";
import { system } from "./browser/browser";
import { MessageApi } from "./browser/messages";

const bc = createBackgroundController();

system.tabs.onUpdated.addListener(
  (tabId: any, changeInfo: { url: any }, tab: any) => {
    const isBlackListed = !bc.IsUrlBlackListed(tab.url);
    console.log(`tab: ${tabId}, url changed to: ${changeInfo.url}`, {
      isBlackListed,
    });
    if (isBlackListed) {
      return;
    }
    MessageApi.emitEventToTab("tab_url_changed", tabId).catch((err) => {
      if (bc.ErrorIsNotLoaded(err)) {
        bc.RunScripts(tabId);
      }
    });
  }
);
system.tabs.onActivated.addListener(async (activeInfo) => {
  const tabId = activeInfo.tabId;
  console.log(`onTabChangeActive, tab: ${tabId}, is the new ActiveTab`, {
    activeInfo,
  });
  const tab = await bc.GetTab(tabId);
  const isEnabled = await bc.IsUrlBlackListed(tab.url);
  bc.SetIconGrey(isEnabled);
});

MessageApi.onEvent("request_api", (d, s) => {
  onRequestBackgroundHN(s.tab.id)
    .then((res) => MessageApi.emitEventToTab("result_from_hn", s.tab.id, res))
    .catch((err) => console.error("request_hn", err));
  onRequestBackgroundReddit(s.tab.id)
    .then((res) =>
      MessageApi.emitEventToTab("result_from_reddit", s.tab.id, res)
    )
    .catch((err) => console.error("request_reddit", err));
});
MessageApi.onEvent("host_remove_from_list", async (hostToRemove: string, s) => {
  await bc.BlacklistRemoveHost(hostToRemove);
  bc.SetIconGrey(false);
});
MessageApi.onEvent("host_add_to_list", async (hostToAdd: string, s) => {
  await bc.BlacklistAddHost(hostToAdd);
  bc.SetIconGrey(true);
});

async function onStartUp() {
  const isEnabled = await bc.GetIsAllEnabled();
  bc.SetIconGrey(isEnabled);
}

onStartUp();
