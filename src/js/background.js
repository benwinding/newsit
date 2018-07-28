var sys = core.getBrowser();

// ACTIONS

function sendCheckCommand(tabId, url) {
  const request = { 
    action: 'check',
    url: url
  }
  sys.tabs.sendMessage(tabId, request)
}

function sendTabNowActiveCommand(tabId) {
  const request = { 
    action: 'nowActive'
  }
  sys.tabs.sendMessage(tabId, request)
}

function setIcon(state, tabId) {
  gui.setIconColour(state, tabId);
  gui.setIconText(state, tabId);
}

// LISTENERS

function onChangeEnabled(changes) {
  if (changes['isEnabled'] == null)
    return
  const isEnabled = changes['isEnabled'].newValue
  logger.logBackground(`tab: ALL, onChangeEnabled: ${isEnabled}`);
  setIcon(isEnabled);
}

function onIconEnabled(request, sender, sendResponse) {
  if (request.iconIsEnabled == null)
    return
  const isEnabled = request.iconIsEnabled
  let tabId;
  if (request.tabId)
    tabId = request.tabId;
  else
    tabId = sender.tab.id;
  logger.logBackground(`tab: ${tabId}, onIconEnabled: ${isEnabled}`);
  setIcon(isEnabled, tabId);
}

function onStartUp() {
  core.getStorage({isEnabled: true})
    .then((list) => {
      setIcon(list['isEnabled']);
    })
    .catch((err) => logger.errBackground(err));
}

function onTabChangeUrl(tabId, changeInfo, tab) {
  if (!changeInfo.url)
    return 
  logger.logBackground(`tab: ${tabId}, url changed to: ${changeInfo.url}`)
  store.isEnabled()
    .then(() => {
      sendCheckCommand(tabId, changeInfo.url);
    })
    .catch((err) => logger.errBackground(err));
}

function onTabChangeActive(activeInfo) {
  const tabId = activeInfo.tabId
  logger.logBackground(`tab: ${tabId}, is the new ActiveTab`)
  store.isEnabled()
    .then(() => store.getTabUrl(tabId))
    .then((tabUrl) => store.isNotBlackListed(tabUrl))
    .then(() => sendTabNowActiveCommand(tabId))
    .then(() => {
      setIcon(true, tabId);
    })
    .catch((err) => {
      setIcon(false, tabId);
      logger.errBackground(err)
    });
}

sys.tabs.onUpdated.addListener(onTabChangeUrl);
sys.tabs.onActivated.addListener(onTabChangeActive);
sys.storage.onChanged.addListener(onChangeEnabled);
sys.runtime.onMessage.addListener(onIconEnabled);

onStartUp();