import { MakeLogger } from "../logger";
import { store } from "../store";
import {
  CheckBlacklist,
  CheckHostAllowedOnFirefox,
  CheckProtocolAllowed,
} from "./url-validator";

const logger = MakeLogger('allowlist-manager', store);

export class AllowListManager {
  public async IsUrlBlackListed(url: string): Promise<boolean> {
    const blackList = await this.GetBlackListedHosts();
    let isBlackListed = false;
    try {
      CheckProtocolAllowed(url);
      CheckHostAllowedOnFirefox(url);
      CheckBlacklist(url, blackList);
    } catch (error) {
      logger.log(error);
      isBlackListed = true;
    }
    logger.log("IsUrlBlackListed", { isBlackListed, url, blackList });
    return isBlackListed;
  }

  IsHostAllowedOnFirefox(url: string) {
    let isBlackListed = false;
    try {
      CheckProtocolAllowed(url);
      CheckHostAllowedOnFirefox(url);
    } catch (error) {
      logger.log(error);
      isBlackListed = true;
    }
    logger.log("IsUrlBlackListed", { isBlackListed, url });
    return isBlackListed;
  }

  public async GetBlackListedHosts(): Promise<string[]> {
    return store
      .GetStorage()
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
  BlackListSetNewArray(newHostArr: string[]) {
    return store.SetStorage({ blackListed: newHostArr });
  }
}

export const alist = new AllowListManager();
