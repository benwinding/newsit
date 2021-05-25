import { ILogger } from "./../shared/ilogger";
import { DEFAULT_STATE, RootState } from "./models";
import { Browser } from "webextension-polyfill-ts";
import { IStore } from "./istore";

export class Store implements IStore {
  private logger: ILogger;

  constructor(private system: Browser) {}

  public _SetLogger(logger: ILogger) {
    this.logger = logger;
  }

  public GetStorage(): Promise<RootState> {
    return this.system.storage.sync.get(DEFAULT_STATE) as Promise<RootState>;
  }

  public SetStorage<T extends Partial<RootState>>(newValues: T): Promise<void> {
    this.logger?.log("SetStorage", newValues);
    return this.system.storage.sync.set(newValues);
  }

  public OnStorageChanged(
    storageKey: keyof RootState,
    cb: (newValue: any) => void
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
    const defaultValue = DEFAULT_STATE[storageKey];
    const v = {} as any;
    v[storageKey] = defaultValue;
    ctx.GetStorage().then((values) => {
      const value = values[storageKey];
      ctx.logger?.log("store OnStorageChanged first", {
        storageKey,
        value,
        valueDefault: defaultValue,
        allStoreValues: values,
      });
      cb(value);
    });
    this.system.storage.onChanged.addListener(listenerCallback);
  }
}
