function getBrowser() {
  const newsit_browser = typeof chrome !== "undefined" ? chrome : browser;
  return newsit_browser;
}

function setIconState(isEnabled) {
  getBrowser().storage.sync.set({
    isEnabled: isEnabled
  })
}

function onChangeIconState(changes, namespace) {
  var storageChange = changes['isEnabled'];
  if (storageChange == undefined)
    return
  const isEnabled = storageChange.newValue;
  const iconPath = isEnabled ? 'images/icon.png' : 'images/icon-grey.png';
  getBrowser().browserAction.setIcon({
    path: iconPath
  });
  const iconText = isEnabled ? 'ON' : '';
  getBrowser().browserAction.setBadgeText({ text:iconText });
}

getBrowser().storage.onChanged.addListener(onChangeIconState);

module.exports = {
  getBrowser: getBrowser,
  setIconState: setIconState,
  onChangeIconState: onChangeIconState
}
