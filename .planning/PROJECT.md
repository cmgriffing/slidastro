# Slidastro

## What This Is

Slidastro is an Astro-powered slide presentation CLI tool with full feature parity with Slidev. It lets developers write presentations in Markdown (compatible with Slidev's `.md` format or Astro-native `.mdx`/`.astro` formats) and use components from any framework — React, Vue, Svelte, Solid, and more — within a single presentation, powered by Astro's island architecture.

## Core Value

Developers can author presentations with multi-framework component support, using the same Markdown workflow as Slidev but with the flexibility of Astro's island system.

## Requirements

### Validated

- [x] CLI tool (`slidastro dev`, `slidastro build`, `slidastro export`) published to npm [Phase 1]
- [x] Markdown slide authoring with `---` separator and frontmatter (Slidev-compatible format) [Phase 1]
- [x] Dev server with hot module reload [Phase 1]
- [x] Astro-native format support (`.mdx` and `.astro` slide files) [Phase 6]
- [x] Multi-framework component support in slides (React, Vue, Svelte, Solid via Astro integrations) [Phase 1]
- [x] Presenter mode (dual window: audience view + speaker notes + timer) [Phase 4]
- [x] Speaker notes in slides [Phase 4]
- [x] Slide transitions and animations [Phase 3]
- [x] Click-to-advance step animations [Phase 3]
- [x] Code syntax highlighting (Shiki) [Phase 2]
- [x] Themes system (installable via npm) [Phase 2]
- [x] Layouts system (built-in and custom) [Phase 2]
- [x] Export to PDF, PPTX, and PNG [Phase 5]
- [x] LaTeX/math support (KaTeX) [Phase 2]
- [x] Mermaid diagram support [Phase 6]
- [x] Drawing and annotation tools overlay [Phase 6]
- [x] Recording mode [Phase 6]
- [x] Overview/grid mode (slide navigator) [Phase 3]
- [x] Print mode [Phase 5]
- [x] Remote presenter control (separate presenter window) [Phase 4]
- [x] Monaco editor integration (code editing in slides) [Phase 6]
- [x] Rendering and click interaction polish [Phase 7]
- [x] Layout parity and styling [Phase 8]
- [x] Presenter experience parity [Phase 9]
- [x] Analysis and Normal Mode layout refinement [Phase 10]
- [x] Decoupled audience view and UI separation [Phase 11]
- [x] Master UI Controller and state management [Phase 11]
- [x] Standard Slidev keyboard shortcuts engine [Phase 12]
- [x] Master Dashboard / Help Overlay [Phase 12]

### Active

- [ ] Future Milestones (Post-v3.0)

### Out of Scope

- Forking or patching the `_slidev` source — it's reference only, not runtime code
- VS Code extension (Slidev has one; defer to v2)
- Native mobile app — web-only

## Context

- The `_slidev/` directory contains the full Slidev source (v52.14.2) as a reference implementation. All architectural decisions, file format specs, and feature behavior should be derived from studying this code rather than from documentation alone.
- Slidev is built on Vite + Vue. Slidastro replaces that core with Astro's build pipeline, gaining multi-framework support at the cost of needing to re-implement Vue-specific features differently.
- Astro's island architecture is the key technical differentiator — it allows React, Vue, Svelte, etc. components to coexist and hydrate independently within a slide page.
- The Markdown format uses `---` as slide separator, YAML frontmatter for slide-level config, and global frontmatter at the top of the file for presentation config.
- Slidev supports two frontmatter formats (the traditional and the "new" headmatter); both should be supported.

## Constraints

- **Tech Stack**: Astro as the core framework — all build, SSR, and component rendering goes through Astro
- **Format compatibility**: Must parse and render existing valid Slidev `.md` files without modification
- **Distribution**: Published to npm as a CLI tool; users run `npx slidastro dev presentation.md`
- **Node.js**: ≥20.12.0 (matching Slidev's requirement)
- **Open source**: MIT license

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Astro as core (not Vite+Vue) | Enables multi-framework component support via island architecture | — Validated |
| Support Slidev .md early, defer native formats | Focuses on core compatibility first (FOUND-03 moved to Phase 6) | [2026-04-09] |
| Use `cac` for CLI | Lightweight and sufficient for Slidastro's command structure | [2026-04-09] |
| Use `@antfu/eslint-config` | Industry standard for modern ESM projects, consistent with Slidev | [2026-04-09] |
| CLI distribution (not integration) | Matches Slidev's UX — one command to start, no existing project required | [2026-04-10] |
| Reference `_slidev` source, don't fork it | Keeps Slidastro's codebase clean; use Slidev as spec not dependency | [2026-04-07] |
| Port Slidev's parsing logic directly | Ensures 100% compatibility with existing .md files and edge cases. | [2026-04-10] |
| Adopt Astro's programmatic dev API | Gives Slidastro full control over the presentation environment. | [2026-04-10] |
| Use Vite virtual modules for data bridge | Bridging file-system markdown to browser JS environment efficiently. | [2026-04-10] |
| Implement MasterOverlay as UI controller | Provides centralized shortcut engine and clean audience view. | [2026-04-16] |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-04-16 after Milestone v3.0 completion*
