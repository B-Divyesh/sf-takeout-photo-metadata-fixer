# Independent verification — FAIL

Date: 2026-08-27
Verifier work order: `takeout-photo-metadata-fixer-verify-1`
Candidate: `e73ac0cde6e3e6ce8c314eb2772e604192ad60bf`
Live URL: <https://takeout-photo-metadata-fixer.sociobot.in/>

## Verdict

**FAIL.** The build and deployed site are otherwise functional, but a real
Google Takeout sidecar shape loses valid GPS metadata during repair. This is a
core stated job of the product, and the researched brief specifically calls
out schema variation as a source of failures.

## Blocking defect

### P1 — valid `geoData` GPS is silently omitted when `geoDataExif` is an empty object

`parseSidecar` in `src/takeout.ts` selects `geoDataExif` when
`hasCoordinates(geoDataExif)` is true. `hasCoordinates({})` returns true
because `Number(undefined)` is `NaN` and `NaN !== 0`. Therefore an empty
`geoDataExif: {}` masks populated `geoData` coordinates.

Reproduced against the live deployment through the actual ZIP import and ZIP
export UI with this sidecar (and a minimal JPEG):

```json
{
  "title": "IMG_0001.jpg",
  "photoTakenTime": { "timestamp": "1600000000" },
  "geoDataExif": {},
  "geoData": { "latitude": 51.5, "longitude": -0.12, "altitude": 16 }
}
```

The UI matched the sidecar and wrote the capture date, but did not show `GPS`
in the preview. The downloaded JPEG had no EXIF GPS IFD pointer (`0x8825`),
while a repaired JPEG with coordinates must have one. No warning tells the
user that valid location data was skipped. This violates the advertised
“restore dates and GPS” behavior.

## Other defects

### P2 — service-worker update applies silently; the promised update notice does not appear

I served the exact production `dist/`, installed its service worker, then
served the same worker with only its generated cache version changed and called
`registration.update()`. The new cache
`takeout-tidy-d7a2bbd24cab-update-test` became active, proving an update was
installed, but `#toast` stayed hidden with an empty message. The app promises
an “update available” notification and the PWA work order requires an in-app
update toast. `skipWaiting()` makes the worker transition through installation
too quickly for the current listener to surface it.

### P3 — deployment hardening and caching are incomplete

On 2026-08-27, `curl -I` for `/`, hashed JavaScript, `/sw.js`, and the policy
pages returned HSTS, `nosniff`, and `Referrer-Policy`, but no
`Content-Security-Policy`, no clickjacking protection (`frame-ancestors` or
`X-Frame-Options`), and no `Permissions-Policy`. Hashed immutable assets are
served with `Cache-Control: public, must-revalidate, max-age=30`, not durable
immutable caching. `/manifest.webmanifest` is served as
`application/octet-stream`. These are not the reason for the FAIL, but should
be resolved before a privacy-focused PWA release.

## What was verified

All commands below were run from a clean detached checkout of the candidate
after `npm ci`.

| Check | Result |
| --- | --- |
| `npm test` | PASS — 11 unit tests in 3 files |
| `npm run test:e2e` | PASS — 8 Playwright tests, desktop Chromium and 390 px mobile |
| `npm run build` | PASS — `tsc --noEmit`, Vite build, and service-worker generation; `dist/` produced |
| Available lint/type checks | No lint script exists; the build's TypeScript check passed |
| Production bundle | PASS — initial JS 46.14 KB raw / 18.50 KB gzip; CSS 16.76 KB raw / 4.79 KB gzip |
| Lighthouse, local production preview | PASS — Performance 100, Accessibility 100, Best Practices 100, SEO 100; FCP 1.2 s, LCP 1.6 s, CLS 0, TBT 0 ms |
| Live deployment identity | PASS — SHA-256 matched candidate `dist/` for index, worker, manifest, offline/privacy/terms pages, both JS chunks, CSS, and hero artwork |
| Accessibility and interaction, live | PASS — exactly one `h1`, `main`, title/lang, desktop and 390 px mobile; no horizontal overflow at 390 px; keyboard skip-link had a 3 px solid focus outline; reduced motion reduced transition duration to `0.00001s`; axe had zero serious/critical findings; no page or console errors |
| Privacy/outbound requests | PASS for normal use — initial live requests were same-origin only; source inspection found no analytics or third-party assets. The only external request is the documented Sociobot license-verification POST after a user submits a key. |
| Normal repair | PASS — ZIP import matched a supplemental sidecar, restored JPEG EXIF date, renamed/year-month organized it, and downloaded an audit manifest |
| Boundary, malformed, recovery | PASS except the blocking GPS case — invalid JSON is reported without stopping scan; a corrupt ZIP displays `invalid zip data`; selecting a valid ZIP immediately afterwards recovers to inspection; unmatched originals remain exportable |
| PWA offline reload | PASS — after service-worker control, reload under browser offline mode retained the full repair screen on local preview and live deployment |
| PWA update | FAIL — new worker/cache activates without the required update notice (P2 above) |

No library/CLI consumer test applies; this is a browser PWA. Folder-picker
permissions were reviewed in code and the functional repair path was exercised
through the cross-browser ZIP route; browser automation cannot safely accept a
native directory permission dialog.

## Recommended remediation and re-verification

1. Make coordinate validation require finite latitude and longitude before
   choosing `geoDataExif`; otherwise fall back to `geoData`. Add regression
   tests for empty/partial `geoDataExif` plus populated `geoData`, then assert
   the exported JPEG/PNG contains GPS metadata.
2. Implement a deterministic SW update signal that remains visible when the
   new worker activates (or do not call `skipWaiting` until the user accepts
   the update), and add an automated update test.
3. Add CSP/frame protection/Permissions-Policy, correct manifest MIME type,
   and immutable caching for fingerprinted assets at deployment.
4. Re-run this verification from the corrected commit and compare the deployed
   artifact hashes again.
