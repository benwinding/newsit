import { core } from "./core";

export const store = {
  getBlackListedHosts,
  getCurrentTabUrl,
  getCurrentTabId,
  getTabUrl,
  getVersion,
  isNotBlackListed,
  isEnabled,
  addHostToBlackList,
  removeHostFromBlackList,
  setBtnPlacement,
  setBtnSize,
  setEnabledAll,
};

const sys = core.getBrowser();
const logg = core.logger.MakeLogger("store.js");

// QUERIES

export function getVersion() {
  return new Promise((resolve, reject) => {
    sys.management.getSelf((ext) => {
      resolve(ext.version);
    });
  });
}

export async function getBlackListedHosts() {
  const items = await core.getStorage({
    blackListed: [],
  });
  return items.blackListed;
}

export function getCurrentTabUrl() {
  return new Promise((resolve, reject) => {
    sys.tabs.query(
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

export function getCurrentTabId() {
  return new Promise((resolve, reject) => {
    sys.tabs.query(
      {
        active: true,
        windowType: "normal",
        currentWindow: true,
      },
      (tabs) => {
        const thisTab = tabs[0];
        const thisId = thisTab.id;
        resolve(thisId);
      }
    );
  });
}

export function getTabUrl(tabId) {
  return new Promise((resolve, reject) => {
    sys.tabs.get(tabId, (tab) => {
      const thisUrl = tab.url;
      resolve(thisUrl);
    });
  });
}

export async function isEnabled() {
  const items = await core.getStorage({ isEnabled: true });
  return items.isEnabled;
}

export async function isNotBlackListed(urlString) {
  const isBlackListed = await isBlackListed(urlString);
  return !isBlackListed;
}

export async function isBlackListed(urlString) {
  const host = new URL(urlString).host;
  const hosts = await getBlackListedHosts();
  const hostsSafe = Array.isArray(hosts) ? hosts : [];
  const isBlackListed = hostsSafe.indexOf(host) > -1;
  return isBlackListed;
}

// COMMANDS

export async function setStorage(values) {
  return sys.storage.sync.set(values);
}

export function setEnabledAll(state) {
  logg.log(`setEnabledAll: ${state}`);
  setStorage({
    isEnabled: state,
  });
}

export function setBtnSize(state) {
  logg.log(`setBtnSize: ${state}`);
  setStorage({
    btnsize: state,
  });
}

export function setBtnPlacement(state) {
  logg.log(`setBtnPlacement: ${state}`);
  setStorage({
    placement: state,
  });
}

export function getHostFromUrl(urlString) {
  let host;
  try {
    host = new URL(urlString).host;
  } catch (e) {
    host = urlString;
  }
  return host;
}

export async function setHost(urlString, isBlackListed) {
  const host = getHostFromUrl(urlString);
  const hosts = await store.getBlackListedHosts();
  const hostsSafe = Array.isArray(hosts) ? hosts : [];
  if (isBlackListed) {
    if (!hostsSafe.includes(host)) {
      hostsSafe.push(host);
    }
  }
  const hostsFiltered = !isBlackListed
    ? hostsSafe.filter((e) => e !== host)
    : hostsSafe;
  await setStorage({
    blackListed: hostsFiltered,
  });
}

export async function addHostToBlackList(urlString) {
  return setHost(urlString, true);
}

export async function removeHostFromBlackList(urlString) {
  return setHost(urlString, false);
}
