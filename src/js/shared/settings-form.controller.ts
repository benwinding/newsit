import { alist } from "../browser/allowlist-manager";
import { system } from "../browser/browser";
import { MessageApi } from "../browser/messages";
import { PlacementType } from "../browser/models";
import { store } from "../browser/store";

class SettingsFormController {
  IsCurrentUrlBlacklisted() {
    return alist.IsCurrentUrlBlacklisted();
  }
  async GetSettings() {
    return store.GetStorage({
      isEnabled: true,
      btnsize: 0.8,
      placement: "br",
      blackListed: [],
    });
  }
  async GetVersion() {
    return system.management.getSelf().then((ext) => ext.version);
  }
  SetBlackListed(val: boolean): void {
    alist.SetCurrentBlackListed(val);
  }
  SetBtnSize(val: number): void {
    store.SetStorage({ btnsize: val });
  }
  SetPlacement(val: PlacementType): void {
    store.SetStorage({ placement: val });
  }
  SetAllEnabled(val: boolean): void {
    store.SetStorage({ isEnabled: val });
  }
  LaunchOptionsPage(): Promise<any> {
    return system.runtime.openOptionsPage();
  }
  async SendCheckApiEvent() {
    const tabId = (await system.tabs.getCurrent()).id;
    return MessageApi.emitEventToTab("request_api", tabId);
  }
}

export function createSettingsFormController() {
  return new SettingsFormController();
}
