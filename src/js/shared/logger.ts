import { system } from "../browser/browser";

class Logger {
  private loggerID = Math.random().toString(32).slice(2, 6);
  private color: string;

  constructor(private prefix: string, private enabled: boolean) {
    this.color = String2Color(prefix);
  }

  private getPrefix() {
    return [
      "%c%s",
      `color: ${this.color};`,
      `📰 newsit:: ${this.prefix} [${this.loggerID}] `,
    ];
  }

  public get log() {
    if (!this.enabled) {
      return (...args: any[]) => {};
    }
    const boundLogFn: (...args: any[]) => void = console.log.bind(
      console,
      ...this.getPrefix()
    );
    return boundLogFn;
  }

  public get warn() {
    if (!this.enabled) {
      return (...args: any[]) => {};
    }
    const boundLogFn: (...args: any[]) => void = console.warn.bind(
      console,
      ...this.getPrefix()
    );
    return boundLogFn;
  }

  public get error() {
    // if (!this.enabled) {
    //   return (...args: any[]) => {};
    // }
    const boundLogFn: (...args: any[]) => void = console.error.bind(
      console,
      ...this.getPrefix()
    );
    return boundLogFn;
  }

  setEnabled(logging: boolean) {
    this.enabled = logging;
  }
  Enable() {
    this.enabled = true;
  }
  Disable() {
    this.enabled = false;
  }
}

export function MakeLogger(prefix: string): Logger {
  const logger = new Logger(prefix, false);
  system.storage.sync.get('debug').then(val => {
    val.debug && logger.Enable();
  })
  return logger;
}

function String2Color(str: string) {
  const r = convertTo8Bit(GetHash(str));
  const g = convertTo8Bit(GetHash(str.slice(0, -1)));
  const b = convertTo8Bit(GetHash(str.slice(0, -2)));
  return `rgb(${r},${g},${b})`;
}

function convertTo8Bit(val: number) {
  val &= 0xff;
  return val;
}

function GetHash(str: string): number {
  let strSafe = typeof str == "string" ? str : "";
  let hash = 0,
    i,
    chr;
  for (i = 0; i < strSafe.length; i++) {
    chr = strSafe.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
}
