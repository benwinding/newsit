const core = require('./shared/core.js');
const sys = core.getBrowser();

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
  core.log('running onStartUp')
  sys.storage.sync.get({isEnabled: true}, () => {
    core.setIconState(isEnabled);
  })
}

sys.storage.onChanged.addListener(onChangeIconState);
sys.runtime.onInstalled.addListener(onStartUp)