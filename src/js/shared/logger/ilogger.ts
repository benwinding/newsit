export type ILogFn = (...args: any[]) => void;

export interface ILogger {
  log: ILogFn;
  warn: ILogFn;
  error: ILogFn;
}
