export function GetUrlSafe(urlString: string): URL {
  const empty = {} as any;
  if (typeof urlString !== "string") {
    return empty;
  }
  const urlProtocol = urlString.includes(":")
    ? urlString
    : `https://${urlString}`;
  try {
    return new URL(urlProtocol);
  } catch (error) {
    return empty;
  }
}

export function CheckProtocolAllowed(urlString: string): void {
  const protocol = GetUrlSafe(urlString).protocol;
  const allowList = ["chrome:", "http:", "https:", "ftp:"];
  if (!allowList.includes(protocol)) {
    throw new Error("found invalid protocol, blocking");
  }
}

export function CheckHostAllowedOnFirefox(urlString: string): void {
  let hostStr = GetUrlSafe(urlString).host;
  const blockList = [
    "accounts-static.cdn.mozilla.net",
    "accounts.firefox.com",
    "addons.cdn.mozilla.net",
    "addons.mozilla.org",
    "api.accounts.firefox.com",
    "content.cdn.mozilla.net",
    "content.cdn.mozilla.net",
    "discovery.addons.mozilla.org",
    "input.mozilla.org",
    "install.mozilla.org",
    "oauth.accounts.firefox.com",
    "profile.accounts.firefox.com",
    "support.mozilla.org",
    "sync.services.mozilla.com",
    "testpilot.firefox.com",
  ];
  if (blockList.includes(hostStr)) {
    throw new Error(`found invalid host "${hostStr}", blocking`);
  }
}

export function CheckBlacklist(urlString: string, blackList: string[]): void {
  const isBlackListed = blackList.some(h => DoUrlDomainsMatch(urlString, h));
  if (isBlackListed) {
    throw new Error(`found blacklist host "${urlString}", blocking`);
  }
}

export function DoUrlDomainsMatch(url1: string, url2: string) {
  const stripped1 = GetUrlSafe(url1).host;
  const stripped2 = GetUrlSafe(url2).host;
  return stripped1 == stripped2;
}
