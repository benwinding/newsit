const shared = require('./shared/shared.js');
const sys = shared.getBrowser();

function onChangeIconState(changes, namespace) {
  var storageChange = changes['isEnabled'];
  if (storageChange == undefined)
    return
  const isEnabled = storageChange.newValue;
  const iconPath = isEnabled ? 'images/icon.png' : 'images/icon-grey.png';
  sys.browserAction.setIcon({
    path: iconPath
  });
  const iconText = isEnabled ? 'ON' : '';
  sys.browserAction.setBadgeText({ text:iconText });
}

function onStartUp() {
  shared.log('running onStartUp')
  sys.storage.sync.get({isEnabled: true}, () => {
    shared.setIconState(isEnabled);
  })
}

sys.storage.onChanged.addListener(onChangeIconState);
sys.runtime.onInstalled.addListener(onStartUp)