# Perfection loop round 4 — cumulative finding closure

Date: 2026-08-28

Work order: `takeout-photo-metadata-fixer-polish-4`

Reviewed candidate: `25438b4bed2c0e377453135cea06c7fde2cc93b2`

Adversarial report commit: `546ffdcff1df6774dfeb3418ff75941fa9d59ea4`

Repair commit: `db70ebb555f047a32bc6abc73fae3ae5c56d25e8`

Deployment ID: `3745352b-14f0-408a-9a57-8ac15c42502a`

Live URL: <https://takeout-photo-metadata-fixer.sociobot.in/>

Every `review-*.md` and `polish-*.md` was read. Every finding below was checked against the clean build and the deployed site.

## Evidence keys

- **Clean** — fresh clone `/tmp/takeout-polish4-clean.WXWLXD/repo` at `db70ebb`; `npm ci --ignore-scripts`, 15/15 unit and contract tests, production build, all 25 claim commands separately, 14/14 consolidated claim scenarios, and 52/52 desktop/mobile browser tests passed.
- **Claims** — the named `@claim:*` scenario in `tests/e2e/claims.spec.ts`, run separately from Clean.
- **Browser** — the named Playwright test in `tests/e2e/app.spec.ts`, run in desktop Chromium and Pixel 5 emulation.
- **Live audit** — [`live-audit.json`](evidence/polish-4/live-audit.json): route status/metadata/focus, mobile overflow, axe, link crawl, fragment navigation, Back, demo reset/isolation/privacy, offline reload, and ZIP export.
- **Live assets** — [`live-assets.json`](evidence/polish-4/live-assets.json): one-click demo/exit, site files, content types, caching, and security headers.
- **Home shots** — [mobile](evidence/polish-4/live-home/screenshot-mobile.png) and [desktop](evidence/polish-4/live-home/screenshot-desktop.png).
- **Demo shots** — [mobile](evidence/polish-4/live-demo-query/screenshot-mobile.png) and [desktop](evidence/polish-4/live-demo-query/screenshot-desktop.png).
- **Routing shots** — [Home to section](evidence/polish-4/live-routing/home-to-section.png), [Demo to section](evidence/polish-4/live-routing/demo-to-section.png), and [cold deep link](evidence/polish-4/live-routing/direct-deep-link.png).
- **Legal shots** — [Privacy](evidence/polish-4/live-privacy/screenshot-mobile.png) and [Terms](evidence/polish-4/live-terms/screenshot-mobile.png).
- **404 shot** — [styled live HTTP 404](evidence/polish-4/live-404/screenshot-desktop.png).
- **Lighthouse** — [`local`](evidence/polish-4/lighthouse-local.json) and [`live`](evidence/polish-4/lighthouse-live.json), both 100 performance / 100 accessibility / 100 best practices / 100 SEO.

## Review 4 finding

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-4-1 | Made **Takeout repair** an explicit SPA route, rendered before resolving its hash, scrolled to the real section, focused and announced its heading, and recorded/restored scroll state. Direct cold deep links now use the same path. | Browser `Takeout repair navigation reaches its section and Back restores the prior route and scroll`; Routing shots; Live audit records target top `0.203125`, focus `how-title`, and Back at scroll `0` from both `/` and `/demo`; live `/#how-it-works`. |

## Reviews 2 and 3 findings

| Finding | Change retained | Evidence |
| --- | --- | --- |
| F-2-1 | Every location statement remains conditional on a location in the Google JSON file; date-only JPEG and PNG outputs do not invent GPS. | Claims `@claim:jpeg-repair`, `@claim:png-repair`; Clean; Home shot; live `/terms/`. |
| F-2-2 | A valid recorded Sociobot response removes the 20,001-file export gate. | Claim `@claim:large-library-unlock`; Clean; live price copy on `/`. |
| F-3-1 | The first-screen pre-write promise remains atomic and proves no output, download, completion, or storage write occurs during import preview. | Claim `@claim:preview-before-write`; Clean; Home shot. |
| F-3-2 | README retains a neutral claims-registry link rather than an unsupported coverage attestation. | Clean contract test; `.factory/copy-audit.md`; README. |

## Review 1 primary findings

| Finding | Change retained | Evidence |
| --- | --- | --- |
| B1 | Kept the job-first headline, named audience, adjacent sample/real actions, next-state note, and three concrete facts. | Browser `390 px first screen names the job, audience, actions, and three facts without overflow`; Home shots; live `/`. |
| B2 | Kept `/demo` and `?demo=1` populated, resettable, memory-only, bannered, and separable through **Start for real**. | Claim `@claim:demo-sandbox`; Live audit and Live assets; Demo shots; live `/?demo=1`. |
| B3 | Kept 25 unique registry entries with exactly one tagged scenario per ID and ran every command separately. | Clean `factory contracts`; 25 individual Claim passes; `.factory/claims.json`. |
| B4 | Kept real Demo, Privacy, Terms, direct deep links, and styled HTTP 404 routing. | Browser route test; Live audit statuses; 404 shot; live `/not-in-the-archive`. |
| M1 | Kept legal and offline pages self-styled under the deployed CSP. | Browser `legal and offline pages load without console errors`; Live Legal shots; Live assets headers. |
| M2 | Kept route-specific metadata, social art, icons, robots, and sitemap. | Browser `publishes a real sitemap and social assets`; Live audit; Live assets. |
| M3 | Kept the shared shell, skip link, route announcer, h1 focus, and Back behavior; fragment focus is now included. | Browser route and F-4-1 tests; Live audit; Routing shots. |
| M4 | Kept product preview, three steps, privacy, exact $12 price, and 20,000-file scope in the required order. | Browser home workflow; Claims `@claim:free-file-limit`, `@claim:one-time-price`; Home shots. |
| M5 | Kept the native drop action operable by pointer, Enter, and Space. | Browser `drop action opens the ZIP picker by pointer, Enter, and Space`; live `/`. |
| m1 | Kept all filter, chooser, and demo controls at least 44 CSS pixels high. | Browser `file filters and chooser controls meet the touch target minimum`; Demo shot. |

## Review 1 claim findings

| Finding | Change retained | Evidence |
| --- | --- | --- |
| U01 | The plain title and local JPEG/PNG repair remain covered. | Claims `@claim:local-processing`, `@claim:jpeg-repair`, `@claim:png-repair`; Live audit title. |
| U02 | Metadata-description outcomes remain split into repair, exact-copy, naming, and local-processing checks. | Corresponding Claims; Live audit metadata. |
| U03 | Hero outcomes remain atomic and location remains conditional. | Claims `local-processing`, `jpeg-repair`, `png-repair`, `exact-copy-dedupe`, `date-rename`; Home shot. |
| U04 | “Photos stay on this device” remains concrete and request-intercepted. | Claim `@claim:local-processing`; Live audit has zero foreign requests and bodies. |
| U05 | Offline behavior remains bounded to after first load. | Claim `@claim:offline-reload`; Live audit offline ZIP export. |
| U06 | Date naming and exact-copy removal remain separate observable outcomes. | Claims `@claim:date-rename`, `@claim:exact-copy-dedupe`; Demo shot. |
| U07 | The undefined memory comparison remains absent. | Copy audit; live `/`. |
| U08 | The unverified browser fallback guarantee remains absent; ZIP import is tested directly. | Claim `@claim:zip-import`; live chooser. |
| U09 | Subjective “Best” browser wording remains absent. | Copy audit; Home shot. |
| U10 | “Every modern browser” remains absent. | Copy audit; Home shot. |
| U11 | JPEG and PNG date plus conditional-location behavior is parsed from exports. | Claims `@claim:jpeg-repair`, `@claim:png-repair`; Clean. |
| U12 | HEIC, HEIF, and MP4 remain copy-only and byte-equal. | Claim `@claim:copy-only-media`; Demo shot. |
| U13 | Original photo payload bytes remain compared after metadata insertion. | Claim `@claim:pixel-preservation`; Clean. |
| U14 | Local-data and no-account promises remain separate and tested. | Claims `@claim:local-processing`, `@claim:no-account`; Live audit. |
| U15 | Offline repair and export remains directly exercised. | Claim `@claim:offline-reload`; Live audit. |
| U16 | The unbounded “0 bytes” badge remains absent; request origins and bodies are inspected. | Claim `@claim:local-processing`; Live audit. |
| U17 | Standard, shortened, and duplicate-album JSON names remain seeded. | Claim `@claim:google-json-match`; Demo shot. |
| U18 | Exact JPEG/PNG dates and conditional coordinates remain parsed. | Claims `@claim:jpeg-repair`, `@claim:png-repair`; Clean. |
| U19 | Original JPEG/PNG payload bytes remain compared. | Claim `@claim:pixel-preservation`; Clean. |
| U20 | Skip, date rename, and per-input log behavior remain atomic. | Claims `@claim:exact-copy-dedupe`, `@claim:date-rename`, `@claim:export-log`; Clean. |
| U21 | Runtime art-provenance marketing remains removed; provenance stays in the design source. | Copy audit; `.factory/design.md`; Home footer. |
| U22 | The complete browser-local repair remains request-intercepted. | Claim `@claim:local-processing`; Live audit. |
| U23 | Folder and multiple-ZIP imports remain independently exercised. | Claims `@claim:folder-picker`, `@claim:zip-import`; Clean. |
| U24 | All named Google JSON filename forms remain paired. | Claim `@claim:google-json-match`; Clean. |
| U25 | JPEG output proves all three date tags and conditional GPS. | Claim `@claim:jpeg-repair`; Clean. |
| U26 | PNG output proves the `eXIf` dates and conditional GPS. | Claim `@claim:png-repair`; Clean. |
| U27 | Exact-byte dedupe and restored-date paths remain asserted. | Claims `@claim:exact-copy-dedupe`, `@claim:date-rename`; Clean. |
| U28 | ZIP downloads and selected-folder writes remain observed through completion. | Claim `@claim:folder-export`; Clean; Live audit ZIP download. |
| U29 | ZIP and folder exports retain one log decision per media input. | Claim `@claim:export-log`; Clean. |
| U30 | The controlled demo reloads and exports offline. | Claim `@claim:offline-reload`; Live audit. |
| U31 | The full demo proves photo, filename, and JSON data stay local. | Claim `@claim:local-processing`; Live audit. |
| U32 | Copy-only status and byte equality remain explicit. | Claim `@claim:copy-only-media`; Clean. |
| U33a | Subjective Chromium ranking remains absent. | Copy audit; live `/`. |
| U33b | The unverified Firefox/Safari promise remains absent. | Copy audit; live `/`. |
| U34 | Node 20 remains the enforced minimum. | Claim `@claim:node-runtime`; Clean. |
| U35 | Production build creates `dist/index.html`. | Claim `@claim:build-output`; Clean build. |
| U36 | Documented PWA, metadata, and host artifacts remain in `dist/`. | Claim `@claim:build-output`; Clean; Live assets. |
| U37 | Host security, MIME, worker, manifest, and cache rules remain parsed and live. | Claim `@claim:static-host-security`; Live assets. |
| U38 | Container claims remain absent for this static deployment. | README deploy section; Claim `@claim:build-output`. |
| U39 | Exactly 20,000 media files remain free and 20,001 remains gated. | Claim `@claim:free-file-limit`; Clean. |
| U40 | Price, Sociobot boundary, valid verification, and gate removal remain exercised. | Claims `@claim:one-time-price`, `@claim:large-library-unlock`, `@claim:billing-boundary`; Clean. |
| U41 | Source and built bundles remain free of direct payment-provider SDKs. | Claim `@claim:billing-boundary`; Clean. |
| U42 | Folder access remains requested only after its explicit action. | Claim `@claim:folder-picker`; Clean. |
| U43 | Real storage remains allowlisted and demo state remains byte-for-byte isolated. | Claims `@claim:storage-allowlist`, `@claim:settings-transfer`, `@claim:demo-sandbox`, `@claim:preview-before-write`; Live audit. |

## Review 1 landing-copy findings

| Finding | Change retained | Evidence |
| --- | --- | --- |
| L01 | “Takeout repair” remains the shared term and now executes its destination correctly. | F-4-1 Browser test; Routing shots; live `/#how-it-works`. |
| L02 | Headline remains “Repair your Google Photos Takeout.” | First-screen Browser test; Home shot. |
| L03 | Audience/result sentence remains 20 words and conditions location on saved JSON data. | Copy audit; Home shot. |
| L04 | Sample and real-file actions remain adjacent. | First-screen Browser test; Home shot. |
| L05 | Figure uses plain date and exact-copy wording. | Claims `@claim:date-rename`, `@claim:exact-copy-dedupe`; Home shot. |
| L06 | Undefined memory comparison remains absent. | Copy audit; live `/`. |
| L07 | Subjective browser ranking remains absent. | Copy audit; live `/`. |
| L08 | Universal-browser wording remains absent. | Copy audit; live `/`. |
| L09 | Support copy promises dates and only locations present in JSON. | Claims `@claim:jpeg-repair`, `@claim:png-repair`; Home shot. |
| L10 | Copy-only wording remains direct. | Claim `@claim:copy-only-media`; Demo shot. |
| L11 | Pixel-preservation wording remains plain. | Claim `@claim:pixel-preservation`; Home shot. |
| L12 | “Repair in three steps” remains concrete. | Routing shot; live `/#how-it-works`. |
| L13 | “How Takeout repair works” remains a standalone heading and is now the focused fragment destination. | F-4-1 Browser test; Routing shot. |
| L14 | Matching heading uses “Google JSON files.” | Copy audit; Routing shot. |
| L15 | Matching copy names shortened and duplicate-album filenames. | Claim `@claim:google-json-match`; Routing shot. |
| L16 | Pixel heading remains concrete. | Routing shot. |
| L17 | Step copy conditions location on the photo’s Google JSON file. | Claims `@claim:jpeg-repair`, `@claim:png-repair`; Routing shot. |
| L18 | Export heading names its result. | Routing shot. |
| L19 | Skip, rename, and log copy remains backed by three claims. | Claims `exact-copy-dedupe`, `date-rename`, `export-log`; Routing shot. |
| L20 | Footer remains “Repair Google Photos dates on your device.” | Home shot. |
| L21 | Hero alt text describes the task-specific transformation. | Live Home verification; Home shot. |
| L22 | Subjective privacy accessible labels remain absent. | Browser axe; Live audit. |
| L23 | Home title remains plain and under 60 characters. | Live audit; live `/`. |
| L24 | Description remains short, concrete, and conditional. | Live audit metadata; live `/`. |

## Review 1 README-copy findings

| Finding | Change retained | Evidence |
| --- | --- | --- |
| R01 | Audience/problem wording remains split and under 22 words. | Copy audit; README. |
| R02 | README retains the one-click `/demo` link. | README; Live assets one-click check. |
| R03 | Repair heading remains specific. | Copy audit; README. |
| R04 | Folder and multi-ZIP wording remains plain. | Claims `@claim:folder-picker`, `@claim:zip-import`; README. |
| R05 | “Google JSON file” remains the consistent term. | Claim `@claim:google-json-match`; Copy audit. |
| R06 | JPEG wording remains conditional. | Claim `@claim:jpeg-repair`; README. |
| R07 | PNG wording remains conditional. | Claim `@claim:png-repair`; README. |
| R08 | Payload wording remains plain and exact. | Claim `@claim:pixel-preservation`; README. |
| R09 | Exact-copy and date-naming terms remain plain. | Claims `@claim:exact-copy-dedupe`, `@claim:date-rename`; README. |
| R10 | Output implementation jargon remains absent. | Claim `@claim:folder-export`; README. |
| R11 | Export-log filename and per-media decision remain explicit. | Claim `@claim:export-log`; README. |
| R12 | Offline behavior remains an observable outcome. | Claim `@claim:offline-reload`; Live audit. |
| R13 | Copy-only wording remains short and factual. | Claim `@claim:copy-only-media`; README. |
| R14 | Vague manifest wording remains absent. | Claim `@claim:export-log`; README. |
| R15 | Subjective Chromium advice remains absent. | Copy audit; README. |
| R16 | Untested Firefox/Safari promises remain absent. | Copy audit; README. |
| R17 | Build instructions remain direct. | Clean build; README. |
| R18 | Static deployment and route fallback remain plain and working. | Claim `@claim:build-output`; Live audit `/demo`. |
| R19 | Host-policy wording remains concise and tested. | Claim `@claim:static-host-security`; Live assets headers. |
| R20 | Container instructions remain absent. | README. |
| R21 | Container runtime/cache claims remain absent. | README. |
| R22 | Provider wording remains Sociobot-only and tested through successful verification. | Claims `@claim:billing-boundary`, `@claim:large-library-unlock`; Clean. |
| R23 | Browser storage uses the agreed terms and allowlist. | Claims `@claim:storage-allowlist`, `@claim:preview-before-write`; Live audit. |
| R24 | “Project source documents” remains a standalone heading. | Copy audit; README. |

## Final verification

No finding remains open. The live site serves build `1.0.4 · polish 4`, preserves the archive-repair-bench identity, and retains the original static PWA deployment class.
