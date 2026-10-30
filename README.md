# Newsit

Find the discussion around the page you're looking at. Newsit can find the top voted Reddit or Hacker News discussion!

- [Chrome Extension](https://chrome.google.com/webstore/detail/newsit-hacker-news-and-re/nngjdplpkehilhcinpccdbkjaknkkifl)
- [Firefox Extension](https://addons.mozilla.org/en-GB/firefox/addon/newsit-hnews-and-reddit-links/)

## Screenshots

![img](https://newsit.benwinding.com/images/screenshot2-ff.png)
![img](https://newsit.benwinding.com/images/screenshot1-ff.png)

## Lookup endpoints

| Source | Endpoint (GET) | Response | When checked |
| --- | --- | --- | --- |
| Hacker News | `https://hn.algolia.com/api/v1/search?query=<url>&restrictSearchableAttributes=url` | JSON | Automatic page loads when enabled, and **Check Current Page** |
| Reddit | `https://old.reddit.com/search?sort=top&q=url%3A<url>` | HTML | Automatic page loads when enabled, and **Check Current Page** |
| Lobsters | `https://lobste.rs/stories/url/all.json?url=<url>` | JSON | When **Enable lobste.rs** is checked: automatic page loads when enabled, and **Check Current Page** |

`<url>` is URL-encoded. Hacker News uses the normalized page URL; Reddit uses
the full page URL. Lobsters tries the tracking-free and original URLs with
fragments removed, skipping duplicate forms.

### Lobsters

Check **Enable lobste.rs** in settings to include Lobsters in automatic and
manual checks. This preference is off by default and syncs across browsers. Matching
discussions appear alongside Reddit and Hacker News, with the most-commented
thread first. The current-tab link setting applies to Lobsters too.

Lookups use Lobsters' public URL endpoint, with no login required. Successful
results (including no matches) are cached for five minutes in the background
context, and concurrent identical requests are combined. Requests are serialized
across tabs. Rate-limited requests pause further lookups according to `Retry-After`
(seconds or HTTP date) and Lobsters' `RateLimit-Reset` (Unix timestamp), using the
later deadline if both are provided. Missing or invalid deadlines fall back to
one minute. The button shows a countdown and enables **Retry** when the wait ends;
there is no automatic retry loop. Cooldowns persist locally across background
restarts; the result cache resets when the background context restarts.

## Development

This is a collection of weird js libraries:

- `react` 
- `bulma` 

All brought together (with slight minification) for your pleasure.

## Build

1. `yarn`
2. `yarn build`

## Release

1. `npm version patch`
2. `yarn build`
