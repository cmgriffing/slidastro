---
phase: 08-layout-parity
plan: 03
subsystem: layouts
tags: [astro, layout, parity, media, embed]
requires: ["08-01", "08-02"]
provides: [POL-05]
tech-stack: [Astro, Tailwind CSS]
key-files: [
  "packages/core/src/layouts/image.astro",
  "packages/core/src/layouts/image-left.astro",
  "packages/core/src/layouts/image-right.astro",
  "packages/core/src/layouts/iframe.astro",
  "packages/core/src/layouts/iframe-left.astro",
  "packages/core/src/layouts/iframe-right.astro"
]
metrics:
  duration: 30m
  completed_date: "2026-04-13"
---

# Phase 8 Plan 03: Media & Embed Layouts Summary

Implemented Slidev-compatible media and embed layouts to achieve visual parity. This plan focused on image-based layouts and iframe embedding.

## Substantive Changes

- **Image Layouts**: 
  - `image.astro`: Verified already present and correctly using `handleBackground`.
  - `image-left.astro`: Created a 2-column grid layout with the image on the left and content on the right.
  - `image-right.astro`: Created a 2-column grid layout with content on the left and the image on the right.
- **Iframe Layouts**:
  - `iframe.astro`: Created a full-slide iframe layout with support for `url` and `scale`.
  - `iframe-left.astro`: Created a 2-column grid with an iframe on the left and content on the right.
  - `iframe-right.astro`: Created a 2-column grid with content on the left and an iframe on the right.

## Key Decisions

- **Scaling Logic**: Replicated Slidev's scaling logic using `scaleInvertPercent` and `transform: scale(scale)` to allow for high-resolution iframes to be scaled down into slide columns.
- **Layout Consistency**: Used the `slidev-layout default` class and `frontmatter.class` to ensure consistent padding and styling across all layout types.

## Deviations from Plan

- `image.astro` was found to be already present in the codebase, so it was verified but not re-created.

## Known Stubs

None - all layouts are fully functional and ready for use.

## Self-Check: PASSED
- [x] `image-left.astro` exists and is correct.
- [x] `image-right.astro` exists and is correct.
- [x] `iframe.astro` exists and is correct.
- [x] `iframe-left.astro` exists and is correct.
- [x] `iframe-right.astro` exists and is correct.
- [x] Commits are present.
