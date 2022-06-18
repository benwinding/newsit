import { alist } from "./shared/allowlist";
import { store } from "./shared/store";

class OptionsController {
  RemoveHostFromList(hostToRemove: string) {
    return alist.BlackListRemove(hostToRemove);
  }
  ListenBlackListedChanged(cb: (hosts: string[]) => void) {
    store.OnStorageChanged("blackListed", cb);
  }
}

export function createOptionsController() {
  return new OptionsController();
}
