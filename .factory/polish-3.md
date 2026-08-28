# Perfection loop round 3 — cumulative finding closure

Date: 2026-08-28

Work order: `takeout-photo-metadata-fixer-polish-3`

Reviewed candidate: `3c81d6a7fdd91c5f461c5ef2039f9e67f2584d2b`

Adversarial report commit: `0763bebbaa391665adb9d6d024156f8e761ba96f`

Verified repair code: `442327c58cac81eeab1ef7a579bd918fba339ed1`

Deployment ID: `66fe4c66-fddd-4682-8823-803e4c61cd11`

Live URL: <https://takeout-photo-metadata-fixer.sociobot.in/>

All earlier `review-*.md` and `polish-*.md` files were read. Every earlier fix was retained and rechecked. Review 3's two new findings were fixed, and the clean-clone run exposed and closed two test/persistence races rather than leaving them hidden.

## Evidence keys

- **Clean** — fresh clone `/tmp/takeout-polish3-final.sI7dZt/repo` at `442327c`; `npm ci --ignore-scripts`, 15/15 unit and contract tests, `npm run build`, all 25 claim commands separately, then 50/50 desktop/mobile browser tests passed.
- **Claims** — the named `@claim:*` browser check in `tests/e2e/claims.spec.ts`, run separately from Clean.
- **Browser** — the named Playwright check in `tests/e2e/app.spec.ts`, run in desktop Chromium and Pixel 5 emulation.
- **Live** — cold browser audit after deployment: seven-row `?demo=1`, reset, byte-for-byte real-storage isolation, pre-write preview, same-origin/bodyless requests, offline reload/export, route focus/Back, HTTP 404, and zero serious/critical axe findings on Home, Demo, Privacy, Terms, and 404.
- **Home shot** — [mobile](evidence/polish-3/live-home/screenshot-mobile.png) and [desktop](evidence/polish-3/live-home/screenshot-desktop.png).
- **Demo shot** — [mobile](evidence/polish-3/live-demo-query/screenshot-mobile.png) and [desktop](evidence/polish-3/live-demo-query/screenshot-desktop.png).
- **Preview shot** — [mobile real-file preview before export](evidence/polish-3/local-preview-before-write-mobile.png).
- **Legal shots** — [Privacy](evidence/polish-3/live-privacy/screenshot-mobile.png) and [Terms](evidence/polish-3/live-terms/screenshot-mobile.png).
- **404 shot** — [live archive-bench 404](evidence/polish-3/live-404/screenshot-desktop.png).

## Review 3 findings

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-3-1 | Added the atomic `preview-before-write` registry entry and a real ZIP-import test. It proves inspection opens with no output picker, Blob URL, download click, completion state, or IndexedDB/localStorage change. Storage reads now avoid creating an empty IndexedDB database. | Claims `@claim:preview-before-write`; Preview shot; Live `/?demo=1` → Start for real → fixture preview. |
| F-3-2 | Removed the absolute README coverage attestation and replaced it with a neutral source-document link. | `.factory/copy-audit.md`; Clean contract test; live product copy cross-check. |

## Review 2 findings

| Finding | Change retained | Evidence |
| --- | --- | --- |
| F-2-1 | Location wording remains conditional everywhere; date-only JPEG and PNG exports receive dates without invented GPS data. | Claims `@claim:jpeg-repair`, `@claim:png-repair`; Clean; live Home and Terms. |
| F-2-2 | A valid recorded Sociobot response still removes the 20,001-file gate through the real Verify license action. | Claim `@claim:large-library-unlock`; Clean and Browser; live pricing copy. |

## Review 1 primary findings

| Finding | Change retained or made | Evidence |
| --- | --- | --- |
| B1 | Kept the job-first headline, named people leaving Google Photos, adjacent sample/real actions, next-step wording, and three facts. | Browser `390 px first screen names the job, audience, actions, and three facts without overflow`; Home shot; live `/`. |
| B2 | Kept `/demo` and `?demo=1` as populated, resettable, memory-only sandboxes with the persistent banner and real-mode exit. | Claims `@claim:demo-sandbox`, `@claim:google-json-match`; Demo shot; Live `/?demo=1`. |
| B3 | Registry now contains 25 unique claims with exactly one matching tag per claim, including the missing pre-write promise. | Clean `factory contracts › maps every registered claim to exactly one browser-test tag`; every registry command passed separately. |
| B4 | Kept real Demo, Privacy, Terms, and styled not-found views with direct load, metadata, focus, history, and host-level 404 behavior. | Browser `demo, legal, and not-found routes have distinct metadata and focus`; Live HTTP 404; 404 shot. |
| M1 | Kept CSP-compatible self-hosted legal/offline styling. | Browser `legal and offline pages load without console errors`; Legal shots; live console checks. |
| M2 | Kept route metadata, social image, favicons, sitemap, and robots reference. | Browser `publishes a real sitemap and social assets`; Live route/content-type checks. |
| M3 | Kept shared skip link, header/footer, factory/build text, route announcement, and h1 focus after navigation and Back. | Browser route-focus test; Live focus/Back audit. |
| M4 | Kept the required tool → how it works → privacy → price order, three facts, $12 price, and 20,000-file scope. | Browser home workflow test; Claims `@claim:free-file-limit`, `@claim:one-time-price`; Home shot. |
| M5 | Kept the native pointer/keyboard ZIP and drop action. | Browser `drop action opens the ZIP picker by pointer, Enter, and Space`; live `/`. |
| m1 | Kept all chooser, filter, and demo controls at least 44 CSS pixels. | Browser `file filters and chooser controls meet the touch target minimum`; Demo shot. |

## Review 1 claim findings

| Finding | Change retained or made | Evidence |
| --- | --- | --- |
| U01 | Plain title and local JPEG/PNG repair remain registered. | Claims `local-processing`, `jpeg-repair`, `png-repair`; Live title. |
| U02 | Description outcomes remain split into repair, dedupe, naming, and local-processing claims. | Corresponding Claims; Clean; live metadata. |
| U03 | Hero outcomes remain atomic and location remains conditional. | Claims `local-processing`, `jpeg-repair`, `png-repair`, `exact-copy-dedupe`, `date-rename`; Home shot. |
| U04 | “Photos stay on this device” remains concrete and request-intercepted. | Claim `local-processing`; Live same-origin/bodyless capture. |
| U05 | Offline behavior remains bounded to after first load. | Claim `offline-reload`; Live offline reload/export. |
| U06 | Date sorting and exact-copy removal remain concrete and separate. | Claims `date-rename`, `exact-copy-dedupe`; Demo shot. |
| U07 | The undefined memory comparison remains absent. | `.factory/copy-audit.md`; live `/`. |
| U08 | The unverified browser fallback guarantee remains absent. | Claim `zip-import`; live chooser copy. |
| U09 | Subjective “Best” browser wording remains absent. | Copy audit; Home shot. |
| U10 | “Every modern browser” remains absent. | Copy audit; Home shot. |
| U11 | JPEG and PNG date plus conditional-location behavior is parsed from exports. | Claims `jpeg-repair`, `png-repair`; Clean. |
| U12 | HEIC, HEIF, and MP4 remain copy-only and byte-equal. | Claim `copy-only-media`; Demo shot. |
| U13 | Photo payload preservation remains exact. | Claim `pixel-preservation`; Clean. |
| U14 | Local-data and no-account promises remain separate. | Claims `local-processing`, `no-account`; Live request capture. |
| U15 | Offline repair/export remains directly exercised. | Claim `offline-reload`; Live offline audit. |
| U16 | The unbounded “0 bytes” badge remains absent; privacy checks inspect request origins and bodies. | Claim `local-processing`; Live request capture. |
| U17 | Standard, shortened, and duplicate-album Google JSON names remain seeded. | Claim `google-json-match`; Demo shot. |
| U18 | Exact JPEG/PNG dates and conditional coordinates remain parsed. | Claims `jpeg-repair`, `png-repair`; Clean. |
| U19 | Original JPEG/PNG payload bytes remain compared after repair. | Claim `pixel-preservation`; Clean. |
| U20 | Skip, date rename, and per-input log behavior remain atomic. | Claims `exact-copy-dedupe`, `date-rename`, `export-log`; Clean. |
| U21 | Runtime provenance claim remains removed; source provenance stays in `design.md`. | Copy audit; Home shot footer. |
| U22 | Complete browser-local repair remains request-intercepted. | Claim `local-processing`; Live request capture. |
| U23 | Folder and multiple-ZIP import remain independently exercised. | Claims `folder-picker`, `zip-import`; Clean. |
| U24 | All named Google JSON matching forms remain paired. | Claim `google-json-match`; Demo shot. |
| U25 | JPEG output still proves all three date tags and conditional GPS. | Claim `jpeg-repair`; Clean. |
| U26 | PNG output still proves the `eXIf` dates and conditional GPS. | Claim `png-repair`; Clean. |
| U27 | Exact-byte dedupe and restored-date paths remain asserted. | Claims `exact-copy-dedupe`, `date-rename`; Clean. |
| U28 | ZIP download and selected-folder writes remain observed. The folder check now waits for its actual manifest write, removing a false-positive race. | Claim `folder-export`; three repeated local passes plus Clean. |
| U29 | ZIP and folder exports still contain one log decision per media input. | Claim `export-log`; Clean. |
| U30 | Offline demo reload and export remain concrete. | Claim `offline-reload`; Live offline audit. |
| U31 | Full demo flow still proves photo, filename, and JSON data stay local. | Claim `local-processing`; Live request capture. |
| U32 | Copy-only status and byte equality remain explicit. | Claim `copy-only-media`; Clean. |
| U33a | Subjective Chromium ranking remains absent. | Copy audit; live `/`. |
| U33b | The unverified Firefox/Safari promise remains absent. | Copy audit; live `/`. |
| U34 | Node 20 floor remains enforced. | Claim `node-runtime`; Clean. |
| U35 | Production build still creates `dist/index.html`. | Claim `build-output`; Clean build. |
| U36 | All documented PWA, metadata, and static-host artifacts remain in `dist/`. | Claim `build-output`; Clean build. |
| U37 | Static-host security, MIME, route, worker, manifest, and immutable-cache rules remain parsed. | Claim `static-host-security`; live response headers. |
| U38 | Irrelevant container claims remain absent for the static artifact. | README deploy section; Claim `build-output`. |
| U39 | Exact 20,000/20,001 behavior remains generated and tested. | Claim `free-file-limit`; Clean. |
| U40 | Price, Sociobot boundary, valid verification, and gate removal remain exercised. | Claims `one-time-price`, `billing-boundary`, `large-library-unlock`; Clean. |
| U41 | Built bundles remain free of direct payment-provider SDKs. | Claim `billing-boundary`; Clean. |
| U42 | Folder access is requested only after the explicit folder action. | Claim `folder-picker`; Clean. |
| U43 | Real storage remains allowlisted and demo state remains byte-for-byte isolated. Read-only startup now leaves IndexedDB absent. | Claims `storage-allowlist`, `settings-transfer`, `demo-sandbox`, `preview-before-write`; Live isolation audit. |

## Review 1 landing-copy findings

| Finding | Change retained | Evidence |
| --- | --- | --- |
| L01 | “Takeout repair” remains the shared navigation term. | Copy audit; Home shot. |
| L02 | Headline remains “Repair your Google Photos Takeout.” | Browser first-screen test; Home shot; live `/`. |
| L03 | Audience/result sentence remains 20 words and conditions location on JSON contents. | Copy audit; Home shot. |
| L04 | Sample and real-file actions remain adjacent. | Browser first-screen test; Home shot. |
| L05 | Figure uses date and exact-copy language. | Claims `date-rename`, `exact-copy-dedupe`; live `/`. |
| L06 | Undefined memory comparison remains absent. | Copy audit; live `/`. |
| L07 | “Best” and browser ranking remain absent. | Copy audit; live `/`. |
| L08 | Universal browser wording remains absent. | Copy audit; live `/`. |
| L09 | Support note states dates plus any location in Google JSON files. | Claims `jpeg-repair`, `png-repair`; Home shot. |
| L10 | Copy-only wording remains direct. | Claim `copy-only-media`; Demo shot. |
| L11 | Pixel-preservation wording remains plain. | Claim `pixel-preservation`; Home shot. |
| L12 | “Repair in three steps” remains concrete. | Home shot. |
| L13 | “How Takeout repair works” remains specific. | Home shot. |
| L14 | Matching heading names Google JSON files. | Copy audit; Home shot. |
| L15 | Matching copy names shortened and duplicate-album filenames. | Claim `google-json-match`; Home shot. |
| L16 | Pixel heading remains “Keep the original photo pixels.” | Home shot. |
| L17 | Step copy conditions location on the photo's Google JSON file. | Claims `jpeg-repair`, `png-repair`; Home shot. |
| L18 | Export heading remains action-led. | Home shot. |
| L19 | Skip, rename, and log sentence remains backed by three claims. | Claims `exact-copy-dedupe`, `date-rename`, `export-log`; Home shot. |
| L20 | Footer remains “Repair Google Photos dates on your device.” | Home shot. |
| L21 | Hero alt text plainly describes photos and Google JSON cards. | Live URL verifier; Home shot. |
| L22 | Subjective privacy accessible label remains absent. | Live axe; Privacy shot. |
| L23 | Home title remains plain and under 60 characters. | Live URL verifier; live `/`. |
| L24 | Description remains short, concrete, and conditional. | Browser metadata test; live `/`. |

## Review 1 README-copy findings

| Finding | Change retained or made | Evidence |
| --- | --- | --- |
| R01 | Audience/problem copy remains split and under 22 words. | `.factory/copy-audit.md`. |
| R02 | README retains the one-click `/demo` link. | README; live `/demo`. |
| R03 | Heading remains “What Takeout Tidy repairs.” | README copy audit. |
| R04 | Folder and multi-ZIP actions remain plain. | Claims `folder-picker`, `zip-import`. |
| R05 | Google JSON terminology remains consistent. | Claim `google-json-match`; copy audit. |
| R06 | JPEG wording remains conditional. | Claim `jpeg-repair`; README. |
| R07 | PNG wording remains conditional. | Claim `png-repair`; README. |
| R08 | Payload wording remains plain and exact. | Claim `pixel-preservation`. |
| R09 | Exact-copy and date naming remain plain. | Claims `exact-copy-dedupe`, `date-rename`. |
| R10 | Output implementation jargon remains absent. | Claim `folder-export`; README. |
| R11 | Export-log filename and per-media decision remain explicit. | Claim `export-log`. |
| R12 | Offline behavior remains stated as an observable outcome. | Claim `offline-reload`; Live offline audit. |
| R13 | Copy-only sentence remains short and factual. | Claim `copy-only-media`. |
| R14 | Vague manifest wording remains absent. | README; Claim `export-log`. |
| R15 | Subjective Chromium recommendation remains absent. | Copy audit. |
| R16 | Untested Firefox/Safari promise remains absent. | Copy audit. |
| R17 | Build instruction remains direct. | Clean build. |
| R18 | Static deploy and route-fallback instructions remain plain. | Claim `build-output`; live `/demo`. |
| R19 | Host policy description remains concise and tested. | Claim `static-host-security`; live headers. |
| R20 | Container instructions remain absent. | README. |
| R21 | Container runtime/cache claims remain absent. | README. |
| R22 | Provider wording remains plain and Sociobot-only. | Claims `billing-boundary`, `large-library-unlock`. |
| R23 | Browser storage uses the agreed terms. | Claims `storage-allowlist`, `preview-before-write`. |
| R24 | “Project source documents” remains the heading. | README. |

## Additional defects closed during verification

- Folder export evidence now waits for the output picker and the written `takeout-tidy-manifest.json`; it cannot pass from a stale ZIP completion message.
- Read-only startup checks for an existing IndexedDB database before opening it. A new visitor can preview files without creating persistent storage.

## Final verification

- Clean clone: `/tmp/takeout-polish3-final.sI7dZt/repo` at `442327c58cac81eeab1ef7a579bd918fba339ed1`.
- Clean `npm test`: 15/15 passed.
- Clean `npm run build`: passed; initial JavaScript 55.57 kB raw / 21.51 kB gzip, CSS 20.13 kB raw / 5.46 kB gzip.
- Every one of 25 registry commands passed separately.
- Clean `npm run test:e2e`: 50/50 passed across desktop Chromium and Pixel 5 emulation.
- Integrated axe: zero serious/critical findings on Home, Demo, Privacy, Terms, and 404 in both local projects and the live site.
- Local Lighthouse: 100 performance, 100 accessibility, 100 best practices, 100 SEO; LCP 1.7 s, TBT 0 ms, CLS 0, 89 KiB transfer.
- Live Lighthouse: 100 performance, 100 accessibility, 100 best practices, 100 SEO; LCP 1.3 s, TBT 0 ms, CLS 0, 82 KiB transfer.
- Live routes: `/`, `/demo`, `/?demo=1`, `/privacy/`, `/terms/`, `/offline.html`, `/sitemap.xml`, `/robots.txt`, manifest, and social image return 200; unknown route returns HTTP 404.
- Live security headers include CSP, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, Permissions Policy, and strict-origin referrer policy.

No finding of any severity remains unresolved.
