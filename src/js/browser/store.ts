import { ILogger } from "./../shared/ilogger";
import { RootState } from "./models";
import { Browser } from "webextension-polyfill-ts";
import { IStore } from "./istore";

export class Store implements IStore {
  logger: ILogger

  constructor(private system: Browser) {}

  public _SetLogger(logger: ILogger) {
    this.logger = logger;
  }

  public GetStorage<T extends Partial<RootState>>(
    defaultValues: T
  ): Promise<T> {
    return this.system.storage.sync.get(defaultValues) as Promise<T>;
  }

  public SetStorage<T extends Partial<RootState>>(newValues: T): Promise<void> {
    this.logger?.log("SetStorage", newValues);
    return this.system.storage.sync.set(newValues);
  }

  public OnStorageChanged(
    storageKey: keyof RootState,
    cb: (newValue: any) => void,
    defaultValue?: any
  ) {
    type StorageChanges = { [key: string]: chrome.storage.StorageChange };
    const ctx = this;
    function listenerCallback(changes: StorageChanges) {
      Object.entries(changes).map(([key, val]) => {
        if (key === storageKey) {
          const value = val.newValue;
          ctx.logger?.log("store OnStorageChanged event", {
            storageKey,
            value,
          });
          cb(value);
        }
      });
    }
    if (defaultValue !== undefined) {
      const v = {} as any;
      v[storageKey] = defaultValue;
      ctx.GetStorage(v).then((values) => {
        const value = values[storageKey];
        ctx.logger?.log("store OnStorageChanged first", { storageKey, value, allStoreValues: values });
        cb(value);
      });
    }
    this.system.storage.onChanged.addListener(listenerCallback);
  }
}
