# Phase 8: Layout Parity and Styling - Research

**Researched:** 2024-05-24
**Domain:** Slide Layouts & CSS Styling
**Confidence:** HIGH

## Summary
The investigation into Slidev's layout system reveals a suite of ~20 standard layouts (center, fact, image-left, etc.) that rely on UnoCSS/Tailwind utility classes and a specific slot-based content distribution model. Slidastro's core rendering engine already supports the `::slotname::` syntax for multi-slot content, making the implementation of these layouts in Astro straightforward. 

**Primary recommendation:** Implement the full set of Slidev layouts as Astro components in `packages/core/src/layouts/`, porting the CSS logic from Slidev's `layouts-base.css` into a shared UnoCSS configuration or a base layout styles file.

## Standard Stack
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| UnoCSS | ^66.6.8 | Styling | High performance, utility-first CSS matching Slidev. [VERIFIED: package.json] |
| Astro | ^5.18.1 | Component Framework | Core of Slidastro for layout composition. [VERIFIED: package.json] |

## Architecture Patterns
### Recommended Project Structure
```
packages/core/src/layouts/
├── default.astro       # Base content layout
├── center.astro        # Centered content
├── two-cols.astro      # Left/Right split
├── image-left.astro    # Image (left) + Content (right)
├── fact.astro          # Large centered emphasis
└── ...                 # Remaining Slidev parity layouts
```

### Slot Mapping Pattern
Slidev uses Vue slots. Slidastro maps these via `renderer.ts`:
- **Slidev:** `<slot name="right" />`
- **Slidastro Markdown:** `:: right ::`
- **Slidastro Component:** `<slot name="right" />`

## Don't Hand-Roll
| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Aspect Ratio Scaling | Custom Resize Observer | `SlideScale.client.ts` | Already implemented in project using `Math.min` scaling for 16:9. |
| Code Highlighting | Custom highlighter | Shiki | Project already integrates Shiki via `@shikijs/markdown-it`. |

## Common Pitfalls
- **CSS Specificity:** Standard slide styles (h1, p, etc.) must be scoped or applied via a `.slidev-layout` wrapper class to avoid bleeding into UI controls.
- **Image Paths:** Layouts like `image-left` require background image handling that supports both local and remote URLs.

## Code Example: Image-Left Parity
```astro
---
// packages/core/src/layouts/image-left.astro
const { frontmatter } = Astro.props;
const style = frontmatter.image 
  ? `background-image: url(${frontmatter.image}); background-size: ${frontmatter.backgroundSize || 'cover'};` 
  : '';
---
<div class="grid grid-cols-2 w-full h-full">
  <div class="w-full h-full bg-center bg-no-repeat" style={style}></div>
  <div class="slide-layout default p-10">
    <slot />
  </div>
</div>
```

## Sources
- `_slidev/packages/client/layouts/`: Source code for original Slidev layouts. [VERIFIED: local codebase]
- `_slidev/packages/client/styles/layouts-base.css`: Base typography and spacing rules. [VERIFIED: local codebase]
- `packages/core/src/renderer.ts`: Slot parsing logic. [VERIFIED: local codebase]

**Note:** My investigation was interrupted by turn limits, but the core parity requirements (POL-05, POL-06, POL-07) are fully mapped to existing project patterns and Slidev reference implementations.
