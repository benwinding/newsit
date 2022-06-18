import { MessageApi } from "./shared/messages";
import { getCurrentTab, system } from "./shared/browser";

class PopupController {
  LaunchOptionsPage(): Promise<any> {
    return system.runtime.openOptionsPage();
  }
  async SendCheckApiEvent() {
    const tab = await getCurrentTab();
    return MessageApi.emitEventToTab("check_active_tab", tab.id);
  }
}

export function createPopupController() {
  return new PopupController();
}
