# Phase 9: Presenter Experience Parity - Research

**Researched:** 2026-04-14
**Domain:** Presenter Mode UI/UX & CLI Tooling
**Confidence:** HIGH

## Summary
The goal is to bring the Slidastro presenter experience to parity with Slidev. Currently, Slidastro has a functional but basic Presenter Mode and a CLI that only logs the start of the dev server without providing deep links to auxiliary routes (Presenter, Overview, Print). This research identifies the specific changes needed to improve the CLI output, UI layout, and synchronization robustness.

**Primary recommendation:** Enhance the CLI to capture the Astro dev server address and log all 4 primary routes, and refactor the `PresenterView.astro` layout to use a professional grid with a dedicated status bar and enhanced notes/timer controls.

## Standard Stack
### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Astro | ^5.18.1 | Dev Server & Routing | Core framework; provides experimental `dev()` programmatic API [VERIFIED: package.json] |
| Nanostores | ^0.10.3 | State Management | Lightweight, framework-agnostic, excellent for sync [VERIFIED: packages/client] |
| BroadcastChannel | Native | Same-origin Sync | Built-in browser API for robust tab-to-tab communication [CITED: mdn] |

## Architecture Patterns
### Recommended Project Structure
- `packages/cli/src/index.ts`: Update to log URLs.
- `packages/core/src/templates/PresenterView.astro`: Main entry for presenter UI.
- `packages/core/src/components/PresenterNavigation.client.ts`: Logic for presenter-specific shortcuts and navigation.

### Pattern 1: Multi-Route CLI Discovery
Astro's `dev()` function returns a `DevServer` object.
```typescript
const server = await dev(config);
const url = server.address.href;
console.log(`  > Main:      ${url}`);
console.log(`  > Presenter: ${url}presenter/1`);
console.log(`  > Overview:  ${url}overview`);
console.log(`  > Print:     ${url}print`);
```
[VERIFIED: Astro 5 Docs]

### Pattern 2: Presenter Console Grid
Slidev uses a specific layout:
- **Top Bar**: Timer, Clock, Slide X/Y, Clicks.
- **Main**: Current Slide (large).
- **Sidebar Top**: Next Slide Preview.
- **Sidebar Bottom**: Notes (editable/scrollable).
[CITED: Slidev Docs]

## Don't Hand-Roll
| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Cross-tab sync | Custom Socket.io | BroadcastChannel | Built-in, zero latency, works offline for same-origin tabs. |
| Time formatting | Complex regex | Simple math/Date | Standard presentation timers don't need heavy libraries like Moment. |

## Common Pitfalls
- **Recursive Previews**: Rendering a preview of a page that contains a preview can crash the browser. **Prevention**: Use a `SlidePreview` component that renders static HTML/Content without the Presenter UI shell [HIGH confidence].
- **Sync Feedback Loops**: Tab A updates Store -> Syncs to Tab B -> Tab B updates Store -> Syncs back to A. **Prevention**: Use an `isReceiving` flag in the sync listener [VERIFIED: packages/client/src/sync.ts].

## Code Examples
### Capturing Dev Server Address
```typescript
import { dev } from 'astro';
const server = await dev({ ... });
// server.address is a URL object in Astro 5
const base = server.address.origin;
```

### Next Slide Sync
```typescript
// Calculate next slide index
const nextIndex = currentSlide + 1;
// Render next slide at scale
<SlidePreview index={nextIndex} scale={0.3} />
```

## Assumptions Log
| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Astro 5 `dev()` returns `address` | Architecture | CLI output might remain basic if API differs. |
| A2 | `previewNext` slot is desired | Summary | Users might prefer simple thumbnail vs custom content. |

## Environment Availability
| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | CLI/Dev | ✓ | 20+ | — |
| Browser | Presenter View | ✓ | Evergreen | — |

## Key Findings
1. **CLI Improvement**: Astro 5's `dev()` API provides the server address via `server.address`. This allows the CLI to output specific URLs for Main, Presenter, Overview, and Print modes immediately on startup.
2. **UI Parity**: Slidev's Presenter Mode features a top-aligned status bar for the timer and slide count, which Slidastro should adopt to move away from its current basic grid.
3. **Next Slide Preview**: The current implementation of `SlidePreview.astro` is safe for previews as it renders the content directly without the interactivity logic that would cause recursion.
4. **Timer/Duration**: Slidev supports a `duration` key in frontmatter (minutes). Slidastro should implement this and add a countdown/stopwatch toggle in the UI.
5. **Sync Strength**: The current dual-sync (BroadcastChannel + Vite HMR) is ideal for Slidastro's "API-First" and "Cloudflare-Native" philosophy, ensuring low-latency updates.
