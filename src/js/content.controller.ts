import { MessageApi } from "./browser/messages";
import { ButtonResult, PlacementType } from "./browser/models";
import { store } from "./browser/store";
import { system } from "./browser/browser";
import { alist } from "./browser/allowlist-manager";
import { CSSProperties } from "react";

class ContentController {
  CalculatePlacementStyles(size: number, placement: PlacementType) {
    const s: Partial<CSSProperties> = {};
    s.transform = `scale(${size})`;
    switch (placement) {
      case "bl":
        s.bottom = 0;
        s.left = 0;
        s.transformOrigin = "bottom left";
        break;
      case "br":
        s.bottom = 0;
        s.right = 0;
        s.transformOrigin = "bottom right";
        break;
      case "tl":
        s.top = 0;
        s.left = 0;
        s.transformOrigin = "top left";
        break;
      case "tr":
        s.top = 0;
        s.right = 0;
        s.transformOrigin = "top right";
        break;
    }
    return s;
  }
  async GetIsCurrentUrlBlackListed() {
    const url = window.location.href;
    return alist.IsUrlBlackListed(url);
  }
  SendCheckApiEvent() {
    return MessageApi.emitEvent("request_api");
  }
  async GetLogoUrls() {
    return {
      reddit: system.runtime.getURL("./img/reddit.png"),
      hn: system.runtime.getURL("./img/hn.png"),
    };
  }
  ListenPlacementChanged(cb: (v: PlacementType) => void) {
    store.OnStorageChanged("placement", cb, 'br');
  }
  ListenBtnSizeChanged(cb: (v: number) => void) {
    store.OnStorageChanged("btnsize", cb, 0.8);
  }
  ListenZindexChanged(cb: (v: number) => void) {
    store.OnStorageChanged("btnzindex", cb, 999);
  }
  ListenIsEnabledChanged(cb: (v: boolean) => void) {
    store.OnStorageChanged("isEnabled", cb, true);
  }
  ListenIsTabBlackListedChanged(cb: (isBlackListed: boolean) => void) {
    MessageApi.onEvent("tab_url_changed", async () => {
      const isBlacklisted = await this.GetIsCurrentUrlBlackListed();
      cb(isBlacklisted);
    });
    store.OnStorageChanged("blackListed", async (list: string[]) => {
      const isBlacklisted = await this.GetIsCurrentUrlBlackListed();
      cb(isBlacklisted);
    }, []);
  }
  ListenResultsHn(cb: (hosts: ButtonResult) => void) {
    return MessageApi.onEvent("result_from_hn", cb);
  }
  ListenResultsReddit(cb: (hosts: ButtonResult) => void) {
    return MessageApi.onEvent("result_from_reddit", cb);
  }
  ListenTabUrlChanged(cb: () => void) {
    return MessageApi.onEvent("tab_url_changed", cb);
  }
  ListenCheckPageTrigger(cb: () => void) {
    return MessageApi.onEvent("check_active_tab", cb);
  }
}

export function createContentController() {
  return new ContentController();
}
