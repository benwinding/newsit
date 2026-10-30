import { ButtonResult, OtherResult } from "../shared/models";
import fromNow from "fromnow";

interface LobstersStory {
  short_id: string;
  url: string;
  title: string;
  created_at: string;
  score?: number;
  comment_count?: number;
  submitter_user: string | { username: string };
  comments_url?: string;
  short_id_url?: string;
}

const TRACKING = /^(utm_[a-z]+|fbclid|gclid|dclid|msclkid|yclid|mc_cid|mc_eid|igshid|_hsenc|_hsmi|ref_src|ref_url)$/i;
const CACHE_MS = 5 * 60 * 1000;

export function lobstersUrlForms(input: string): string[] {
  const original = new URL(input);
  if (!/^https?:$/.test(original.protocol)) throw new Error("Unsupported URL");
  original.hash = "";
  const cleaned = new URL(original.href);
  const keys: string[] = [];
  cleaned.searchParams.forEach((_, key) => keys.push(key));
  keys.forEach((key) => {
    if (TRACKING.test(key)) cleaned.searchParams.delete(key);
  });
  return Array.from(new Set([cleaned.href, original.href]));
}

export function translateLobsters(stories: LobstersStory[]): ButtonResult {
  const unique = Array.from(new Map(stories.map((story) => [story.short_id, story])).values());
  const results: OtherResult[] = unique.map((story) => ({
    post_url: story.url,
    post_title: story.title,
    post_date: fromNow(story.created_at).split(",")[0] + " ago",
    post_upvotes: story.score ?? 0,
    post_by: typeof story.submitter_user === "string" ? story.submitter_user : story.submitter_user?.username,
    comments_count: story.comment_count ?? 0,
    comments_link: story.comments_url || story.short_id_url || `https://lobste.rs/s/${story.short_id}`,
  })).sort((a, b) => b.comments_count - a.comments_count);
  return results.length ? {
    text: String(results[0].comments_count),
    link: results[0].comments_link,
    other_results: results,
  } : { text: "-" };
}

export function lobstersRetryAt(headers: Headers, now = Date.now()): number {
  const retry = headers.get("Retry-After")?.trim();
  const retryAt = retry && /^\d+$/.test(retry) ? now + Number(retry) * 1000 : Date.parse(retry || "");
  // Lobsters sends RateLimit-Reset as a Unix timestamp in seconds.
  const reset = Number(headers.get("RateLimit-Reset")) * 1000;
  const deadlines = [retryAt, reset].filter((value) => Number.isFinite(value) && value > now);
  return deadlines.length ? Math.max(...deadlines) : now + 60000;
}

interface CooldownStorage {
  load(): Promise<number>;
  save(deadline: number): Promise<void>;
}

// Serialize checks across tabs so a 429 pauses queued lookups too.
export function createLobstersClient(request: typeof fetch = fetch, storage?: CooldownStorage) {
  const cache = new Map<string, { expires: number; result: ButtonResult }>();
  const pending = new Map<string, Promise<ButtonResult>>();
  let cooldownUntil = 0;
  let queue: Promise<any> = Promise.resolve();

  function cooldownResult(): ButtonResult {
    return { text: "!", status: "Lobsters: rate-limited.", retryAt: cooldownUntil };
  }

  async function lookup(forms: string[]): Promise<ButtonResult> {
    if (storage) cooldownUntil = Math.max(cooldownUntil, await storage.load());
    if (Date.now() < cooldownUntil) return cooldownResult();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    const stories: LobstersStory[] = [];
    try {
      for (const url of forms) {
        const response = await request(`https://lobste.rs/stories/url/all.json?url=${encodeURIComponent(url)}`, {
          signal: controller.signal,
          credentials: "omit",
          referrerPolicy: "no-referrer",
        });
        if (response.status === 429) {
          cooldownUntil = Math.max(cooldownUntil, lobstersRetryAt(response.headers));
          if (storage) await storage.save(cooldownUntil);
          return cooldownResult();
        }
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        if (!Array.isArray(data)) throw new Error("Unexpected response");
        stories.push(...data);
      }
      return translateLobsters(stories);
    } catch (error) {
      return { text: "!", status: controller.signal.aborted ? "Lobsters: request timed out." : "Lobsters: could not fetch discussions." };
    } finally {
      clearTimeout(timeout);
    }
  }

  return async (url: string): Promise<ButtonResult> => {
    let forms: string[];
    try { forms = lobstersUrlForms(url); } catch { return { text: "!", status: "Lobsters: unsupported page URL." }; }
    const key = JSON.stringify(forms);
    const saved = cache.get(key);
    if (saved && saved.expires > Date.now()) return saved.result;
    if (Date.now() < cooldownUntil) return cooldownResult();
    if (pending.has(key)) return pending.get(key);
    const work = queue.then(async () => {
      try {
        const result = await lookup(forms);
        if (!result.status) {
          if (cache.size >= 100) cache.delete(cache.keys().next().value);
          cache.set(key, { result, expires: Date.now() + CACHE_MS });
        }
        return result;
      } finally {
        pending.delete(key);
      }
    });
    queue = work.catch(() => undefined);
    pending.set(key, work);
    return work;
  };
}
