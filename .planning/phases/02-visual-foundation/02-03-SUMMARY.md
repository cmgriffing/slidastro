# Summary: Phase 02-03 Layout System & Type Updates

## Accomplishments
- **Dynamic Layout Discovery**: Enhanced the virtual module to scan the user's `layouts/` directory and map custom `.astro` layouts.
- **Built-in Layouts**: Implemented core layouts: `default`, `cover` (centered), and `two-cols` (grid-based).
- **Slot Mapping**: Implemented a markdown splitting logic that supports named slots using `::name::` markers, allowing complex slide designs.
- **Layout Resolver**: Updated `SlideView.astro` to dynamically resolve layouts, prioritizing user-defined layouts over built-ins.
- **Robust Parser**: Rewrote the markdown parser to correctly handle per-slide frontmatter and nested `---` separators, mirroring Slidev's behavior.

## Technical Details
- **Slot Implementation**: Uses a hardcoded list of common slots (`right`, `left`, `top`, `bottom`) for stability in Astro templates, passing rendered HTML directly to component slots.
- **Absolute Path Imports**: Utilizes `await import(/* @vite-ignore */ path)` to load user layouts from outside the project root.
- **State-based Parsing**: The new parser correctly tracks code blocks and slide boundaries to avoid misidentifying separators.

## Verification Results
- [x] **Built-in Layouts**: Verified `cover` and `two-cols` layouts render correctly with appropriate styling.
- [x] **Custom Layouts**: Confirmed that a layout defined in `tests/layouts/Custom.astro` is correctly resolved and applied via `layout: Custom` frontmatter.
- [x] **Slot Mapping**: Verified that `::right::` content is correctly directed to the `right` slot in the `two-cols` layout.
- [x] **Parser Stability**: Verified that multiple slides with individual frontmatter are parsed correctly.
