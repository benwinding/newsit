import { getBrowserInstance } from "./browser";
import { RootState } from "./models";

const system = getBrowserInstance();

export class Store {
  public GetStorage<T extends Partial<RootState>>(
    defaultValues: T
  ): Promise<T> {
    return system.storage.sync.get(defaultValues) as Promise<T>;
  }

  public SetStorage<T extends Partial<RootState>>(newValues: T): Promise<void> {
    console.log("SetStorage", newValues);
    return system.storage.sync.set(newValues);
  }

  public OnStorageChanged(
    storageKey: keyof RootState,
    cb: (newValue: any) => void
  ) {
    type StorageChanges = { [key: string]: chrome.storage.StorageChange };
    function listenerCallback(changes: StorageChanges) {
      Object.entries(changes).map(([key, val]) => {
        if (key === storageKey) {
          cb(val.newValue);
        }
      });
    }
    system.storage.onChanged.addListener(listenerCallback);
  }
}

export const store = new Store();
