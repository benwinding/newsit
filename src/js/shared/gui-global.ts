import { system, logger } from "./core";

export const gui = {
  setIconColour: setIconColour,
  setIconText: setIconText,
  setIcon: setIcon,
};

const logg = logger.MakeLogger("gui-global.js");

function setIconColour(isColour: any, tabId: any) {
  const iconPath = isColour ? "img/icon.png" : "img/icon-grey.png";
  logg.log(`tab: ${tabId}, changing icon to: ${iconPath}`);
  let options = {};
  options.path = iconPath;
  if (tabId) options.tabId = tabId;
  sys.browserAction.setIcon(options);
}

function setIconText(isEnabled: any, tabId: any) {
  const iconText = isEnabled ? "ON" : "";
  logg.log(`tab: ${tabId}, changing icon text to: ${iconText}`);
  system.browserAction.setBadgeText({
    tabId: tabId,
    text: iconText
  });
}

function setIcon(state: any, tabId: any) {
  setIconColour(state, tabId);
  setIconText(state, tabId);
}
