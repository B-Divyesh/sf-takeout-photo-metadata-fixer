# Review 3 handoff — Takeout Tidy

Date: 2026-08-28

Work order: `takeout-photo-metadata-fixer-review-3`

Live URL: <https://takeout-photo-metadata-fixer.sociobot.in/>

## Outcome

Review 3 is complete. No product code was changed. The live PWA remains clear
on a cold mobile and desktop visit, has a populated one-click demo, and passes
the registered claim, offline, privacy, routing, metadata, and accessibility
checks. The review verdict is **FAIL** because two user-facing claims are not
registered in `.factory/claims.json`:

- `F-3-1`: “Preview matches before anything is written.” needs an atomic
  pre-export/no-write browser claim.
- `F-3-2`: “Every public promise is mapped to an executable browser check in
  claims.json.” is an unsupported coverage assertion and should be removed or
  bounded and tested.

The two review-2 blockers were closed:

- All user-facing location wording is conditional on a location being present in the Google JSON file. JPEG and PNG claim tests now prove both located and date-only exports. Date-only output receives its three date tags, receives no invented GPS directory, and is not labelled “location found.”
- A new `large-library-unlock` claim imports 20,001 files, proves the gate is active, intercepts the real Sociobot verification request with a recorded valid response, checks its payload and saved activation, and proves the repaired export becomes enabled.

## Verification evidence

Reviewed commit: `3c81d6a7fdd91c5f461c5ef2039f9e67f2584d2b`

Fresh clone: `/tmp/takeout-review3-clean.RSKGfE`

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
- Every one of the 24 registered claim commands passed separately.
- `npm run test:e2e`: passed in the clean clone across desktop and mobile.
- Live cold browser: first screen answered job, audience, and first click at
  390 px and desktop with no console error or horizontal overflow.
- Live demo: populated inspection immediately after one click; reset restored
  defaults; real storage snapshot remained unchanged.
- Live privacy/offline: only same-origin, bodyless requests; a
  service-worker-controlled `/demo` reloaded offline and downloaded its ZIP.
- Live routes: shared shell, metadata, direct links, h1 focus on navigation and
  Back, sitemap, and styled HTTP 404 were confirmed.

## Run locally

```sh
npm ci
npm test
npm run build
npm run test:claims
npm run test:e2e
```

## Known gaps and next steps

Implement the two documented Review 3 claim-contract fixes, then rerun the
full clean-clone command set above. HEIC, HEIF, and video metadata remain
copy-only by documented v1 scope; that behavior is explicit and tested, not an
unresolved defect.
