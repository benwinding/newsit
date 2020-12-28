export function debounce<T>(
  fn: (v: T) => void,
  delayMs: number
): (v: T) => void {
  let timeoutID = 0;
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

