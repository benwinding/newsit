import { MessageApi } from "./browser/messages";
import { ButtonResult, PlacementType } from "./browser/models";
import { store } from "./browser/store";
import { system } from "./browser/browser";
import { alist } from "./browser/allowlist-manager";

class ContentController {
  async GetIsCurrentUrlBlackListed() {
    return alist.IsCurrentUrlBlacklisted()
  }
  SendCheckApiEvent() {
    return MessageApi.emitEvent("request_api");
  }
  async GetPlacement(): Promise<PlacementType> {
    return store.GetStorage({ placement: "br" }).then((s) => s.placement);
  }
  async GetBtnSize() {
    return store.GetStorage({ btnsize: 1 }).then((s) => s.btnsize);
  }
  async GetLogoUrls() {
    return {
      reddit: system.runtime.getURL("./img/reddit.png"),
      hn: system.runtime.getURL("./img/hn.png"),
    };
  }
  ListenPlacementChanged(cb: (v: PlacementType) => void) {
    store.OnStorageChanged("placement", cb);
  }
  ListenBtnSizeChanged(cb: (v: number) => void) {
    store.OnStorageChanged("btnsize", cb);
  }
  ListenBlackListedChanged(cb: (hosts: string[]) => void) {
    store.OnStorageChanged("blackListed", cb);
  }
  ListenResultsHn(cb: (hosts: ButtonResult) => void) {
    MessageApi.onEvent("result_from_hn", cb);
  }
  ListenResultsReddit(cb: (hosts: ButtonResult) => void) {
    MessageApi.onEvent("result_from_reddit", cb);
  }
  ListenTabChanged(cb: () => void) {
    MessageApi.onEvent("tab_url_changed", cb);
  }
}

export function createContentController() {
  return new ContentController();
}
