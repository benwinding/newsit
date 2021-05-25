import { IStore } from "../browser/istore";
import { ILogger } from "./ilogger";
import { Logger } from "./logger";

export function MakeLogger(prefix: string, store: IStore): ILogger {
  const logger = new Logger(prefix, false);
  store.OnStorageChanged("debug", (isDebug) => {
    isDebug ? logger.Enable() : logger.Disable();
  });
  return logger;
}
