# Perfection loop round 1 — finding closure

Date: 2026-08-28

Work order: `takeout-photo-metadata-fixer-polish-1-all-findings`

Reviewed release candidate: `6e06b1f4ef1ef2e3602678055749b27e8149034f`

Adversarial report: `67d9c44a9cf811cccb2f857cf6db2b7fc6f019d5`

Deployed code commit: `02c387fa265e0e102b311ba1b91e60192982f16a`

Live URL: <https://takeout-photo-metadata-fixer.sociobot.in/>

Every `.factory/review-*.md` and `.factory/polish-*.md` present before this file was read. The only review was `review-1.md`; there was no earlier polish report.

## Primary findings

| Finding | Change made | Evidence |
| --- | --- | --- |
| B1 | Replaced the metaphorical first screen with “Repair your Google Photos Takeout,” named people leaving Google Photos, added the sample and real actions, explained the next step, and separated privacy, offline, and price facts. | `390 px first screen names the job, audience, actions, and three facts without overflow`; [live mobile home](evidence/polish-1/live-final/home-mobile.png); live `/`. |
| B2 | Added populated `/demo` and `?demo=1` entry points, realistic JPEG/PNG/duplicate/unmatched/HEIC/HEIF/video data, persistent demo banner, reset, real-mode exit, and memory-only demo state. Real settings reload on every route exit from demo. | `@claim:demo-sandbox`; `@claim:google-json-match`; [live demo desktop](evidence/polish-1/live-final/screenshot-desktop.png); [live demo mobile](evidence/polish-1/live-final/screenshot-mobile.png); [cold report](evidence/polish-1/live-final/cold-check.json). |
| B3 | Added `.factory/claims.json` with 23 atomic claims. Contract tests enforce unique IDs and exactly one tagged test occurrence per claim. Every registry command passed separately from a clean clone. | `factory contracts › maps every registered claim to exactly one browser-test tag`; all `@claim:*` tests; clean clone `02c387f`. |
| B4 | Added real client views and metadata for Demo, Privacy, Terms, and a paper-archive 404. History navigation restores route state and focuses/announces the new `h1`; Azure returns HTTP 404 for unknown URLs. | `demo, legal, and not-found routes have distinct metadata and focus`; live `/definitely-not-a-route` = 404; [live 404](evidence/polish-1/live-final/404-desktop.png). |
| M1 | Moved legal/offline styling to self-hosted CSS covered by the CSP; no inline styles remain on those pages. | `legal and offline pages load without console errors`; final live `verify-url.sh` reports no errors. |
| M2 | Added per-route titles, descriptions, canonicals, Open Graph/Twitter data, product art, favicon, Apple touch icon, XML sitemap, and sitemap-aware robots file. | `publishes a real sitemap and social assets`; `factory contracts › ships complete static metadata`; live sitemap is `text/xml`. |
| M3 | Applied the same skip link, header, footer, factory credit, build ID, focus transfer, and polite route announcement to app routes. | `demo, legal, and not-found routes have distinct metadata and focus`; final cold report records focused `h1` on Demo, Privacy, and Terms. |
| M4 | Set the required landing order to tool, three steps, privacy, and price. Published the $12 one-time unlock and its 20,000-file boundary. | `home page exposes the complete starting workflow`; `@claim:free-file-limit`; `@claim:one-time-price`; live `/`. |
| M5 | Replaced the pseudo-button drop action with a native button while keeping drag/drop on its container. | `drop action opens the ZIP picker by pointer, Enter, and Space`. |
| m1 | Raised result filters and demo controls to at least 44 CSS pixels. | `file filters and chooser controls meet the touch target minimum` in desktop and mobile projects. |

## Unlisted claim findings

| Finding | Change made | Evidence |
| --- | --- | --- |
| U01 | Rewrote the title in plain words and registered local repair behavior. | `@claim:local-processing`, `@claim:jpeg-repair`, `@claim:png-repair`. |
| U02 | Split the compound description into repair, exact-copy removal, dated naming, and local-processing claims. | `@claim:jpeg-repair`, `@claim:png-repair`, `@claim:exact-copy-dedupe`, `@claim:date-rename`, `@claim:local-processing`. |
| U03 | Replaced the compound hero sentence with audience/result copy and separate tested facts. | `@claim:local-processing`, `@claim:jpeg-repair`, `@claim:png-repair`, `@claim:exact-copy-dedupe`, `@claim:date-rename`. |
| U04 | Replaced vague “Runs locally” with the concrete “Photos stay on this device.” | `@claim:local-processing`; live request capture reports only same-origin requests and no request bodies. |
| U05 | Kept the offline fact and registered it. | `@claim:offline-reload`; final live cold report records an offline 5,518-byte repaired ZIP. |
| U06 | Replaced “dated, deduplicated archive” with plain copy. | `@claim:date-rename`; `@claim:exact-copy-dedupe`. |
| U07 | Removed the undefined “lowest-memory” comparison. | Copy audit; live folder chooser says “Read files from a folder you select.” |
| U08 | Removed the unverified browser fallback statement and kept the testable multi-ZIP action. | `@claim:zip-import`. |
| U09 | Removed “Best for large libraries.” | Copy audit; live first screen. |
| U10 | Removed “every modern browser.” | Copy audit; `@claim:zip-import` tests observable import behavior. |
| U11 | Registered JPEG and PNG date/location repair separately and parses exact tags/coordinates. | `@claim:jpeg-repair`; `@claim:png-repair`. |
| U12 | Added HEIC, HEIF, and MP4 sample cases with preview/log status and byte equality. | `@claim:copy-only-media`. |
| U13 | Rewrote the claim as “Photo pixels are not changed” and compares source payload bytes after removing inserted metadata. | `@claim:pixel-preservation`. |
| U14 | Replaced the compound hidden-process copy with separate local-processing and no-account claims. | `@claim:local-processing`; `@claim:no-account`. |
| U15 | Rewrote the instruction as a precise first-load offline fact. | `@claim:offline-reload`. |
| U16 | Removed the “0 bytes uploaded” marketing stamp. The remaining privacy wording is proved by request URL/body capture. | `@claim:local-processing`. |
| U17 | Rewrote jargon as standard, shortened, and duplicate-album Google JSON names and seeded each case. | `@claim:google-json-match`. |
| U18 | Registered exact JPEG and PNG date/location insertion outcomes. | `@claim:jpeg-repair`; `@claim:png-repair`. |
| U19 | Standardized the pixel wording and added exact payload comparison. | `@claim:pixel-preservation`. |
| U20 | Split skipping, naming, and logging into atomic claims. | `@claim:exact-copy-dedupe`; `@claim:date-rename`; `@claim:export-log`. |
| U21 | Removed the runtime provenance claim. Source prompts, model, date, and license remain in `.factory/design.md`. | Footer screenshot and design document. |
| U22 | Rewrote the README introduction and registered the complete no-external-request repair flow. | `@claim:local-processing`. |
| U23 | Rewrote API jargon as folder and multi-ZIP import actions and tested each. | `@claim:folder-picker`; `@claim:zip-import`. |
| U24 | Rewrote and seeded standard, shortened, and album-copy matching. | `@claim:google-json-match`. |
| U25 | Replaced tag-heavy visitor copy; the test still parses `DateTime`, `DateTimeOriginal`, `DateTimeDigitized`, latitude, longitude, and altitude. | `@claim:jpeg-repair`. |
| U26 | Replaced chunk jargon; the test parses the PNG `eXIf` date and coordinates. | `@claim:png-repair`. |
| U27 | Rewrote the compound option claim and tested exact-byte dedupe and dated year/month paths. | `@claim:exact-copy-dedupe`; `@claim:date-rename`. |
| U28 | Removed implementation jargon and added real ZIP plus stubbed directory output verification. | `@claim:folder-export`; the shared export claim test also inspects the downloaded ZIP. |
| U29 | Replaced “auditable manifest” with “export log” and validates one decision per media input in both output modes. | `@claim:export-log`. |
| U30 | Replaced PWA jargon with a concrete offline demo outcome. | `@claim:offline-reload`; `app shell reloads offline after installation`. |
| U31 | Standardized the privacy wording and intercepted the complete demo flow. | `@claim:local-processing`. |
| U32 | Removed the untestable reliability judgment; HEIC, HEIF, and video are present and byte-equal after export. | `@claim:copy-only-media`. |
| U33a | Removed subjective browser ranking and API jargon. | Copy audit; `@claim:folder-picker`. |
| U33b | Removed the unverified cross-browser statement. | Copy audit; no browser-matrix promise remains. |
| U34 | Added `engines.node: ">=20"`. | `@claim:node-runtime`. |
| U35 | Kept the build-output statement and checks `dist/index.html`. | `@claim:build-output`. |
| U36 | Condensed the output list and checks every documented PWA/metadata/host artifact. | `@claim:build-output`. |
| U37 | Rewrote dense host jargon and parses the generated security, MIME, route, and cache configuration. | `@claim:static-host-security`. |
| U38 | Removed container-deployment claims because this work order is static. | README deploy section; `@claim:build-output`; `@claim:static-host-security`. |
| U39 | Kept the numeric free boundary and tests 20,000 and 20,001 generated media inputs. | `@claim:free-file-limit`. |
| U40 | Published the exact price and Sociobot route. | `@claim:one-time-price`; `@claim:billing-boundary`. |
| U41 | Removed the fixed-product-ID claim and rewrote the remainder as “does not load payment-provider code.” | `@claim:billing-boundary` scans source and built bundles. |
| U42 | Kept the concrete permission timing and stubs/counts directory picker calls. | `@claim:folder-picker`. |
| U43 | Rewrote storage terms, enumerates IndexedDB/localStorage, tests settings transfer, and snapshots real storage across demo reset/export. | `@claim:storage-allowlist`; `@claim:settings-transfer`; `@claim:demo-sandbox`. |

## Landing copy findings

| Finding | Change made | Evidence |
| --- | --- | --- |
| L01 | Changed the nav label to “Takeout repair” and the section heading to “How Takeout repair works.” | Copy audit; live home screenshot. |
| L02 | Changed the headline to “Repair your Google Photos Takeout.” | First-screen browser test. |
| L03 | Replaced the 24-word jargon sentence with the 18-word audience/result sentence. | First-screen browser test; copy audit. |
| L04 | Added “Try it with sample data” and “Choose your Takeout files.” | First-screen browser test. |
| L05 | Replaced “deduplicated archive” with “Photos sorted by date, with exact copies removed.” | Copy audit; live home. |
| L06 | Removed the memory comparison. | Live folder action. |
| L07 | Removed “Best” and browser ranking. | Live folder action. |
| L08 | Removed the absolute browser claim. | Live ZIP action. |
| L09 | Uses “Repairs dates and locations in JPEG and PNG photos.” | Copy audit. |
| L10 | Removed “clearly” and states the copy-only behavior. | `@claim:copy-only-media`. |
| L11 | Uses “Photo pixels are not changed.” | `@claim:pixel-preservation`. |
| L12 | Uses “Repair in three steps.” | Live home screenshot. |
| L13 | Uses “How Takeout repair works.” | Live home screenshot. |
| L14 | Uses “Match photos to Google JSON files.” | Copy audit. |
| L15 | Explains standard, shortened, and duplicate-album filenames in plain language. | `@claim:google-json-match`. |
| L16 | Uses “Keep the original photo pixels.” | Live home screenshot. |
| L17 | Uses “Adds the Google date and location to each supported photo.” | Copy audit. |
| L18 | Uses “Export repaired files.” | Live home screenshot. |
| L19 | Uses “Skips exact copies, renames files by date, and logs each result.” | Three matching claim tests. |
| L20 | Replaced the cloud metaphor with “Repair Google Photos dates on your device.” | Footer screenshots. |
| L21 | Alt text now says “Paper photos and Google JSON cards enter a sorter and leave in date order.” | `verify-url.sh` and source audit. |
| L22 | Removed the subjective “Privacy promise” label; the section is labelled by its visible heading. | Axe and DOM tests. |
| L23 | Uses “Takeout Tidy — repair Google Photos dates.” | Metadata route test. |
| L24 | Uses two short, concrete description sentences. | Metadata route test and copy audit. |

## README copy findings

| Finding | Change made | Evidence |
| --- | --- | --- |
| R01 | Split the audience/problem statement and kept each sentence below 22 words. | `.factory/copy-audit.md`. |
| R02 | Added the one-click live sample link. | README `/demo` link and live check. |
| R03 | Uses “What Takeout Tidy repairs.” | README. |
| R04 | Replaced API jargon with folder and multi-ZIP actions. | `@claim:folder-picker`; `@claim:zip-import`. |
| R05 | Uses “Google JSON files,” shortened names, and duplicate-album filenames. | `@claim:google-json-match`. |
| R06 | Uses plain date/location wording; exact EXIF tags remain in tests. | `@claim:jpeg-repair`. |
| R07 | Uses plain PNG date/location wording; exact chunk parsing remains in tests. | `@claim:png-repair`. |
| R08 | Uses “Keeps photo payload bytes.” | `@claim:pixel-preservation`. |
| R09 | Uses exact-copy and date naming language without algorithm jargon. | `@claim:exact-copy-dedupe`; `@claim:date-rename`. |
| R10 | Removed “incrementally” and “fallback”; output choices are named plainly in the app. | `@claim:folder-export`; ZIP export claim test. |
| R11 | Names `takeout-tidy-manifest.json` and says it has one decision per media file. | `@claim:export-log`. |
| R12 | Replaced “offline PWA” with the concrete demo reload/export statement. | `@claim:offline-reload`. |
| R13 | Split and shortened the HEIC/HEIF/video statement and removed the reliability judgment. | `@claim:copy-only-media`. |
| R14 | Replaced vague manifest wording with the exact export-log behavior. | `@claim:export-log`. |
| R15 | Removed the subjective Chromium “best” statement. | README audit. |
| R16 | Removed the untested Firefox/Safari statement. | README audit. |
| R17 | Uses direct build instructions. | README; clean-clone build. |
| R18 | Uses two plain static-deploy sentences and gives `/demo` as the route example. | README; live direct route. |
| R19 | Split the host description and reduced it to security, file-type, and cache behavior. | `@claim:static-host-security`. |
| R20 | Removed container instructions because the artifact remains a static PWA. | README deployment section. |
| R21 | Removed all container runtime/cache claims. | README deployment section. |
| R22 | Uses “The app does not load payment-provider code” and drops the false fixed-ID promise. | `@claim:billing-boundary`. |
| R23 | Uses “repair settings,” “last export summary,” and “activated license.” | `@claim:storage-allowlist`. |
| R24 | Uses “Project source documents.” | README. |
| Terminology | Product copy consistently uses Google JSON file, exact copy, repaired export, Takeout files, export log, and location. Technical format names remain only where necessary. | `.factory/copy-audit.md`; `rg` audit; live pages. |

## Final evidence

- Clean clone: `/tmp/tmp.Qjgxj0Bn7r/repo`, commit `02c387fa265e0e102b311ba1b91e60192982f16a`.
- Clean-clone `npm test`: 15/15 passed.
- Clean-clone `npm run build`: passed; `dist/index.html` at root; 55.34 kB raw initial JavaScript and 20.13 kB raw CSS.
- Every one of the 23 `.factory/claims.json` commands: passed separately.
- Clean-clone `npm run test:e2e`: 42/42 passed across desktop Chromium and Pixel 5 emulation.
- Integrated axe, local: zero serious/critical findings on Home, Demo, Privacy, Terms, and 404 in both projects.
- Live axe: zero violations on Home, Demo, Privacy, Terms, and 404 before the final wording-only deploy; final cold Home/404 check again found zero serious/critical issues.
- Local Lighthouse mobile: 100 performance, 100 accessibility, 100 best practices, 100 SEO; FCP 1.1 s, LCP 1.3 s, CLS 0, TBT 80 ms.
- Live Lighthouse mobile: 100/100/100/100; FCP 1.1 s, LCP 1.1 s, CLS 0, TBT 60 ms, 31 KiB transfer.
- Final `verify-url.sh` on live `/demo`: 1,125 ms network-idle load, one `h1`, `lang=en`, main landmark, no missing alt, no unlabelled button, and no console errors.
- Final live routes: `/`, `/demo`, `/privacy/`, `/terms/`, `/offline.html`, `/sitemap.xml`, and `/robots.txt` return 200; `/definitely-not-a-route` returns 404.
- Final deployment ID: `a5c6c12d-0dac-4777-8681-cdd2ed5f2086`; custom domain status `Ready`.

No review finding remains unresolved.
