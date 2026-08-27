# Design thesis — The archive repair bench

## Direction

The product is a **paper-cut diorama** of a careful photo archivist's workbench. Google Takeout leaves people with a pile of photos, labels, and sidecars; the interface makes the repair process feel like sorting that pile into a trustworthy archive. Layered paper edges, small registration marks, tape-like labels, and grounded shadows explain source → inspection → clean output. Decoration is reserved for the hero and empty states; working screens defer to the file results.

This is deliberately single-mode. The warm, evenly lit paper bench is part of the task metaphor, while deep navy ink, visible focus rings, and restrained surfaces maintain contrast.

## Tokens

- `paper`: `#F5EBD8` — the surrounding archival stock.
- `sheet`: `#FFFDF7` — the primary working sheet.
- `ink`: `#17283B` — cool archival ink; primary text.
- `muted-ink`: `#536272` — secondary text, ≥4.5:1 on sheet.
- `coral`: `#C84F3D` — primary action and paper tabs.
- `coral-dark`: `#963426` — hover/pressed action.
- `teal`: `#17736A` — repaired/success state.
- `ochre`: `#9B6410` — attention and partial-match state.
- `danger`: `#A8323A` — failures.
- `line`: `#C8BAA3` — scored paper edges and separators.

## Typography

- Display: Georgia, Cambria, `Times New Roman`, serif. The editorial shapes suggest photo albums and handwritten archive cards without downloading a font.
- Interface/body: Inter-compatible system sans (`ui-sans-serif`, system UI, Segoe UI, sans-serif). It stays legible in dense file tables and works fully offline.
- Scale: 14 / 16 / 18 / 24 / 38–60 px, with body at 16 px minimum and 1.55 line height. Filenames and counts use tabular figures.

## Space and shape

- 4 px base rhythm: 4, 8, 12, 16, 24, 32, 48, 72.
- Paper layers use 2–8 px corner radii rather than generic pill cards. Buttons use 4 px radii and a 3 px offset shadow, like a pasted paper tab.
- Desktop content maxes at 1180 px. At 390 px, the diorama drops behind the task copy, settings stack, the result table becomes labeled rows, and the sticky action bar respects safe-area insets.
- All interactive targets are at least 44×44 px.

## Interaction grammar

- Source choices look like two labeled folder tabs. Selecting one reveals the same scan bench, so users never wonder whether ZIP is a lesser path.
- Status moves left-to-right through three numbered bench marks: choose, inspect, export.
- Repair counts resemble stamped inventory labels. Status always includes text or an icon in addition to color.
- Primary actions depress their paper shadow on press. Progress is determinate when file counts are known and announced in a polite live region.

## Motion policy

- 180–240 ms transitions use only opacity and transform. Sheets rise 4 px from their physical origin; buttons depress 2 px. No looping animation.
- With `prefers-reduced-motion: reduce`, transforms and smooth scrolling are removed and state changes are immediate. Depth remains through borders, overlap, and static shadows.

## Original asset plan and provenance

- Hero: one wide editorial paper-cut diorama showing loose photos and JSON labels entering a small archival sorter, with dated photos emerging in order. It explains local transformation without claiming cloud or AI behavior.
- App icons: hand-authored SVG paper-photo mark, exported locally to PNG for manifest sizes.
- UI icons: hand-authored inline SVG, using a consistent 1.75 px rounded stroke.

### Hero prompt sheet

Use case: `stylized-concept`. Asset type: wide landing-page hero illustration. Subject: a tabletop archival sorting scene where overlapping instant-photo prints and tiny plain JSON sidecar cards enter from the left, pass through a small hand-built paper file sorter in the center, and emerge on the right as a neat chronological stack with subtle date-tab shapes and a tiny map-pin cutout. World/materials: tactile layered construction paper, deckled edges, cardstock, tiny folds and realistic paper fibers; no screens. Lighting/lens: soft window light from upper left, shallow isometric viewpoint, gentle physical shadows, editorial still life. Palette words: warm cream, midnight navy, muted coral, dark teal, ochre accents. Composition: 3:2 landscape, subject centered with breathing room, no important content near edges. Negative list: no text, no letters, no numbers, no logos, no brands, no Google marks or colors, no people, no hands, no glossy plastic, no watermark.

Generated with the factory Azure image deployment (`factory-image`) on 2026-08-27. The generation is original for this product; prompt is also saved beside the source asset in `assets/src/hero-paper-archive.prompt.json`. Final delivery is optimized WebP below 300 KB.
