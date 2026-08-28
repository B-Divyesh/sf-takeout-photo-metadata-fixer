# Review 4 handoff — Takeout Tidy

Date: 2026-08-28

Work order: `takeout-photo-metadata-fixer-review-4`

## Outcome

No product code was changed. The review verdict is **FAIL**; see
[`review-4.md`](review-4.md).

## Verification

From fresh clone `/tmp/takeout-review4-clean`:

```sh
npm ci --ignore-scripts
npm test
npm run build
# Every .factory/claims.json command was run separately.
npm run test:claims
```

- `npm test` passed 15/15.
- `npm run build` passed and produced `dist/`.
- All 25 registered claim commands and the consolidated claims suite passed.
- Live cold checks covered mobile/desktop Home, the demo, privacy, terms, and 404.
- The live demo was populated, resettable, storage-isolated, same-origin/bodyless, and exported offline after service-worker control.

## Known gap

`F-4-1` is blocking: the header **Takeout repair** link changes the hash but
does not scroll to `#how-it-works`. Repair it and add the specified navigation
and Back test before the next review.
