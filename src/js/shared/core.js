var core = (function() {
  function getBrowser() {
    const newsit_browser = typeof chrome !== "undefined" ? chrome : browser;
    return newsit_browser;
  }

  function getStorage(values) {
    return new Promise((resolve, reject) => {
      getBrowser().storage.sync.get(values, (items) => {
        resolve(items);
      })
    });
  }

  function isProduction() {
    return new Promise((resolve, reject) => {
      // Check build time variable, (see gullpfile.js)
      if (IS_PRODUCTION)
        resolve(true)
      else
        resolve(false)
    })
  }

  function sendMessageIconEnabled(isEnabled, tabId) {
    let message = {iconIsEnabled: isEnabled}
    if (tabId)
      message.tabId = tabId;
    getBrowser().runtime.sendMessage(message);
  }

  return {
    getBrowser: getBrowser,
    getStorage: getStorage,
    isProduction: isProduction,
    sendMessageIconEnabled: sendMessageIconEnabled,
  }
}())