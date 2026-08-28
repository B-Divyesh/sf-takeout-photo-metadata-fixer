# Takeout Tidy

Repair Google Photos Takeout dates and locations in your browser.

Takeout Tidy is for people leaving Google Photos with wrong dates, repeated album copies, or separate Google JSON files.

- Live product: <https://takeout-photo-metadata-fixer.sociobot.in/>
- One-click sample: <https://takeout-photo-metadata-fixer.sociobot.in/demo>

## What Takeout Tidy repairs

- Imports an extracted folder or one or more Takeout ZIP files.
- Matches photos to standard, shortened, and duplicate-album Google JSON filenames.
- Adds the Google date and location to JPEG and PNG metadata.
- Keeps photo payload bytes and copies HEIC, HEIF, and video files unchanged.
- Can skip exact copies and rename repaired files by date.
- Adds `takeout-tidy-manifest.json` with one decision for each media file.

Photo, filename, and Google JSON data stay on the device during repair and export. The demo can reload and export offline after its first load.

Repair is free for up to 20,000 media files. A $12 one-time unlock removes that limit with no subscription.

Every public promise is mapped to an executable browser check in [`.factory/claims.json`](.factory/claims.json).

## Run locally

Use Node.js 20 or newer.

```sh
npm ci
npm run dev
```

Open the local URL shown by Vite. The sample route is `/demo` or `/?demo=1`.

## Test and build

```sh
npm test
npm run build
npm run test:claims
npm run test:e2e
```

The production build is in `dist/`. Its root contains `index.html`, the manifest, service worker, offline page, sitemap, and static-host configuration. The static-host file sets the content policy, frame protection, permissions, file types, and cache rules.

## Deploy

Deploy `dist/` as a static site with address-bar fallback to `index.html`.

```sh
/opt/fleet/lib/deploy-static.sh takeout-photo-metadata-fixer dist
```

The buy link and license check use Sociobot endpoints. The app does not load a payment-provider SDK. Set these variables only for registered replacements:

- `VITE_SOCIOBOT_BUY_URL`
- `VITE_SOCIOBOT_LICENSE_VERIFY_URL`

## Privacy and safety

Keep an untouched copy of the original Takeout. Folder permission is requested only after you choose the folder action.

Real mode stores repair settings, the last export summary, and an activated license. Demo mode uses memory and leaves real storage unchanged.

Read the deployed [privacy policy](https://takeout-photo-metadata-fixer.sociobot.in/privacy/) and [terms](https://takeout-photo-metadata-fixer.sociobot.in/terms/).

## Project source documents

- Product scope: [`.factory/brief.json`](.factory/brief.json)
- Visual system and asset provenance: [`.factory/design.md`](.factory/design.md)
- Demo contract: [`.factory/demo.md`](.factory/demo.md)
- Repair evidence: [`.factory/handoff.md`](.factory/handoff.md)

Licensed under the [MIT License](LICENSE).
