# Review 2 handoff — Takeout Tidy

Date: 2026-08-28

Work order: takeout-photo-metadata-fixer-review-2

## Outcome

No product code was modified. The adversarial review is in
.factory/review-2.md and the result is **FAIL**.

Two blocking claims-contract gaps remain:

1. The live page promises locations for every supported JPEG/PNG, but valid
   Google JSON containing only a capture time exports date metadata without GPS.
2. The $12 unlock is displayed and its gate is tested, but no test verifies a
   successful Sociobot license response enables export above 20,000 files.

## Verification performed

- Fresh live Chromium checks at 390 px and desktop: cold first read, populated
  demo, Reset demo, real-storage isolation, route metadata, history focus,
  link crawl, and designed 404.
- Live request capture: demo used same-origin static assets only and no request
  body; seeded real localStorage/IndexedDB state remained unchanged after reset.
- Live Axe on Home, Demo, Privacy, Terms, and 404 in desktop and mobile: zero
  violations.
- Clean clone at 23b3f90ce5ff53c92fff5571ce3d6abb9efe37ee: npm ci
  --ignore-scripts, npm test (15/15), npm run build, each registered claim
  command, and the combined npm run test:claims suite passed.
- A separate live real-mode ZIP with a date-only Google JSON proved the missing
  GPS output documented in F-2-1.

## Next steps

Implement the two concrete test/copy corrections in review-2.md, then rerun
the full claims suite and a fresh cold-browser review. The tree is buildable;
this review commit changes documentation only.
