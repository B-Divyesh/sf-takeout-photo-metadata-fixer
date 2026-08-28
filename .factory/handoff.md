# Polish 3 handoff — Takeout Tidy

Date: 2026-08-28

Work order: `takeout-photo-metadata-fixer-polish-3`

Live URL: <https://takeout-photo-metadata-fixer.sociobot.in/>

Deployment ID: `66fe4c66-fddd-4682-8823-803e4c61cd11`

## Outcome

All findings from reviews 1–3 are closed. The first screen remains job-first and mobile-safe. `/demo` and `?demo=1` open the same populated, resettable, memory-only sample. Real files reach an inspection screen without generating output or creating saved state. Export begins only after the user chooses a folder or ZIP action.

Review 3's missing `preview-before-write` claim is now registered and tested. The README's unprovable claim-coverage sentence was replaced by a source-document link. Clean-clone verification also found and fixed an older folder-export test race and stopped read-only startup from creating an empty IndexedDB database.

The paper archive-bench identity, static PWA deployment class, deterministic metadata repair, copy-only HEIC/HEIF/video scope, and Sociobot-only billing boundary are unchanged.

## Verification

Verified from fresh clone `/tmp/takeout-polish3-final.sI7dZt/repo` at code commit `442327c58cac81eeab1ef7a579bd918fba339ed1`:

```sh
npm ci --ignore-scripts
npm test
npm run build
# Each of the 25 commands in .factory/claims.json was run separately.
npm run test:e2e
```

- Unit/contract: 15/15 passed.
- Build: passed; `dist/index.html` and all documented PWA/static-host artifacts exist.
- Claims: all 25 registry commands passed separately.
- Browser/integration: 50/50 passed across desktop Chromium and Pixel 5 emulation.
- Accessibility: integrated axe found zero serious/critical issues on Home, Demo, Privacy, Terms, and 404 locally and live.
- Privacy: live demo requests were same-origin with no bodies; reset/export left seeded real storage byte-for-byte unchanged.
- Pre-write behavior: live real-file preview caused zero folder-picker calls, object URLs, download clicks, downloads, or storage changes.
- Offline: the live service-worker-controlled demo reloaded and exported a repaired ZIP with the network disabled.
- Routing: live titles, canonicals, h1 focus, announcement/Back behavior, reciprocal legal links, and styled HTTP 404 passed.
- Mobile: 390 px had no horizontal overflow; both actions and all three first-screen facts fit within 844 px.
- Build size: initial JS 55.57 kB raw / 21.51 kB gzip; CSS 20.13 kB raw / 5.46 kB gzip.
- Lighthouse local: 100/100/100/100; LCP 1.7 s, TBT 0 ms, CLS 0, 89 KiB.
- Lighthouse live: 100/100/100/100; LCP 1.3 s, TBT 0 ms, CLS 0, 82 KiB.
- URL verifier reports zero console errors and correct title/lang/h1/main/alt/button basics on live Home, `?demo=1`, Privacy, and Terms.

Evidence is under [`.factory/evidence/polish-3`](evidence/polish-3). The full finding-by-finding ledger is [`.factory/polish-3.md`](polish-3.md).

## Run locally

```sh
npm ci
npm test
npm run build
npm run test:claims
npm run test:e2e
```

## Known gaps

None against the brief or cumulative reviews. HEIC, HEIF, and video metadata remain copy-only by the documented v1 scope and are covered by byte-equality tests.
