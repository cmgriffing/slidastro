# Roadmap: Slidastro

Slidastro is an Astro-powered slide presentation CLI tool that brings Slidev's developer experience to the Astro ecosystem, enabling multi-framework island components in presentations.

## Phases

### Milestone v1.0: Foundation (Complete)
- [x] **Phase 1: Foundation** - Parser, CLI, and minimal Astro integration
- [x] **Phase 2: Visual Foundation** - Layouts, themes, and rendering pipeline
- [x] **Phase 3: Client SPA & Interactivity** - Navigation, clicks, and transitions
- [x] **Phase 4: Presenter Mode & State Sync** - Synchronized presenter view and speaker notes
- [x] **Phase 5: Export & Build** - Static build and PDF/PNG/PPTX export
- [x] **Phase 6: Ecosystem & Advanced Features** - Diagrams, drawings, and native formats

### Milestone v2.0: Polishing & Experience (Active)
- [ ] **Phase 7: Rendering and Click Interaction Polish** - Framework-neutral naming and refined animations
- [ ] **Phase 8: Layout Parity and Styling** - Missing Slidev layouts and UnoCSS refinements
- [ ] **Phase 9: Presenter Experience Parity** - Refined presenter UI and improved synchronization

## Phase Details

### Phase 1: Foundation
**Goal**: Establish the core data pipeline and CLI that can start an Astro dev server.
**Depends on**: Nothing
**Requirements**: FOUND-01, FOUND-02, FOUND-03, FOUND-04, FOUND-05
**Success Criteria** (what must be TRUE):
  1. User can run `slidastro dev slides.md` and see the content of the first slide in a browser.
  2. The parser correctly splits a Slidev-compatible `.md` file into individual slides, respecting `---` separators even inside code blocks.
  3. Edits to the `.md" file trigger a hot module reload (HMR) update in the browser.
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
- [x] 04-02-PLAN.md — Presenter Mode Route & Layout
- [x] 04-03-PLAN.md — Presentation Timer & WebSocket Sync
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
  - **Pitfall #12**: Exporting dynamic/interactive content to static PDF.
**Plans**:
- [x] 05-01-PLAN.md — Static Build & PDF Export

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
**Plans**:
- [x] 06-01-PLAN.md — Advanced Rendering
- [x] 06-02-PLAN.md — Live Interactivity
- [x] 06-03-PLAN.md — Native Formats

### Phase 7: Rendering and Click Interaction Polish
**Goal**: Refine the core interactive experience with better naming and high-quality animations.
**Depends on**: Phase 6
**Requirements**: POL-01, POL-02, POL-03, POL-04
**Success Criteria** (what must be TRUE):
  1. User can use `s-click` and `<s-click>` instead of `v-click` for animations.
  2. Any element with an `s-click` attribute (e.g., `<p s-click>`) is correctly handled by the click engine.
  3. Animations and transitions no longer have the "off" feeling (jitter or inconsistent timing).
  4. Advanced ranges like `s-click="1-3"` allow an element to be visible only during specific click steps.
**Complexity**: Medium
**Critical Risks**:
  - **Pitfall #23**: Migrating from v-click to s-click while maintaining backward compatibility (optional but recommended).
  - **Pitfall #24**: Complexity of range-based visibility logic in the click engine.
**Plans**:
- [x] 07-01-PLAN.md — s-click & Range Logic
**UI hint**: yes

### Phase 8: Layout Parity and Styling
**Goal**: Achieve visual parity with Slidev's layout system and aesthetic quality.
**Depends on**: Phase 7
**Requirements**: POL-05, POL-06, POL-07
**Success Criteria** (what must be TRUE):
  1. All standard Slidev layouts (`center`, `fact`, `full`, `image-left`, `image-right`, etc.) are available and match Slidev's behavior.
  2. Layouts use UnoCSS for styling, resulting in a polished, professional look.
  3. Multiple slots (e.g., in `two-cols`) are handled robustly across all layouts.
  4. Layouts are responsive and adapt correctly to different screen sizes.
**Complexity**: Medium
**Critical Risks**:
  - **Pitfall #25**: Ensuring consistent slot naming and behavior across all ported layouts.
**Plans**:
- [x] 08-01-PLAN.md — Layout Infrastructure & Refinement
- [ ] 08-02-PLAN.md — Content Focus Layouts
- [ ] 08-03-PLAN.md — Media & Embed Layouts
**UI hint**: yes

### Phase 9: Presenter Experience Parity
**Goal**: Refine the presenter experience to match Slidev's rich feature set and helpful dev feedback.
**Depends on**: Phase 8
**Requirements**: PRES-06, PRES-07, PRES-08
**Success Criteria** (what must be TRUE):
  1. The CLI output on dev server start displays all relevant URLs (Main, Presenter, Overview, Print).
  2. The Presenter Mode UI includes speaker notes, a functional timer, and a "next slide" preview.
  3. State synchronization between the presenter window and the audience window is robust and instantaneous.
**Complexity**: Medium
**Critical Risks**:
  - **Pitfall #26**: Complexity of rendering a "next slide" preview without causing performance issues or recursion.
**Plans**: TBD
**UI hint**: yes

## Progress

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation | 4/4 | Complete | 2026-04-09 |
| 2. Visual Foundation | 4/4 | Complete | 2026-04-10 |
| 3. Client SPA & Interactivity | 1/1 | Complete | 2026-04-10 |
| 4. Presenter Mode & State Sync | 3/3 | Complete | 2026-04-11 |
| 5. Export & Build | 1/1 | Complete | 2026-04-11 |
| 6. Ecosystem & Advanced Features | 3/3 | Complete | 2026-04-11 |
| 7. Rendering and Click Interaction Polish | 1/1 | Complete | 2026-04-13 |
| 8. Layout Parity and Styling | 1/3 | Active | - |
| 9. Presenter Experience Parity | 0/0 | Not started | - |
