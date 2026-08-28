# Adversarial first-read review 2 — Takeout Tidy

Date: 2026-08-28

Work order: takeout-photo-metadata-fixer-review-2

Candidate and live deployment reviewed: 23b3f90ce5ff53c92fff5571ce3d6abb9efe37ee

Live URL: https://takeout-photo-metadata-fixer.sociobot.in/

## Verdict: FAIL

Two blocking honesty/claims-contract findings remain. The core first-read, demo,
routing, accessibility, privacy, and offline checks otherwise pass. Passing a
test that does not assert the whole visitor promise is not a claims pass.

## Cold first read

Fresh Chromium contexts at 390 × 844 and 1440 × 900 loaded at scroll position
zero with no console errors.

| Question | Answer from the first screen |
| --- | --- |
| What does it do? | Repairs a Google Photos Takeout: restores dates and locations, removes exact copies, and renames files. |
| For whom? | People leaving Google Photos. |
| What should I click first? | **Try it with sample data**. The page says the next step is a preview before anything is written. |

The first screen is clear without scrolling. At 390 px it fits the headline,
audience, both actions, and three facts without horizontal overflow. The
paper archive-bench treatment is product-specific rather than a generic SaaS
template.

## Blocking findings

### F-2-1 — U11/U18 regressed: location is promised when the Google JSON has no location

**Exact quotes and locations**

- Landing hero: “For people leaving Google Photos, restore dates and locations, remove exact copies, and rename files on this device.”
- Landing support note: “Repairs dates and locations in JPEG and PNG photos.”
- Landing step 2: “Adds the Google date and location to each supported photo.”
- README: “Adds the Google date and location to JPEG and PNG metadata.”
- claims.json: “The repaired export adds the Google date and location to JPEG photos.” The PNG claim has the same wording.

**Evidence**

I gave the live app, in real mode, a ZIP containing date-only.jpg and matching
Google JSON with a valid capture time and geoData of 0, 0. The preview called it
**Ready**, then the downloaded JPEG contained DateTime and ExifIFD tags but no
GPS IFD pointer. This matches the code: takeout.ts treats 0, 0 as no location
and metadata.ts adds GPS only when both coordinates are finite.

A person with date-only Google JSON is promised a result the product cannot
produce. The current sample and claim tests only use sidecars with coordinates.

**Concrete fix**

Use this condition everywhere the promise appears:

> Adds the Google date and any location in the Google JSON file to each supported photo.

Apply it to the hero, support note, README, Terms, and JPEG/PNG claims. Extend
both repair claim tests with a date-only fixture that proves the date is
written, no GPS directory is invented, and the preview does not say
“location found.” Retain the existing coordinates fixture for the positive path.

### F-2-2 — U40 remains half-fixed: the $12 unlock claim does not prove that it removes the gate

**Exact quotes and locations**

- Landing price panel: “A $12 one-time unlock removes the file limit. There is no subscription.”
- README: “A $12 one-time unlock removes that limit with no subscription.”
- claims.json one-time-price: “The large-library unlock costs $12 once with no subscription.”

The registered one-time-price test only checks the display string and literal
Buy URL. The free-file-limit test confirms that 20,001 files are blocked, but
no test verifies a successful Sociobot license response, removes the 20,001-file
gate, and allows export. The earlier U40 finding required a stubbed Sociobot
endpoint; that observable outcome remains absent.

This leaves the paid result untested: a visitor can buy an unlock because the
page says it removes the limit, while the suite proves only that a sentence and
link exist.

**Concrete fix**

Add a clean-state Playwright fixture that intercepts Sociobot verification with
{ "valid": true }, enters a test license via the real **Verify license** action,
and confirms a 20,001-file preview changes from disabled to an enabled repaired
export. Keep the intercept test-local; demo mode must remain spend-free. Make
that result part of one-time-price or a new atomic large-library-unlock claim.

## Demo, privacy, and offline verification

The first click on **Try it with sample data** opened /demo directly on a
populated inspection screen. It showed a JPEG, duplicate album JPEG, PNG,
unmatched JPEG, and matched MP4, HEIC, and HEIF. The persistent banner read
“Demo — sample data, nothing is saved” and included **Reset demo** and
**Start for real**.

I seeded unrelated localStorage and IndexedDB records in real mode, entered
demo, reset it, and compared them byte-for-byte. They were unchanged. The demo
requested only same-origin static resources and sent no request body. The
registered offline check also reloads /demo after connection disablement and
exports the repaired ZIP.

## Claims execution

I read claims.json and ran every listed command separately in a fresh clone at
23b3f90ce5ff53c92fff5571ce3d6abb9efe37ee. All commands completed
successfully. I also ran the full npm run test:claims suite from that clone;
its ten browser tests exercised all 23 claim tags. This is evidence for the
passing claims, not a waiver for F-2-1 or F-2-2.

| Commands passed |
| --- |
| demo-sandbox, local-processing, no-account, jpeg-repair, png-repair, exact-copy-dedupe, date-rename, copy-only-media, pixel-preservation, export-log, folder-export, google-json-match, offline-reload, free-file-limit, one-time-price, folder-picker, zip-import, settings-transfer, storage-allowlist, node-runtime, build-output, static-host-security, billing-boundary |

Clean-clone checks passed: npm ci --ignore-scripts, npm test (15/15), npm run
build (dist produced), and npm run test:claims.

## Copy audit

Counts use the plain-words convention: hyphenated compounds, filenames, and
numbers count as one word. Buttons and headings are included because they must
stand alone. Apart from F-2-1’s inaccurate location promise and F-2-2’s
untested paid result, no landing or README sentence exceeds 22 words, uses a
banned marketing adjective, changes a core term, or uses a non-result-naming
action.

### Landing prose

| Exact text | Words | Result |
| --- | ---: | --- |
| Private photo repair | 3 | Pass |
| Repair your Google Photos Takeout | 6 | Pass |
| For people leaving Google Photos, restore dates and locations, remove exact copies, and rename files on this device. | 18 | F-2-1 |
| Preview matches before anything is written. | 6 | Pass |
| Photos stay on this device. | 5 | Pass |
| Works offline after the first load. | 6 | Pass |
| Free for up to 20,000 files. | 7 | Pass |
| Takeout files in. | 3 | Pass |
| Photos sorted by date, with exact copies removed. | 8 | Pass |
| Choose an extracted folder or one or more Takeout ZIP files. | 11 | Pass |
| Read files from a folder you select | 7 | Pass |
| Import one or more ZIP files | 6 | Pass |
| Repairs dates and locations in JPEG and PNG photos. | 9 | F-2-1 |
| Copies HEIC, HEIF, and video files without changing their metadata. | 10 | Pass |
| Photo pixels are not changed. | 5 | Pass |
| Matches JSON files, shortened Google filenames, and duplicate album filenames. | 10 | Pass |
| Adds the Google date and location to each supported photo. | 10 | F-2-1 |
| Skips exact copies, renames files by date, and logs each result. | 11 | Pass |
| The repair runs in your browser. | 6 | Pass |
| It needs no account and sends no photo, filename, or Google JSON data to a server. | 16 | Pass |
| A $12 one-time unlock removes the file limit. | 8 | F-2-2 |
| There is no subscription. | 4 | Pass |
| Repair Google Photos dates on your device. | 7 | Pass |

### Landing headings, actions, and navigation

| Exact text | Words | Result |
| --- | ---: | --- |
| Takeout Tidy | 2 | Pass |
| Demo | 1 | Pass |
| Takeout repair | 2 | Pass |
| Privacy | 1 | Pass |
| Try it with sample data | 5 | Pass: names the result |
| Choose your Takeout files | 4 | Pass: names the input |
| Choose extracted folder | 3 | Pass |
| Choose Takeout ZIP files | 4 | Pass |
| Choose ZIP files, or drag a folder here | 8 | Pass |
| Repair in three steps | 4 | Pass |
| How Takeout repair works | 4 | Pass |
| Match photos to Google JSON files | 6 | Pass |
| Keep the original photo pixels | 5 | Pass |
| Export repaired files | 3 | Pass |
| Read the privacy policy | 4 | Pass |
| Large libraries | 2 | Pass |
| Repair up to 20,000 files free | 6 | Pass |
| Buy the $12 unlock | 4 | F-2-2 outcome untested |
| Terms | 1 | Pass |
| Export settings | 2 | Pass |
| Import settings | 2 | Pass |
| Built by Param Factory · Paper archive bench · Build 1.0.1 · polish 1 | 10 | Pass |

### README prose and labels

| Exact text | Words | Result |
| --- | ---: | --- |
| Takeout Tidy | 2 | Pass |
| Repair Google Photos Takeout dates and locations in your browser. | 10 | F-2-1 |
| Takeout Tidy is for people leaving Google Photos with wrong dates, repeated album copies, or separate Google JSON files. | 19 | Pass |
| Live product | 2 | Pass |
| One-click sample | 2 | Pass |
| What Takeout Tidy repairs | 4 | Pass |
| Imports an extracted folder or one or more Takeout ZIP files. | 10 | Pass |
| Matches photos to standard, shortened, and duplicate-album Google JSON filenames. | 10 | Pass |
| Adds the Google date and location to JPEG and PNG metadata. | 10 | F-2-1 |
| Keeps photo payload bytes and copies HEIC, HEIF, and video files unchanged. | 11 | Pass |
| Can skip exact copies and rename repaired files by date. | 9 | Pass |
| Adds takeout-tidy-manifest.json with one decision for each media file. | 8 | Pass |
| Photo, filename, and Google JSON data stay on the device during repair and export. | 14 | Pass |
| The demo can reload and export offline after its first load. | 11 | Pass |
| Repair is free for up to 20,000 media files. | 9 | Pass |
| A $12 one-time unlock removes that limit with no subscription. | 10 | F-2-2 |
| Every public promise is mapped to an executable browser check in claims.json. | 12 | F-2-1/F-2-2 expose incomplete checks |
| Run locally | 2 | Pass |
| Use Node.js 20 or newer. | 6 | Pass |
| Open the local URL shown by Vite. | 7 | Pass |
| The sample route is /demo or /?demo=1. | 8 | Pass |
| Test and build | 3 | Pass |
| The production build is in dist/. | 6 | Pass |
| Its root contains index.html, the manifest, service worker, offline page, sitemap, and static-host configuration. | 11 | Pass |
| The static-host file sets the content policy, frame protection, permissions, file types, and cache rules. | 15 | Pass |
| Deploy | 1 | Pass |
| Deploy dist/ as a static site. | 6 | Pass |
| Send app routes such as /demo to index.html. | 8 | Pass |
| The buy link and license check use Sociobot endpoints. | 9 | F-2-2 needs positive fixture |
| The app does not load payment-provider code. | 7 | Pass |
| Set these variables only for registered replacements: | 8 | Pass |
| Privacy and safety | 3 | Pass |
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

## Previous-finding regression check

I read review-1.md, polish-1.md, and the previous handoff. The following
checks were made against the live page and current source.

| Earlier finding | Current result |
| --- | --- |
| B1 | Fixed: cold mobile and desktop name job, audience, first action, result, privacy, offline, and price. |
| B2 | Fixed: populated in-memory demo, banner, reset, exit, and storage isolation rechecked. |
| B3 | Registry/tag uniqueness passes; F-2-1 and F-2-2 are incomplete claim coverage. |
| B4 | Fixed: direct routes work and unknown route is a designed HTTP 404. |
| M1 | Fixed: legal and offline pages load styled with no CSP console error. |
| M2 | Fixed: all route metadata, social data, favicon, robots, and sitemap present. |
| M3 | Fixed: shared shell and h1 focus after navigation and Back. |
| M4 | Fixed: required landing order, price, and limit are visible. |
| M5 | Fixed: native drop action works by pointer and keyboard. |
| m1 | Fixed: rechecked controls meet 44 px target. |
| U01 | Fixed: local processing is registered and intercepted. |
| U02 | Fixed: description promises map to atomic claims. |
| U03 | Fixed except F-2-1 availability wording. |
| U04 | Fixed: local-device wording has request interception. |
| U05 | Fixed: offline reload/export exercised. |
| U06 | Fixed: dated/deduplicated wording is concrete and tested. |
| U07 | Fixed: unmeasured memory comparison removed. |
| U08 | Fixed: browser guarantee removed; ZIP import tested. |
| U09 | Fixed: subjective folder ranking removed. |
| U10 | Fixed: absolute browser claim removed. |
| U11 | **Regressed: F-2-1.** Date-only media receives no location despite universal wording. |
| U12 | Fixed: copy-only containers are byte-equal in test. |
| U13 | Fixed: photo payload preservation tested. |
| U14 | Fixed: no-account/local-data checks separated. |
| U15 | Fixed: first-load offline behavior tested. |
| U16 | Fixed: demo request capture has no body or off-origin request. |
| U17 | Fixed: all named Google JSON forms are in the fixture. |
| U18 | **Regressed: F-2-1.** Same unqualified location promise. |
| U19 | Fixed: payload comparison asserted. |
| U20 | Fixed: skip, naming, and log outcome asserted. |
| U21 | Fixed: runtime provenance claim removed. |
| U22 | Fixed: local browser repair is tested. |
| U23 | Fixed: folder and multi-ZIP flows independently tested. |
| U24 | Fixed: named matching forms tested. |
| U25 | Fixed except F-2-1 availability wording. |
| U26 | Fixed except F-2-1 availability wording. |
| U27 | Fixed: byte dedupe and dated output tested. |
| U28 | Fixed: ZIP and folder export observed. |
| U29 | Fixed: export log decision per input asserted. |
| U30 | Fixed: offline sample reload/export tested. |
| U31 | Fixed: full demo privacy interception tested. |
| U32 | Fixed: unchanged containers explicit and byte-equal. |
| U33a | Fixed: browser ranking removed. |
| U33b | Fixed: unverified browser promise removed. |
| U34 | Fixed: Node floor asserted. |
| U35 | Fixed: production artifacts asserted. |
| U36 | Fixed: static/PWA files asserted in dist. |
| U37 | Fixed: static-host policy parsed and checked. |
| U38 | Fixed: container claims removed. |
| U39 | Fixed: 20,000/20,001 gate tested. |
| U40 | **Still half-fixed: F-2-2.** Successful verification/unlock is not observed. |
| U41 | Fixed: source/bundle scan excludes provider SDKs. |
| U42 | Fixed: folder picker timing tested. |
| U43 | Fixed: storage allowlist and demo isolation tested. |
| L01–L24 | Fixed except L09/L17, which F-2-1 reintroduces as unqualified location copy. |
| R01–R24 | Fixed except R06/R07/R13 under F-2-1 and R22/U40 under F-2-2. |

## Structure and accessibility verification

- Home, Demo, Privacy, Terms, 404, and Offline each have one h1, main,
  lang=en, route title, description, canonical, Open Graph data, favicon, and
  Apple touch icon.
- Title pattern is correct for Home, Demo, Privacy, Terms, and 404.
- /definitely-not-a-route returns HTTP 404 with the designed archive label.
  Direct links, reloads, history Back, and h1 focus were checked.
- Every rendered home link returned 200 or was a valid same-page fragment:
  home, demo, privacy, terms, and the Sociobot buy URL.
- Axe found zero violations on Home, Demo, Privacy, Terms, and 404 at desktop
  and 390 px widths.

## Missed leverage

No AI feature is expected. Google JSON matching and local metadata writing are
deterministic, while an AI step would add privacy exposure without improving
the stated job. The expected import/export paths already exist: folder,
multi-ZIP, folder output, ZIP output, export log, and settings transfer.

## What would make this perfect

Make location wording conditional on a location being present in Google JSON,
prove date-only and date-plus-location exports, and prove a successful
Sociobot verification removes the 20,001-file gate. Rerun the claim suite and
a fresh cold-browser review after those changes.
