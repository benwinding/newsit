import { MessageChannelObj, MessageChannelType, RootState } from "./models";
import { system } from "./browser";
// export { logger } from "../shared/logger";

export class FrontApi {
  async sendMessage<T>(channel: MessageChannelType, data: {}): Promise<T> {
    return new Promise((resolve) => {
      const msg: MessageChannelObj = {
        channel: channel,
        data: data,
      };
      system.runtime.sendMessage(msg, (response) => {
        resolve(response);
      });
    });
  }

  async getStorage<T extends Partial<RootState>>(defaultValues: T): Promise<T> {
    return new Promise((resolve, reject) => {
      system.storage.sync.get(defaultValues, (values) => {
        resolve(values as T);
      });
    });
  }

  async setStorage<T extends Partial<RootState>>(defaultValues: T): Promise<void> {
    return new Promise((resolve, reject) => {
      system.storage.sync.set(defaultValues, () => {
        resolve();
      });
    });
  }


  async getCurrentTabUrl(): Promise<string> {
    return new Promise((resolve, reject) => {
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

  async getCurrentTabId(): Promise<number>  {
    return new Promise((resolve, reject) => {
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
    return new Promise((resolve, reject) => {
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
    const isBlackListed = hostsSafe.indexOf(host) > -1;
    return isBlackListed;
  }

  async getBlackListedHosts(): Promise<string[]> {
    const items = await this.getStorage({
      blackListed: [],
    });
    return items.blackListed;  
  }

  async setHostDontRun(hostToBlackList: string) {
    const hosts = await this.getBlackListedHosts();
    const hostsSafe = Array.isArray(hosts) ? hosts : [];
    hostsSafe.push(hostToBlackList);
    return this.setStorage({blackListed: hostsSafe});
  }

  async setHostRun(hostToRemove: string) {
    const hosts = await this.getBlackListedHosts();
    const hostsSafe = Array.isArray(hosts) ? hosts : [];
    const hostsNew = hostsSafe.filter(h => h !== hostToRemove);
    return this.setStorage({blackListed: hostsNew});
  }
}

export const front = new FrontApi();