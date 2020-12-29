import { store } from "./store";
import {
  CheckBlacklist,
  CheckHostAllowedOnFirefox,
  CheckProtocolAllowed,
} from "./url-validator";

export class AllowListManager {
  public async IsUrlBlackListed(urlString: string): Promise<boolean> {
    const blackList = await this.GetBlackListedHosts();
    console.log("IsUrlBlackListed", { urlString, blackList });
    try {
      CheckProtocolAllowed(urlString);
      CheckHostAllowedOnFirefox(urlString);
      CheckBlacklist(urlString, blackList);
    } catch (error) {
      console.log(error);
      return true;
    }
    return false;
  }

  IsHostAllowedOnFirefox(url: string) {
    try {
      CheckProtocolAllowed(url);
      CheckHostAllowedOnFirefox(url);
    } catch (error) {
      console.log(error);
      return true;
    }
    return false;
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
  BlackListSetNewArray(newHostArr: string[]) {
    return store.SetStorage({ blackListed: newHostArr });
  }
}

export const alist = new AllowListManager();
