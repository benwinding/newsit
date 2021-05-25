import { MakeLogger } from "../shared/logger.factory";
import { getBrowserInstance } from "./browser";
import { Store } from "./store";

export const store = new Store(getBrowserInstance());
export const logger = MakeLogger("store", store);
store._SetLogger(logger);
