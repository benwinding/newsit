// Get extension api Chrome or Firefox
function getBrowserInstance(): typeof chrome {
  const browserInstance = window.chrome || (window as any)['browser'];
  return browserInstance;
}

export const system = getBrowserInstance();

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
