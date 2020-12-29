import { doUrlsMatch, stripUrl } from "./url-matcher";

describe("stripUrl checks", () => {
  test("check strip protocol", () => {
    expect(stripUrl("https://host.com")).toBe("host.com/");
  });
  test("check ignores trailing slashes", () => {
    expect(stripUrl("https://host.com/")).toBe("host.com/");
  });
  test("check ignores location fragments", () => {
    expect(stripUrl("https://host.com/#asdasdmmmmdass/asdasd")).toBe("host.com/");
  });
  test("check has query string still", () => {
    expect(stripUrl("https://host.com/?abc=123")).toBe("host.com/?abc=123");
    expect(stripUrl("https://host.com/?abc=123#kjascjascjjasc")).toBe("host.com/?abc=123");
  });
});

describe("doUrlsMatch checks", () => {
  test("check simple", () => {
    expect(doUrlsMatch("https://host.com", "https://host.com")).toBe(true);
  });
  test("check protocols dont matter", () => {
    expect(doUrlsMatch("http://host.com", "host.com")).toBe(true);
    expect(doUrlsMatch("https://host.com", "http://host.com")).toBe(true);
  });
});
