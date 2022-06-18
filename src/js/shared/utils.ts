import { ButtonResult } from "./models";

export function debounce<T>(
  fn: (v: T) => void,
  delayMs: number
): (v: T) => void {
  let timeoutID: any;
  return function () {
    clearTimeout(timeoutID);
    var args = arguments;
    var that = this;
    timeoutID = setTimeout(function () {
      fn.apply(that, args);
    }, delayMs);
  };
}

export const setTimeoutAsyc = (ms: number) =>
  new Promise((res) => setTimeout(res, ms));

export function len(res: ButtonResult) {
  if (!res || !res.text) {
    return 0;
  }
  return res.text.length;
}

export function randomUuid() {
  return Math.random().toString(32).slice(0, 8);
}
