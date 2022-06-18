import { MakeLogger } from "../logger";
import { system } from "../browser";
import { IStore } from "./istore";
import { Store } from "./store";

const _store = new Store(system);
export const store: IStore = _store;
export const logger = MakeLogger("store", _store);
_store._SetLogger(logger);
