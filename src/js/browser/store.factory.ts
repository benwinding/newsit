import { MakeLogger } from "../shared/logger.factory";
import { getBrowserInstance } from "./browser";
import { IStore } from "./istore";
import { Store } from "./store";

const _store = new Store(getBrowserInstance());
export const store: IStore = _store;
export const logger = MakeLogger("store", _store);
_store._SetLogger(logger);
