# Adversarial first-read review 1 — Takeout Tidy

Date: 2026-08-28

Work order: `takeout-photo-metadata-fixer-review-1`

Candidate: `c4a54d9734a7096016422f7946ea98f0a9215d93`

Live URL: <https://takeout-photo-metadata-fixer.sociobot.in/>

## Verdict: FAIL

The product has four blocking findings: the first screen does not name its
audience, there is no sample demo or isolated demo storage, the required claim
registry and claim tests do not exist, and unknown/deep routes are rewritten to
the home page instead of a designed 404. Passing implementation tests do not
offset those acceptance failures.

## Blocking findings

### B1 — The first screen does not say who this is for

At 390 × 844 and 1440 × 900, before scrolling, my cold-read answers were:

- **What it appears to do:** combine Google Takeout JSON files with JPEG/PNG
  photos to restore dates and locations, remove exact copies, and rename files.
- **For whom:** cannot determine. The page does not say “people leaving Google
  Photos” or name another user situation. A visitor must already understand
  “Takeout sidecars.”
- **What to click first:** **“Start with your Takeout.”** It scrolls to two real
  file pickers; it does not explain the result or offer a safe sample.

The exact copy that fails is **“Put the dates back where they belong.”** followed
by **“Match Google Takeout sidecars, restore dates and GPS to JPEGs and PNGs,
remove exact duplicates, and rename the result—without uploading a single
photo.”** The headline is metaphorical, the supporting sentence is 24 words,
and neither names the audience. “Sidecars” is unexplained on a first screen.

Concrete fix:

- Headline: **“Repair your Google Photos Takeout”**.
- Audience/result sentence: **“For people leaving Google Photos, restore dates
  and locations, remove exact copies, and rename files on this device.”**
- Primary action: **“Try it with sample data”**.
- Adjacent real action: **“Choose your Takeout files”**, with **“Preview matches
  before anything is written.”**
- Three tested facts: **“Photos stay on this device.” “Works offline after the
  first load.” “Free for up to 20,000 files.”**

### B2 — There is no one-click demo and `/demo` uses the real app namespace

No **“Try it with sample data”** action exists on the first screen or anywhere
in the initial page. Both `/demo` and `/?demo=1` returned the ordinary empty
home page. Neither showed realistic files, a demo banner, **Reset demo**, or
**Start for real**. `.factory/demo.md` is also absent.

The storage check confirms there is no sandbox boundary. In a fresh browser
context, I changed the real `deduplicate` preference to `false`, opened
`/demo`, and read the same value from IndexedDB database `takeout-tidy`. There
is no `demo:` database/key prefix or in-memory demo store. Therefore a route a
visitor reasonably treats as a demo reads the real preference namespace.

This blocks a first-time visitor from seeing the repair result within 30
seconds and prevents a verifier from proving that sample activity leaves real
data untouched.

Concrete fix: make `/demo` load a seeded, already-scanned Takeout containing a
matched JPEG, a GPS PNG, an exact album duplicate, an unmatched file, and a
copy-only HEIC/video. Show the populated inspection screen immediately. Keep a
persistent **“Demo — sample data, nothing is saved”** banner with **Reset demo**
and **Start for real**. Store demo state only in memory or a `demo:` namespace,
discard it on exit, add `.factory/demo.md`, and test that real IndexedDB and
localStorage remain byte-for-byte unchanged.

### B3 — The claims contract is absent; every product claim is unlisted

`.factory/claims.json` does not exist. `rg '@claim|claim:'` found no claim-tagged
tests. There were consequently zero listed claim commands to run. This is not a
claim-test pass: the registry needed to discover the commands is missing.

Each row below is an unlisted-claim finding. A visitor can rely on the quoted
sentence, but the repository provides no required one-to-one claim entry and
tagged sandbox test. Compound claims must be split into atomic entries.

| ID | Where and exact claim | Concrete test or copy fix |
| --- | --- | --- |
| U01 | Title: “repair Google Photos metadata locally” | Add a demo ZIP repair test plus request interception; assert repaired metadata and no non-site request. |
| U02 | Meta description: “Repair Google Photos Takeout dates and GPS metadata locally, remove duplicate copies, and export a clean chronological archive.” | Split into repair, dedupe, naming/order, and local-processing entries; assert exported archive contents. |
| U03 | Hero: “Match Google Takeout sidecars, restore dates and GPS to JPEGs and PNGs, remove exact duplicates, and rename the result—without uploading a single photo.” | Split into matching, JPEG, PNG, dedupe, rename, and zero-upload entries; use only seeded demo data. |
| U04 | Hero: “Runs locally.” | Define “locally”; intercept the complete demo flow and allow only same-origin static asset requests. |
| U05 | Hero: “Works offline after the first visit.” | Add `@claim:offline-reload`; load `/demo`, wait for worker control, go offline, reload, repair, and export. |
| U06 | Figure: “A dated, deduplicated archive out.” | Export demo data and assert dates plus exactly one retained copy per identical byte hash. |
| U07 | Chooser: “Select the extracted folder for the lowest-memory route.” | “Lowest” has no measurable comparison; replace with a bounded statement or add a peak-memory comparison test. |
| U08 | Chooser: “If your browser does not support folder access, choose one or more Takeout ZIPs.” | Run ZIP import/export in each named supported browser. |
| U09 | Folder choice: “Best for large libraries · Chromium” | Remove undefined “Best” or state and test a file-count/memory boundary. |
| U10 | ZIP choice: “Works in every modern browser” | Replace “every modern browser” with named versions and run the claim in that browser matrix. |
| U11 | Support note: “Supported repair: JPEG and PNG date + GPS.” | Parse exported JPEG and PNG metadata from demo data and assert date and location values. |
| U12 | Support note: “HEIC, HEIF, and video are included unchanged and clearly marked.” | Assert byte equality and the exact copy-only status in preview and manifest. |
| U13 | Support note: “No pixel data is re-encoded.” | Compare image payload bytes before and after metadata insertion. |
| U14 | Privacy strip: “There is no upload step, account, tracking script, or hidden cloud process.” | Intercept requests for the entire demo repair/export; assert no auth UI, trackers, or external requests. |
| U15 | Privacy strip: “Turn off Wi-Fi after loading the app—it still works.” | Run the full seeded repair and export after `context.setOffline(true)`. |
| U16 | Privacy strip: “0 bytes uploaded” | Record all request bodies after choosing demo files and assert zero photo, filename, and sidecar bytes leave the page. |
| U17 | How it works: “We account for `.json`, supplemental metadata, truncated names, and album-copy suffixes.” | Seed one case of each name form and assert the expected match. |
| U18 | How it works: “Dates and available GPS coordinates are inserted into JPEG or PNG metadata.” | Parse both exported formats and assert exact date/GPS values. |
| U19 | How it works: “Pixel data is untouched.” | Compare decoded pixel hashes or unchanged image payload bytes. |
| U20 | How it works: “Exact copies are skipped, names become chronological, and every decision is recorded in a manifest.” | Split into three entries; assert dedupe count, filename order/pattern, and one manifest decision per input. |
| U21 | Footer: “Original paper-cut imagery generated for this product.” | Record the source prompt and output hash in a provenance check, or remove the runtime claim. |
| U22 | README: “Takeout Tidy repairs Google Photos Takeout exports entirely in the browser.” | Run the complete demo with external requests blocked and assert a valid export. |
| U23 | README: “Opens an extracted Takeout folder through the File System Access API, or imports one or more Takeout ZIPs.” | Test directory handles and multiple ZIPs separately. |
| U24 | README: “Matches `.json` and `.supplemental-metadata.json` sidecars using paths, JSON titles, copy suffixes, and Google-style truncated names.” | Add fixtures for every listed matching rule and assert the matched partner. |
| U25 | README: “Restores `DateTime`, `DateTimeOriginal`, `DateTimeDigitized`, and available GPS coordinates in JPEG EXIF.” | Parse every named EXIF tag from an exported demo JPEG. |
| U26 | README: “Adds a standards-based PNG `eXIf` chunk with the same date and GPS data.” | Parse the exported PNG chunk and compare exact values to the demo JSON. |
| U27 | README: “Optionally skips byte-identical files using SHA-256, renames files by capture time, and organizes output by year/month.” | Split and assert hash dedupe, rename pattern, and archive paths. |
| U28 | README: “Writes incrementally to a chosen output folder, or downloads a ZIP fallback.” | Instrument folder writes for incremental output and separately inspect the downloaded ZIP. |
| U29 | README: “Includes an auditable JSON manifest in every export.” | Export by folder and ZIP; validate the manifest schema and one decision per input. Replace subjective “auditable.” |
| U30 | README: “Installs as an offline PWA.” | Install/service-worker test from `/demo`, then reload and complete the job offline. |
| U31 | README: “No photo bytes, filenames, or metadata are uploaded.” | Intercept the whole demo flow and inspect request URLs and bodies. |
| U32 | README: “HEIC/HEIF and video sidecars are matched and previewed, but those containers are copied unchanged because safe in-browser metadata rewriting is not yet reliable.” | Test matching, preview status, and byte equality; remove the untestable reliability judgment. |
| U33a | README: “Chromium gives the best experience because it supports direct folder read/write.” | Replace “best” with a named capability and run directory tests in Chromium. |
| U33b | README: “Firefox and Safari can use ZIP import/export.” | Run ZIP import and export tests in Firefox and WebKit. |
| U34 | README: “Requires Node.js 20 or newer.” | Add an `engines.node` constraint and CI/build checks on the minimum supported version. |
| U35 | README: “Static output lands in `dist/`, with `dist/index.html` at its root.” | Build from a clean checkout and assert both paths. |
| U36 | README: “The checked-in `/privacy/`, `/terms/`, offline page, manifest, icons, and service worker are copied into that directory by Vite.” | Build and assert every named artifact in `dist/`. |
| U37 | README: “The build also generates `dist/staticwebapp.config.json` for Standard Static Web Apps: it sends the CSP, clickjacking, Permissions-Policy, manifest MIME type, service-worker cache policy, and immutable cache headers for Vite-hashed assets.” | Parse the generated file and assert each promised header/rule against a served build. |
| U38 | README: “It serves `dist/` on port 8080 as an unprivileged user, preserves SPA routes and service-worker behavior, sets immutable cache headers only for fingerprinted bundles, and sends `no-store` for HTML, the manifest, and the service worker.” | Build/run the container, inspect its user and response headers, and test every cache class. |
| U39 | README: “The free tier handles up to 20,000 media files.” | Seed 20,000 and 20,001 inputs; assert export allowed at the boundary and gated above it. |
| U40 | README: “The optional one-time large-library unlock uses Sociobot billing.” | Use a stubbed Sociobot endpoint; assert one-time-license UI and no direct provider request. |
| U41 | README: “No payment-provider SDK is embedded and no product ID is hardcoded.” | Scan built requests/bundles for provider SDKs and source/build output for a fixed product ID. |
| U42 | README: “Folder permissions are requested by the browser only when needed.” | Stub the directory picker; assert it is not called before the folder action and is called once afterward. |
| U43 | README: “The app stores only repair preferences, a summary of the last run, and an optional verified-license result locally.” | Enumerate IndexedDB, localStorage, Cache Storage, and OPFS after real and demo flows; assert the documented allowlist and isolated demo namespace. |

Concrete fix: add `.factory/claims.json`; rewrite vague/absolute claims; give
every remaining atomic claim exactly one `@claim:<id>` test that starts at
`/demo` in clean storage. The existing untagged tests may be reused only after
they exercise the demo entry point and are mapped one-to-one.

### B4 — Routing is broken for demo and not-found URLs

`/definitely-not-a-route` returned HTTP 200 with the home title, home canonical,
and home `<h1>`. `/demo` did the same. There is no designed 404 route. This is a
broken route contract: a visitor can follow or type a deep URL and receive an
unrelated tool screen with no explanation.

Concrete fix: implement real route rendering for `/demo`, `/privacy`, `/terms`,
and a product-styled 404. Unknown paths must show the archive-bench 404 with a
clear **Return to repair tool** link and correct title/canonical; configure the
host to return an actual 404 where supported. Add direct-load, reload,
back/forward, title, focus, and not-found tests.

## Major and minor findings

### M1 — CSP strips all styling from Privacy, Terms, and Offline pages

Opening `/privacy/` and `/terms/` logs:

> Applying inline style violates the following Content Security Policy directive `style-src 'self'` ... The action has been blocked.

Both pages ship their only CSS in an inline `<style>`, while the live CSP allows
only self-hosted styles. The mobile pages therefore render as unstyled browser
defaults and produce console errors. `offline.html` has the same construction.
This contradicts the no-console-error gate and breaks the visual identity on
required routes.

Concrete fix: move this CSS into a hashed self-hosted stylesheet shared by all
routes (preferred), or use a generated CSP hash. Add console-error and visual
style assertions for all three pages.

### M2 — Required route metadata and site files are missing

The home title is 52 characters and follows the required pattern; home also has
one `<h1>`, `lang`, a description, canonical, SVG favicon, and theme color.
However, home has no Open Graph title/description/image, Twitter card, or
180-pixel apple-touch icon. Privacy and Terms have route titles and one `<h1>`,
but no description, canonical, Open Graph/Twitter data, or favicon links.
`/sitemap.xml` is not a sitemap: it returns the home HTML through the SPA
fallback with status 200. `robots.txt` does not name a sitemap.

Concrete fix: add route-specific description/canonical/OG/Twitter metadata,
the product-derived 1200 × 630 image, SVG favicon and apple-touch icon to every
route. Generate a real XML sitemap for `/`, `/demo`, `/privacy/`, and `/terms/`,
and reference it from `robots.txt`.

### M3 — Route focus and the standard shell are not consistent

After selecting the header Privacy link, `document.activeElement` was `BODY`,
not the new `<h1>`. It remained `BODY` after Back. Privacy and Terms have no
skip link, product header, standard footer, **Built by Param Factory** line, or
version/build id. The home footer also omits the factory credit and build id.

Concrete fix: use the shared header/footer on every route. On each route change
focus a `tabindex="-1"` `<h1>` and announce it in a polite live region; test
direct load plus Back/Forward. Add the required factory credit and build id.

### M4 — The landing skeleton omits required decisions

The first screen gives two facts in one line—**“Runs locally. Works offline
after the first visit.”**—rather than privacy, offline, and price as three short
facts. No price is shown anywhere on the initial landing page; the paid gate is
rendered only after more than 20,000 scanned files and still says only
“one-time license.” The section order is product → privacy → how it works,
rather than product → how it works → privacy.

Concrete fix: show the three tested facts beside the two first actions, publish
the exact one-time price and what it unlocks in a landing section, and move the
three-step explanation before the privacy section.

### M5 — The drop area has button semantics but no pointer activation

**“Or drag a folder or ZIP files onto this paper”** has `role="button"`,
`tabindex="0"`, and a pointer cursor. Enter/Space opens the ZIP chooser, but
there is no `click` listener. A visitor who taps the button-like region gets no
response.

Concrete fix: make it a real `<button>` that opens the ZIP chooser on click,
Enter, and Space, while retaining drag/drop on its container; or remove button
semantics and the pointer cursor. Add keyboard and touch/click tests.

### m1 — File-filter touch targets are below the baseline

The result filter controls have `min-height: 40px`, below the required 44 px.
Concrete fix: use at least 44 px in both desktop and 390 px layouts and assert
the computed bounding boxes.

## Copy audit method

Counts treat a hyphenated compound as one word and a number or code identifier
as one word. Headings, navigation labels, buttons, status labels, and captions
are included because the brief explicitly requires them to make sense out of
context. Repeated copy is listed at each visible occurrence, and accessible
labels/alt text are listed separately. No banned
plain-words terms were found; the flags below cover length, jargon, subjective
adjectives, terminology, standalone headings, and action labels.

## Landing-page copy audit

| # | Exact copy | Words | Flag and proposed rewrite |
| ---: | --- | ---: | --- |
| 1 | Takeout Tidy | 2 | — |
| 2 | How it works | 3 | L01, vague out-of-context heading/link → **How Takeout repair works**. |
| 3 | Privacy | 1 | — |
| 4 | Private photo repair, in your browser | 6 | — |
| 5 | Put the dates back where they belong. | 7 | L02, headline does not name the job → **Repair your Google Photos Takeout**. |
| 6 | Match Google Takeout sidecars, restore dates and GPS to JPEGs and PNGs, remove exact duplicates, and rename the result—without uploading a single photo. | 24 | L03, over 22 words, jargon, no audience, inconsistent “result” → **For people leaving Google Photos, restore dates and locations, remove exact copies, and rename files on this device.** |
| 7 | Start with your Takeout | 4 | L04, action does not name its result → primary **Try it with sample data**; adjacent real action **Choose your Takeout files**. |
| 8 | Runs locally. | 2 | — (unlisted claim U04). |
| 9 | Works offline after the first visit. | 6 | — (unlisted claim U05). |
| 10 | Loose Takeout files in. | 4 | — |
| 11 | A dated, deduplicated archive out. | 5 | L05, “deduplicated archive” is jargon → **Photos sorted by date, with exact copies removed.** |
| 12 | 1 Choose | 2 | — |
| 13 | 2 Inspect | 2 | — |
| 14 | 3 Export | 2 | — |
| 15 | Step 1 | 2 | — |
| 16 | Choose your Takeout | 3 | — |
| 17 | Select the extracted folder for the lowest-memory route. | 8 | L06, “lowest-memory route” is jargon and an undefined comparison → **Choose the extracted folder to use less memory.** |
| 18 | If your browser does not support folder access, choose one or more Takeout ZIPs. | 14 | — |
| 19 | Choose extracted folder | 3 | —; verb names the selected input. |
| 20 | Best for large libraries · Chromium | 5 | L07, subjective adjective and jargon → **Folder import works in Chrome and Edge.** Test named browsers. |
| 21 | Choose Takeout ZIPs | 3 | —; verb names the selected input. |
| 22 | Works in every modern browser | 5 | L08, undefined/absolute marketing claim → **Import ZIP files in Chrome, Edge, Firefox, or Safari.** Test each named browser. |
| 23 | Or drag a folder or ZIP files onto this paper | 10 | —; interaction defect is M5. |
| 24 | Supported repair: JPEG and PNG date + GPS. | 7 | L09, acronym-heavy → **Repairs dates and locations in JPEG and PNG photos.** |
| 25 | HEIC, HEIF, and video are included unchanged and clearly marked. | 10 | L10, “clearly” is subjective → **Copies HEIC, HEIF, and video files without changing their metadata.** |
| 26 | No pixel data is re-encoded. | 5 | L11, “re-encoded” is jargon → **Photo pixels are not changed.** |
| 27 | Your photos stay yours. | 4 | — |
| 28 | There is no upload step, account, tracking script, or hidden cloud process. | 12 | — (unlisted claim U14). |
| 29 | Turn off Wi-Fi after loading the app—it still works. | 10 | — (unlisted claim U15). |
| 30 | 0 bytes uploaded | 3 | — (unlisted quantitative claim U16). |
| 31 | A careful three-step pass | 4 | L12, “careful” is an unsupported marketing adjective → **Repair in three steps**. |
| 32 | What happens on the repair bench | 6 | L13, metaphorical out-of-context heading → **How Takeout repair works**. |
| 33 | Match the sidecars | 3 | L14, jargon → **Match photos to Google JSON files**. |
| 34 | We account for `.json`, supplemental metadata, truncated names, and album-copy suffixes. | 11 | L15, four unexplained technical terms → **Matches JSON files, shortened Google filenames, and duplicate album filenames.** |
| 35 | Repair without re-encoding | 3 | L16, jargon → **Keep the original photo pixels**. |
| 36 | Dates and available GPS coordinates are inserted into JPEG or PNG metadata. | 12 | L17, acronym/metadata jargon → **Adds the Google date and location to each supported photo.** |
| 37 | Pixel data is untouched. | 4 | — |
| 38 | Write a clean archive | 4 | L18, “clean” is subjective and “archive” competes with output/export → **Export repaired files**. |
| 39 | Exact copies are skipped, names become chronological, and every decision is recorded in a manifest. | 15 | L19, “manifest” is jargon and “exact copies” conflicts with “exact duplicates” → **Skips files with identical bytes, renames them by date, and logs each result in `takeout-tidy-manifest.json`.** |
| 40 | Takeout Tidy | 2 | — |
| 41 | Made for leaving the cloud, not joining another one. | 9 | L20, metaphor instead of the named situation → **Built for moving your photos out of Google Photos.** |
| 42 | Privacy | 1 | — |
| 43 | Terms | 1 | — |
| 44 | Export settings | 2 | —; result-naming verb. |
| 45 | Import settings | 2 | —; result-naming verb. |
| 46 | Original paper-cut imagery generated for this product. | 7 | — (unlisted provenance claim U21). |
| 47 | Skip to repair tool | 4 | —; hidden until keyboard focus and names its destination. |
| 48 | Takeout Tidy home | 3 | —; brand-link accessible name. |
| 49 | Primary navigation | 2 | —; navigation accessible name. |
| 50 | Paper-cut photo prints and sidecar cards moving through an archive sorter into a neat stack | 15 | L21, alt text uses unexplained “sidecar” → **Paper photos and Google JSON cards enter a sorter and leave in date order.** |
| 51 | Repair progress | 2 | —; progress-group accessible name. |
| 52 | Choose extracted Takeout folder | 4 | —; file-input accessible name. |
| 53 | Choose extracted Takeout ZIP files | 5 | —; file-input accessible name. |
| 54 | Privacy promise | 2 | L22, subjective accessible name → **Photo data handling**. |
| 55 | Footer navigation | 2 | —; navigation accessible name. |
| 56 | Takeout Tidy — repair Google Photos metadata locally | 7 | L23, browser title uses “metadata” jargon → **Takeout Tidy — repair Google Photos dates**. |
| 57 | Repair Google Photos Takeout dates and GPS metadata locally, remove duplicate copies, and export a clean chronological archive. | 18 | L24, metadata jargon plus subjective “clean archive” → **Fix dates and locations in Google Photos exports. Remove exact copies and rename files without uploading photos.** |

## README copy audit

| # | Exact copy | Words | Flag and proposed rewrite |
| ---: | --- | ---: | --- |
| 1 | Takeout Tidy | 2 | — |
| 2 | Takeout Tidy repairs Google Photos Takeout exports entirely in the browser. | 11 | — (unlisted claim U22). |
| 3 | It is for people who find that their downloaded photos have filesystem dates instead of capture dates, GPS lives in neighboring JSON files, album copies are duplicated, and filenames no longer sort chronologically. | 33 | R01, over 22 words and jargon → **It is for people leaving Google Photos whose downloaded files have wrong dates or repeated album copies. Location data may remain in separate JSON files.** |
| 4 | Live product: `https://takeout-photo-metadata-fixer.sociobot.in` | 6 | R02, links only to the empty real workflow → add **Try the sample: `https://…/demo`**. |
| 5 | What it does | 3 | R03, vague out-of-context heading → **What Takeout Tidy repairs**. |
| 6 | Opens an extracted Takeout folder through the File System Access API, or imports one or more Takeout ZIPs. | 18 | R04, API jargon → **Opens an extracted Takeout folder in Chrome or Edge, or imports one or more Takeout ZIP files.** |
| 7 | Matches `.json` and `.supplemental-metadata.json` sidecars using paths, JSON titles, copy suffixes, and Google-style truncated names. | 16 | R05, dense jargon → **Matches photos to Google JSON files, including shortened names and duplicate album filenames.** |
| 8 | Restores `DateTime`, `DateTimeOriginal`, `DateTimeDigitized`, and available GPS coordinates in JPEG EXIF. | 11 | R06, tag/API jargon → **Writes the original date and available location to JPEG metadata.** Put exact tag names in a technical note. |
| 9 | Adds a standards-based PNG `eXIf` chunk with the same date and GPS data. | 13 | R07, jargon and “standards-based” adjective → **Writes the same date and location to PNG metadata.** |
| 10 | Never re-encodes image pixels. | 4 | R08, jargon → **Never changes photo pixels.** |
| 11 | Optionally skips byte-identical files using SHA-256, renames files by capture time, and organizes output by year/month. | 17 | R09, algorithm and slash jargon → **Can skip files with identical bytes, rename photos by date, and sort them into year and month folders.** |
| 12 | Writes incrementally to a chosen output folder, or downloads a ZIP fallback. | 12 | R10, “incrementally” and “fallback” are implementation jargon → **Writes files as it works, or downloads them in one ZIP file.** |
| 13 | Includes an auditable JSON manifest in every export. | 8 | R11, subjective “auditable” and “manifest” jargon → **Adds a JSON log that lists every exported file and decision.** |
| 14 | Installs as an offline PWA. | 5 | R12, PWA jargon → **Can be installed and reopened offline.** |
| 15 | No photo bytes, filenames, or metadata are uploaded. | 8 | — (unlisted claim U31). |
| 16 | HEIC/HEIF and video sidecars are matched and previewed, but those containers are copied unchanged because safe in-browser metadata rewriting is not yet reliable. | 24 | R13, over 22 words, jargon, and untestable “safe/reliable” judgment → **HEIC, HEIF, and video files appear in the preview. The export copies them without changing their metadata.** |
| 17 | The output manifest says so explicitly. | 6 | R14, jargon and vague “so” → **The JSON log marks each unchanged file as `copied-container-unchanged`.** |
| 18 | Run locally | 2 | — |
| 19 | Requires Node.js 20 or newer. | 6 | — (unlisted claim U34). |
| 20 | Open the local URL shown by Vite. | 7 | — |
| 21 | Chromium gives the best experience because it supports direct folder read/write. | 12 | R15, subjective “best” and slash jargon → **Chrome and Edge can read from and write to selected folders.** |
| 22 | Firefox and Safari can use ZIP import/export. | 8 | R16, slash jargon → **Firefox and Safari can import and download ZIP files.** |
| 23 | Test and build | 3 | — |
| 24 | The reproducible production command is `npm run build`. | 8 | R17, “reproducible production command” jargon → **Run `npm run build` to create the production files.** |
| 25 | Static output lands in `dist/`, with `dist/index.html` at its root. | 12 | — (unlisted claim U35). |
| 26 | Deploy | 1 | — |
| 27 | Deploy `dist/` as a static site with SPA fallback to `index.html`. | 12 | R18, SPA jargon → **Deploy `dist/` as a static site and route unknown app URLs to `index.html`.** |
| 28 | The checked-in `/privacy/`, `/terms/`, offline page, manifest, icons, and service worker are copied into that directory by Vite. | 18 | — (technical but concrete; unlisted claim U36). |
| 29 | The build also generates `dist/staticwebapp.config.json` for Standard Static Web Apps: it sends the CSP, clickjacking, Permissions-Policy, manifest MIME type, service-worker cache policy, and immutable cache headers for Vite-hashed assets. | 32 | R19, over 22 words and dense platform jargon → **The build also creates Azure Static Web Apps settings. They define security headers, file types, and cache rules.** |
| 30 | For the factory container deployment, build and run the included multi-stage image. | 12 | R20, container jargon → **For a container deployment, build and run the included Docker image.** |
| 31 | It serves `dist/` on port 8080 as an unprivileged user, preserves SPA routes and service-worker behavior, sets immutable cache headers only for fingerprinted bundles, and sends `no-store` for HTML, the manifest, and the service worker. | 35 | R21, over 22 words and dense jargon → **The container serves `dist/` on port 8080 as a non-root user. It routes app URLs correctly. It caches versioned assets but not HTML, the manifest, or service worker.** |
| 32 | The free tier handles up to 20,000 media files. | 10 | — (unlisted quantitative claim U39). |
| 33 | The optional one-time large-library unlock uses Sociobot billing. | 8 | — (unlisted claim U40). |
| 34 | The factory can provide these build variables when the product is registered: | 12 | — |
| 35 | `VITE_SOCIOBOT_BUY_URL` — hosted Sociobot purchase URL. | 8 | —; code identifier is necessary here. |
| 36 | `VITE_SOCIOBOT_LICENSE_VERIFY_URL` — Sociobot license verification endpoint. | 9 | —; code identifier is necessary here. |
| 37 | No payment-provider SDK is embedded and no product ID is hardcoded. | 11 | R22, SDK/hardcoded jargon → **The app does not load payment-provider code or contain a fixed product ID.** |
| 38 | Privacy and safety | 3 | — |
| 39 | Keep an untouched copy of the original Takeout. | 8 | — |
| 40 | Folder permissions are requested by the browser only when needed. | 10 | — (unlisted claim U42). |
| 41 | The app stores only repair preferences, a summary of the last run, and an optional verified-license result locally. | 18 | R23, “verified-license result” jargon → **The browser stores repair settings, the last export summary, and an activated license.** |
| 42 | See `public/privacy/index.html` and `public/terms/index.html`. | 10 | — |
| 43 | Project notes | 2 | R24, vague out-of-context heading → **Project source documents**. |
| 44 | Product scope: `.factory/brief.json` | 5 | — |
| 45 | Visual system and asset provenance: `.factory/design.md` | 8 | — |
| 46 | Build handoff: `.factory/handoff.md` | 5 | — |
| 47 | Licensed under the MIT License. | 5 | — |

## Terminology finding

The same concepts change names, increasing the amount a first-time visitor must
decode. Use one term in product copy; reserve exact format names for expandable
technical details.

| Concept | Current terms | Use consistently |
| --- | --- | --- |
| Google metadata file | sidecar, neighboring JSON file, supplemental metadata, `.json`, `.supplemental-metadata.json` | **Google JSON file**; explain “sidecar” once in technical help. |
| Identical item | exact duplicate, exact copy, byte-identical file | **exact copy**. |
| Repaired deliverable | result, clean archive, output, export, dated archive | **repaired export**. |
| File input | Takeout, source, extracted folder, Takeout ZIP | **Takeout files**; then name **folder** or **ZIP** only for the chosen method. |
| Action log | manifest, JSON manifest, auditable manifest, output manifest | **export log**; show the filename once. |
| Location | GPS, GPS coordinates, location data | **location** in visitor copy; **GPS coordinates** in technical details. |

Concrete fix: apply this terminology table to landing, demo, errors, README,
Privacy, Terms, and tests in one edit; then rerun the copy extraction.

## Structure, accessibility, and visual check results

| Check | Result |
| --- | --- |
| Cold 390 px and desktop first screen | **Fail**: audience missing; sample demo missing. No horizontal overflow or load-time console error on home. |
| One `<h1>`, `<main>`, `lang`, heading order | **Pass** on home, Privacy, and Terms. |
| Home title/description/canonical | **Pass**; title is 52 characters. |
| Per-route metadata, OG/Twitter/apple icon | **Fail**; see M2. |
| Designed 404 and deep routes | **Blocking fail**; see B4. |
| Back button and route focus | **Partial**: browser Back changes URL, but focus remains on `BODY`. |
| Link crawl | **Pass** for every rendered anchor on Home, Privacy, and Terms; all targets returned 200 and all three home fragments exist. |
| Sitemap | **Fail**: `/sitemap.xml` returns home HTML with status 200. |
| Header/footer consistency | **Fail**; legal routes lack both and home lacks factory/build text. |
| Serious/critical axe findings | **Pass**: none on Home, Privacy, or Terms at 390 px. This does not detect the CSP-stripped styles. |
| Keyboard/focus style/reduced motion | **Mostly pass** in source and smoke checks; drop-zone pointer activation fails and filter targets are 40 px. |
| Visual identity | **Pass**: the warm paper archive bench, taped photo, serif/sans pairing, square tabs, and restrained motion are product-specific rather than a generic SaaS hero. |
| Asset provenance | **Pass by repository inspection**: `.factory/design.md` and the prompt/source records identify the generated hero and hand-authored icon plan. |
| First-load code size | **Pass**: build emitted 34.42 kB app JS + 12.47 kB archive JS raw (18.78 kB gzip total), below the contract limit. |

## Demo, privacy, and offline evidence

- A fresh home load requested only the live site origin.
- A synthetic one-photo Takeout ZIP scanned and exported successfully. From
  scan through download it made zero network requests.
- After service-worker control, an offline reload showed the repair tool.
- The real export wrote `last-session` into IndexedDB database
  `takeout-tidy`, as documented for real mode.
- `/demo` then exposed the same `takeout-tidy` preference database. No separate
  demo namespace exists.

The first three observations support the implementation, but they do not cure
B2/B3: the required verifier path is the absent seeded demo, and there are no
registered claim tests.

## Commands and outcomes

The supplied checkout was clean at the requested base before review files were
written. Dependencies were installed with `npm ci`.

```text
npm test
  PASS — 12/12 Vitest tests

npm run build
  PASS — TypeScript + Vite + service-worker build; dist/ produced

npm run test:e2e
  PASS — 10/10 Playwright tests across desktop and mobile projects

rg '@claim|claim:' . tests src README.md
  0 matches

.factory/claims.json
  MISSING — therefore zero discoverable claim commands, not a claims pass
```

The existing E2E tests cover the empty home, axe, offline shell, worker update,
and a manually supplied ZIP repair. They do not cover the mandatory one-click
demo, demo isolation/reset, route metadata/404/focus, legal-page CSP console
errors, browser compatibility claims, or claim-to-test registration.
