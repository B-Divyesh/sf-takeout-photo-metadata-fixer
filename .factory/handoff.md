# Repair handoff — Takeout Tidy

Date: 2026-08-27
Work order: `takeout-photo-metadata-fixer-repair-1`
Commit: `b3b5fa3` (`fix: preserve Takeout GPS and harden static PWA`)
Deployment: Standard Azure Static Web App, <https://takeout-photo-metadata-fixer.sociobot.in/>

## Completed repair

- Fixed Google Takeout schema fallback: empty, zero-placeholder, or partial
  `geoDataExif` can no longer mask populated fields in `geoData`. Finite EXIF
  fields remain preferred on a per-field basis.
- Added unit coverage for empty and partial EXIF location objects, and an
  end-to-end ZIP import/export regression that parses the exported JPEG and
  PNG TIFF structures. It asserts the GPS IFD pointer and tags 0 through 6
  (version, latitude/ref, longitude/ref, altitude/ref).
- Reworked PWA update handling. A new worker remains waiting until the person
  selects the visible in-session **Reload now** toast action, then receives
  `SKIP_WAITING` and reloads under the new worker. This protects local repair
  work from an unexpected mid-session worker activation.
- Generated Standard Static Web App configuration at build time from the real
  Vite hashes. It sends CSP, `frame-ancestors 'none'`, `X-Frame-Options: DENY`,
  `Permissions-Policy`, `nosniff`, and same-origin isolation headers; serves
  `.webmanifest` as `application/manifest+json`; uses `no-store` for the
  worker/manifest; and gives only fingerprinted JS/CSS one-year immutable
  caching. The equivalent Nginx configuration was also updated.
- Repair remains local-only. ZIP/folder scanning, metadata insertion,
  deduplication, and export do not upload photo bytes. The separately invoked
  optional license verification remains the only documented external API path.

## Verification

Ran from a clean dependency install (`npm ci`):

```sh
npm test
npm run build
npm run test:e2e
```

- Unit tests: **12 passed** across metadata construction, filename/export
  behavior, and Takeout parsing/matching.
- Playwright: **10 passed** across desktop Chromium and a 390 px mobile
  viewport. This includes axe serious/critical checks, offline reload after
  worker installation, the waiting-worker update toast, and the exported
  JPEG/PNG GPS assertion.
- Build: TypeScript, Vite, generated service worker, and generated
  `staticwebapp.config.json` passed. The initial application JS is 46.89 KB
  raw (18.78 KB gzip) across its two entry chunks; CSS is 16.96 KB raw (4.83
  KB gzip), within the static-product budget.
- Static configuration smoke check confirmed CSP/clickjacking/Permissions
  headers, the manifest MIME declaration, and exactly three immutable Vite
  asset routes.
- Local mobile Lighthouse: **100 Performance, 100 Accessibility, 100 Best
  Practices, 100 SEO**; LCP 1.6 s and CLS 0.
- Live post-deploy checks confirmed 200 HTTPS, CSP, `X-Frame-Options: DENY`,
  Permissions-Policy, immutable hash-asset caching, `no-store` worker caching,
  and `application/manifest+json` on the manifest. A live 390 px browser ZIP
  repair with `geoDataExif: {}` displayed GPS, exported all seven GPS tags,
  reloaded offline under service-worker control, and had zero console errors.

## Run and deploy

```sh
npm ci
npm test
npm run build
npm run test:e2e
```

Deploy `dist/` as a Standard Static Web App. The generated
`dist/staticwebapp.config.json` must remain alongside `index.html`.

## Known gaps

- HEIC/HEIF and video containers are still copied unchanged and marked in the
  manifest; JPEG and PNG are the supported browser-safe metadata writers.
- ZIP processing is memory-bound for very large archives; Chromium folder
  export remains the low-memory path.
