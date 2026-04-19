# Feature Landscape: Slidastro v4.0

**Domain:** Presentation Tool / Slide Engine
**Researched:** 2026-04-18
**Overall confidence:** HIGH (Directly derived from Slidev source code)

## Table Stakes

Features users expect in a Slidev-compatible ecosystem. Missing these makes the product feel incomplete for power users.

| Feature | Why Expected | Complexity | Behavior & Configuration |
|---------|--------------|------------|--------------------------|
| `s-clicks` | reveal list items/steps. | Medium | Wraps children. Props: `depth`, `every`, `at` (default `+1`), `hide`, `fade`. |
| `s-after` | elements appearing after current click. | Low | Simple wrapper. Behavior: `at: +0`. |
| `Toc` | structural navigation. | Medium | Props: `columns`, `maxDepth`, `minDepth`, `mode` (`all`, `onlyCurrentTree`, `onlySiblings`). |
| `Youtube` | media embedding. | Low | Props: `id`, `width`, `height`. |
| `Video` | HTML5 video. | Medium | Props: `autoplay` (bool \| `once`), `autoreset` (`slide` \| `click`), `controls`, `poster`. |
| `Link` | internal navigation. | Low | Props: `to` (slide no), `title` (optional). |
| `$page` / `$total` | slide status. | Low | Global variables available in Markdown expressions. |

## Differentiators

Advanced features that set Slidastro apart by providing high-fidelity parity with Slidev's most interactive capabilities.

| Feature | Value Proposition | Complexity | Behavior & Configuration |
|---------|-------------------|------------|--------------------------|
| `ShikiMagicMove` | High-end code transitions. | High | Props: `at`, `stepsLz` (lz-compressed JSON), `stepRanges`, `lines`, `duration`. |
| `s-mark` | Dynamic annotations. | Medium | Directive/Component. Modifiers: `box`, `circle`, `underline`, `highlight`, `strike`, etc. Props: `at`, `color`, `opacity`. |
| `s-drag` | Draggable elements. | High | Props: `pos` (x,y coordinates), `markdownSource` (for persistence). Updates source via First-POST. |
| `s-switch` | Complex content toggling. | Medium | Uses named slots matching click ranges (e.g., `<template #1>`, `<template #2-4>`). Props: `at`, `unmount`, `transition`. |
| `AutoFitText` | Responsive text sizing. | Medium | Props: `max`, `min` (font sizes). Uses ResizeObserver to scale text to fit container. |
| `s-click-gap` | timing/pacing control. | Low | Props: `size` (number of "empty" clicks to add). |

## Anti-Features

Features to explicitly NOT build to maintain focus and performance.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| Native Video Editor | Too complex, out of scope for a slide tool. | Use `s-video` and handle editing externally. |
| WYSIWYG Slide Builder | Violates the "Developer-First / Markdown-First" ethos. | Use `s-drag` for positioning and stick to Markdown for content. |
| Per-element animation timelines | Too much complexity (PowerPoint-style). | Rely on the discrete click-based state model. |

## Feature Dependencies

```
Click State Management (existing) → s-clicks, s-after, s-switch, s-click-gap, s-mark, ShikiMagicMove
Global Slide Metadata (existing) → Toc, $page, $total, Link
Shiki Integration (existing) → ShikiMagicMove
Astro Island Architecture (existing) → Multi-framework support for all components
```

## MVP Recommendation (v4.0 Focus)

Prioritize:
1. **Advanced Click Logic (`s-clicks`, `s-after`, `s-switch`)**: These are fundamental to the "Slidev feel" and have the highest utility for content creators.
2. **Standard Content (`Toc`, `Link`, `$page`, `$total`)**: Low effort, high value for presentation structure.
3. **`ShikiMagicMove`**: This is a major "wow" factor for technical presentations and demonstrates the power of the stack.

Defer:
- **`s-drag`**: High complexity due to state persistence. While powerful, it's often used for "fine-tuning" which can be done via CSS/props initially.

## Sources

- `_slidev/packages/client/builtin/`: Primary reference for component implementation.
- `_slidev/packages/client/modules/`: Reference for `v-click` and `v-mark` directive logic.
- `_slidev/packages/client/context.ts`: Reference for `$page` and `$total` context.
