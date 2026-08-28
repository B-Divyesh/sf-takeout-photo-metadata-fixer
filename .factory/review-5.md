# Adversarial first-read review 5 — Takeout Tidy

Date: 2026-08-28

Work order: `takeout-photo-metadata-fixer-review-5`

Candidate: `13042bc87d2d0dfe9b621d308ed16c1dd8ffb67b`

Live URL: <https://takeout-photo-metadata-fixer.sociobot.in/>

## Verdict: PASS

No blocking or minor finding remains. This review used new Chromium profiles
against the deployed site, a separate clean checkout for tests, and a complete
re-check of the prior-review map. There are no untested registered claims and
no live claim-like sentence that lacks a registry entry.

## Cold first read

Both a 390 × 844 mobile viewport and a 1440 × 900 desktop viewport loaded
without console errors or horizontal overflow.

Before scrolling, the cold-read answers were:

| Question | Answer from the first screen |
| --- | --- |
| What does it do? | It repairs a Google Photos Takeout by putting dates and available locations from Google JSON files into photos, removing exact copies, and renaming files. |
| For whom? | People leaving Google Photos. |
| What should I click first? | **Try it with sample data**; the adjacent real-data action is **Choose your Takeout files** and the result note says “Preview matches before anything is written.” |

The first screen supplies all three answers in direct language. Its three facts
and primary action are visible at 390 px without a scroll. The paper
archive-bench art and squared paper-tab controls are product-specific rather
than a generic SaaS hero.

## Copy audit

Counts treat hyphenated words, filenames, and numbers as one word. The audit
includes headings, actions, and alt text because they are visitor-facing copy.
No row exceeds 22 words. No row uses a banned marketing adjective, inconsistent
term, unexplained heading, or a non-result-naming action. “Unlock” occurs only
as the literal paid-limit removal.

### Landing page

| Copy | Words | Check |
| --- | ---: | --- |
| Takeout Tidy | 2 | Pass |
| Demo | 1 | Pass |
| Takeout repair | 2 | Pass |
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
| Paper photos and Google JSON cards enter a sorter and leave in date order. | 14 | Pass; image alt |
| Takeout files in. | 3 | Pass |
| Photos sorted by date, with exact copies removed. | 8 | Pass |
| Choose / Inspect / Export | 3 total | Pass; progress labels |
| Step 1 | 2 | Pass |
| Choose an extracted folder or one or more Takeout ZIP files. | 11 | Pass |
| Choose extracted folder | 3 | Pass |
| Read files from a folder you select | 7 | Pass |
| Choose Takeout ZIP files | 4 | Pass |
| Import one or more ZIP files | 6 | Pass |
| Choose ZIP files, or drag a folder here | 8 | Pass |
| Repairs dates and any location in Google JSON files for JPEG and PNG photos. | 14 | Pass; conditional location |
| Copies HEIC, HEIF, and video files without changing their metadata. | 10 | Pass |
| Photo pixels are not changed. | 5 | Pass |
| Repair in three steps | 4 | Pass |
| How Takeout repair works | 4 | Pass |
| Match photos to Google JSON files | 6 | Pass |
| Matches JSON files, shortened Google filenames, and duplicate album filenames. | 10 | Pass |
| Keep the original photo pixels | 5 | Pass |
| Adds the Google date and any location in its Google JSON file to each supported photo. | 16 | Pass; conditional location |
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
| Export settings / Import settings | 4 total | Pass; name their result |
| Built by Param Factory · Paper archive bench · Build 1.0.4 · polish 4 | 11 | Pass; provenance/build label |

### README

| Copy | Words | Check |
| --- | ---: | --- |
| Repair Google Photos Takeout dates and locations saved in Google JSON files. | 12 | Pass |
| Takeout Tidy is for people leaving Google Photos with wrong dates, repeated album copies, or separate Google JSON files. | 19 | Pass |
| Live product / One-click sample | 4 total | Pass; descriptive link labels |
| What Takeout Tidy repairs | 4 | Pass |
| Imports an extracted folder or one or more Takeout ZIP files. | 11 | Pass |
| Matches photos to standard, shortened, and duplicate-album Google JSON filenames. | 10 | Pass |
| Adds the Google date and any location in its Google JSON file to JPEG and PNG metadata. | 17 | Pass; conditional location |
| Keeps photo payload bytes and copies HEIC, HEIF, and video files unchanged. | 11 | Pass |
| Can skip exact copies and rename repaired files by date. | 10 | Pass |
| Adds `takeout-tidy-manifest.json` with one decision for each media file. | 9 | Pass |
| Photo, filename, and Google JSON data stay on the device during repair and export. | 14 | Pass |
| The demo can reload and export offline after its first load. | 11 | Pass |
| Repair is free for up to 20,000 media files. | 9 | Pass |
| A $12 one-time unlock removes that limit with no subscription. | 10 | Pass |
| See `.factory/claims.json` for the registered product checks. | 7 | Pass; neutral source-document link |
| Run locally / Test and build / Deploy / Privacy and safety / Project source documents | 17 total | Pass; standalone headings |
| Use Node.js 20 or newer. | 6 | Pass |
| Open the local URL shown by Vite. | 7 | Pass |
| The sample route is `/demo` or `/?demo=1`. | 7 | Pass |
| The production build is in `dist/`. | 6 | Pass |
| Its root contains `index.html`, the manifest, service worker, offline page, sitemap, and static-host configuration. | 12 | Pass |
| The static-host file sets the content policy, frame protection, permissions, file types, and cache rules. | 15 | Pass |
| Deploy `dist/` as a static site. | 6 | Pass |
| Send app routes such as `/demo` to `index.html`. | 8 | Pass |
| The buy link and license check use Sociobot endpoints. | 9 | Pass |
| The app does not load payment-provider code. | 7 | Pass |
| Set these variables only for registered replacements: | 7 | Pass |
| Keep an untouched copy of the original Takeout. | 8 | Pass |
| Folder permission is requested only after you choose the folder action. | 11 | Pass |
| Real mode stores repair settings, the last export summary, and an activated license. | 13 | Pass |
| Demo mode uses memory and leaves real storage unchanged. | 9 | Pass |
| Read the deployed privacy policy and terms. | 7 | Pass |
| Licensed under the MIT License. | 6 | Pass; verified by `LICENSE` |

Terminology remains consistent: **Google JSON file**, **exact copy**,
**repaired export**, **Takeout files**, **export log**, and **location**.

## Demo, privacy, and claims

- The first-screen sample action reached `/demo` in one click. The first demo
  render already showed seven realistic media rows: matched JPEG/PNG, an exact
  album copy, an unmatched JPEG, HEIC, HEIF, and MP4 copy-only cases.
- The persistent banner read **“Demo — sample data, nothing is saved”** and
  exposed **Reset demo** and **Start for real**. After toggling exact-copy
  removal off, Reset restored it to its default on the live site.
- A real localStorage marker and IndexedDB snapshot were byte-for-byte
  unchanged across demo entry, option change, reset, and exit. Exit removed the
  banner and focused the real-mode h1.
- After service-worker control, an offline reload of live `/demo` still showed
  the populated inspection screen and downloaded `takeout-tidy-repaired.zip`.
  Request capture observed no foreign origin and no request body.
- `.factory/claims.json` has 25 atomic IDs. In a clean clone at
  `/tmp/takeout-review5-clean.LOTi54/repo`, every listed command was run
  separately: **25/25 passed**. `npm test` passed **15/15** and `npm run build`
  passed, producing `dist/`.
- The live landing page and README were cross-checked against those IDs.
  All outcome, privacy, price, limit, and deployment statements map to the
  registry; no unlisted claim was found.

## Prior-history confirmation

Every earlier review, polish report, and the previous handoff was read. The
following check is against both the current source and the live deployment,
not merely the prior “fixed” label. All listed IDs remain fixed.

| Earlier IDs checked individually | Current confirmation |
| --- | --- |
| B1, B2, B3, B4 | Cold first screen, populated memory-only demo, 25-entry claim registry, direct routes, and designed HTTP 404 all work live. |
| M1, M2, M3, M4, M5, m1 | Live CSP has no console violation; metadata/social assets exist; shared skip/header/footer and focus transfer work; the required landing order/price is present; the drop control is a native button; controls meet the 44 px test coverage. |
| U01–U06 | Local repair, metadata, conditional location, offline behavior, date naming, and exact-copy removal map to passing atomic claims. |
| U07–U10 | Unsupported memory/browser superlatives remain absent; direct folder/ZIP actions remain present and tested. |
| U11–U20 | JPEG/PNG conditional metadata, copy-only media, photo payload retention, no-account/local processing, filename matching, dedupe, rename, and per-input log behavior all pass their named clean-state checks. |
| U21–U32 | Runtime provenance marketing and untestable format reliability wording remain absent; README/app behavior is represented by the corresponding local-processing, import/export, offline, and copy-only claims. |
| U33a, U33b, U34–U43 | Browser rankings and unverified cross-browser claims remain absent; Node floor, build files, host policy, file limit, price/license path, Sociobot-only billing, folder timing, and storage isolation pass. |
| L01–L24 | Current live landing labels retain the plain terms, conditional location wording, meaningful hero alt, result-naming actions, and concise title/description shown in this review’s copy audit. |
| R01–R24 | Current README retains its demo URL, plain import/export vocabulary, conditional location wording, tested storage/billing/deployment statements, and standalone headings. |
| F-2-1, F-2-2 | Location remains conditional on a Google JSON value, including date-only tests; the recorded valid Sociobot response removes the 20,001-file gate. |
| F-3-1, F-3-2 | Preview-before-write remains registered and tested; the README makes a neutral registry reference rather than a coverage assertion. |
| F-4-1 | `/#how-it-works` scrolls to and focuses “How Takeout repair works”; Back returns to the initial page heading. |

## Structure and accessibility

- `/`, `/demo`, `/privacy/`, `/terms/`, and an unknown URL each had one h1,
  one main landmark, `lang="en"`, a route-specific title/description/canonical,
  favicon, and Open Graph/Twitter data. The unknown URL returned HTTP 404 and
  rendered the archive-bench return route.
- The exact live titles follow the required pattern: **Takeout Tidy — repair
  Google Photos dates**, **Demo — Takeout Tidy**, **Privacy — Takeout Tidy**,
  **Terms — Takeout Tidy**, and **Page not found — Takeout Tidy**.
- Browser navigation to Demo and back put focus on the destination h1. The
  fragment route also focuses its target h2 and the polite route announcer is
  in the source.
- Every discovered internal link and the Sociobot purchase link returned 200.
  The shared header/footer include Privacy and Terms. `robots.txt`, sitemap,
  manifest, worker, offline page, social preview, and icons returned 200 with
  appropriate types; CSP, `nosniff`, and strict-origin referrer policy were
  present.
- Axe reported zero serious or critical violations on Home, Demo, Privacy,
  Terms, and 404. Live desktop and 390 px mobile checks recorded no console
  errors and no horizontal overflow.

## Missed-leverage check

No finding. The brief’s obvious value is local folder/ZIP import, preview,
metadata repair, exact-copy removal, renaming, and folder/ZIP export; each is
present. An AI step would not improve deterministic sidecar matching and would
undercut the private, offline-first job, so its absence is appropriate. There
is no decorative AI feature or embedded provider key.

## What would make this perfect

No corrective product change is identified. Preserve the one-click isolated
demo, conditional location language, and clean-state claim checks when making
future release changes.
