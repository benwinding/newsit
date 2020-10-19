import { core, sys } from "./shared/core";
import { apis } from "./shared/apis";
import { store } from "./shared/store";
import { hlpr } from "./shared/gui-content";

{
  const logg = core.logger.MakeLogger("content.js");

  function beforeCheck() {
    hlpr.addContainer();
    hlpr.makeButtonWaiting("newsit_tdReddit");
    hlpr.makeButtonWaiting("newsit_tdHNews");
    hlpr.resizeIconHeights();
  }

  function afterCheck() {
    hlpr.resizeIconHeights();
  }

  function runCheckApis(urlString) {
    beforeCheck();
    apis
      .findHn(urlString)
      .then((res) =>
        hlpr.makeButtonFound(
          hlpr.btnIdHNews,
          res.link,
          res.comments,
          "Hacker News"
        )
      )
      .catch((err) => {
        logg.error(err);
        hlpr.makeButtonFailed(hlpr.btnIdHNews, "Hacker News");
      });
    apis
      .findReddit(urlString)
      .then((res) =>
        hlpr.makeButtonFound(hlpr.btnIdReddit, res.link, res.comments, "Reddit")
      )
      .catch((err) => {
        logg.error(err);
        hlpr.makeButtonFailed(hlpr.btnIdReddit, "Reddit");
      });
    afterCheck();
  }

  // GUI LISTENERS

  function onChangedBtnSize(changes, namespace) {
    var btnSizeChange = changes["btnsize"];
    if (btnSizeChange == undefined) return;
    const btnSizeNew = btnSizeChange.newValue;
    hlpr.setButtonSize(btnSizeNew);
  }

  function onChangedBtnPlacement(changes, namespace) {
    var placementChange = changes["placement"];
    if (placementChange == undefined) return;
    const placementNew = placementChange.newValue;
    hlpr.setButtonPlacement(placementNew);
  }

  // EVENT LISTENERS

  function onPageLoad() {
    let urlString = location.href;
    logg.log("onPageLoad: " + urlString);
    store
      .isEnabled()
      .then(() => store.isNotBlackListed(urlString))
      .then(() => {
        runCheckApis(urlString);
        core.sendMessageIconEnabled(true);
      })
      .catch((err) => {
        logg.error(err);
        core.sendMessageIconEnabled(false);
      });
  }

  function onTabNowActive(request) {
    if (request.action != "nowActive") return;
    let urlString = location.href;
    store
      .isEnabled()
      .then(() => store.isNotBlackListed(urlString))
      .then(() => {
        runCheckApis(urlString);
      })
      .catch((err) => {
        logg.error(err);
        hlpr.removeContainer();
      });
  }

  function onCheck(request) {
    if (request.action != "check") return;
    const urlString = request.url || location.href;
    runCheckApis(urlString);
  }

  sys.storage.onChanged.addListener(onChangedBtnSize);
  sys.storage.onChanged.addListener(onChangedBtnPlacement);

  sys.runtime.onMessage.addListener(onTabNowActive);
  sys.runtime.onMessage.addListener(onCheck);

  $(onPageLoad);
}
