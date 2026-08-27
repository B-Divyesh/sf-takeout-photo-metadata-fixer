# Takeout Tidy

Takeout Tidy repairs Google Photos Takeout exports entirely in the browser. It is for people who find that their downloaded photos have filesystem dates instead of capture dates, GPS lives in neighboring JSON files, album copies are duplicated, and filenames no longer sort chronologically.

Live product: <https://takeout-photo-metadata-fixer.sociobot.in>

## What it does

- Opens an extracted Takeout folder through the File System Access API, or imports one or more Takeout ZIPs.
- Matches `.json` and `.supplemental-metadata.json` sidecars using paths, JSON titles, copy suffixes, and Google-style truncated names.
- Restores `DateTime`, `DateTimeOriginal`, `DateTimeDigitized`, and available GPS coordinates in JPEG EXIF.
- Adds a standards-based PNG `eXIf` chunk with the same date and GPS data.
- Never re-encodes image pixels.
- Optionally skips byte-identical files using SHA-256, renames files by capture time, and organizes output by year/month.
- Writes incrementally to a chosen output folder, or downloads a ZIP fallback.
- Includes an auditable JSON manifest in every export.
- Installs as an offline PWA. No photo bytes, filenames, or metadata are uploaded.

HEIC/HEIF and video sidecars are matched and previewed, but those containers are copied unchanged because safe in-browser metadata rewriting is not yet reliable. The output manifest says so explicitly.

## Run locally

Requires Node.js 20 or newer.

```sh
npm install
npm run dev
```

Open the local URL shown by Vite. Chromium gives the best experience because it supports direct folder read/write. Firefox and Safari can use ZIP import/export.

## Test and build

```sh
npm test
npm run build
npm run test:e2e
```

The reproducible production command is `npm run build`. Static output lands in `dist/`, with `dist/index.html` at its root.

## Deploy

Deploy `dist/` as a static site with SPA fallback to `index.html`. The checked-in `/privacy/`, `/terms/`, offline page, manifest, icons, and service worker are copied into that directory by Vite. The build also generates `dist/staticwebapp.config.json` for Standard Static Web Apps: it sends the CSP, clickjacking, Permissions-Policy, manifest MIME type, service-worker cache policy, and immutable cache headers for Vite-hashed assets.

For the factory container deployment, build and run the included multi-stage image. It serves `dist/` on port 8080 as an unprivileged user, preserves SPA routes and service-worker behavior, sets immutable cache headers only for fingerprinted bundles, and sends `no-store` for HTML, the manifest, and the service worker.

```sh
docker build -t takeout-tidy .
docker run --rm -p 8080:8080 takeout-tidy
```

The free tier handles up to 20,000 media files. The optional one-time large-library unlock uses Sociobot billing. The factory can provide these build variables when the product is registered:

- `VITE_SOCIOBOT_BUY_URL` — hosted Sociobot purchase URL.
- `VITE_SOCIOBOT_LICENSE_VERIFY_URL` — Sociobot license verification endpoint.

No payment-provider SDK is embedded and no product ID is hardcoded.

## Privacy and safety

Keep an untouched copy of the original Takeout. Folder permissions are requested by the browser only when needed. The app stores only repair preferences, a summary of the last run, and an optional verified-license result locally. See [`public/privacy/index.html`](public/privacy/index.html) and [`public/terms/index.html`](public/terms/index.html).

## Project notes

- Product scope: [`.factory/brief.json`](.factory/brief.json)
- Visual system and asset provenance: [`.factory/design.md`](.factory/design.md)
- Build handoff: [`.factory/handoff.md`](.factory/handoff.md)

Licensed under the [MIT License](LICENSE).
