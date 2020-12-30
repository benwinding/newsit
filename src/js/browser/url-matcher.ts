const withHttp = (url: string) =>
  !/^https?:\/\//i.test(url) ? `http://${url}` : url;

export function stripUrl(urlString: string) {
  const urlWithProtocol = withHttp(urlString);
  const urlObj = new URL(urlWithProtocol);
  const hostStripped = stripHostPrefix(urlObj.host);
  const result = hostStripped + urlObj.pathname + urlObj.search;
  return result;
}

export function stripHostPrefix(hostName: string): string {
  for (let prefix of ["www.", "m."]) {
    if (hostName.startsWith(prefix)) {
      return hostName.replace(prefix, '');
    }
  }
  return hostName;
}

export function doUrlsMatch(url1: string, url2: string) {
  const stripped1 = stripUrl(url1);
  const stripped2 = stripUrl(url2);
  return stripped1 == stripped2;
}
