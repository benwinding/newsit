import { Tabs } from "webextension-polyfill-ts";
import { getBrowserInstance } from "./browser";
import { MessageApi } from "./messages";
import { RootState } from "./models";
import { store } from "./store";

const system = getBrowserInstance();

export class AllowListManager {
  public async SetCurrentBlackListed(isBlackListed: boolean) {
    const url = await this.getCurrentTabUrl();
    if (isBlackListed) {
      return MessageApi.emitEvent("host_add_to_list", url);
    } else {
      return MessageApi.emitEvent("host_remove_from_list", url);
    }
  }

  public async IsCurrentUrlBlacklisted() {
    return this.getCurrentTabUrl().then((url) => this.IsUrlBlackListed(url));
  }

  public async IsUrlBlackListed(urlString: string): Promise<boolean> {
    const isProtocolAllowed = !this.IsHostAllowedOnFirefox(urlString);
    console.log("isBlackListed", { urlString, isProtocolAllowed });
    if (isProtocolAllowed) {
      return true;
    }
    const host = new URL(urlString).host;
    const hosts = await this.GetBlackListedHosts();
    const hostsNoProtocol = hosts.map((h) => new URL(h).host);
    const isBlackListed = hostsNoProtocol.indexOf(host) > -1;
    return isBlackListed;
  }

  public async GetBlackListedHosts(): Promise<string[]> {
    return store
      .GetStorage({
        blackListed: [] as string[],
      })
      .then((items) => items.blackListed)
      .then((hosts) => (Array.isArray(hosts) ? hosts : []));
  }

  public async BlackListAdd(hostToBlackList: string) {
    const hosts = await this.GetBlackListedHosts();
    hosts.push(hostToBlackList);
    return store.SetStorage({ blackListed: hosts });
  }

  public async BlackListRemove(hostToRemove: string) {
    const hosts = await this.GetBlackListedHosts();
    const hostsNew = hosts.filter((h) => h !== hostToRemove);
    return store.SetStorage({ blackListed: hostsNew });
  }

  private async getCurrentTabUrl() {
    return system.tabs.getCurrent().then(t => t.url);
  }

  private isProtocolAllowed(urlString: string): boolean {
    let protocolStr = "";
    try {
      protocolStr = new URL(urlString).protocol;
    } catch (error) {}
    const allowList = ["file:", "http:", "https:"];
    const isAllowed = allowList.includes(protocolStr);
    return isAllowed;
  }

  public IsHostAllowedOnFirefox(urlString: string): boolean {
    let hostStr = "";
    try {
      hostStr = new URL(urlString).host;
    } catch (error) {}
    const bannedDomainsList = [
      "accounts-static.cdn.mozilla.net",
      "accounts.firefox.com",
      "addons.cdn.mozilla.net",
      "addons.mozilla.org",
      "api.accounts.firefox.com",
      "content.cdn.mozilla.net",
      "content.cdn.mozilla.net",
      "discovery.addons.mozilla.org",
      "input.mozilla.org",
      "install.mozilla.org",
      "oauth.accounts.firefox.com",
      "profile.accounts.firefox.com",
      "support.mozilla.org",
      "sync.services.mozilla.com",
      "testpilot.firefox.com",
    ];
    const isAllowed = !bannedDomainsList.includes(hostStr);
    const isProtocolAllowed = this.isProtocolAllowed(urlString);
    return isAllowed && isProtocolAllowed;
  }
}

export const alist = new AllowListManager();
