var core = (function () {
  function getBrowser() {
    const newsit_browser = typeof chrome !== "undefined" ? chrome : browser;
    return newsit_browser;
  }

  function setIconState(isEnabled) {
    this.getBrowser().storage.sync.set({
      isEnabled: isEnabled
    })
  }

  function log(text) {
    console.log(text);
  }

  return {
    getBrowser: getBrowser,
    setIconState: setIconState,
    log: log
  }
}())
