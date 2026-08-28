# Polish 2 handoff — Takeout Tidy

Date: 2026-08-28

Work order: `takeout-photo-metadata-fixer-polish-2`

Live URL: <https://takeout-photo-metadata-fixer.sociobot.in/>

## Outcome

Perfection-loop round 2 is complete. The repair keeps the paper archive-bench identity and static offline-PWA deployment class. Every finding in `review-1.md` and `review-2.md` is mapped in `polish-2.md`; none remains open.

The two review-2 blockers were closed:

- All user-facing location wording is conditional on a location being present in the Google JSON file. JPEG and PNG claim tests now prove both located and date-only exports. Date-only output receives its three date tags, receives no invented GPS directory, and is not labelled “location found.”
- A new `large-library-unlock` claim imports 20,001 files, proves the gate is active, intercepts the real Sociobot verification request with a recorded valid response, checks its payload and saved activation, and proves the repaired export becomes enabled.

The catalog sentence, README, Terms, metadata, manifest, machine-readable product text, claim registry, copy audit, build/version identifiers, and PWA start version were updated consistently.

## Exact verification evidence

Repair commit: `6e7886990a80df407ef9773f1cb6f8e16c1e0983`

Fresh clone: `/tmp/takeout-polish2-clean.Unnr9O/repo`

```sh
npm ci --ignore-scripts
npm test
npm run build
# Each of the 24 commands in .factory/claims.json was run separately.
npm run test:e2e
```

Results:

- `npm test`: 15/15 passed.
- `npm run build`: passed; `dist/index.html` exists.
- Claim registry: 24/24 commands passed separately.
- `npm run test:claims`: 13/13 grouped desktop tests passed.
- `npm run test:e2e`: 48/48 passed in the working tree and again in the fresh clone across desktop Chromium and Pixel 5 emulation.
- Accessibility: integrated axe found zero serious/critical violations on Home, Demo, Privacy, Terms, and 404 in desktop and mobile projects.
- Privacy: the full demo export made only same-origin requests with no request body; real IndexedDB and localStorage snapshots remained byte-for-byte unchanged.
- Offline: the service-worker-controlled Demo reloaded and exported while the browser context was offline.
- Production output: 55.43 kB raw initial JavaScript, 20.13 kB raw CSS; both remain far below budget.
- Local Lighthouse: performance 100, accessibility 100, best practices 100, SEO 100; FCP 1.1 s, LCP 1.7 s, CLS 0, TBT 30 ms.

## Deployment and live checks

Deployment command:

```sh
/opt/fleet/lib/deploy-static.sh takeout-photo-metadata-fixer dist
```

Deployment ID: `7027c934-243a-4b77-9c7d-d1c2cf8b9361`

The custom domain reported `Ready` and HTTPS returned 200. Cold checks after deployment found:

- `/`, `/demo`, `/privacy/`, `/terms/`, `/offline.html`, `/sitemap.xml`, and `/robots.txt`: HTTP 200.
- `/definitely-not-a-route`: HTTP 404 with the designed archive-bench not-found view.
- Home and Demo: correct titles, one `h1`, `lang=en`, main landmark, complete image alt and button labels, and zero console errors.
- Live deployed `@claim:jpeg-repair`, `@claim:png-repair`, and `@claim:large-library-unlock`: 3/3 passed.
- Live first-screen/mobile, axe, route title/focus/404, legal/offline console, and touch-target tests: 5/5 passed.
- Live Lighthouse: performance 99, accessibility 100, best practices 100, SEO 100; FCP 1.1 s, LCP 1.4 s, CLS 0, TBT 120 ms, total transfer 90 KiB.

Evidence:

- [Polish mapping](polish-2.md)
- [Cold home report](evidence/polish-2/live-home/verify.json)
- [Cold demo report](evidence/polish-2/live-demo/verify.json)
- [Mobile home screenshot](evidence/polish-2/live-home/screenshot-mobile.png)
- [Desktop demo screenshot](evidence/polish-2/live-demo/screenshot-desktop.png)

## Run locally

```sh
npm ci
npm test
npm run build
npm run test:claims
npm run test:e2e
```

## Known gaps and next steps

None. HEIC, HEIF, and video metadata remain copy-only by the documented v1 product scope; this behavior is explicit and tested, not an unresolved defect.
