import { Browser, browser } from "webextension-polyfill-ts";

// Get extension api Chrome or Firefox
export function getBrowserInstance(): Browser {
  return browser;
}

export const system = getBrowserInstance();

export async function getCurrentTab() {
  return system.tabs
    .query({
      active: true,
      windowType: "normal",
      currentWindow: true,
    })
    .then((tabs) => {
      const thisTab = tabs[0];
      return thisTab;
    });
}
