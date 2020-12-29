import { MakeLogger } from "../shared/logger";
import { getBrowserInstance } from "./browser";
import { RootState } from "./models";

const system = getBrowserInstance();

const logger = MakeLogger('store');

export class Store {
  public GetStorage<T extends Partial<RootState>>(
    defaultValues: T
  ): Promise<T> {
    return system.storage.sync.get(defaultValues) as Promise<T>;
  }

  public SetStorage<T extends Partial<RootState>>(newValues: T): Promise<void> {
    logger.log("SetStorage", newValues);
    return system.storage.sync.set(newValues);
  }

  public OnStorageChanged(
    storageKey: keyof RootState,
    cb: (newValue: any) => void,
    defaultValue?: any
  ) {
    type StorageChanges = { [key: string]: chrome.storage.StorageChange };
    function listenerCallback(changes: StorageChanges) {
      Object.entries(changes).map(([key, val]) => {
        if (key === storageKey) {
          const value = val.newValue;
          logger.log("store OnStorageChanged event", { storageKey, value });
          cb(value);
        }
      });
    }
    if (defaultValue !== undefined) {
      const v = {} as any;
      v[storageKey] = defaultValue;
      this.GetStorage(v).then((values) => {
        const value = values[storageKey];
        logger.log("store OnStorageChanged first", { storageKey, value });
        cb(value);
      });
    }
    system.storage.onChanged.addListener(listenerCallback);
  }
}

export const store = new Store();
