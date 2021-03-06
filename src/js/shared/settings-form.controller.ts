import { alist } from "../browser/allowlist-manager";
import { getCurrentTab, system } from "../browser/browser";
import { MessageApi } from "../browser/messages";
import { PlacementType } from "../browser/models";
import { store } from "../browser/store.factory";
import { debounce } from "./utils";

class SettingsFormController {
  async IsCurrentUrlBlacklisted() {
    const tab = await getCurrentTab();
    return alist.IsUrlBlackListed(tab.url);
  }
  async GetVersion() {
    return system.management.getSelf().then((ext) => ext.version);
  }
  ListenBlackListChanged(cb: (v: string[]) => void) {
    store.OnStorageChanged("blackListed", cb);
  }
  ListenIsEnabledChanged(cb: (v: boolean) => void) {
    store.OnStorageChanged("isEnabled", cb);
  }
  ListenNoResultsChanged(cb: (v: boolean) => void) {
    store.OnStorageChanged('hideWhenNoResults', cb);
  }
  ListenConsoleDebugChanged(cb: (v: boolean) => void) {
    store.OnStorageChanged("debug", cb);
  }
  ListenBtnSizeChanged(cb: (v: number) => void) {
    store.OnStorageChanged("btnsize", cb);
  }
  ListenPlacementChanged(cb: (v: PlacementType) => void) {
    store.OnStorageChanged("placement", cb);
  }
  ListenZindexChanged(cb: (v: number) => void) {
    store.OnStorageChanged("btnzindex", cb);
  }
  SetHostsArr(newHostArr: string[]) {
    alist.BlackListSetNewArray(newHostArr);
  }
  async SetCurrentEnabled(enabled: boolean) {
    const blackListed = !enabled;
    const tab = await getCurrentTab();
    if (blackListed) {
      alist.BlackListAdd(tab.url);
    } else {
      alist.BlackListRemove(tab.url);
    }
  }
  SetBtnSize = debounce((val: number): void => {
    store.SetStorage({ btnsize: val });
  }, 300);
  SetPlacement = debounce((val: PlacementType): void => {
    store.SetStorage({ placement: val });
  }, 300);
  SetAllEnabled = debounce((val: boolean): void => {
    store.SetStorage({ isEnabled: val });
  }, 300);
  SetConsoleDebug = debounce((val: boolean): void => {
    store.SetStorage({ debug: val });
  }, 300);
  SetHideWhenNoResults = debounce((val: boolean): void => {
    store.SetStorage({ hideWhenNoResults: val });
  }, 300);
  SetZindex = debounce((val: number): void => {
    store.SetStorage({ btnzindex: val });
  }, 300);
  LaunchOptionsPage(): Promise<any> {
    return system.runtime.openOptionsPage();
  }
  async SendCheckApiEvent() {
    const tabId = (await getCurrentTab()).id;
    return MessageApi.emitEventToTab("tab_url_changed", tabId);
  }
  GetFormBtnsLocation() {
    return [
      {
        value: "br",
        text: "Bottom Right",
      },
      {
        value: "bl",
        text: "Bottom Left",
      },
      {
        value: "tr",
        text: "Top Right",
      },
      {
        value: "tl",
        text: "Top Left",
      },
    ];
  }
}

export function createSettingsFormController() {
  return new SettingsFormController();
}
