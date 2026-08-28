# Adversarial first-read review 4 — Takeout Tidy

Date: 2026-08-28  
Work order: `takeout-photo-metadata-fixer-review-4`  
Candidate: `25438b4bed2c0e377453135cea06c7fde2cc93b2`  
Live URL: <https://takeout-photo-metadata-fixer.sociobot.in/>

## Verdict: FAIL

One blocking finding remains. The product is clear, tryable, and its sandbox is
honest, but a visible primary-navigation link does not reach its stated
destination. Broken routing is blocking under the site-structure contract.

## Findings

### F-4-1 — “Takeout repair” changes the hash but does not navigate to the section (BLOCKING)

**Quote/location:** primary header on every route: **“Takeout repair”**, with
target `/#how-it-works`.

**Evidence:** I activated it from cold Home and `/demo` at 1440 × 900. The URL
became `/#how-it-works`, but the page stayed at its top. The intended section
was 1,702–1,704 CSS pixels below the viewport. This is reproducible in the
live app.

**Why a visitor is lost:** a visitor choosing the only header item that
describes the product expects the repair explanation. The updated hash makes a
failed deep link look successful.

**Code confirmation:** `src/main.ts` adds `data-route` to the fragment anchor.
Its handler prevents native fragment navigation; `navigate()` calls
`enterRoute()`, which ends in `window.scrollTo(0, 0)`. No code consumes the
hash or scrolls `#how-it-works` into view.

**Concrete fix:** use a normal fragment link, or preserve SPA navigation and
after rendering Home scroll/focus the requested hash target. Add an E2E test
that clicks it from Home and Demo, asserts the target is in view, and confirms
Back restores route and scroll. If the intended target is the chooser, rename
it **“Start repair”** and point to `#repair`.

## Cold first read

Fresh contexts at 390 px mobile and 1440 × 900 desktop loaded at scroll zero.

| Question | Answer before scrolling |
| --- | --- |
| What does it do? | Repairs a Google Photos Takeout by restoring saved dates and locations, removing exact copies, and renaming files. |
| For whom? | People leaving Google Photos. |
| First click? | **Try it with sample data**; the neighboring note says it previews matches first. |

The evidence is visible in **“Repair your Google Photos Takeout”**, its
20-word audience/result sentence, adjacent sample and real-file actions, and
three facts. At 390 px there was no horizontal overflow. The paper archive
bench—taped paper, archival ink, coral tabs, and original sorter art—is a
distinct product identity, not a generic SaaS template.

## Demo, sandbox, privacy, and offline checks

- One click on **Try it with sample data** opened `/demo` on a populated
  inspection table (seven sample media files plus the table header).
- The persistent banner was exactly **“Demo — sample data, nothing is saved”**
  with **Reset demo** and **Start for real**.
- After I seeded a real-mode `localStorage` sentinel, entered demo, and reset,
  the sentinel and local-storage snapshot were unchanged; the first sample row
  was restored.
- The live demo made five same-origin static requests with no request body.
- After service-worker control, an offline reload of `/demo` downloaded
  `takeout-tidy-repaired.zip`; the UI reported **“6 files written, 1 exact
  copies skipped.”**

The one-click demo is populated, realistic, resettable, and isolated. No demo
finding is open.

## Claims execution

I read all 25 `.factory/claims.json` entries. In fresh clone
`/tmp/takeout-review4-clean`, I ran `npm ci --ignore-scripts`, each registered
test command separately, `npm test`, `npm run build`, and `npm run test:claims`.
All passed; unit/contract tests passed 15/15 and the build created `dist/`.

Passed IDs: `demo-sandbox`, `preview-before-write`, `local-processing`,
`no-account`, `jpeg-repair`, `png-repair`, `exact-copy-dedupe`, `date-rename`,
`copy-only-media`, `pixel-preservation`, `export-log`, `folder-export`,
`google-json-match`, `offline-reload`, `free-file-limit`, `one-time-price`,
`large-library-unlock`, `folder-picker`, `zip-import`, `settings-transfer`,
`storage-allowlist`, `node-runtime`, `build-output`, `static-host-security`,
and `billing-boundary`.

The live landing and README claim-like text maps to the registry; no unlisted
claim was found. F-4-1 is an observable routing defect, not an unlisted claim.

## Copy audit

Counts treat hyphenated terms, filenames, and numbers as one word. Headings,
labels, and actions are included. No copy exceeds 22 words, uses a banned
marketing adjective, changes a core term, or has a non-result action. Only
the **“Takeout repair”** link is flagged because it does not execute its named
navigation.

### Landing page

| Copy | Words | Result |
| --- | ---: | --- |
| Takeout Tidy | 2 | Pass |
| Demo | 1 | Pass |
| Takeout repair | 2 | F-4-1 |
| Privacy | 1 | Pass |
| Private photo repair | 3 | Pass |
| Repair your Google Photos Takeout | 6 | Pass |
| For people leaving Google Photos, restore dates and locations saved in Google JSON files, remove exact copies, and rename files. | 20 | Pass |
| Try it with sample data | 5 | Pass |
| Choose your Takeout files | 4 | Pass |
| Preview matches before anything is written. | 6 | Pass |
| Photos stay on this device. | 5 | Pass |
| Works offline after the first load. | 6 | Pass |
| Free for up to 20,000 files. | 7 | Pass |
| Takeout files in. | 3 | Pass |
| Photos sorted by date, with exact copies removed. | 8 | Pass |
| Step 1 | 2 | Pass |
| Choose an extracted folder or one or more Takeout ZIP files. | 11 | Pass |
| Choose extracted folder | 3 | Pass |
| Read files from a folder you select | 7 | Pass |
| Choose Takeout ZIP files | 4 | Pass |
| Import one or more ZIP files | 6 | Pass |
| Choose ZIP files, or drag a folder here | 8 | Pass |
| Repairs dates and any location in Google JSON files for JPEG and PNG photos. | 14 | Pass |
| Copies HEIC, HEIF, and video files without changing their metadata. | 10 | Pass |
| Photo pixels are not changed. | 5 | Pass |
| Repair in three steps | 4 | Pass |
| How Takeout repair works | 4 | Pass |
| Match photos to Google JSON files | 6 | Pass |
| Matches JSON files, shortened Google filenames, and duplicate album filenames. | 10 | Pass |
| Keep the original photo pixels | 5 | Pass |
| Adds the Google date and any location in its Google JSON file to each supported photo. | 16 | Pass |
| Export repaired files | 3 | Pass |
| Skips exact copies, renames files by date, and logs each result. | 11 | Pass |
| Your photos stay on this device | 6 | Pass |
| The repair runs in your browser. | 6 | Pass |
| It needs no account and sends no photo, filename, or Google JSON data to a server. | 16 | Pass |
| Read the privacy policy | 4 | Pass |
| Large libraries | 2 | Pass |
| Repair up to 20,000 files free | 6 | Pass |
| A $12 one-time unlock removes the file limit. | 8 | Pass |
| There is no subscription. | 4 | Pass |
| Buy the $12 unlock | 4 | Pass |
| Repair Google Photos dates on your device. | 7 | Pass |
| Terms | 1 | Pass |
| Export settings | 2 | Pass |
| Import settings | 2 | Pass |
| Built by Param Factory · Paper archive bench · Build 1.0.3 · polish 3 | 10 | Pass |

### README

| Copy | Words | Result |
| --- | ---: | --- |
| Takeout Tidy | 2 | Pass |
| Repair Google Photos Takeout dates and locations saved in Google JSON files. | 12 | Pass |
| Takeout Tidy is for people leaving Google Photos with wrong dates, repeated album copies, or separate Google JSON files. | 19 | Pass |
| Live product | 2 | Pass |
| One-click sample | 2 | Pass |
| What Takeout Tidy repairs | 4 | Pass |
| Imports an extracted folder or one or more Takeout ZIP files. | 10 | Pass |
| Matches photos to standard, shortened, and duplicate-album Google JSON filenames. | 10 | Pass |
| Adds the Google date and any location in its Google JSON file to JPEG and PNG metadata. | 17 | Pass |
| Keeps photo payload bytes and copies HEIC, HEIF, and video files unchanged. | 11 | Pass |
| Can skip exact copies and rename repaired files by date. | 9 | Pass |
| Adds `takeout-tidy-manifest.json` with one decision for each media file. | 8 | Pass |
| Photo, filename, and Google JSON data stay on the device during repair and export. | 14 | Pass |
| The demo can reload and export offline after its first load. | 11 | Pass |
| Repair is free for up to 20,000 media files. | 9 | Pass |
| A $12 one-time unlock removes that limit with no subscription. | 10 | Pass |
| See `.factory/claims.json` for the registered product checks. | 7 | Pass |
| Run locally | 2 | Pass |
| Test and build | 3 | Pass |
| Deploy | 1 | Pass |
| Privacy and safety | 3 | Pass |
| Use Node.js 20 or newer. | 6 | Pass |
| Open the local URL shown by Vite. | 7 | Pass |
| The sample route is `/demo` or `/?demo=1`. | 8 | Pass |
| The production build is in `dist/`. | 6 | Pass |
| Its root contains `index.html`, the manifest, service worker, offline page, sitemap, and static-host configuration. | 11 | Pass |
| The static-host file sets the content policy, frame protection, permissions, file types, and cache rules. | 15 | Pass |
| Deploy `dist/` as a static site. | 6 | Pass |
| Send app routes such as `/demo` to `index.html`. | 8 | Pass |
| The buy link and license check use Sociobot endpoints. | 9 | Pass |
| The app does not load payment-provider code. | 7 | Pass |
| Set these variables only for registered replacements: | 8 | Pass |
| Keep an untouched copy of the original Takeout. | 8 | Pass |
| Folder permission is requested only after you choose the folder action. | 11 | Pass |
| Real mode stores repair settings, the last export summary, and an activated license. | 12 | Pass |
| Demo mode uses memory and leaves real storage unchanged. | 9 | Pass |
| Read the deployed privacy policy and terms. | 7 | Pass |
| Project source documents | 3 | Pass |
| Product scope | 2 | Pass |
| Visual system and asset provenance | 5 | Pass |
| Demo contract | 2 | Pass |
| Repair evidence | 2 | Pass |
| Licensed under the MIT License. | 5 | Pass |

## Structure, links, and accessibility

| Check | Result |
| --- | --- |
| Metadata | Pass: each app route has `lang=en`, one h1, `main`, description, canonical, OG/Twitter data, SVG favicon, and Apple touch asset. |
| Titles | Pass: Home, Demo, Privacy, Terms, and 404 use the specified route title pattern. |
| Direct routes | Pass: Home, Demo, query-demo, legal, offline, sitemap, robots, manifest, and social asset returned 200; unknown route returned styled HTTP 404. |
| History/focus | Pass for app-route navigation and Back: h1 receives focus and the polite status changes. F-4-1 is the separate fragment failure. |
| Link crawl | Pass for all real links and valid fragments except F-4-1. The Sociobot buy URL returned 200. |
| Shell | Pass: skip link, header/footer, Privacy/Terms, factory credit, and build identifier are consistent. |
| Accessibility | Pass: axe E2E coverage has zero serious/critical issues; live mobile had no horizontal overflow. |

## Earlier-finding verification

Every prior `review-*.md`, `polish-*.md`, and handoff was read. Each former
finding is confirmed below against live behavior and current source; no item is
merely accepted from its old status.

| Earlier IDs | Current verification |
| --- | --- |
| B1 | Fixed: first screen names job, audience, actions, next state, and facts. |
| B2 | Fixed: demo is populated, bannered, resettable, and memory-isolated. |
| B3 | Fixed: 25 unique claim IDs each have a tagged check. |
| B4 | Fixed: Demo/Privacy/Terms and HTTP 404 load directly. |
| M1 | Fixed: legal/offline styling is self-hosted and CSP-compatible. |
| M2 | Fixed: per-route metadata, social art, icons, robots, and sitemap are live. |
| M3 | Fixed: shared shell, route focus, and announcement work. |
| M4 | Fixed: required landing order, price, and file limit are present. |
| M5 | Fixed: ZIP/drop action supports pointer and keyboard. |
| m1 | Fixed: controls meet the touch-target baseline. |
| U01 | Fixed: local repair title is covered by processing/format claims. |
| U02 | Fixed: description outcomes map to atomic claims. |
| U03 | Fixed: hero outcomes are conditional and atomic. |
| U04 | Fixed: on-device handling is request-intercepted. |
| U05 | Fixed: offline reload/export is tested. |
| U06 | Fixed: dated/deduplicated outcomes are independently asserted. |
| U07 | Fixed: unsupported memory comparison removed. |
| U08 | Fixed: browser guarantee removed; ZIP import tested. |
| U09 | Fixed: subjective folder ranking removed. |
| U10 | Fixed: universal-browser wording removed. |
| U11 | Fixed: JPEG location wording is conditional and date-only output is tested. |
| U12 | Fixed: HEIC/HEIF/MP4 are copy-only and byte-checked. |
| U13 | Fixed: photo payload preservation is asserted. |
| U14 | Fixed: account and local-data promises are separate/tested. |
| U15 | Fixed: offline promise is bounded to first load. |
| U16 | Fixed: zero-byte badge removed; bodies are checked. |
| U17 | Fixed: named JSON filename forms are seeded. |
| U18 | Fixed: JPEG/PNG date and conditional GPS are parsed. |
| U19 | Fixed: original payload comparison is asserted. |
| U20 | Fixed: skip/name/log are atomic outcomes. |
| U21 | Fixed: runtime art-provenance claim removed. |
| U22 | Fixed: browser-local end-to-end repair is intercepted. |
| U23 | Fixed: folder and multi-ZIP imports are independent. |
| U24 | Fixed: named Google JSON forms are paired. |
| U25 | Fixed: JPEG date tags and conditional GPS are parsed. |
| U26 | Fixed: PNG `eXIf` behavior is parsed. |
| U27 | Fixed: exact-byte dedupe and dated paths are asserted. |
| U28 | Fixed: ZIP and selected-folder writes are observed. |
| U29 | Fixed: both exports contain per-media log decisions. |
| U30 | Fixed: offline demo behavior is concrete. |
| U31 | Fixed: full demo requests are same-origin/bodyless. |
| U32 | Fixed: copy-only status and byte equality are explicit. |
| U33a | Fixed: subjective Chromium ranking absent. |
| U33b | Fixed: unverified Firefox/Safari promise absent. |
| U34 | Fixed: Node 20 floor enforced. |
| U35 | Fixed: build creates `dist/index.html`. |
| U36 | Fixed: documented static/PWA artifacts build. |
| U37 | Fixed: static-host policy is parsed/asserted. |
| U38 | Fixed: irrelevant container claims absent. |
| U39 | Fixed: exact free boundary is tested. |
| U40 | Fixed: valid Sociobot response removes the gate. |
| U41 | Fixed: no direct payment-provider SDK is bundled. |
| U42 | Fixed: folder action gates permission request. |
| U43 | Fixed: storage allowlist and demo isolation are asserted. |
| L01 | Copy fixed; its broken header navigation is F-4-1. |
| L02 | Fixed: headline is job-first. |
| L03 | Fixed: audience sentence is 20 words and conditional. |
| L04 | Fixed: sample/real actions adjacent. |
| L05 | Fixed: figure caption is plain. |
| L06 | Fixed: memory comparison absent. |
| L07 | Fixed: ranking absent. |
| L08 | Fixed: universal browser claim absent. |
| L09 | Fixed: support wording conditional. |
| L10 | Fixed: copy-only wording direct. |
| L11 | Fixed: pixel wording plain. |
| L12 | Fixed: three-step label concrete. |
| L13 | Fixed: explanation heading stands alone. |
| L14 | Fixed: matching heading names JSON files. |
| L15 | Fixed: shortened/album forms stated. |
| L16 | Fixed: pixel heading concrete. |
| L17 | Fixed: location wording conditional. |
| L18 | Fixed: export heading names result. |
| L19 | Fixed: skip/name/log copy is claimed. |
| L20 | Fixed: footer names on-device repair. |
| L21 | Fixed: hero alt describes purpose. |
| L22 | Fixed: subjective privacy label absent. |
| L23 | Fixed: Home title plain/short. |
| L24 | Fixed: description concrete/conditional. |
| R01 | Fixed: README audience copy short. |
| R02 | Fixed: README demo link present. |
| R03 | Fixed: repair heading specific. |
| R04 | Fixed: folder/ZIP wording plain. |
| R05 | Fixed: JSON terminology consistent. |
| R06 | Fixed: JPEG wording conditional. |
| R07 | Fixed: PNG wording conditional. |
| R08 | Fixed: payload wording exact. |
| R09 | Fixed: exact-copy/date terms plain. |
| R10 | Fixed: output implementation jargon absent. |
| R11 | Fixed: export-log name/decision explicit. |
| R12 | Fixed: offline behavior observable. |
| R13 | Fixed: copy-only sentence factual. |
| R14 | Fixed: vague manifest wording absent. |
| R15 | Fixed: Chromium advice absent. |
| R16 | Fixed: Firefox/Safari promise absent. |
| R17 | Fixed: build instruction direct. |
| R18 | Fixed: deployment/fallback wording direct. |
| R19 | Fixed: host description concise/tested. |
| R20 | Fixed: container instructions absent. |
| R21 | Fixed: container runtime/cache claims absent. |
| R22 | Fixed: Sociobot-only provider wording tested. |
| R23 | Fixed: storage terms consistent. |
| R24 | Fixed: source-document heading stands alone. |
| F-2-1 | Fixed: location is conditional; date-only cases test no invented GPS. |
| F-2-2 | Fixed: valid license verification enables >20,000 export. |
| F-3-1 | Fixed: pre-write preview has an atomic claim. |
| F-3-2 | Fixed: README has a neutral source link, not a coverage assertion. |

## Missed leverage

No AI feature is expected: JSON matching and metadata repair are deterministic,
and AI would add privacy exposure without improving the stated job. The
brief-implied imports/exports already exist: folders, multi-ZIP, folder/ZIP
output, export log, and settings transfer. No decorative AI or provider key
was found.

## What would make this perfect

Make **Takeout repair** reach its target, add the two-route navigation/Back
test, then rerun the clean claim suite and live link crawl. With F-4-1 closed,
this review has no remaining finding.
