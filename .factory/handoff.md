# Verification handoff — FAIL

Date: 2026-08-27
Work order: `takeout-photo-metadata-fixer-verify-1`
Tested candidate: `e73ac0cde6e3e6ce8c314eb2772e604192ad60bf`
Tested deployment: <https://takeout-photo-metadata-fixer.sociobot.in/>

## Outcome

**FAIL — do not accept or promote this candidate.** The application builds and
the deployed artifact exactly matches it, but a common valid Takeout sidecar
shape silently loses GPS metadata: an empty `geoDataExif: {}` prevents fallback
to populated `geoData`. The product then reports a successful repair while
exporting a date-only JPEG/PNG. This conflicts with the core promise to restore
GPS and with the brief's schema-resilience requirement.

Full reproducible evidence, command results, deployment hashes, scope, and
remediation steps are in [`.factory/verification.md`](verification.md).

## What passed

- Clean `npm ci`; `npm test` (11 tests), `npm run test:e2e` (8 tests across
  desktop and 390 px mobile), and exact `npm run build` all passed.
- Production bundle is within budget: 46.14 KB raw / 18.50 KB gzip initial JS;
  16.76 KB raw / 4.79 KB gzip CSS. Local Lighthouse was 100/100/100/100
  (Performance/Accessibility/Best Practices/SEO), with 1.6 s LCP and zero CLS.
- Normal ZIP repair, renamed export/manifest, malformed-sidecar reporting,
  corrupt-ZIP recovery, offline reload, keyboard focus, reduced motion, and
  live axe/console/mobile smoke checks passed.
- No photo bytes or tracking requests leave the site during normal use; normal
  live requests are same-origin. The documented license check is the only
  external request after a user enters a key.

## Defects to resolve before re-verification

1. **P1:** Correct empty/partial `geoDataExif` fallback and add an end-to-end
   regression test that asserts exported EXIF GPS tags.
2. **P2:** A forced service-worker update activates a new cache silently;
   required update-available toast never appears.
3. **P3:** Deploy CSP/clickjacking/Permissions-Policy, immutable caching for
   hashed assets, and the correct manifest MIME type.

After correcting these items, run `npm ci && npm test && npm run test:e2e &&
npm run build`, deploy the generated `dist/`, and perform a fresh independent
verification against the new commit and URL.
