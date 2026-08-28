# Adversarial first-read review 3 — Takeout Tidy

Date: 2026-08-28

Work order: `takeout-photo-metadata-fixer-review-3`

Candidate and live deployment reviewed: `3c81d6a7fdd91c5f461c5ef2039f9e67f2584d2b`

Live URL: <https://takeout-photo-metadata-fixer.sociobot.in/>

## Verdict: FAIL

The first-read, demo, privacy, routing, and registered-claim checks pass. Two
visitor-facing promises remain outside `.factory/claims.json`. The claims
contract requires every such promise to have one executable sandbox check, so
the release cannot pass while these remain.

## Blocking findings

### F-3-1 — The first-screen preview promise has no registered claim

**Quote and location:** Landing hero, below the two first actions:

> “Preview matches before anything is written.”

`.factory/claims.json` has no `preview-before-write` entry. `demo-sandbox`
checks the sample storage boundary, and the export claims check output after an
export action, but neither asserts the visitor promise that entering the
inspection view has not written an output or persisted an action.

This matters to a person with an irreplaceable photo archive: the sentence is
the reason to click the real-file action without fearing an immediate change.

**Concrete fix:** add an atomic `preview-before-write` claim whose clean-state
test selects a fixture, reaches **Inspect the matches**, and proves no output
folder picker, download, export log, or real-mode storage write occurs before
an explicit export action. Include the hero location in its `where` field.
Alternatively, remove the sentence.

### F-3-2 — README makes an untestable claims-coverage assertion

**Quote and location:** README, after the pricing paragraph:

> “Every public promise is mapped to an executable browser check in claims.json.”

There is no entry for this assertion in `.factory/claims.json`. The existing
contract test proves that registry IDs have tags; it cannot prove that *every*
public promise has been identified, as F-3-1 demonstrates. “Executable browser
check” is also internal test jargon rather than useful first-read product copy.

**Concrete fix:** delete this sentence, or replace it with the non-assertive
source-document link “See `.factory/claims.json` for the registered checks.”
Do not retain an absolute coverage claim unless a bounded, executable audit is
defined and registered.

## Cold first read

Fresh Chromium contexts loaded the live site at scroll position zero, at 390 ×
844 and 1440 × 900. Neither context recorded a console error or horizontal
overflow.

| Question | Answer before scrolling |
| --- | --- |
| What does this do? | It repairs a Google Photos Takeout by restoring dates and any location supplied in a Google JSON file, removing exact copies, and renaming files. |
| For whom? | People leaving Google Photos. |
| What should I click first? | **Try it with sample data**. The neighboring note says the next state is a preview. |

The evidence is the visible headline **“Repair your Google Photos Takeout”**,
the 20-word audience sentence, the two adjacent first actions, and the three
facts for device-only handling, offline use after first load, and the free
20,000-file limit. This first-screen check passes.

The mobile page uses the documented paper archive-bench treatment—ink-blue
serif display type, taped paper panels, coral paper-tab action, and the archive
sorter art—rather than a generic SaaS hero. This check passes.

## Demo, sandbox, privacy, and offline checks

- Clicking **Try it with sample data** from the cold home page navigated to
  `/demo` in one click. The first demo screen already displayed seven
  realistic rows: a JPEG, exact album copy, PNG, unmatched JPEG, MP4, HEIC,
  and HEIF.
- The persistent banner was exactly **“Demo — sample data, nothing is saved”**
  with **Reset demo** and **Start for real**. Changing a demo checkbox and
  waiting for **“Sample data reset.”** restored its default value.
- In a fresh live context, a pre-existing real localStorage marker and the
  `takeout-tidy` database list were byte-for-byte unchanged after demo changes
  and reset. Source review confirms `enterDemo` uses `createDemoScan()` and
  does not call the real storage loaders or savers.
- A live `/demo` service-worker-controlled page reloaded while offline and
  downloaded the repaired ZIP. The observed flow had no off-origin requests
  and no request bodies.

The demo and storage boundary therefore pass. F-3-1 is only the missing
registry coverage for the separate first-screen wording.

## Claims execution

I read all 24 entries in `.factory/claims.json`. From the clean clone
`/tmp/takeout-review3-clean.RSKGfE` I ran `npm ci --ignore-scripts`, `npm test`,
`npm run build`, and each registry `test` command separately. All completed
successfully. The 24 command IDs were:

`demo-sandbox`, `local-processing`, `no-account`, `jpeg-repair`, `png-repair`,
`exact-copy-dedupe`, `date-rename`, `copy-only-media`, `pixel-preservation`,
`export-log`, `folder-export`, `google-json-match`, `offline-reload`,
`free-file-limit`, `one-time-price`, `large-library-unlock`, `folder-picker`,
`zip-import`, `settings-transfer`, `storage-allowlist`, `node-runtime`,
`build-output`, `static-host-security`, and `billing-boundary`.

The clean clone produced `dist/`; `npm test` passed 15/15. The full clean-clone
`npm run test:e2e` also passed after the individual claim commands. Registered
claims therefore pass; F-3-1 and F-3-2 are unlisted claims discovered by the
required live-copy cross-check.

## Copy audit

Counts use the plain-words convention: hyphenated terms, filenames, and
numbers are one word each. The first table includes all landing prose; the
second includes its headings, navigation, and actions because each must stand
alone. The README table lists every prose sentence plus all headings and link
labels. `F-3-1` and `F-3-2` are the only flags; no string exceeds 22 words,
uses a banned marketing adjective, changes a core term, or uses a non-result
action label.

### Landing prose

| Copy | Words | Result |
| --- | ---: | --- |
| Private photo repair | 3 | Pass |
| Repair your Google Photos Takeout | 6 | Pass |
| For people leaving Google Photos, restore dates and locations saved in Google JSON files, remove exact copies, and rename files. | 20 | Pass |
| Preview matches before anything is written. | 6 | **F-3-1** |
| Photos stay on this device. | 5 | Pass — `local-processing` |
| Works offline after the first load. | 6 | Pass — `offline-reload` |
| Free for up to 20,000 files. | 7 | Pass — `free-file-limit` |
| Takeout files in. | 3 | Pass |
| Photos sorted by date, with exact copies removed. | 8 | Pass — `date-rename`, `exact-copy-dedupe` |
| Choose an extracted folder or one or more Takeout ZIP files. | 11 | Pass — `folder-picker`, `zip-import` |
| Read files from a folder you select | 7 | Pass — `folder-picker` |
| Import one or more ZIP files | 6 | Pass — `zip-import` |
| Repairs dates and any location in Google JSON files for JPEG and PNG photos. | 14 | Pass — `jpeg-repair`, `png-repair` |
| Copies HEIC, HEIF, and video files without changing their metadata. | 10 | Pass — `copy-only-media` |
| Photo pixels are not changed. | 5 | Pass — `pixel-preservation` |
| Matches JSON files, shortened Google filenames, and duplicate album filenames. | 10 | Pass — `google-json-match` |
| Adds the Google date and any location in its Google JSON file to each supported photo. | 16 | Pass — `jpeg-repair`, `png-repair` |
| Skips exact copies, renames files by date, and logs each result. | 11 | Pass — export claims |
| The repair runs in your browser. | 6 | Pass — `local-processing` |
| It needs no account and sends no photo, filename, or Google JSON data to a server. | 16 | Pass — `no-account`, `local-processing` |
| A $12 one-time unlock removes the file limit. | 8 | Pass — `large-library-unlock` |
| There is no subscription. | 4 | Pass — `one-time-price` |
| Repair Google Photos dates on your device. | 7 | Pass — local JPEG/PNG repair coverage |

### Landing headings, navigation, and actions

| Copy | Words | Result |
| --- | ---: | --- |
| Takeout Tidy | 2 | Pass |
| Demo | 1 | Pass |
| Takeout repair | 2 | Pass |
| Privacy | 1 | Pass |
| Try it with sample data | 5 | Pass — result-naming action |
| Choose your Takeout files | 4 | Pass — result-naming action |
| Choose extracted folder | 3 | Pass — `folder-picker` |
| Choose Takeout ZIP files | 4 | Pass — `zip-import` |
| Choose ZIP files, or drag a folder here | 8 | Pass — concrete input action |
| Repair in three steps | 4 | Pass |
| How Takeout repair works | 4 | Pass |
| Match photos to Google JSON files | 6 | Pass |
| Keep the original photo pixels | 5 | Pass |
| Export repaired files | 3 | Pass |
| Read the privacy policy | 4 | Pass |
| Large libraries | 2 | Pass |
| Repair up to 20,000 files free | 6 | Pass |
| Buy the $12 unlock | 4 | Pass — literal paid action |
| Terms | 1 | Pass |
| Export settings | 2 | Pass — `settings-transfer` |
| Import settings | 2 | Pass — `settings-transfer` |
| Built by Param Factory · Paper archive bench · Build 1.0.2 · polish 2 | 10 | Pass |

### README prose

| Copy | Words | Result |
| --- | ---: | --- |
| Repair Google Photos Takeout dates and locations saved in Google JSON files. | 12 | Pass — conditional location wording |
| Takeout Tidy is for people leaving Google Photos with wrong dates, repeated album copies, or separate Google JSON files. | 19 | Pass |
| Imports an extracted folder or one or more Takeout ZIP files. | 10 | Pass — import claims |
| Matches photos to standard, shortened, and duplicate-album Google JSON filenames. | 10 | Pass — `google-json-match` |
| Adds the Google date and any location in its Google JSON file to JPEG and PNG metadata. | 17 | Pass — repair claims |
| Keeps photo payload bytes and copies HEIC, HEIF, and video files unchanged. | 11 | Pass — payload and copy-only claims |
| Can skip exact copies and rename repaired files by date. | 9 | Pass — dedupe and rename claims |
| Adds `takeout-tidy-manifest.json` with one decision for each media file. | 8 | Pass — `export-log` |
| Photo, filename, and Google JSON data stay on the device during repair and export. | 14 | Pass — `local-processing` |
| The demo can reload and export offline after its first load. | 11 | Pass — `offline-reload` |
| Repair is free for up to 20,000 media files. | 9 | Pass — `free-file-limit` |
| A $12 one-time unlock removes that limit with no subscription. | 10 | Pass — pricing and unlock claims |
| Every public promise is mapped to an executable browser check in claims.json. | 12 | **F-3-2** |
| Use Node.js 20 or newer. | 6 | Pass — `node-runtime` |
| Open the local URL shown by Vite. | 7 | Pass — instruction, not product claim |
| The sample route is `/demo` or `/?demo=1`. | 8 | Pass — live route checked |
| The production build is in `dist/`. | 6 | Pass — `build-output` |
| Its root contains `index.html`, the manifest, service worker, offline page, sitemap, and static-host configuration. | 11 | Pass — `build-output` |
| The static-host file sets the content policy, frame protection, permissions, file types, and cache rules. | 15 | Pass — `static-host-security` |
| Deploy `dist/` as a static site. | 6 | Pass — instruction |
| Send app routes such as `/demo` to `index.html`. | 8 | Pass — `build-output` |
| The buy link and license check use Sociobot endpoints. | 9 | Pass — `billing-boundary` |
| The app does not load payment-provider code. | 7 | Pass — `billing-boundary` |
| Set these variables only for registered replacements: | 8 | Pass — configuration instruction |
| Keep an untouched copy of the original Takeout. | 8 | Pass — safety instruction |
| Folder permission is requested only after you choose the folder action. | 11 | Pass — `folder-picker` |
| Real mode stores repair settings, the last export summary, and an activated license. | 12 | Pass — `storage-allowlist` |
| Demo mode uses memory and leaves real storage unchanged. | 9 | Pass — `demo-sandbox` |
| Read the deployed privacy policy and terms. | 7 | Pass — link instruction |
| Licensed under the MIT License. | 5 | Pass |

### README headings and labels

| Copy | Words | Result |
| --- | ---: | --- |
| Takeout Tidy | 2 | Pass |
| Live product | 2 | Pass |
| One-click sample | 2 | Pass |
| What Takeout Tidy repairs | 4 | Pass |
| Run locally | 2 | Pass |
| Test and build | 3 | Pass |
| Deploy | 1 | Pass |
| Privacy and safety | 3 | Pass |
| Project source documents | 3 | Pass |
| Product scope | 2 | Pass |
| Visual system and asset provenance | 5 | Pass |
| Demo contract | 2 | Pass |
| Repair evidence | 2 | Pass |

Terminology is consistent: **Google JSON file**, **exact copy**, **repaired
export**, **Takeout files**, **export log**, and **location**. The literal paid
action uses “unlock,” the sole allowed use of that otherwise banned word.

## Structure, accessibility, and route checks

| Check | Result |
| --- | --- |
| Title pattern | Pass: Home is `Takeout Tidy — repair Google Photos dates`; Demo, Privacy, Terms, and 404 have route-specific titles. |
| Metadata | Pass: `lang=en`, one h1, main landmark, description, canonical, OG/Twitter image, SVG favicon, and Apple touch icon on Home, Demo, Privacy, Terms, and 404. |
| Direct routes and 404 | Pass: `/`, `/demo`, `/privacy/`, `/terms/`, `/offline.html`, `/sitemap.xml`, and `/robots.txt` returned 200; an unknown route returned a styled 404. |
| History and focus | Pass: Demo → Privacy and browser Back restored the route, focused `#page-title`, and updated the polite live region. |
| Link crawl | Pass: all rendered non-fragment links returned 200, including the Sociobot buy link. |
| Shared shell | Pass: all app routes have a skip link, header, footer, Privacy/Terms links, factory credit, and build identifier. |
| Accessibility | Pass: the clean-clone E2E axe check reported no serious or critical violations for Home, Demo, Privacy, Terms, and 404 in desktop and mobile projects. |
| Responsive controls | Pass: the 390 px page has no horizontal overflow; existing clean E2E checks verify 44 px filters, demo controls, and drop action. |

## Earlier-finding verification

I read `review-1.md`, `polish-1.md`, `review-2.md`, `polish-2.md`, and the
previous handoff. I rechecked the result against the live site and source.
Every earlier finding below is fixed; this review’s F-3 findings are new
coverage gaps.

| Earlier ID | Current verification |
| --- | --- |
| B1 | Fixed: cold first screen names the job, audience, first action, next state, and three facts. |
| B2 | Fixed: `/demo` is populated, bannered, resettable, and memory-isolated. |
| B3 | Fixed: 24 unique registry IDs have one tagged clean-state test each. |
| B4 | Fixed: real Demo/Privacy/Terms views and a styled HTTP 404 work on direct load. |
| M1 | Fixed: legal and offline pages are self-styled with no console errors. |
| M2 | Fixed: per-route metadata, social art, icons, robots, and sitemap are published. |
| M3 | Fixed: the shared shell, route announcement, and h1 focus work after navigation and Back. |
| M4 | Fixed: landing order, three facts, $12 price, and 20,000-file scope are present. |
| M5 | Fixed: the ZIP/drop action is a pointer- and keyboard-operable button. |
| m1 | Fixed: filter, chooser, and demo controls meet 44 px in the E2E check. |
| U01 | Fixed: local repair wording maps to request-intercepted browser processing. |
| U02 | Fixed: description outcomes map to atomic repair, dedupe, naming, and privacy claims. |
| U03 | Fixed: hero wording is conditional on location data and maps to atomic claims. |
| U04 | Fixed: device-only processing is request-intercepted. |
| U05 | Fixed: offline reload, repair, and export pass. |
| U06 | Fixed: date sorting and exact-copy removal are separately asserted. |
| U07 | Fixed: unsupported memory comparison is absent. |
| U08 | Fixed: unsupported browser-fallback guarantee is absent. |
| U09 | Fixed: subjective browser ranking is absent. |
| U10 | Fixed: absolute modern-browser wording is absent. |
| U11 | Fixed: JPEG location wording is conditional and date-only output has no GPS directory. |
| U12 | Fixed: HEIC, HEIF, and MP4 are byte-equal copy-only output. |
| U13 | Fixed: photo payload bytes are compared after metadata insertion. |
| U14 | Fixed: local-data and no-account statements are separately tested. |
| U15 | Fixed: offline promise is bounded to after the first load. |
| U16 | Fixed: zero-byte marketing badge is absent; request bodies are inspected. |
| U17 | Fixed: standard, shortened, and duplicate filename forms are seeded. |
| U18 | Fixed: JPEG and PNG date-plus-conditional-location output is parsed. |
| U19 | Fixed: pixel payload preservation is asserted. |
| U20 | Fixed: skip, dated name, and per-media log outcomes are atomic. |
| U21 | Fixed: runtime art-provenance claim is absent; provenance remains in design documentation. |
| U22 | Fixed: complete browser-local repair is request-intercepted. |
| U23 | Fixed: folder and multi-ZIP imports are independently exercised. |
| U24 | Fixed: all named Google JSON matching forms are paired in demo. |
| U25 | Fixed: all three JPEG date tags plus conditional GPS are parsed. |
| U26 | Fixed: PNG `eXIf` date tags plus conditional GPS are parsed. |
| U27 | Fixed: exact-byte dedupe and restored-date paths are asserted. |
| U28 | Fixed: ZIP and selected-folder exports are observed. |
| U29 | Fixed: both export modes contain a seven-decision JSON log. |
| U30 | Fixed: offline demo reload/export is demonstrated without PWA jargon. |
| U31 | Fixed: full demo privacy capture verifies same-origin, bodyless requests. |
| U32 | Fixed: copy-only status and byte equality replace the reliability judgment. |
| U33a | Fixed: subjective Chromium ranking is absent. |
| U33b | Fixed: unverified Firefox/Safari promise is absent. |
| U34 | Fixed: package engines require Node 20 or newer. |
| U35 | Fixed: the clean build produces `dist/index.html`. |
| U36 | Fixed: documented PWA, metadata, and static-host files exist in `dist/`. |
| U37 | Fixed: static-host headers, MIME, cache, and route rules are parsed in test. |
| U38 | Fixed: irrelevant container deployment claims are absent. |
| U39 | Fixed: 20,000 is allowed and 20,001 is gated. |
| U40 | Fixed: a recorded valid Sociobot result enables a 20,001-file export. |
| U41 | Fixed: built bundles contain no payment-provider SDK. |
| U42 | Fixed: folder picker is called only after its explicit action. |
| U43 | Fixed: real storage allowlist and demo byte-for-byte isolation are checked. |
| L01 | Fixed: navigation and section use “Takeout repair.” |
| L02 | Fixed: headline names the job. |
| L03 | Fixed: audience/result sentence is 20 words and conditions location data. |
| L04 | Fixed: sample and real-file actions are adjacent. |
| L05 | Fixed: figure caption uses plain date and exact-copy words. |
| L06 | Fixed: memory comparison is absent. |
| L07 | Fixed: “best” and browser ranking are absent. |
| L08 | Fixed: universal browser claim is absent. |
| L09 | Fixed: support wording uses conditional plain location language. |
| L10 | Fixed: copy-only wording is direct. |
| L11 | Fixed: pixel-preservation wording is plain. |
| L12 | Fixed: “Repair in three steps” is concrete. |
| L13 | Fixed: “How Takeout repair works” stands alone. |
| L14 | Fixed: the matching heading names Google JSON files. |
| L15 | Fixed: matching copy names shortened and duplicate-album forms. |
| L16 | Fixed: the pixel heading is concrete. |
| L17 | Fixed: step copy conditions location on its Google JSON file. |
| L18 | Fixed: export heading names the result. |
| L19 | Fixed: skip, naming, and log text maps to three claims. |
| L20 | Fixed: footer names Google Photos date repair on-device. |
| L21 | Fixed: hero alt text describes the transformation in plain terms. |
| L22 | Fixed: subjective privacy label is absent. |
| L23 | Fixed: home title is short and plain. |
| L24 | Fixed: description is concrete and conditional. |
| R01 | Fixed: audience/problem copy is split and below 22 words. |
| R02 | Fixed: README includes the one-click `/demo` link. |
| R03 | Fixed: README heading names Takeout Tidy repairs. |
| R04 | Fixed: folder and multi-ZIP actions replace API jargon. |
| R05 | Fixed: Google JSON-file terminology is consistent. |
| R06 | Fixed: JPEG wording is conditional on JSON location data. |
| R07 | Fixed: PNG wording is conditional on JSON location data. |
| R08 | Fixed: payload wording is plain and tested. |
| R09 | Fixed: exact-copy/date naming terms are plain. |
| R10 | Fixed: output implementation jargon is absent. |
| R11 | Fixed: README names the export-log file and its per-media decision. |
| R12 | Fixed: offline behavior is concrete rather than PWA jargon. |
| R13 | Fixed: copy-only wording is short and factual. |
| R14 | Fixed: vague manifest wording is absent. |
| R15 | Fixed: subjective Chromium recommendation is absent. |
| R16 | Fixed: untested Firefox/Safari promise is absent. |
| R17 | Fixed: build instruction is direct. |
| R18 | Fixed: static route fallback wording is direct and works live. |
| R19 | Fixed: host policy wording is concise and tested. |
| R20 | Fixed: container instruction is absent for this static product. |
| R21 | Fixed: container cache/runtime claims are absent. |
| R22 | Fixed: payment-provider statement is source/bundle-tested. |
| R23 | Fixed: browser storage terms are consistent and enumerated. |
| R24 | Fixed: source-document heading stands alone. |
| F-2-1 | Fixed: all visitor location wording is conditional; date-only JPEG/PNG tests prove no invented GPS. |
| F-2-2 | Fixed: successful mocked license verification removes the 20,001-file export gate. |

## Missed leverage

No additional AI feature is expected. Google JSON matching and metadata writing
are deterministic; an AI call would add privacy exposure without helping the
brief’s core task. The expected import/export leverage is already present:
folder import, multi-ZIP import, folder/ZIP output, export logs, and settings
transfer.

## What would make this perfect

Register and test the first-screen pre-write preview promise, then remove the
README’s unverifiable coverage attestation. Re-run the two affected claim
checks, the complete registry, and this cold-copy cross-check. With no
unlisted claims remaining, the product would satisfy this review.
