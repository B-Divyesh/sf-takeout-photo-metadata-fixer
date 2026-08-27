# Independent verification — PASS

Date: 2026-08-27  
Work order: `takeout-photo-metadata-fixer-verify-2`  
Candidate commit: `252dc2bdf50f01daf19b9ac999335e3cc535a3c7`  
Live URL: <https://takeout-photo-metadata-fixer.sociobot.in/>

## Verdict

**PASS.** The deployed app is the production build of the tested candidate and
the local repair workflow works end to end. No critical, high, or medium
severity release defect was found.

## Clean-checkout quality gates

Commands used:

```sh
npm ci
npx playwright install chromium
npm test
npm run build
npm run test:e2e
```

- `npm ci` installed 61 packages; `npm audit` found 0 vulnerabilities.
- `npm test`: 12/12 Vitest tests passed.
- `npm run build`: passed TypeScript `--noEmit`, Vite production build, and
  service-worker/static-host configuration generation; `dist/` was created.
- `npm run test:e2e`: 10/10 Playwright tests passed across desktop Chromium
  and the configured mobile project.
- The initial E2E invocation correctly reported a missing browser executable;
  standard Playwright Chromium installation was necessary in this fresh
  container. That browser runtime is not installed by `npm ci`.

Build output is 46.89 KB raw JavaScript (18.78 KB gzip) across entry chunks and
16.96 KB raw CSS (4.83 KB gzip), within the 200 KB/50 KB budgets.

## Independent live product checks

All following checks used a new Chromium profile against the live HTTPS URL,
not the repository test server.

- A mixed Takeout ZIP (matched JPEG, byte-identical album copy, unmatched JPEG,
  and dated MP4) produced an EXIF-repaired JPEG, skipped the exact duplicate,
  retained the unmatched original, copied the MP4 unchanged, and emitted a
  manifest. Its statuses were `metadata-written`, `skipped-duplicate`,
  `copied-unmatched`, and `copied-container-unchanged`.
- The shipped E2E test independently parsed exported JPEG and PNG TIFF data;
  it passed checks for capture dates and all seven expected GPS IFD tags,
  including empty/partial Takeout `geoDataExif` fallback.
- A malformed ZIP showed `invalid zip data`; choosing a valid ZIP immediately
  after it recovered to the Inspect screen.
- A 20,001-file ZIP displayed the one-time-license gate and disabled export;
  it made no license request.
- Desktop and 390 px mobile layouts were visually inspected. Mobile stacks
  source choices and has no horizontal overflow. Keyboard Tab reached the skip
  link with a visible 3 px focus outline.
- With reduced motion, button/source-choice transitions were `0.00001s` and
  scroll behavior was `auto`. Console and page-error listeners recorded zero
  errors throughout normal, recovery, PWA, and boundary exercises.
- The repository's Playwright axe assertions found zero serious/critical
  violations for empty and scanned states on desktop and mobile.

## PWA, privacy, deployment, and headers

- Live service worker control, offline reload, and the waiting-worker
  `A new version is ready. Reload now` update action all worked.
- Initial page-load request capture observed zero third-party origins. Source
  review confirms photo bytes stay local; optional license verification is the
  sole explicit external API and CSP limits it to `https://api.sociobot.in`.
- Live headers include HTTPS/HSTS, self-only CSP, `X-Frame-Options: DENY`,
  `nosniff`, restrictive Permissions-Policy, COOP/CORP, `no-store` worker and
  manifest caching, immutable fingerprinted JS/CSS caching, and manifest MIME.
- Live index, worker, assets, and public pages have byte-identical SHA-256
  hashes to the local candidate build. `staticwebapp.config.json` is consumed
  by deployment and deliberately not exposed as a public resource.
- Manifest has standalone display, matching colors, 192/512/maskable icons,
  and versioned start URL. Privacy and terms pages are live.

## Performance

Fresh mobile Lighthouse against the live URL (simulated throttling):

| Category | Score |
| --- | ---: |
| Performance | 99 |
| Accessibility | 100 |
| Best Practices | 100 |
| SEO | 100 |

FCP was 1.4 s, LCP 1.6 s, CLS 0, TBT 20 ms, total transfer 78 KiB, and no
console errors. Lighthouse required `--disable-dev-shm-usage` in this container
to avoid a Chromium shared-memory crash.

## Defects and known limits

| Severity | Finding | Disposition |
| --- | --- | --- |
| Critical / High / Medium | None found | — |
| Low | A brand-new machine needs `npx playwright install chromium` before `npm run test:e2e`. | Test-runtime prerequisite; suite passes after standard install. |
| Scope limit | HEIC/HEIF and video metadata containers are matched and copied unchanged. | Disclosed in UI, docs, manifest, brief, and terms; not a defect. |

## Reproduce

```sh
npm ci
npx playwright install chromium
npm test
npm run build
npm run test:e2e
```
