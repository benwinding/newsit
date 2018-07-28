var sys = core.getBrowser();

var gui = (function() {

  function setIconColour(isColour, tabId) {
    const iconPath = isColour ? 'img/icon.png' : 'img/icon-grey.png';
    logger.logGui(`tab: ${tabId}, changing icon to: ${iconPath}`)
    let options = {};
    options.path = iconPath;
    if (tabId)
      options.tabId = tabId;
    sys.browserAction.setIcon(options);
  }

  function setIconText(isEnabled, tabId) {
    const iconText = isEnabled ? 'ON' : '';
    logger.logGui(`tab: ${tabId}, changing icon text to: ${iconText}`)
    let options = {};
    options.text = iconText;
    if (tabId)
      options.tabId = tabId;
    sys.browserAction.setBadgeText(options);
  }

  function setIcon(state, tabId) {
    setIconColour(state, tabId);
    setIconText(state, tabId);
  }

  return {
    setIconColour: setIconColour,
    setIconText: setIconText,
    setIcon: setIcon,
  }
}())