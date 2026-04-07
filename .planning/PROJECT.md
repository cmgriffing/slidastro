# Slidastro

## What This Is

Slidastro is an Astro-powered slide presentation CLI tool with full feature parity with Slidev. It lets developers write presentations in Markdown (compatible with Slidev's `.md` format or Astro-native `.mdx`/`.astro` formats) and use components from any framework — React, Vue, Svelte, Solid, and more — within a single presentation, powered by Astro's island architecture.

## Core Value

Developers can author presentations with multi-framework component support, using the same Markdown workflow as Slidev but with the flexibility of Astro's island system.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] CLI tool (`slidastro dev`, `slidastro build`, `slidastro export`) published to npm
- [ ] Markdown slide authoring with `---` separator and frontmatter (Slidev-compatible format)
- [ ] Astro-native format support (`.mdx` and `.astro` slide files)
- [ ] Multi-framework component support in slides (React, Vue, Svelte, Solid via Astro integrations)
- [ ] Dev server with hot module reload
- [ ] Presenter mode (dual window: audience view + speaker notes + timer)
- [ ] Speaker notes in slides
- [ ] Slide transitions and animations
- [ ] Click-to-advance step animations
- [ ] Code syntax highlighting (Shiki)
- [ ] Themes system (installable via npm)
- [ ] Layouts system (built-in and custom)
- [ ] Export to PDF, PPTX, and PNG
- [ ] LaTeX/math support (KaTeX)
- [ ] Mermaid diagram support
- [ ] Drawing and annotation tools overlay
- [ ] Recording mode
- [ ] Overview/grid mode (slide navigator)
- [ ] Print mode
- [ ] Remote presenter control (separate presenter window)
- [ ] Monaco editor integration (code editing in slides)

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
| Astro as core (not Vite+Vue) | Enables multi-framework component support via island architecture | — Pending |
| Support both Slidev .md AND Astro-native formats | Lowers adoption barrier for existing Slidev users while enabling Astro-native authoring | — Pending |
| CLI distribution (not integration) | Matches Slidev's UX — one command to start, no existing project required | — Pending |
| Reference `_slidev` source, don't fork it | Keeps Slidastro's codebase clean; use Slidev as spec not dependency | — Pending |

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
*Last updated: 2026-04-07 after initialization*
