# Perfection loop round 2 — cumulative finding closure

Date: 2026-08-28

Work order: `takeout-photo-metadata-fixer-polish-2`

Reviewed candidate: `23b3f90ce5ff53c92fff5571ce3d6abb9efe37ee`

Adversarial report commit: `8ac8ad924ab0e465db4eeacb66607ec45ba84a4e`

Deployed repair commit: `6e7886990a80df407ef9773f1cb6f8e16c1e0983`

Deployment ID: `7027c934-243a-4b77-9c7d-d1c2cf8b9361`

Live URL: <https://takeout-photo-metadata-fixer.sociobot.in/>

Every available `review-*.md` and `polish-*.md` was read before the repair. The tables below map every finding from reviews 1 and 2. Earlier fixes were retained and rechecked; review-2 regressions received new code and claim coverage.

## Evidence keys

- **Clean** — fresh clone `/tmp/takeout-polish2-clean.Unnr9O/repo`; `npm ci --ignore-scripts`, `npm test`, `npm run build`, every registered claim command separately, and `npm run test:e2e` passed.
- **Browser** — `npm run test:e2e`: 48/48 across desktop Chromium and Pixel 5 emulation.
- **Live claims** — deployed `@claim:jpeg-repair`, `@claim:png-repair`, and `@claim:large-library-unlock`: 3/3 passed.
- **Live routes** — deployed first-screen, axe, route metadata/focus/404, legal/offline console, and touch-target checks: 5/5 passed.
- **Home shot** — [mobile home](evidence/polish-2/live-home/screenshot-mobile.png) and [desktop home](evidence/polish-2/live-home/screenshot-desktop.png).
- **Demo shot** — [desktop demo](evidence/polish-2/live-demo/screenshot-desktop.png) and [mobile demo](evidence/polish-2/live-demo/screenshot-mobile.png).
- **Cold reports** — [home](evidence/polish-2/live-home/verify.json) and [demo](evidence/polish-2/live-demo/verify.json): no console errors, one `h1`, `lang=en`, main landmark, complete labels and alt text.

## Review 2 findings

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-2-1 | Made every location promise conditional on a location being present in the Google JSON file. Updated the first screen, support note, how-it-works step, Terms, README, metadata, manifest, `llms.txt`, and both claims. Added located and date-only JPEG/PNG fixtures; date-only output gets all date tags, no GPS directory, and no “location found” preview text. | `@claim:jpeg-repair`; `@claim:png-repair`; both passed in Clean and Live claims; Home shot; live `/terms/`. |
| F-2-2 | Added atomic `large-library-unlock` claim. Its real UI test imports 20,001 files, confirms export is blocked, intercepts only the Sociobot verification endpoint with `{valid:true}`, checks the request body and saved activation, then confirms export is enabled. | `@claim:large-library-unlock`; passed in Clean, Browser desktop/mobile, and Live claims; live `/`. |

## Review 1 primary findings

| Finding | Change retained or made | Evidence |
| --- | --- | --- |
| B1 | Kept the job-first headline, named people leaving Google Photos, one-click sample action, real-file action, next-step note, and three tested facts. Conditional location wording remains 20 words. | `390 px first screen names the job, audience, actions, and three facts without overflow`; Browser and Live routes; Home shot. |
| B2 | Kept `/demo` and `?demo=1` as populated memory-only sandboxes with banner, Reset demo, Start for real, realistic mixed media, and no reads or writes to real settings. | `@claim:demo-sandbox`; `@claim:google-json-match`; Demo shot; live `/demo`. |
| B3 | Registry now has 24 unique atomic claims. The contract test enforces exactly one tag per ID, and every registry command passed separately in Clean. | `factory contracts > maps every registered claim to exactly one browser-test tag`; Clean. |
| B4 | Kept real Demo, Privacy, Terms, and archive-bench 404 views with route metadata, history focus, announcements, and host 404 behavior. | `demo, legal, and not-found routes have distinct metadata and focus`; Live routes; live unknown URL returned 404. |
| M1 | Kept legal and offline styles self-hosted under the CSP. | `legal and offline pages load without console errors`; Live routes; live `/privacy/`, `/terms/`, `/offline.html`. |
| M2 | Kept route titles/descriptions/canonicals, Open Graph/Twitter image data, favicons, sitemap, and robots reference. | `publishes a real sitemap and social assets`; live `/sitemap.xml` returned `text/xml`. |
| M3 | Kept shared skip link, header/footer, factory/build text, focus transfer, and polite route announcement. | `demo, legal, and not-found routes have distinct metadata and focus`; Live routes. |
| M4 | Kept tool → three steps → privacy → price order, three first-screen facts, exact $12 price, and 20,000-file boundary. | `home page exposes the complete starting workflow`; `@claim:free-file-limit`; `@claim:one-time-price`; Home shot. |
| M5 | Kept a native drop button with pointer, Enter, and Space activation plus drag/drop. | `drop action opens the ZIP picker by pointer, Enter, and Space`; Browser. |
| m1 | Kept filters and demo controls at least 44 CSS pixels. | `file filters and chooser controls meet the touch target minimum`; Browser and Live routes. |

## Review 1 claim findings

| Finding | Change retained or made | Evidence |
| --- | --- | --- |
| U01 | Plain title plus tested local JPEG/PNG repair. | `@claim:local-processing`; `@claim:jpeg-repair`; `@claim:png-repair`. |
| U02 | Metadata promise remains split across repair, dedupe, naming, and local-processing claims. | Corresponding four claim commands in Clean. |
| U03 | Hero promise remains split; location is now explicitly conditional. | F-2-1 live claims; `@claim:exact-copy-dedupe`; `@claim:date-rename`; `@claim:local-processing`. |
| U04 | Concrete “Photos stay on this device” wording with request interception. | `@claim:local-processing`. |
| U05 | First-load offline statement retained and exercised through repair/export. | `@claim:offline-reload`. |
| U06 | Dated output and exact-copy removal remain concrete and tested. | `@claim:date-rename`; `@claim:exact-copy-dedupe`. |
| U07 | Undefined lowest-memory comparison remains removed. | `.factory/copy-audit.md`; Home shot. |
| U08 | Unverified browser fallback guarantee remains removed; multi-ZIP behavior is tested. | `@claim:zip-import`. |
| U09 | Subjective “Best” remains removed. | `.factory/copy-audit.md`. |
| U10 | “Every modern browser” remains removed. | `.factory/copy-audit.md`. |
| U11 | JPEG/PNG promise is conditional and both positive-location and date-only output are parsed. | `@claim:jpeg-repair`; `@claim:png-repair`; Live claims. |
| U12 | HEIC, HEIF, and MP4 remain copy-only with exact byte checks and statuses. | `@claim:copy-only-media`. |
| U13 | Pixel claim remains plain and payload-preservation is exact. | `@claim:pixel-preservation`. |
| U14 | Account and local-processing statements remain separate. | `@claim:no-account`; `@claim:local-processing`. |
| U15 | Offline behavior remains bounded to after first load. | `@claim:offline-reload`. |
| U16 | “0 bytes” badge remains removed; flow interception checks request origin and bodies. | `@claim:local-processing`. |
| U17 | Standard, shortened, and duplicate-album JSON forms remain seeded. | `@claim:google-json-match`. |
| U18 | Exact JPEG/PNG dates and conditional GPS directories are now asserted. | `@claim:jpeg-repair`; `@claim:png-repair`; Live claims. |
| U19 | Photo payload preservation remains exact. | `@claim:pixel-preservation`. |
| U20 | Skipping, naming, and logging remain atomic claims. | `@claim:exact-copy-dedupe`; `@claim:date-rename`; `@claim:export-log`. |
| U21 | Runtime image-provenance claim remains removed; source provenance stays in `design.md`. | Footer in Home shot; `.factory/design.md`. |
| U22 | Browser-local end-to-end repair remains request-intercepted. | `@claim:local-processing`. |
| U23 | Folder and multi-ZIP imports remain independently tested. | `@claim:folder-picker`; `@claim:zip-import`. |
| U24 | Every named matching form remains seeded and paired. | `@claim:google-json-match`. |
| U25 | JPEG test parses all three date tags and conditional GPS. | `@claim:jpeg-repair`; Live claims. |
| U26 | PNG test parses its `eXIf` date tags and conditional GPS. | `@claim:png-repair`; Live claims. |
| U27 | Exact-copy skipping and restored-date paths remain asserted. | `@claim:exact-copy-dedupe`; `@claim:date-rename`. |
| U28 | ZIP download and stubbed folder output remain observed. | `@claim:folder-export`; sample export claim test. |
| U29 | Export log remains one decision per input in both output paths. | `@claim:export-log`. |
| U30 | Offline PWA jargon remains replaced by the tested reload/export outcome. | `@claim:offline-reload`; `app shell reloads offline after installation`. |
| U31 | Full demo request capture still checks local photo, filename, and JSON handling. | `@claim:local-processing`. |
| U32 | Reliability judgment remains removed; copy-only status and byte equality remain tested. | `@claim:copy-only-media`. |
| U33a | Subjective Chromium ranking remains removed. | `.factory/copy-audit.md`; `@claim:folder-picker`. |
| U33b | Unverified Firefox/Safari promise remains removed. | `.factory/copy-audit.md`. |
| U34 | Node floor remains in `engines`. | `@claim:node-runtime`. |
| U35 | Build still asserts `dist/index.html`. | `@claim:build-output`; Clean build. |
| U36 | Every documented PWA/metadata/static-host artifact remains asserted. | `@claim:build-output`. |
| U37 | Generated host policy remains parsed for security, MIME, route, worker, manifest, and immutable cache rules. | `@claim:static-host-security`. |
| U38 | Container claims remain absent for this static artifact. | README deploy section; `@claim:build-output`. |
| U39 | Exact 20,000/20,001 boundary remains generated and tested. | `@claim:free-file-limit`. |
| U40 | Price/route tests now include the missing successful verification and gate removal outcome. | `@claim:one-time-price`; `@claim:billing-boundary`; `@claim:large-library-unlock`; Live claims. |
| U41 | Direct-provider claim remains removed; bundles remain scanned for provider SDK names. | `@claim:billing-boundary`. |
| U42 | Folder picker remains uncalled until the user action, then called once. | `@claim:folder-picker`. |
| U43 | Real storage allowlist and byte-for-byte demo isolation remain enumerated. | `@claim:storage-allowlist`; `@claim:settings-transfer`; `@claim:demo-sandbox`. |

## Review 1 landing-copy findings

| Finding | Change retained or made | Evidence |
| --- | --- | --- |
| L01 | “Takeout repair” remains the shared navigation term. | Copy audit; Home shot. |
| L02 | Job-first headline remains “Repair your Google Photos Takeout.” | First-screen test; Home shot. |
| L03 | Audience/result sentence remains under 22 words and now conditions locations on JSON contents. | F-2-1; copy audit. |
| L04 | Sample and real-file actions remain adjacent. | First-screen test. |
| L05 | Figure uses date and exact-copy language. | `@claim:date-rename`; `@claim:exact-copy-dedupe`. |
| L06 | Memory comparison remains removed. | Copy audit. |
| L07 | “Best” and browser ranking remain removed. | Copy audit. |
| L08 | Absolute browser claim remains removed. | Copy audit. |
| L09 | Support note now says dates plus any location in Google JSON files. | `@claim:jpeg-repair`; `@claim:png-repair`. |
| L10 | Copy-only wording remains direct. | `@claim:copy-only-media`. |
| L11 | Pixel wording remains plain. | `@claim:pixel-preservation`. |
| L12 | “Repair in three steps” remains the eyebrow. | Home shot. |
| L13 | “How Takeout repair works” remains the section heading. | Home shot. |
| L14 | Matching heading uses “Google JSON files.” | Copy audit. |
| L15 | Matching sentence names shortened and duplicate-album filenames. | `@claim:google-json-match`. |
| L16 | Pixel-preservation heading remains concrete. | Home shot. |
| L17 | Step copy now says any location in the photo's Google JSON file. | F-2-1; Live claims. |
| L18 | Export heading remains action-led. | Home shot. |
| L19 | Skip, rename, and log sentence remains backed by three claims. | `@claim:exact-copy-dedupe`; `@claim:date-rename`; `@claim:export-log`. |
| L20 | Footer remains “Repair Google Photos dates on your device.” | Home shot. |
| L21 | Hero art alt remains task-specific. | Cold reports. |
| L22 | Subjective privacy label remains absent. | Axe checks in Browser and Live routes. |
| L23 | Title remains plain and under 60 characters. | Cold reports; live `/`. |
| L24 | Description remains short, concrete, and now conditions locations. | Live metadata route check. |

## Review 1 README-copy findings

| Finding | Change retained or made | Evidence |
| --- | --- | --- |
| R01 | Audience/problem copy remains split and under 22 words. | Copy audit. |
| R02 | One-click live sample link remains present. | README; live `/demo`. |
| R03 | Specific repair heading remains. | README. |
| R04 | Folder and multi-ZIP wording remains plain. | `@claim:folder-picker`; `@claim:zip-import`. |
| R05 | Google JSON terminology remains consistent. | `@claim:google-json-match`; copy audit. |
| R06 | JPEG copy now explicitly says any location in the JSON file. | `@claim:jpeg-repair`; Live claims. |
| R07 | PNG copy now explicitly says any location in the JSON file. | `@claim:png-repair`; Live claims. |
| R08 | Payload wording remains plain and exact. | `@claim:pixel-preservation`. |
| R09 | Exact-copy and date naming remain plain. | Two corresponding claims. |
| R10 | Output implementation jargon remains absent. | `@claim:folder-export`; ZIP export test. |
| R11 | Export-log filename and per-media decision remain explicit. | `@claim:export-log`. |
| R12 | Offline PWA jargon remains replaced by observable behavior. | `@claim:offline-reload`. |
| R13 | Copy-only sentence remains short and removes reliability judgment. | `@claim:copy-only-media`. |
| R14 | Vague manifest wording remains absent. | README; `@claim:export-log`. |
| R15 | Subjective Chromium ranking remains absent. | Copy audit. |
| R16 | Untested Firefox/Safari claim remains absent. | Copy audit. |
| R17 | Build instruction remains direct. | Clean build. |
| R18 | Static deployment and app-route fallback remain plain. | `@claim:build-output`; live `/demo`. |
| R19 | Host description remains split and testable. | `@claim:static-host-security`. |
| R20 | Container instructions remain removed for static deployment. | README. |
| R21 | Container runtime/cache claims remain removed. | README. |
| R22 | Provider-code statement remains plain; successful Sociobot verification is now also observed. | `@claim:billing-boundary`; `@claim:large-library-unlock`. |
| R23 | Browser storage uses the agreed terms. | `@claim:storage-allowlist`. |
| R24 | “Project source documents” remains the heading. | README. |
| Terminology | Google JSON file, exact copy, repaired export, Takeout files, export log, and location remain consistent. | `.factory/copy-audit.md`; live screenshots. |

## Final verification

- Clean unit tests: 15/15.
- Clean build: passed; initial JavaScript 55.43 kB raw and CSS 20.13 kB raw.
- Every one of 24 claim commands: passed separately in the fresh clone.
- Clean browser suite: 48/48 across desktop and mobile.
- Integrated axe: zero serious/critical findings on Home, Demo, Privacy, Terms, and 404 in both browser projects.
- Local Lighthouse: 100 performance, 100 accessibility, 100 best practices, 100 SEO; LCP 1.7 s, TBT 30 ms, CLS 0.
- Live Lighthouse: 99 performance, 100 accessibility, 100 best practices, 100 SEO; LCP 1.4 s, TBT 120 ms, CLS 0, 90 KiB transfer.
- Live cold checks: Home and Demo have zero console errors; all required routes return 200; unknown route returns 404.

No finding of any severity remains unresolved.
