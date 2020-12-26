import { RootState } from "./models";
import { system } from "./browser";

export class FrontApi {
  gotoOptionsPage() {
    return system.runtime.openOptionsPage();
  }

  getLocalAssetUrl(path: string): string {
    return system.runtime.getURL(path);
  }

  async getStorage<T extends Partial<RootState>>(defaultValues: T): Promise<T> {
    return new Promise((resolve) => {
      system.storage.sync.get(defaultValues, (values) => {
        resolve(values as T);
      });
    });
  }

  async setStorage<T extends Partial<RootState>>(newValues: T): Promise<void> {
    return new Promise((resolve) => {
      system.storage.sync.set(newValues, () => {
        resolve();
      });
    });
  }


  async getCurrentTabUrl(): Promise<string> {
    return new Promise((resolve) => {
      system.tabs.query(
        {
          active: true,
          windowType: "normal",
          currentWindow: true,
        },
        (tabs) => {
          const thisTab = tabs[0];
          const thisUrl = thisTab.url;
          resolve(thisUrl);
        }
      );
    });
  }

  async getTab(tabId: number): Promise<chrome.tabs.Tab> {
    return new Promise((resolve) => {
      system.tabs.get(tabId, (t) => resolve(t));
    });
  }

  async getCurrentTabId(): Promise<number>  {
    return new Promise((resolve) => {
      system.tabs.query(
        {
          active: true,
          windowType: "normal",
          currentWindow: true,
        },
        (tabs) => {
          const thisTab = tabs[0];
          const thisTabId = thisTab.id;
          resolve(thisTabId);
        }
      );
    });
  }

  getVersion() {
    return new Promise((resolve) => {
      system.management.getSelf((ext) => {
        resolve(ext.version);
      });
    });
  }

  async getIsAllEnabled(): Promise<boolean>  {
    const res = await this.getStorage({isEnabled: true});
    return res.isEnabled;
  }

  async setEnabledAll(allEnabled: boolean): Promise<void>  {
    await this.setStorage({isEnabled: allEnabled});
  }

  getSubmitLink(whichSource: string): string {
    const title = encodeURI(document.title);
    const link = encodeURI(document.location.href);
    if (whichSource.includes("eddit")) {
      return `https://reddit.com/submit?title=${title}&url=${link}`;
    } else {
      return `https://news.ycombinator.com/submitlink?t=${title}&u=${link}`;
    }
  }

  async isBlackListed(urlString: string): Promise<boolean> {
    const host = new URL(urlString).host;
    const hosts = await this.getBlackListedHosts();
    const hostsSafe = Array.isArray(hosts) ? hosts : [];
    const hostsNoProtocol = hostsSafe.map(h => new URL(h).host);
    const isBlackListed = hostsNoProtocol.indexOf(host) > -1;
    return isBlackListed;
  }

  async getBlackListedHosts(): Promise<string[]> {
    const items = await this.getStorage({
      blackListed: [],
    });
    const hosts = items.blackListed;
    console.log('getBlackListedHosts', {hosts});
    return hosts;
  }

  async blackListAdd(hostToBlackList: string) {
    const hosts = await this.getBlackListedHosts();
    const hostsSafe = Array.isArray(hosts) ? hosts : [];
    hostsSafe.push(hostToBlackList);
    return this.setStorage({blackListed: hostsSafe});
  }

  async blackListRemove(hostToRemove: string) {
    const hosts = await this.getBlackListedHosts();
    const hostsSafe = Array.isArray(hosts) ? hosts : [];
    const hostsNew = hostsSafe.filter(h => h !== hostToRemove);
    return this.setStorage({blackListed: hostsNew});
  }
}

export const front = new FrontApi();