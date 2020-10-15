import { core } from "./core";

const sys = core.getBrowser();
const logg = core.logger.MakeLogger("gui-global.js");

export const gui = {
  setIconColour: setIconColour,
  setIconText: setIconText,
  setIcon: setIcon,
};

function setIconColour(isColour, tabId) {
  const iconPath = isColour ? "img/icon.png" : "img/icon-grey.png";
  logg.log(`tab: ${tabId}, changing icon to: ${iconPath}`);
  let options = {};
  options.path = iconPath;
  if (tabId) options.tabId = tabId;
  sys.browserAction.setIcon(options);
}

function setIconText(isEnabled, tabId) {
  const iconText = isEnabled ? "ON" : "";
  logg.log(`tab: ${tabId}, changing icon text to: ${iconText}`);
  let options = {};
  options.text = iconText;
  if (tabId) options.tabId = tabId;
  sys.browserAction.setBadgeText(options);
}

function setIcon(state, tabId) {
  setIconColour(state, tabId);
  setIconText(state, tabId);
}
