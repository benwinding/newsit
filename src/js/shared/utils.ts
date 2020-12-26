import { front } from "../browser/front";

export async function getIsBlackListed() {
  const thisUrl = await front.getCurrentTabUrl();
  const isBlackListed = await front.isBlackListed(thisUrl);
  return isBlackListed;
}

export async function checkIsBlackListed(url: string) {
  const isBlackListed = await front.isBlackListed(url);
  console.log('checkIsBlackListed', {url, isBlackListed});
  return isBlackListed;
}

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

