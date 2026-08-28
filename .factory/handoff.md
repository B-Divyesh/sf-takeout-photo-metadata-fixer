# Review handoff — Takeout Tidy

Date: 2026-08-28

Work order: `takeout-photo-metadata-fixer-review-1`

Reviewed candidate: `c4a54d9734a7096016422f7946ea98f0a9215d93`

Live URL: <https://takeout-photo-metadata-fixer.sociobot.in/>

## Outcome

Adversarial first-read verdict: **FAIL**.

The detailed report is in [review-1.md](review-1.md). No product code was
changed. The review found four blocking issues:

1. The phone and desktop first screen do not name the intended audience.
2. There is no one-click sample demo, demo banner/reset, isolated storage, or
   `.factory/demo.md`; `/demo` returns the real empty app and reads its IndexedDB
   namespace.
3. `.factory/claims.json` and `@claim:` tests are absent, leaving all landing
   and README claims unlisted.
4. Unknown paths and `/demo` are rewritten to the home page; there is no
   designed 404 or correct deep-route state.

Additional findings cover CSP-blocked styles and console errors on Privacy,
Terms, and Offline; missing route/social metadata and sitemap; inconsistent
route shells/focus; incomplete landing structure/pricing; a non-clickable
button-like drop zone; 40 px filter targets; long/jargon-heavy copy; and
inconsistent terminology.

## Verification performed

From the clean supplied checkout at the reviewed base:

```sh
npm ci
npm test
npm run build
npm run test:e2e
```

Results:

- `npm test`: 12/12 passed.
- `npm run build`: passed and produced `dist/`; application JavaScript was
  46.89 kB raw and 18.78 kB gzip in total.
- `npm run test:e2e`: 10/10 passed across desktop and mobile projects.
- Live cold reads were performed at 390 × 844 and 1440 × 900.
- Live link crawl found no dead rendered anchor, but `/sitemap.xml` incorrectly
  returns home HTML.
- Live axe checks found no serious/critical issues on Home, Privacy, or Terms.
- Live console capture found CSP inline-style errors on Privacy and Terms.
- A synthetic ZIP repair/export made no requests after load; initial requests
  were same-origin, and offline reload worked after service-worker control.
- A real preference written on `/` was readable from `/demo` in the same
  `takeout-tidy` IndexedDB database, confirming missing sandbox isolation.
- `rg '@claim|claim:' . tests src README.md` returned no matches, and the claim
  registry file is missing.

## Next steps

Address the blocking findings in report order. The minimum re-review candidate
needs a seeded `/demo` with isolated/resettable state, a complete claim registry
with one tagged sandbox test per atomic claim, first-screen copy that names the
audience and sample action, and real route/404 handling. Then resolve legal-page
CSP styling, route metadata/sitemap/shell/focus, and the copy-audit flags before
requesting another first-read review.
