# Repair handoff — Takeout Tidy

Date: 2026-08-28

Work order: `takeout-photo-metadata-fixer-polish-1`

Reviewed base: `67d9c44a9cf811cccb2f857cf6db2b7fc6f019d5`

Repair commits: `45983c6`, `433402a`

Live URL: <https://takeout-photo-metadata-fixer.sociobot.in/>

## Outcome

All blocking and product-specific findings in `review-1.md` are resolved.

- The first screen now names people leaving Google Photos, explains the result in 18 words, and pairs the sample and real actions with the next-step note.
- `/demo` and `/?demo=1` open an already-scanned sample with JPEG, GPS PNG, exact album copy, unmatched JPEG, HEIC, and MP4 cases.
- Demo mode is memory-only. Its persistent banner provides **Reset demo** and **Start for real** without reading or changing real IndexedDB or localStorage.
- Fifteen atomic claims are registered in `.factory/claims.json`, each with exactly one `@claim:<id>` test.
- `/demo`, `/privacy/`, and `/terms/` are real focused routes with distinct titles, descriptions, canonicals, and social metadata.
- Unknown URLs receive HTTP 404 from the static host and render the designed archive-label 404 with a return link.
- Legal and offline styling is self-hosted and CSP-safe. Every route uses the product header, footer, build id, skip link, and paper archive visual grammar.
- The product publishes a real XML sitemap, sitemap-aware robots file, 1200 × 630 social preview, and 180 px Apple touch icon.
- The drop target has real pointer/button activation. Result filters are at least 44 px high.
- The landing order is repair tool → three steps → privacy → exact $12 one-time large-library price.
- `.factory/copy-audit.md`, `.factory/demo.md`, and the verb-first 88-character catalog description are present.

## Clean-clone verification

Final verification used a fresh clone of commit `433402a` at `/tmp/tmp.Yh9Rbd7j6B/repo` with `npm ci --ignore-scripts`.

Every registry command was run separately and passed:

```text
@claim:demo-sandbox          PASS
@claim:local-processing      PASS
@claim:jpeg-repair           PASS
@claim:png-repair            PASS
@claim:exact-copy-dedupe     PASS
@claim:date-rename           PASS
@claim:copy-only-media       PASS
@claim:pixel-preservation    PASS
@claim:export-log            PASS
@claim:google-json-match     PASS
@claim:offline-reload        PASS
@claim:free-file-limit       PASS
@claim:one-time-price        PASS
@claim:folder-picker         PASS
@claim:zip-import            PASS
```

Full clean-clone gates:

- `npm test`: 15/15 passed across four files.
- `npm run build`: passed; `dist/index.html`, service worker, manifest, offline page, sitemap, icons, and `staticwebapp.config.json` exist.
- `npm run test:e2e`: 34/34 passed across desktop Chromium and Pixel 5 emulation.
- Integrated axe checks: zero serious or critical findings on home, demo, privacy, terms, and 404 in both projects.
- Offline claim: service-worker-controlled `/demo` reloaded and exported while the browser context was offline.
- Privacy claim: the complete demo export made only same-origin requests with no request body; seeded real IndexedDB and localStorage snapshots stayed byte-for-byte unchanged.
- File boundary claim: export remained enabled for 20,000 media files and was gated for 20,001.
- Initial production assets: 54.0 kB raw JavaScript total (20.83 kB gzip) and 20.03 kB raw CSS (5.44 kB gzip).

Additional verification:

- Factory `verify-url.sh` against local `/demo`: title present, `lang=en`, one `h1`, main landmark, all images labelled, no unlabeled buttons, zero console errors.
- Local Lighthouse mobile: Performance 100, Accessibility 100, Best Practices 100, SEO 100; FCP 1.1 s, LCP 1.7 s, CLS 0, TBT 0 ms, 89 KiB transfer.
- Azure Static Web Apps emulator: `/`, `/demo`, `/privacy/`, `/terms/`, `/sitemap.xml`, and `/offline.html` returned 200; `/not-a-route` returned 404 and rendered the correct client title and heading.

## Deployment and live evidence

`/opt/fleet/lib/deploy-static.sh takeout-photo-metadata-fixer dist` deployed the production `dist/` successfully to Azure Static Web Apps deployment `900b9d69-71ef-4fb4-bf98-4b1111ade898`. The custom domain reported `Ready` and HTTPS returned 200.

- Live `verify-url.sh` on `/demo`: 801 ms network-idle load, no console errors, `lang=en`, one `h1`, main landmark, no missing alt text, and no unlabeled buttons.
- Live routes: home/demo/privacy/terms/offline/sitemap returned 200; `/definitely-not-a-route` returned 404.
- Live demo: repaired ZIP download passed, offline reload passed, and no external requests or console errors occurred during the demo/export/offline flow.
- Live Lighthouse mobile: Performance 100, Accessibility 100, Best Practices 100, SEO 100; FCP 1.1 s, LCP 1.4 s, CLS 0, TBT 0 ms, 89 KiB transfer.

## Run locally

```sh
npm ci
npm test
npm run build
npm run test:claims
npm run test:e2e
```

## Known limits

No blocking finding remains. HEIC, HEIF, and video containers remain copy-only by the v1 product contract. Folder read/write uses browser directory APIs; ZIP import/export remains the portable path.
