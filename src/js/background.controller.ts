import { alist } from "./browser/allowlist-manager";
import { system } from "./browser/browser";
import { MessageApi } from "./browser/messages";
import { MessageChannelType } from "./browser/models";
import { store } from "./browser/store.factory";
import { MakeLogger } from "./shared/logger.factory";

const logger = MakeLogger('background.controller', store);

class BackgroundController {
  ListenForAllEnabledChange(cb: (isAllEnabled: boolean) => void) {
    store.OnStorageChanged('isEnabled', cb, true);
  }
  ListenForHostAdd(cb: (hostToAdd: string) => Promise<void>) {
    MessageApi.onEvent("host_add_to_list", (d: string, s) => {
      return cb(d);
    });
  }
  ListenForHostRemove(cb: (hostToRemove: string) => Promise<void>) {
    MessageApi.onEvent("host_remove_from_list", (d: string, s) => {
      return cb(d);
    });
  }
  ListenForRequestApi(cb: (tabId: number) => void) {
    MessageApi.onEvent("request_api", (d, s) => {
      return cb(s.tab.id);
    });
  }
  ListenTabChange(cb: (tabId: any, tabUrl: any) => Promise<void>) {
    system.tabs.onActivated.addListener(async (activeInfo) => {
      const tabId = activeInfo.tabId;
      logger.log(`onTabChangeActive, tab: ${tabId}, is the new ActiveTab`, {
        activeInfo,
      });
      const tab = await system.tabs.get(tabId);
      cb(tabId, tab.url);
    });
  }
  ListenUrlChange(cb: (tabId: any, tabUrl: any) => void) {
    system.tabs.onUpdated.addListener(async (tabId, changeInfo) => {
      const url = changeInfo.url;
      if (!url) {
        return;
      }
      cb(tabId, url);
    });
  }
  IsUrlBlackListed(url: string) {
    return alist.IsUrlBlackListed(url);
  }
  IsHostAllowedOnFirefox(url: string) {
    return alist.IsHostAllowedOnFirefox(url);
  }
  async BlacklistAddHost(hostToAdd: string) {
    return alist.BlackListAdd(hostToAdd);
  }
  async BlacklistRemoveHost(hostToRemove: string) {
    return alist.BlackListRemove(hostToRemove);
  }
  ErrorIsNotLoaded(err: { message: string }): boolean {
    return err.message.includes("Receiving end does not exist.");
  }
  async GetIsAllEnabled() {
    return store.GetStorage({ isEnabled: true }).then((v) => v.isEnabled);
  }
  private getTab(tabId: number) {
    return system.tabs.get(tabId);
  }

  // Commands
  SendEventToTab(e: MessageChannelType, tabId: number, d?: any) {
    return MessageApi.emitEventToTab(e, tabId, d);
  }
  SetIconGrey(shouldBeGrey: boolean) {
    const iconPath = shouldBeGrey ? "./img/icon-grey.png" : "./img/icon.png";
    const iconP = system.runtime.getURL(iconPath);
    system.browserAction.setIcon({ path: iconP });
  }
  SetIconText(isAllOn: boolean) {
    // ⏻ ⏼ ⏽ ⭘ ⏾
    const iconPath = isAllOn ? "●" : "";
    // const iconTextBackgroundColor = isAllOn ? "#FF0000" : "gray";
    // const iconTextColor = isAllOn ? "white" : "black";
    system.browserAction.setBadgeText({text: iconPath});
    // system.browserAction.setBadgeTextColor({color: iconTextColor});
    // system.browserAction.setBadgeBackgroundColor({color: iconTextBackgroundColor});
  }

  private async ExecuteContentScripts(tabId: number) {
    function exec(relPath: string) {
      logger.log("executeContentScripts", { relPath });
      return system.tabs.executeScript(tabId, {
        file: relPath,
      });
    }

    await exec("vendor/browser-polyfill.min.js");
    await exec("vendor/react.js");
    await exec("vendor/react-dom.js");
    await exec("js/content.js");
  }

  async RunScripts(tabId: number) {
    const tab = await this.getTab(tabId);
    await this.ExecuteContentScripts(tabId).catch((err) => {
      logger.error("executeContentScripts", err);
    });
  }
}

export function createBackgroundController() {
  return new BackgroundController();
}
