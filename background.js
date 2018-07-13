function setIcon(isEnabled) {
  chrome.storage.sync.set({
    isEnabled: isEnabled
  })
  const iconPath = isEnabled ? 'images/icon.png' : 'images/icon-grey.png';
  chrome.browserAction.setIcon({
    path: iconPath
  });
}

function onClickIcon() {
  chrome.storage.sync.get('isEnabled', function(data) {
    const newIsEnabled = !data.isEnabled;
    setIcon(newIsEnabled);
  });
};

function onChangeStorage(changes, namespace) {
  var storageChange = changes['isEnabled'];
  for (key in changes) {
    var storageChange = changes[key];
    console.log('Storage key "%s" in namespace "%s" changed. ' +
      'Old value was "%s", new value is "%s".',
      key,
      namespace,
      storageChange.oldValue,
      storageChange.newValue);
  }
  setIcon(storageChange.newValue);
}

chrome.runtime.onInstalled.addListener(function() {
  setIcon(true);
});
chrome.browserAction.onClicked.addListener(onClickIcon);
chrome.storage.onChanged.addListener(onChangeStorage);