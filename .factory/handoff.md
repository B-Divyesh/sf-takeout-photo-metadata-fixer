# Polish 4 handoff — Takeout Tidy

Date: 2026-08-28

Work order: `takeout-photo-metadata-fixer-polish-4`

## Outcome

All cumulative findings from reviews 1–4 are closed. The remaining `F-4-1` navigation defect now has an implementation fix, desktop/mobile regression coverage, and cold live evidence.

The **Takeout repair** header link now:

- reaches `/#how-it-works` from Home and Demo;
- places the section at the top of the viewport;
- focuses and announces “How Takeout repair works”;
- restores the prior route, scroll position, and page-heading focus on Back;
- works from a cold direct deep link.

The release is `1.0.4 · polish 4`. The catalog description is a 90-character verb-first sentence. The paper archive-bench identity and `pwa-offline` artifact class are unchanged.

## Source and deployment

- Reviewed candidate: `25438b4bed2c0e377453135cea06c7fde2cc93b2`
- Review report: `546ffdcff1df6774dfeb3418ff75941fa9d59ea4`
- Repair commit: `db70ebb555f047a32bc6abc73fae3ae5c56d25e8`
- Deployment ID: `3745352b-14f0-408a-9a57-8ac15c42502a`
- Live URL: <https://takeout-photo-metadata-fixer.sociobot.in/>
- Cumulative map: [polish-4.md](polish-4.md)

## Clean verification

Fresh clone: `/tmp/takeout-polish4-clean.WXWLXD/repo` at `db70ebb555f047a32bc6abc73fae3ae5c56d25e8`.

```sh
npm ci --ignore-scripts
npm test
npm run build
# Each of the 25 commands in .factory/claims.json was run separately.
npm run test:claims
npm run test:e2e
```

Results:

- `npm test`: 15/15 passed.
- `npm run build`: passed; `dist/index.html` and all documented static/PWA artifacts exist.
- Every registered claim command: 25/25 passed separately.
- Consolidated claim scenarios: 14/14 passed.
- Full Playwright suite: 52/52 passed across desktop Chromium and Pixel 5.
- Build payload: 44.07 kB app JS + 12.47 kB archive JS raw; 20.13 kB CSS raw.
- Local Lighthouse: performance 100, accessibility 100, best practices 100, SEO 100; LCP 1.7 s, CLS 0, TBT 0 ms.

## Cold live verification

- Home, `?demo=1`, Privacy, and Terms returned HTTP 200 with route-specific titles, descriptions, canonicals, one h1, `lang=en`, a main landmark, complete labels/alts, and no console errors.
- `/not-in-the-archive` returned HTTP 404 with the designed archive-bench page and a working return link.
- Home and Demo fragment navigation placed `#how-it-works` at viewport top and focused `#how-title`. Back restored the starting URL at scroll 0 and focused `#page-title`.
- The cold `/#how-it-works` deep link produced the same target position and focus.
- The first-screen sample action reached `/demo` in one click. Seven sample media rows plus the header were visible immediately.
- The demo banner, reset, and **Start for real** worked. Real localStorage and IndexedDB snapshots were byte-for-byte unchanged.
- The demo made no off-origin request and sent no request body. It reloaded offline and downloaded `takeout-tidy-repaired.zip` with 6 writes and 1 exact copy skipped.
- All live internal links and the Sociobot checkout link returned 200.
- Axe found zero serious or critical issues on Home, Demo, Privacy, Terms, and 404. Each 390 px route had zero horizontal overflow.
- `robots.txt`, `sitemap.xml`, manifest, worker, social preview, and offline page returned 200 with the expected content types and policies.
- Live Lighthouse: performance 100, accessibility 100, best practices 100, SEO 100; LCP 1.4 s, CLS 0, TBT 0 ms.

Evidence is under [`.factory/evidence/polish-4/`](evidence/polish-4/), especially [`live-audit.json`](evidence/polish-4/live-audit.json), [`live-assets.json`](evidence/polish-4/live-assets.json), and the routing screenshots.

## Known gaps

None against the brief or reviews. HEIC, HEIF, and video metadata rewriting remains the explicit v1 scope boundary; those files are copied unchanged and tested byte-for-byte.
