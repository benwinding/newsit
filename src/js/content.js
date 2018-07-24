require('../css/content.css');
const core = require('./shared/core.js');
const apis = require('./shared/apis.js');
const sys = core.getBrowser();

import * as hlpr from './shared/btn-helpers.js'

function runCheckApis(urlString) {
  hlpr.addContainer();
  hlpr.makeButtonWaiting('newsit_tdReddit');
  hlpr.makeButtonWaiting('newsit_tdHNews');
  hlpr.resizeIconHeights();
  apis.findHn(urlString)
    .then((res) => hlpr.makeButtonFound(hlpr.btnIdHNews, res.link, res.comments, 'Hacker News'))
    .catch((err) => {
      console.log(err)
      hlpr.makeButtonFailed(hlpr.btnIdHNews, 'Hacker News')
    });
  apis.findReddit(urlString)
    .then((res) => hlpr.makeButtonFound(hlpr.btnIdReddit, res.link, res.comments, 'Reddit'))
    .catch((err) => {
      console.log(err)
      hlpr.makeButtonFailed(hlpr.btnIdReddit, 'Reddit')
    });
  hlpr.resizeIconHeights();
}

function onChangedBtnSize(changes, namespace) {
  var btnSizeChange = changes['btnsize'];
  if (btnSizeChange == undefined)
    return
  const btnSizeNew = btnSizeChange.newValue;
  hlpr.setButtonSize(btnSizeNew);
}

function onChangedBtnPlacement(changes, namespace) {
  var placementChange = changes['placement'];
  if (placementChange == undefined)
    return
  const placementNew = placementChange.newValue;
  hlpr.setButtonPlacement(placementNew);
}

function onPageLoad() {
  sys.storage.sync.get({
    isEnabled: true,
  }, (items) => {
    if (items.isEnabled != true)
      return;
    let urlString = location.href;
    runCheckApis(urlString);
  });
}

function onMessageRecieved(request, sender, sendResponse) {
  // listen for messages sent from background.js
  if (request.action != 'check')
    return
  const urlString = request.url || location.href;
  console.debug('URL CHANGED: ' + urlString) // new url is now in content scripts!
  runCheckApis(urlString);
}

$(onPageLoad);
sys.storage.onChanged.addListener(onChangedBtnSize);
sys.storage.onChanged.addListener(onChangedBtnPlacement);
sys.runtime.onMessage.addListener(onMessageRecieved);

export default runCheckApis
