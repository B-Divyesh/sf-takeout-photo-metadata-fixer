# Build handoff — Takeout Tidy

Date: 2026-08-27  
Work order: `takeout-photo-metadata-fixer-build-1`  
Artifact: static offline PWA (`dist/`)

## What was built

- A responsive paper-cut-diorama interface for selecting an extracted Google Photos Takeout folder, dragging a folder, or selecting one or more Takeout ZIPs.
- A local sidecar matcher that handles `.json`, `.supplemental-metadata.json`, JSON `title`, copied-file suffixes, same-folder preference, truncated filename stems, missing `geoDataExif`, and invalid JSON.
- Lossless metadata insertion for JPEG (EXIF APP1) and PNG (`eXIf`) with capture/modified dates plus GPS latitude, longitude, and altitude when supplied. Image pixels are never decoded or re-encoded.
- Honest copy-only handling for HEIC/HEIF, WebP, GIF, AVIF, and common video containers where safe browser-side container writing is unavailable.
- Optional byte-exact SHA-256 deduplication, capture-time renaming, flat/year/year-month organization, collision-safe output names, and inclusion/exclusion of unmatched originals.
- Incremental output-folder writes into a newly created timestamped subfolder, preventing source overwrites. ZIP export is available as a cross-browser fallback.
- An export manifest recording input, sidecar, output, digest, disposition, duplicates, and failures.
- IndexedDB persistence for user preferences and a small last-run summary, plus explicit JSON settings export/import. No photo bytes are persisted there.
- Offline PWA manifest, 192/512/maskable icons, deterministic build-time app-shell precache, runtime asset caching, offline fallback, update notice, and online/offline notices.
- Free use through 20,000 media files and a one-time large-library license path through the Sociobot buy/verify endpoints. URLs are build-configurable; no payment-provider SDK or hardcoded product ID is included.
- Static privacy and terms pages, a complete README, MIT license, robots/LLM discovery files, and original generated artwork with prompt provenance.

## Verification

Commands run successfully from `/work/repo`:

```sh
npm test
npm run build
npm run test:e2e
```

- Unit tests: 11 passed across sidecar parsing/matching, EXIF/PNG metadata construction, and output naming.
- Playwright: 8 passed across desktop Chromium and a 390px-class mobile viewport.
- End-to-end fixture: imports a Takeout ZIP, matches its supplemental sidecar, writes JPEG EXIF, applies chronological year/month naming, downloads a ZIP, and confirms its manifest.
- Offline test: installs the service worker, reloads under `context.setOffline(true)`, and confirms the full repair UI is available.
- Axe: zero serious or critical violations on both the initial screen and populated results screen, desktop and mobile.
- Console smoke test: no console errors on initial load.
- Production build: `dist/index.html` exists. Initial JavaScript is 46.14 KB raw / 18.50 KB gzip; CSS is 16.76 KB raw / 4.79 KB gzip. The 640 px hero is 24 KB and the 1024 px hero is 52 KB WebP.
- Lighthouse mobile: Performance 100, Accessibility 100, Best Practices 100, SEO 100; FCP 1.1 s, LCP 1.5 s, CLS 0, TBT 0 ms.
- Visual inspection completed at 1440×1000 and 390×844. Focus styles, stacking, safe spacing, alt text, semantic landmarks, one `h1`, and reduced-motion behavior are present.

## Build and deploy

```sh
npm install
npm run build
```

Deploy `dist/` as the static root. The build script fingerprints the service-worker cache deterministically from the generated asset list. Configure these factory values once billing registration is available:

- `VITE_SOCIOBOT_BUY_URL`
- `VITE_SOCIOBOT_LICENSE_VERIFY_URL`

## Known gaps and next steps

- HEIC/HEIF and video metadata are not rewritten; those files are copied unchanged and marked `copied-container-unchanged` in the manifest. A future vetted WASM container writer can add this without changing the UI contract.
- ZIP import/export uses browser memory. Very large libraries should use Chromium folder read/write, which processes one media file at a time. Web Crypto still needs one individual file in memory to calculate its SHA-256 hash.
- EXIF timestamps are derived from Google’s epoch timestamp in UTC. Existing EXIF blocks remain in the file after the new repaired block, preserving camera metadata; the repaired block is inserted first for readers to prefer.
- Browser tests exercise ZIP export because file-picker permission dialogs cannot be automated reliably. The folder writer uses the same repair function and creates a fresh timestamped destination folder.
- Billing URLs default to the Sociobot product route/API contract and should be replaced through build-time environment values when the factory registers the product.
