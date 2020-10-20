import {getStorage, system} from "../core";

// QUERIES

export function getVersion() {
  return new Promise((resolve, reject) => {
    system.management.getSelf((ext) => {
      resolve(ext.version);
    });
  });
}

export async function getBlackListedHosts() {
  const items = await getStorage({
    blackListed: [] as string[],
  });
  return items.blackListed;
}

export function getCurrentTabUrl() {
  return new Promise((resolve, reject) => {
    system.tabs.query(
      {
        active: true,
        windowType: "normal",
        currentWindow: true,
      },
      (tabs: any[]) => {
        const thisTab = tabs[0];
        const thisUrl = thisTab.url;
        resolve(thisUrl);
      }
    );
  });
}

export function getCurrentTabId() {
  return new Promise((resolve, reject) => {
    system.tabs.query(
      {
        active: true,
        windowType: "normal",
        currentWindow: true,
      },
      (tabs: any[]) => {
        const thisTab = tabs[0];
        const thisId = thisTab.id;
        resolve(thisId);
      }
    );
  });
}

export function getTabUrl(tabId: any) {
  return new Promise((resolve, reject) => {
    system.tabs.get(tabId, (tab) => {
      const thisUrl = tab.url;
      resolve(thisUrl);
    });
  });
}

export async function isEnabled() {
  const items = await getStorage({ isEnabled: true });
  return items.isEnabled;
}

export async function isNotBlackListed(urlString: any) {
  const is = await isBlackListed(urlString);
  return !is;
}

export async function isBlackListed(urlString: string) {
  const host = new URL(urlString).host;
  const hosts = await getBlackListedHosts();
  const hostsSafe = Array.isArray(hosts) ? hosts : [];
  const isBlackListed = hostsSafe.indexOf(host) > -1;
  return isBlackListed;
}

export function getHostFromUrl(urlString: string) {
  let host;
  try {
    host = new URL(urlString).host;
  } catch (e) {
    host = urlString;
  }
  return host;
}
