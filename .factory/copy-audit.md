# Copy audit

Audited: 2026-08-28 after polish 3. Counts treat hyphenated terms, filenames, and numbers as one word. Every visitor-facing sentence in the landing, demo, legal routes, offline page, and README was checked. No sentence exceeds 22 words or uses a banned marketing word. “Unlock” appears only as the literal name of the paid file-limit removal.

## First screen

| Copy | Words | Result |
| --- | ---: | --- |
| Private photo repair | 3 | Pass |
| Repair your Google Photos Takeout | 6 | Pass |
| For people leaving Google Photos, restore dates and locations saved in Google JSON files, remove exact copies, and rename files. | 20 | Pass; location is conditional. |
| Try it with sample data | 5 | Pass |
| Choose your Takeout files | 4 | Pass |
| Preview matches before anything is written. | 6 | Pass; `preview-before-write` proves no output, download, completion, or storage write before export. |
| Photos stay on this device. | 5 | Pass |
| Works offline after the first load. | 6 | Pass |
| Free for up to 20,000 files. | 7 | Pass |
| Takeout files in. | 3 | Pass |
| Photos sorted by date, with exact copies removed. | 8 | Pass |

## Repair tool

| Copy | Words | Result |
| --- | ---: | --- |
| Choose your Takeout files | 4 | Pass |
| Choose an extracted folder or one or more Takeout ZIP files. | 11 | Pass |
| Read files from a folder you select | 7 | Pass |
| Import one or more ZIP files | 6 | Pass |
| Choose ZIP files, or drag a folder here | 8 | Pass |
| Repairs dates and any location in Google JSON files for JPEG and PNG photos. | 14 | Pass; `jpeg-repair` and `png-repair` claims include date-only cases. |
| Copies HEIC, HEIF, and video files without changing their metadata. | 10 | Pass |
| Photo pixels are not changed. | 5 | Pass |
| Nothing has been written. | 4 | Pass |
| Review each match and choose the repaired export. | 8 | Pass |
| The export log lists every written, skipped, and failed file. | 10 | Pass |
| This scan has more than 20,000 files. | 7 | Pass |
| The first 20,000 files are free. | 6 | Pass |
| A $12 one-time license removes the limit. | 8 | Pass |

## Explanation, privacy, and price

| Copy | Words | Result |
| --- | ---: | --- |
| Repair in three steps | 4 | Pass |
| How Takeout repair works | 4 | Pass |
| Matches JSON files, shortened Google filenames, and duplicate album filenames. | 10 | Pass |
| Adds the Google date and any location in its Google JSON file to each supported photo. | 16 | Pass; location is conditional. |
| Skips exact copies, renames files by date, and logs each result. | 11 | Pass |
| The repair runs in your browser. | 6 | Pass |
| It needs no account and sends no photo, filename, or Google JSON data to a server. | 16 | Pass |
| Repair up to 20,000 files free | 6 | Pass |
| A $12 one-time unlock removes the file limit. | 8 | Pass |
| There is no subscription. | 4 | Pass |
| An activated large-library license enables repair above 20,000 media files. | 10 | Pass; `large-library-unlock` claim. |

## Demo and route states

| Copy | Words | Result |
| --- | ---: | --- |
| Demo — sample data, nothing is saved | 7 | Pass |
| Inspect a sample Google Photos Takeout | 7 | Pass |
| This in-memory sample includes repaired photos, an exact copy, an unmatched file, and copy-only media. | 15 | Pass |
| Sample data reset. | 3 | Pass |
| This page is not in the archive | 7 | Pass |
| The address does not match a Takeout Tidy page. | 9 | Pass |
| Return to repair tool | 4 | Pass |

## README and legal copy

| Copy | Words | Result |
| --- | ---: | --- |
| Repair Google Photos Takeout dates and locations saved in Google JSON files. | 12 | Pass; location is conditional. |
| Takeout Tidy is for people leaving Google Photos with wrong dates, repeated album copies, or separate Google JSON files. | 19 | Pass |
| Photo, filename, and Google JSON data stay on the device during repair and export. | 14 | Pass; `local-processing` claim. |
| The demo can reload and export offline after its first load. | 11 | Pass; `offline-reload` claim. |
| Repair is free for up to 20,000 media files. | 9 | Pass; `free-file-limit` claim. |
| A $12 one-time unlock removes that limit with no subscription. | 10 | Pass; `one-time-price` claim. |
| Adds the Google date and any location in its Google JSON file to JPEG and PNG metadata. | 17 | Pass; `jpeg-repair` and `png-repair` claims. |
| The tool adds dates and any location in a Google JSON file to JPEG and PNG files. | 17 | Pass; Terms wording is conditional. |
| Use Node.js 20 or newer. | 6 | Pass; `node-runtime` claim. |
| Deploy `dist/` as a static site with address-bar fallback to `index.html`. | 11 | Pass; `build-output` claim. |
| Demo mode uses memory and leaves real storage unchanged. | 9 | Pass; `demo-sandbox` claim. |
| Photos, videos, ZIP files, Google JSON files, hashes, repaired files, and export logs stay in your browser. | 17 | Pass; `local-processing` claim. |
| A license key is sent to the Sociobot API only after you choose Verify license. | 15 | Pass; specific and user-triggered. |
| The repair workflow needs no account. | 6 | Pass; `no-account` claim. |
| The app does not load payment-provider code. | 7 | Pass; `billing-boundary` claim. |
| Send app routes such as `/demo` to `index.html`. | 8 | Pass; `build-output` claim. |
| See `.factory/claims.json` for the registered product checks. | 7 | Pass; source-document link, not a coverage assertion. |

## Terminology

| Concept | Required term |
| --- | --- |
| Google metadata file | Google JSON file |
| Identical item | exact copy |
| Repaired deliverable | repaired export |
| File input | Takeout files |
| Action log | export log; filename shown once as `takeout-tidy-manifest.json` |
| Geographic metadata | location; GPS appears only in technical tests |
