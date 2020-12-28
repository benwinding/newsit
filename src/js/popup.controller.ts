import { MessageApi } from "./browser/messages";
import { system } from "./browser/browser";

class PopupController {
  LaunchOptionsPage(): Promise<any> {
    return system.runtime.openOptionsPage();
  }
  async SendCheckApiEvent() {
    const tabId = await this.getCurrentTabId();
    return MessageApi.emitEventToTab("request_api", tabId);
  }
  private async getCurrentTabId() {
    return system.tabs
      .query({
        active: true,
        windowType: "normal",
        currentWindow: true,
      })
      .then((tabs) => {
        const thisTab = tabs[0];
        const thisId = thisTab.id;
        return thisId;
      });
  }
}

export function createPopupController() {
  return new PopupController();
}
