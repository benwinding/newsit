import { MessageApi } from "./shared/messages";
import { ButtonResult, PlacementType } from "./shared/models";
import { store } from "./shared/store";
import { system } from "./shared/browser";
import { alist } from "./shared/allowlist";
import { CSSProperties } from "react";
import { parseRedditHtml } from "./content.reddit-dom-parse";

function getTitle() {
  if (document.title) {
    return document.title;
  }
  for (let hTag of ["h1", "h2", "h3", "title"]) {
    const dVal = document.querySelector(hTag);
    if (dVal) {
      return dVal.textContent;
    }
  }
  return "";
}

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
  GetRedditSubmitLink(): string {
    const title = encodeURI(getTitle());
    const link = encodeURI(document.location.href);
    return `https://reddit.com/submit?title=${title}&url=${link}`;
  }
  GetHnSubmitLink(): string {
    const title = encodeURI(getTitle());
    const link = encodeURI(document.location.href);
    return `https://news.ycombinator.com/submitlink?t=${title}&u=${link}`;
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
    store.OnStorageChanged("placement", cb);
  }
  ListenBtnSizeChanged(cb: (v: number) => void) {
    store.OnStorageChanged("btnsize", cb);
  }
  ListenZindexChanged(cb: (v: number) => void) {
    store.OnStorageChanged("btnzindex", cb);
  }
  ListenIsEnabledChanged(cb: (v: boolean) => void) {
    store.OnStorageChanged("isEnabled", cb);
  }
  ListenHideWhenNoResultsChanged(cb: (v: boolean) => void) {
    store.OnStorageChanged("hideWhenNoResults", cb);
  }
  ListenIsTabBlackListedChanged(cb: (isBlackListed: boolean) => void) {
    MessageApi.onEvent("tab_url_changed", async () => {
      const isBlacklisted = await this.GetIsCurrentUrlBlackListed();
      cb(isBlacklisted);
    });
    store.OnStorageChanged("blackListed", async (list: string[]) => {
      const isBlacklisted = await this.GetIsCurrentUrlBlackListed();
      cb(isBlacklisted);
    });
  }
  ListenResultsHn(cb: (hosts: ButtonResult) => Promise<void>) {
    return MessageApi.onEvent("result_from_hn", cb);
  }
  ListenResultsReddit(cb: (hosts: ButtonResult) => Promise<void>) {
    return MessageApi.onEvent("result_from_reddit", cb);
  }
  ListenTabUrlChanged(cb: () => Promise<void>) {
    return MessageApi.onEvent("tab_url_changed", cb);
  }
  ListenCheckPageTrigger(cb: () => Promise<void>) {
    return MessageApi.onEvent("check_active_tab", cb);
  }
  ListenRequestRedditDomParse() {
    return MessageApi.onEvent("request_reddit_dom_parse", async (htmlData: string) => {
      const useNewRedditLinks = (await store.GetStorage()).useNewRedditLinks;
      const result = parseRedditHtml(htmlData, useNewRedditLinks);
      return result;
    });
  }
}

export function createContentController() {
  return new ContentController();
}
