/** @jest-environment jsdom */
// Match webpack's CommonJS default-import interop in ts-jest.
jest.doMock("fromnow", () => ({ __esModule: true, default: jest.requireActual("fromnow") }));
const { createLobstersClient, lobstersUrlForms, translateLobsters, lobstersRetryAt }: typeof import("./lobsters") = jest.requireActual("./lobsters");

const page = "https://example.com/article";
const story = {
  short_id: "abc123",
  url: page,
  title: "An article",
  created_at: "2026-01-01T12:00:00Z",
  submitter_user: "alice",
  score: 5,
  comment_count: 2,
};

function response(data: any, status = 200, retryAfter: string = null): Response {
  return {
    ok: status === 200,
    status,
    headers: { get: (name: string) => name === "Retry-After" ? retryAfter : null },
    json: async () => data,
  } as unknown as Response;
}

afterEach(() => {
  jest.restoreAllMocks();
  jest.useRealTimers();
});

test("cleans tracking and fragments but preserves meaningful query parameters", () => {
  expect(lobstersUrlForms(page + "?id=42&utm_source=test#section")).toEqual([
    page + "?id=42", page + "?id=42&utm_source=test",
  ]);
  expect(lobstersUrlForms(page + "#section")).toEqual([page]);
});

test("maps and deduplicates stories, preferring the discussion with most comments", () => {
  const result = translateLobsters([
    story, story,
    { ...story, short_id: "def456", comment_count: 8, submitter_user: { username: "bob" }, comments_url: "https://lobste.rs/s/def456/article" },
  ]);
  expect(result.text).toBe("8");
  expect(result.link).toBe("https://lobste.rs/s/def456/article");
  expect(result.other_results).toHaveLength(2);
  expect(result.other_results[0].post_by).toBe("bob");
  expect(result.other_results[1]).toMatchObject({
    comments_link: "https://lobste.rs/s/abc123",
    post_url: page, post_title: "An article", post_upvotes: 5,
  });
});

test("keeps zero-comment stories and represents empty results separately", () => {
  expect(translateLobsters([{ ...story, comment_count: 0 }])).toMatchObject({ text: "0", link: "https://lobste.rs/s/abc123" });
  expect(translateLobsters([])).toEqual({ text: "-" });
});

test("uses encoded full URLs, omits credentials, and trusts server URL matching", async () => {
  const request = jest.fn().mockResolvedValue(response([{ ...story, url: page + "/" }]));
  const lookup = createLobstersClient(request);
  const result = await lookup(page + "?utm_source=test");
  expect(request).toHaveBeenCalledTimes(2);
  expect(request.mock.calls[0][0]).toBe("https://lobste.rs/stories/url/all.json?url=" + encodeURIComponent(page));
  expect(request.mock.calls[0][1]).toMatchObject({ credentials: "omit", referrerPolicy: "no-referrer" });
  expect(result.other_results).toHaveLength(1);
});

test("deduplicates concurrent checks and caches successful results for five minutes", async () => {
  const now = jest.spyOn(Date, "now").mockReturnValue(1000000);
  const request = jest.fn().mockResolvedValue(response([]));
  const lookup = createLobstersClient(request);
  await Promise.all([lookup(page), lookup(page)]);
  await lookup(page);
  expect(request).toHaveBeenCalledTimes(1);
  now.mockReturnValue(1300001);
  await lookup(page);
  expect(request).toHaveBeenCalledTimes(2);
});

test.each(["120", new Date(1120000).toUTCString()])("respects Retry-After %s across URLs", async (retry) => {
  const now = jest.spyOn(Date, "now").mockReturnValue(1000000);
  const request = jest.fn().mockResolvedValueOnce(response(null, 429, retry)).mockResolvedValue(response([]));
  const lookup = createLobstersClient(request);
  expect((await lookup(page)).status).toContain("rate-limited");
  now.mockReturnValue(1060001);
  expect((await lookup(page + "/other")).status).toContain("rate-limited");
  expect(request).toHaveBeenCalledTimes(1);
  now.mockReturnValue(1120001);
  expect(await lookup(page)).toEqual({ text: "-" });
  expect(request).toHaveBeenCalledTimes(2);
});

test("does not cache failed or malformed responses as no results", async () => {
  const request = jest.fn()
    .mockRejectedValueOnce(new Error("offline"))
    .mockResolvedValueOnce(response({}, 500))
    .mockResolvedValueOnce(response({}))
    .mockResolvedValueOnce(response([]));
  const lookup = createLobstersClient(request);
  for (let i = 0; i < 3; i++) expect((await lookup(page)).status).toContain("could not fetch");
  expect(await lookup(page)).toEqual({ text: "-" });
  expect(request).toHaveBeenCalledTimes(4);
});

test("aborts slow requests and reports timeout", async () => {
  jest.useFakeTimers();
  const request = jest.fn((_, options: RequestInit) => new Promise<Response>((resolve, reject) => {
    options.signal.addEventListener("abort", () => reject(new Error("aborted")));
  }));
  const result = createLobstersClient(request)(page);
  await Promise.resolve();
  jest.advanceTimersByTime(10000);
  expect((await result).status).toContain("timed out");
});

test("never fetches non-web URLs", async () => {
  const request = jest.fn();
  expect((await createLobstersClient(request)("file:///tmp/example")).status).toContain("unsupported");
  expect(request).not.toHaveBeenCalled();
});

test.each([
  [{ "Retry-After": "10" }, 1010000],
  [{ "RateLimit-Reset": "1120" }, 1120000],
  [{ "Retry-After": "10", "RateLimit-Reset": "1120" }, 1120000],
  [{ "Retry-After": "invalid", "RateLimit-Reset": "999" }, 1060000],
  [{}, 1060000],
])("parses cooldown headers %j", (values, expected) => {
  const headers = { get: (name: string) => (values as { [key: string]: string })[name] || null } as Headers;
  expect(lobstersRetryAt(headers, 1000000)).toBe(expected);
});

test("persists cooldowns across client restarts and blocks queued checks", async () => {
  jest.spyOn(Date, "now").mockReturnValue(1000000);
  let saved = 0;
  const storage = {
    load: async () => saved,
    save: async (deadline: number) => { saved = deadline; },
  };
  const limited = response(null, 429);
  limited.headers.get = (name) => name === "RateLimit-Reset" ? "1120" : null;
  const request = jest.fn().mockResolvedValue(limited);
  const lookup = createLobstersClient(request, storage);
  const results = await Promise.all([lookup(page), lookup(page + "/other")]);
  expect(results.map((result) => result.retryAt)).toEqual([1120000, 1120000]);
  expect(request).toHaveBeenCalledTimes(1);
  const restarted = createLobstersClient(request, storage);
  expect((await restarted(page)).retryAt).toBe(1120000);
  expect(request).toHaveBeenCalledTimes(1);
});
