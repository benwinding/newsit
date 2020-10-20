export { logger } from "./logger";

// Get extension api Chrome or Firefox
function browser(): typeof chrome {
  const newsit_browser = window.chrome || (window as any)['browser'];
  return newsit_browser;
}

export const system = browser();

export async function getStorage<T>(values: T): Promise<T> {
  return new Promise((resolve, reject) => {
    system.storage.sync.get(values, (items) => {
      resolve(items as T);
    });
  });
}

export function sendMessageIconEnabled(isEnabled: boolean, tabId?: string) {
  let message = { iconIsEnabled: isEnabled, tabId: tabId };
  system.runtime.sendMessage(message);
}
