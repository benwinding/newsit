import {
  onRequestBackgroundHN,
  onRequestBackgroundReddit,
} from "./browser/api";
import { createBackgroundController } from "./background.controller";

const bc = createBackgroundController();

bc.ListenUrlChange(async (tabId, tabUrl) => {
  const shouldBeGrey = await bc.IsUrlBlackListed(tabUrl);
  bc.SetIconGrey(shouldBeGrey);
  bc.SendEventToTab("tab_url_changed", tabId);
});
bc.ListenTabChange(async (tabId, tabUrl) => {
  const shouldBeGrey = await bc.IsUrlBlackListed(tabUrl);
  bc.SetIconGrey(shouldBeGrey);
});
bc.ListenForAllEnabledChange((isAllEnabled) => {
  bc.SetIconText(isAllEnabled);
})
bc.ListenForRequestApi((tabId) => {
  onRequestBackgroundHN(tabId)
    .then((res) => bc.SendEventToTab("result_from_hn", tabId, res))
    .catch((err) => console.log("!!!! request_hn", err));
  onRequestBackgroundReddit(tabId)
    .then((res) => bc.SendEventToTab("result_from_reddit", tabId, res))
    .catch((err) => console.log("!!!! request_reddit", err));
});
bc.ListenForHostRemove(async (hostToRemove: string) => {
  await bc.BlacklistRemoveHost(hostToRemove);
  bc.SetIconGrey(false);
});
bc.ListenForHostAdd(async (hostToAdd: string) => {
  await bc.BlacklistAddHost(hostToAdd);
  bc.SetIconGrey(true);
});

async function onStartUp() {
  const isEnabled = await bc.GetIsAllEnabled();
  bc.SetIconGrey(isEnabled);
}

onStartUp();
