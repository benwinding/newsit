import {
  CheckBlacklist,
  CheckHostAllowedOnFirefox,
  CheckProtocolAllowed,
  GetUrlSafe,
} from "./url-validator";

describe("check urls", () => {
  test("check GetUrlSafe works safely", () => {
    expect(() => GetUrlSafe("asdasdasd/ssss")).not.toThrowError();
  });
  test("check GetUrlSafe doesnt need protocol", () => {
    expect(GetUrlSafe("example.com").host).toBe('example.com');
  });
  test("check CheckProtocolAllowed", () => {
    expect(() =>
      CheckProtocolAllowed("https://example.com")
    ).not.toThrowError();
    expect(() => CheckProtocolAllowed("http://example.com")).not.toThrowError();
    expect(() => CheckProtocolAllowed("ftp://example.com")).not.toThrowError();
    expect(() => CheckProtocolAllowed("file://example.com")).toThrowError();
    expect(() => CheckProtocolAllowed("about:settings")).toThrowError();
  });
  test("check CheckHostAllowedOnFirefox", () => {
    expect(() =>
      CheckHostAllowedOnFirefox("https://accounts.firefox.com")
    ).toThrowError();
    expect(() =>
      CheckHostAllowedOnFirefox("http://example.com")
    ).not.toThrowError();
  });
  test("check CheckBlacklist", () => {
    const blackList = ["aaa.com", "eee.as"];
    expect(() => CheckBlacklist("https://aaa.com", blackList)).toThrowError();
    expect(() => CheckBlacklist("https://aaa.au", blackList)).not.toThrowError();
  });
});
