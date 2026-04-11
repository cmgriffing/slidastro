# Roadmap: Slidastro

Slidastro is an Astro-powered slide presentation CLI tool that brings Slidev's developer experience to the Astro ecosystem, enabling multi-framework island components in presentations.

## Phases

- [x] **Phase 1: Foundation** - Parser, CLI, and minimal Astro integration
- [x] **Phase 2: Visual Foundation** - Layouts, themes, and rendering pipeline
- [ ] **Phase 3: Client SPA & Interactivity** - Navigation, clicks, and transitions
- [ ] **Phase 4: Presenter Mode & State Sync** - Synchronized presenter view and speaker notes
- [ ] **Phase 5: Export & Build** - Static build and PDF/PNG/PPTX export
- [ ] **Phase 6: Ecosystem & Advanced Features** - Diagrams, drawings, and native formats

## Phase Details

### Phase 1: Foundation
**Goal**: Establish the core data pipeline and CLI that can start an Astro dev server.
**Depends on**: Nothing
**Requirements**: FOUND-01, FOUND-02, FOUND-03, FOUND-04, FOUND-05
**Success Criteria** (what must be TRUE):
  1. User can run `slidastro dev slides.md` and see the content of the first slide in a browser.
  2. The parser correctly splits a Slidev-compatible `.md` file into individual slides, respecting `---` separators even inside code blocks.
  3. Edits to the `.md` file trigger a hot module reload (HMR) update in the browser.
**Complexity**: High (establishing the Astro-Vite-Virtual Module bridge)
**Critical Risks**:
  - **Pitfall #1**: Choosing MPA routing instead of SPA shell. (Must use SPA shell early).
  - **Pitfall #5**: Subtle `---` separator edge cases in the parser. (Port Slidev parser directly).
  - **Pitfall #9**: Astro programmatic API instability. (Pin Astro version).
**Plans**:
- [x] 01-01-PLAN.md — Monorepo & Types
- [x] 01-02-PLAN.md — TDD Parser
- [x] 01-03-PLAN.md — CLI & Astro Integration
- [x] 01-04-PLAN.md — Rendering & HMR

### Phase 2: Visual Foundation
**Goal**: Implement the visual system including layouts, themes, and CSS scaling.
**Depends on**: Phase 1
**Requirements**: VIS-01, VIS-02, VIS-03, VIS-04
**Success Criteria** (what must be TRUE):
  1. User can specify built-in layouts (e.g., `cover`, `two-cols`) in frontmatter, and they render correctly.
  2. Slides maintain a consistent aspect ratio (configurable, default 16:9) via CSS transforms.
  3. User can provide local custom layouts in a `layouts/` directory.
  4. Themes can be loaded from external npm packages with Slidev-compatible structure.
  5. Code blocks render with Shiki syntax highlighting and math with KaTeX.
**Complexity**: Medium
**Critical Risks**:
  - **Pitfall #13**: Slide scaling and aspect ratio math. (Use top-left transform-origin and explicit centering).
  - **Pitfall #10**: Full-page HMR instead of per-slide. (Implement surgical virtual module invalidation).
**Plans**:
- [x] 02-01-PLAN.md — Markdown Rendering & Surgical HMR
- [x] 02-02-PLAN.md — Precise Slide Scaling & Dynamic Aspect Ratio
- [x] 02-03-PLAN.md — Layout System & Type Updates
- [x] 02-04-PLAN.md — Theme Framework & Robust Resolution
**UI hint**: yes

### Phase 3: Client SPA & Interactivity
**Goal**: Transform the slide deck into a seamless, interactive client-side SPA.
**Depends on**: Phase 2
**Requirements**: INTER-01, INTER-02, INTER-03, INTER-04
**Success Criteria** (what must be TRUE):
  1. User can navigate between slides using keyboard/mouse without full page reloads.
  2. The URL updates to `/[slide-number]` automatically.
  3. Elements with `v-click` (or equivalent) appear/disappear sequentially on click.
  4. Slide transitions (fade, slide) animate correctly between slides.
**Complexity**: High (Click system and navigation state management)
**Critical Risks**:
  - **Pitfall #3**: Click animation system complexity. (Build framework-agnostic core).
  - **Pitfall #7**: Island hydration timing breaks transitions. (Custom hydration strategy).
**Plans**:
- [x] 03-01-PLAN.md — Client-Side SPA Navigation & v-click Engine
**UI hint**: yes

### Phase 4: Presenter Mode & State Sync
**Goal**: Create a synchronized presenter experience with speaker notes and timers.
**Depends on**: Phase 3
**Requirements**: PRES-01, PRES-02, PRES-03, PRES-04, PRES-05
**Success Criteria** (what must be TRUE):
  1. User can open a separate presenter window (`/presenter/1`) that stays in sync with the main viewer.
  2. Speaker notes (from HTML comments) are visible in the presenter window.
  3. A timer tracks presentation duration and per-slide timing.
  4. State sync works via BroadcastChannel (same browser) and WebSockets (dev/remote).
**Complexity**: Medium-High
**Critical Risks**:
  - **Pitfall #4**: Presenter mode state synchronization. (Implement custom WebSocket server integration).
**Plans**:
- [x] 04-01-PLAN.md — Shared State & BroadcastChannel
- [ ] 04-02-PLAN.md — Presenter Mode Route & Layout
- [ ] 04-03-PLAN.md — Presentation Timer & WebSocket Sync
**UI hint**: yes

### Phase 5: Export & Build
**Goal**: Deliver reliable production builds and high-quality PDF exports.
**Depends on**: Phase 4
**Requirements**: EXP-01, EXP-02, EXP-03, EXP-04
**Success Criteria** (what must be TRUE):
  1. `slidastro build` produces a deployable static site.
  2. `slidastro export` produces a PDF that perfectly matches the screen rendering.
  3. Export handles all async content (Mermaid, images, fonts) correctly.
**Complexity**: Medium
**Critical Risks**:
  - **Pitfall #6**: PDF Export complexity with async content. (Port Slidev's wait-for patterns).
**Plans**: TBD

### Phase 6: Ecosystem & Advanced Features
**Goal**: Expand features with diagrams, live drawing, and native Astro file support.
**Depends on**: Phase 5
**Requirements**: ADV-01, ADV-02, ADV-03, ADV-04, FOUND-03
**Success Criteria** (what must be TRUE):
  1. User can render Mermaid diagrams within slides.
  2. Drawing tools (drauu) allow live annotation over slides.
  3. Monaco editor integration allows live code editing in-slide.
  4. Support for native `.mdx` and `.astro` slide files is fully integrated.
**Complexity**: High (Monaco and Native format support)
**Critical Risks**:
  - **Pitfall #15**: Monaco editor integration complexity.
**Plans**: TBD
**UI hint**: yes

## Progress

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation | 4/4 | Complete | 2026-04-09 |
| 2. Visual Foundation | 4/4 | Complete | 2026-04-10 |
| 3. Client SPA & Interactivity | 1/1 | Complete | 2026-04-10 |
| 4. Presenter Mode & State Sync | 0/TBD | Not started | - |
| 5. Export & Build | 0/TBD | Not started | - |
| 6. Ecosystem & Advanced Features | 0/TBD | Not started | - |
