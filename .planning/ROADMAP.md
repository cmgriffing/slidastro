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

### Milestone v2.0: Polishing & Experience (Complete)
- [x] **Phase 7: Rendering and Click Interaction Polish** - Framework-neutral naming and refined animations (completed 2026-04-13)
- [x] **Phase 8: Layout Parity and Styling** - Missing Slidev layouts and UnoCSS refinements (completed 2026-04-14)
- [x] **Phase 9: Presenter Experience Parity** - Refined presenter UI and improved synchronization (completed 2026-04-14)

### Milestone v3.0: Root View & Layout Refinement (Complete)
- [x] **Phase 10: Analysis & Normal Mode Layout** - Refine slide centering and professional presentation stage (completed 2024-05-22)
- [x] **Phase 11: UI Separation & Master Controller** - Decouple presenter-focused UI from root view with a master controller (completed 2025-04-16)
- [x] **Phase 12: Keyboard Shortcuts & Interaction Polish** - Refine accessibility and tool toggling (completed 2026-04-16)

### Milestone v4.0: Full Feature Parity
- [x] **Phase 13: Core Click Logic & State** - Cross-island click synchronization and advanced reveal logic (completed 2025-04-16)
- [ ] **Phase 14: Content Built-in Components** - Essential structural and media components (Toc, Tweet, Youtube, Video, Link)
- [x] **Phase 15: Visual Polish & Annotations** - Auto-fitting text and hand-drawn annotations (s-mark) (completed 2026-04-18)
- [ ] **Phase 16: Advanced Code Transitions** - Smooth code morphing with ShikiMagicMove
- [ ] **Phase 17: Interactive Persistence** - Draggable elements with dev-mode persistence back to source

## Phase Details

### Phase 13: Core Click Logic & State (Complete)
**Goal**: Establish a unified, cross-framework click state and advanced reveal logic.
**Depends on**: Phase 12
**Requirements**: CLICK-01, CLICK-02, CLICK-03, CLICK-04, CLICK-05
**Success Criteria** (what must be TRUE):
  1. User can use `s-after` to show content immediately following a previous click without an additional user action.
  2. User can wrap multiple elements in `<s-clicks>` to reveal them one-by-one sequentially.
  3. User can use `<s-switch>` to display different content blocks specifically for designated click ranges.
  4. Global variables `$page` and `$total` are accurately available for use in Markdown and component templates.
  5. Multiple independent Astro islands (React, Vue, Svelte) correctly synchronize their local state to the global Master Click Controller (NanoStore).
**Plans**: 3 plans
- [x] 13-01-PLAN.md — Core Indexing & Directives
- [x] 13-02-PLAN.md — Advanced Reveal Components
- [x] 13-03-PLAN.md — Global Variables & Store Sync

### Phase 14: Content Built-in Components
**Goal**: Implement essential structural and media components for presentation utility.
**Depends on**: Phase 13
**Requirements**: CONT-01, CONT-02, CONT-03, CONT-04
**Success Criteria** (what must be TRUE):
  1. User can add `<s-toc />` to a slide to automatically generate a functional Table of Contents from slide headers.
  2. User can embed social posts using `<s-tweet id="..." />` with appropriate placeholder shells.
  3. User can include `<s-youtube id="..." />` and `<s-video src="..." />` with functional synchronized autoplay and reset logic.
  4. User can use `<s-link href="..." />` to create stylized internal navigation and external links.
**Plans**: 3 plans
- [x] 14-01-PLAN.md — Foundation & Navigation
- [ ] 14-02-PLAN.md — Embeds & Media
- [ ] 14-03-PLAN.md — Media Sync & Verification
**UI hint**: yes

### Phase 15: Visual Polish & Annotations (Complete)
**Goal**: Add "wow factor" through dynamic text scaling and hand-drawn style annotations.
**Depends on**: Phase 13
**Requirements**: VIS-02, INT-01
**Success Criteria** (what must be TRUE):
  1. Text wrapped in `<AutoFitText>` automatically scales to optimally fill its container without overflow.
  2. User can highlight text or elements with dynamic, hand-drawn styles using `<s-mark>` (powered by rough-notation).
**Plans**: 3 plans
- [x] 15-01-PLAN.md — AutoFitText Implementation
- [x] 15-02-PLAN.md — S-Mark Annotation Implementation
- [x] 15-03-PLAN.md — Integration & Multi-Format Verification
**UI hint**: yes

### Phase 16: Advanced Code Transitions
**Goal**: Enable smooth, morphing transitions between code states for better technical storytelling.
**Depends on**: Phase 13
**Requirements**: VIS-01
**Success Criteria** (what must be TRUE):
  1. User can use `<ShikiMagicMove>` to animate code transitions between different snippets or states smoothly.
  2. Transitions between code states remain performant even with larger snippets through optimized tokenization.
**Plans**: TBD
**UI hint**: yes

### Phase 17: Interactive Persistence
**Goal**: Implement draggable elements that persist their position back to the source Markdown.
**Depends on**: Phase 13
**Requirements**: INT-02
**Success Criteria** (what must be TRUE):
  1. User can mark elements as draggable using `<s-drag>`.
  2. In dev mode, moving a draggable element triggers a persistent update back to the presentation's `.md` file.
**Plans**: TBD

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
| 8. Layout Parity and Styling | 3/3 | Complete | 2026-04-14 |
| 9. Presenter Experience Parity | 3/3 | Complete | 2026-04-14 |
| 10. Analysis & Normal Mode Layout | 2/2 | Complete | 2024-05-22 |
| 11. UI Separation & Master Controller | 1/1 | Complete | 2025-04-16 |
| 12. Keyboard Shortcuts & Interaction Polish | 1/1 | Complete | 2026-04-16 |
| 13. Core Click Logic & State | 3/3 | Complete | 2025-04-16 |
| 14. Content Built-in Components | 1/3 | In Progress|  |
| 15. Visual Polish & Annotations | 3/3 | Complete | 2026-04-18 |
| 16. Advanced Code Transitions | 1/3 | In Progress|  |
| 17. Interactive Persistence | 2/3 | In Progress|  |
