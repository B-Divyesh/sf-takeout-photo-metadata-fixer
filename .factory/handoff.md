# Repair handoff — Takeout Tidy

Date: 2026-08-28

Work order: `takeout-photo-metadata-fixer-polish-1-all-findings`

Reviewed candidate: `6e06b1f4ef1ef2e3602678055749b27e8149034f`

Deployed code: `02c387fa265e0e102b311ba1b91e60192982f16a`

Live URL: <https://takeout-photo-metadata-fixer.sociobot.in/>

## Outcome

All blocking, major, minor, unlisted-claim, copy, terminology, routing, accessibility, mobile, privacy, offline, and product-specific findings in `.factory/review-1.md` are fixed. The complete finding-by-finding ledger is in `.factory/polish-1.md`.

The product remains a static offline PWA with its paper archive-bench identity. The live first screen names the job and audience, offers the isolated sample in one click, explains the real action, and shows tested privacy, offline, and price facts. Demo mode is memory-only and restores real saved settings only after exit.

## Verification

Fresh clone `/tmp/tmp.Qjgxj0Bn7r/repo` at `02c387fa265e0e102b311ba1b91e60192982f16a`:

- `npm ci --ignore-scripts`: passed; zero audit vulnerabilities.
- `npm test`: 15/15 passed.
- `npm run build`: passed and produced `dist/index.html` plus the complete PWA/static-host output.
- Every one of the 23 commands in `.factory/claims.json`: passed separately.
- `npm run test:e2e`: 42/42 passed across desktop Chromium and Pixel 5 emulation.
- Axe integration: zero serious or critical findings on Home, Demo, Privacy, Terms, and 404 in both projects.
- Initial bundles: 55.34 kB raw JavaScript (about 21.44 kB gzip) and 20.13 kB raw CSS (5.46 kB gzip).
- Local Lighthouse mobile: Performance 100, Accessibility 100, Best Practices 100, SEO 100; FCP 1.1 s, LCP 1.3 s, CLS 0, TBT 80 ms.

Live verification after deployment:

- Deployment `a5c6c12d-0dac-4777-8681-cdd2ed5f2086` succeeded; custom domain is `Ready` and HTTPS returns 200.
- Final `verify-url.sh` on `/demo`: 1,125 ms network-idle load, correct title/lang, one `h1`, main landmark, complete image/button labels, and no console errors.
- `/`, `/demo`, `/privacy/`, `/terms/`, `/offline.html`, `/sitemap.xml`, and `/robots.txt` return 200; unknown URLs return HTTP 404 with the designed page.
- Cold `?demo=1` reset and 5,518-byte ZIP export passed. Reload and a second 5,518-byte export passed offline.
- The full demo flow sent no request body and made no cross-origin request.
- Demo/Privacy/Terms titles and focused `h1` states passed; 390 px width had no horizontal overflow.
- Live axe found zero violations on all public routes. A final Home/404 rerun found zero serious/critical findings.
- Live Lighthouse mobile: Performance 100, Accessibility 100, Best Practices 100, SEO 100; FCP 1.1 s, LCP 1.1 s, CLS 0, TBT 60 ms, 31 KiB transfer.

Evidence is under `.factory/evidence/polish-1/`, especially `live-final/verify.json`, `live-final/cold-check.json`, the live screenshots, `live/axe.json`, and `live/lighthouse.json`.

## Run and verify

```sh
npm ci
npm test
npm run build
npm run test:claims
npm run test:e2e
```

Deploy with:

```sh
/opt/fleet/lib/deploy-static.sh takeout-photo-metadata-fixer dist
```

## Known limits and next steps

No acceptance finding remains. HEIC, HEIF, and video containers intentionally remain copy-only in v1. Direct folder access depends on browser directory APIs; ZIP import/export is always available in the interface. No further repair or deployment step is required for this work order.
