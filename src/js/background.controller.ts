import { alist } from "./browser/allowlist-manager";
import { system } from "./browser/browser";
import { store } from "./browser/store";

class BackgroundController {
  IsUrlBlackListed(url: string) {
    return alist.IsUrlBlackListed(url);
  }
  IsHostAllowedOnFirefox(url: string) {
    return alist.IsHostAllowedOnFirefox(url);
  }
  IsCurrentUrlBlacklisted() {
    return alist.IsCurrentUrlBlacklisted();
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
  GetTab(tabId: number) {
    return system.tabs.get(tabId);
  }
  SetIconGrey(enabled: boolean) {
    const iconPath = enabled ? "./img/icon.png" : "./img/icon-grey.png";
    const iconP = system.runtime.getURL(iconPath);
    system.browserAction.setIcon({ path: iconP });
  }

  private async ExecuteContentScripts(tabId: number) {
    function exec(relPath: string) {
      console.log("executeContentScripts", { relPath });
      return system.tabs.executeScript(tabId, {
        file: relPath,
      });
    }

    await exec("vendor/browser-polyfill.min.js");
    await exec("vendor/react.development.js");
    await exec("vendor/react-dom.development.js");
    await exec("js/content.js");
  }

  async RunScripts(tabId: number) {
    const tab = await this.GetTab(tabId);
    if (!alist.IsHostAllowedOnFirefox(tab.url)) {
      return;
    }
    await this.ExecuteContentScripts(tabId).catch((err) => {
      console.error("executeContentScripts", err);
    });
  }
}

export function createBackgroundController() {
  return new BackgroundController();
}
