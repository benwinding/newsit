import { logger } from "./logger";

export const core = {
  getBrowser: getBrowser,
  getStorage: getStorage,
  isProduction: process.env.IS_PRODUCTION,
  sendMessageIconEnabled: sendMessageIconEnabled,
  logger: logger,
};

export const sys = core.getBrowser();

function getBrowser() {
  const newsit_browser = typeof chrome !== "undefined" ? chrome : browser;
  return newsit_browser;
}

function getStorage(values) {
  return new Promise((resolve, reject) => {
    getBrowser().storage.sync.get(values, (items) => {
      resolve(items);
    });
  });
}

function sendMessageIconEnabled(isEnabled, tabId) {
  let message = { iconIsEnabled: isEnabled };
  if (tabId) message.tabId = tabId;
  getBrowser().runtime.sendMessage(message);
}
