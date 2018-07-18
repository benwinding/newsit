const core = require('./shared/core.js');
const sys = core.getBrowser();

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

sys.storage.onChanged.addListener(onChangeIconState);
onStartUp();