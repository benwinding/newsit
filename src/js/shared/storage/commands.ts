import {system, logger} from "../core";
import { getBlackListedHosts, getHostFromUrl } from "./queries";

const logg = logger.MakeLogger("store.js");

interface RootState {
  isEnabled: boolean;
  btnsize: number;
  placement: string;
  blackListed: string[];
}

// COMMANDS

export async function setStorage(values: Partial<RootState>) {
  logg.log("setStorage: ", { values });
  return system.storage.sync.set(values);
}

export function setEnabledAll(state: boolean) {
  setStorage({
    isEnabled: !!state,
  });
}

export function setBtnSize(state: number) {
  setStorage({
    btnsize: +state,
  });
}

export function setBtnPlacement(state: string) {
  setStorage({
    placement: state,
  });
}

export async function setHost(urlString: string, isBlackListed: boolean) {
  const host = getHostFromUrl(urlString);
  const hosts = await getBlackListedHosts();
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

export async function addHostToBlackList(urlString: any) {
  return setHost(urlString, true);
}

export async function removeHostFromBlackList(urlString: any) {
  return setHost(urlString, false);
}
