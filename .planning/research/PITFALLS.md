# Pitfalls Research: Milestone v4.0 Full Feature Parity

**Domain:** Slide Presentation Engine (Astro/Slidev Hybrid)
**Researched:** 2026-04-18
**Confidence:** HIGH

## Critical Pitfalls

### Pitfall 1: Global Click State Desync in Island Architecture

**What goes wrong:**
Individual `s-click` or `s-after` islands fail to advance in sync with the presentation controller, or they register themselves in the wrong order. This results in "ghost clicks" where the user clicks but nothing happens, or multiple animations triggering at the same time.

**Why it happens:**
Astro islands hydrate independently. In Slidev (Vue-only), the parent slide component manages the click count and passes it down. In Astro, if elements are separate islands, they don't have a shared parent reactive state unless explicitly bridged via a Store (e.g., Nano Stores) or a Master Controller.

**How to avoid:**
Use a singleton Master Click Controller (via Nano Stores or a global `window.$slidastro`) that all `s-` click components subscribe to. Implement a "registration" phase where components report their existence and requested click index to the controller upon mounting.

**Warning signs:**
Animations triggering out of order; `s-after` appearing before its predecessor; click count in UI and actual slide state disagreeing.

**Phase to address:**
Phase 1: Advanced Click Logic

---

### Pitfall 2: Layout Measurement Race Conditions (AutoFitText)

**What goes wrong:**
`AutoFitText` calculates a font size of `0` or a tiny fallback size, causing text to be invisible or illegible.

**Why it happens:**
Measurement occurs before fonts are fully loaded or while the slide is `display: none` (inactive). Astro's SSR might also send a pre-rendered state that doesn't account for final client-side dimensions.

**How to avoid:**
Use the `ResizeObserver` API and wait for `document.fonts.ready`. Ensure measurement only happens when the slide becomes the "active" slide. Implement a "loading" or "measuring" state to prevent a jarring "font-snap" visual.

**Warning signs:**
Text flickering from small to large when switching slides; text overflowing its container on the first load but fixing itself on resize.

**Phase to address:**
Phase 3: Visual Enhancements

---

### Pitfall 3: Shiki Tokenization Overhead & Performance

**What goes wrong:**
`ShikiMagicMove` causes significant frame drops (jank) during transitions, or the browser tab freezes when navigating to a slide with large code blocks.

**Why it happens:**
Slidev's Magic Move tokenizes code blocks into hundreds of individual `<span>` elements and uses FLIP animations on all of them. Doing this in multiple Astro islands simultaneously, especially if Shiki is re-initialized in each, is extremely heavy.

**How to avoid:**
Share a single Shiki highlighter instance across all islands. Limit `ShikiMagicMove` to reasonable code lengths and provide a `pre-tokenized` path where the server (Astro) does the heavy lifting and sends the tokens to the client.

**Warning signs:**
High CPU usage during slide transitions; delay between clicking "next" and the animation starting.

**Phase to address:**
Phase 3: Visual Enhancements

---

### Pitfall 4: Source-Truth Divergence (s-drag Persistence)

**What goes wrong:**
User drags an element to a new position in Dev Mode, but the change is lost on refresh, or the `.md` file is corrupted by an incorrect regex replacement.

**Why it happens:**
`s-drag` needs to write back to the local filesystem. Astro components are client-side and don't have "write" access to the source `.md`. If the bridge between the client and the `slidastro` CLI server is fragile or uses simple regex, it can fail on complex Markdown.

**How to avoid:**
Implement a robust WebSocket-based "Source Bridge". Instead of regex, use a proper Markdown AST parser (like `unified`/`remark`) on the server side to locate and update the position attributes in the frontmatter or directive.

**Warning signs:**
"Failed to update source" console errors; element jumping back to origin after HMR; Markdown file losing formatting after a drag save.

**Phase to address:**
Phase 2: Interactive Components

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Using `window.localStorage` for `s-mark` | Fast to implement; no server needed. | Annotations lost when clearing cache or switching browsers. | MVP / Phase 2 only. |
| Global `z-index` wars for `s-mark`/`s-drag` | Easy to make elements "on top". | Interactions (clicks) blocked on underlying elements; impossible to debug stacking. | Never; use a dedicated Overlay Layer. |
| Native `<iframe>` for Youtube/Tweet | No dependencies; simple implementation. | No control over "Ready" state; slow loading; layout shifts. | Acceptable for first pass of Phase 4. |

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| **Rough Notation (s-mark)** | Triggering mark animation on SSR/Load. | Wait for "Slide Active" + "Click Step" before triggering. |
| **Twitter/X API** | Re-loading the widget script for every `Tweet` component. | Use a singleton script loader to ensure `widgets.js` is loaded once. |
| **Shiki** | Mismatched themes between static code blocks and Magic Move. | Pass the global theme configuration to the Magic Move client island. |

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| **Many s-click islands** | High memory usage; slow hydration. | Use a lightweight "Proxy" component for clicks that doesn't hydrate a full framework. | > 50 clickable elements per slide. |
| **Un-optimized YouTube embeds** | Slow initial page load; high network usage. | Use "Lite" embeds (thumbnail first) and only load the iframe on click or slide entry. | > 3 videos in a presentation. |
| **Recursive Toc** | Infinite loop if headers are generated dynamically. | Limit TOC depth and use a non-recursive rendering pattern. | Deeply nested (depth > 6) presentations. |

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| **s-drag Source Injection** | Malicious input in drag position could inject scripts into the `.md` file. | Sanitize and validate position coordinates on the server before writing to disk. |
| **Third-party Script Injection** | Loading Tweet/Youtube scripts from untrusted sources. | Hardcode official URLs for widgets. |

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| **Invisible s-click-gap** | Presenter clicks, nothing happens, they click again (double-advance). | Provide a visual indicator in "Presenter Mode" that a click-gap was triggered. |
| **s-drag without "Save" feedback** | User doesn't know if their position change was persisted. | Show a "Saved" toast or indicator in the corner of the slide. |
| **Toc hijacking scroll** | Large TOC makes it hard to see slide content. | Use a scrollable container for TOC or a "Grid" layout for many slides. |

## "Looks Done But Isn't" Checklist

- [ ] **s-clicks:** Often missing "decrement" support (going back a step) — verify `prev` works as expected.
- [ ] **s-switch:** Often missing `unmount` logic — verify hidden slots aren't consuming resources or blocking clicks.
- [ ] **ShikiMagicMove:** Often breaks in PDF export — verify static fallback for print mode.
- [ ] **Youtube/Video:** Often lacks "Autoplay on slide enter" — verify interaction-less playback if configured.

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Source corruption from `s-drag` | HIGH | Use Git for version control; implement a "Restore from Backup" in the CLI. |
| Click state desync | MEDIUM | Implement a "Reset Slide" shortcut (default `R`) that clears the local click store. |
| AutoFit text overflow | LOW | Provide a manual `scale` prop as an override for the `AutoFit` component. |

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Click Desync | Phase 1 (Click Logic) | Unit test with 10+ interleaved `s-click` islands. |
| Measurement Error | Phase 3 (Visuals) | Test on different screen resolutions and "slow 3G" network throttling. |
| Source Corruption | Phase 2 (Interactives) | Automated test suite that drags an element and verifies Markdown integrity. |

## Sources

- [Slidev GitHub Issues - Magic Move PDF Export (#1422)](https://github.com/slidevjs/slidev/issues/1422)
- [Slidev Documentation - v-drag best practices](https://sli.dev/guide/animations#v-drag)
- [Personal Experience with Astro Island Synchronization]
- [Rough Notation Documentation - Scaling Issues](https://roughnotation.com/)

---
*Pitfalls research for: Slidastro Milestone v4.0*
*Researched: 2026-04-18*
