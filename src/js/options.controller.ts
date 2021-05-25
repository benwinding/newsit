import { alist } from "./browser/allowlist-manager";
import { store } from "./browser/store.factory";

class OptionsController {
  RemoveHostFromList(hostToRemove: string) {
    return alist.BlackListRemove(hostToRemove);
  }
  ListenBlackListedChanged(cb: (hosts: string[]) => void) {
    store.OnStorageChanged("blackListed", cb, []);
  }
}

export function createOptionsController() {
  return new OptionsController();
}
