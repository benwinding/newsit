var sys = core.getBrowser();

function onChangeIconState(changes, namespace) {
  var isEnabledChange = changes['isEnabled'];
  if (isEnabledChange == undefined)
    return
  const isEnabled = isEnabledChange.newValue;
  const iconPath = isEnabled ? 'icon.png' : 'icon-grey.png';
  sys.browserAction.setIcon({
    path: iconPath
  });
  const iconText = isEnabled ? 'ON' : '';
  sys.browserAction.setBadgeText({ text:iconText });
}

function onStartUp() {
  sys.storage.sync.get({isEnabled: true}, (list) => {
    core.setIconState(list['isEnabled']);
  })
}

function onTabChange  (tabId, changeInfo, tab) {
  // read changeInfo data and do something with it (like read the url)
  if (changeInfo.url) {
    const request = { 
      action: 'check',
      url: changeInfo.url 
    }
    sys.tabs.sendMessage(tabId, request)
  }
}
sys.storage.onChanged.addListener(onChangeIconState);
sys.tabs.onUpdated.addListener(onTabChange);
onStartUp();