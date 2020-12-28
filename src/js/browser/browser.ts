import { Browser, browser } from "webextension-polyfill-ts";

// Get extension api Chrome or Firefox
export function getBrowserInstance(): Browser {
  return browser;
}

export const system = getBrowserInstance();
