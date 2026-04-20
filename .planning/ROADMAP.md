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
- [ ] **Phase 13: Core Click Logic & State** - Cross-island click synchronization and advanced reveal logic
- [ ] **Phase 14: Content Built-in Components** - Essential structural and media components (Toc, Tweet, Youtube, Video, Link)
- [ ] **Phase 15: Visual Polish & Annotations** - Auto-fitting text and hand-drawn annotations (s-mark)
- [ ] **Phase 16: Advanced Code Transitions** - Smooth code morphing with ShikiMagicMove
- [ ] **Phase 17: Interactive Persistence** - Draggable elements with dev-mode persistence back to source

## Phase Details

### Phase 10: Analysis & Normal Mode Layout
**Goal**: Refine the visual presentation of slides in the "normal" audience view.
**Depends on**: Phase 9
**Requirements**: LAYOUT-01, LAYOUT-06
**Success Criteria** (what must be TRUE):
  1. Slides are perfectly centered and scaled to the viewport with a professional "stage" background.
  2. The `SlideContainer` handles aspect ratio correctly across different browser sizes without layout shifts.
  3. All 15+ built-in layouts render correctly and use the full available space as expected.
**Plans**: 2 plans
- [x] 10-01-PLAN.md — Scaling & Stage Foundation
- [x] 10-02-PLAN.md — Layout Verification & Full-Space Utilization
**UI hint**: yes

### Phase 11: UI Separation & Master Controller
**Goal**: Remove presenter-focused clutter from the default audience view and implement a clean UI layer.
**Depends on**: Phase 10
**Requirements**: LAYOUT-02, LAYOUT-03, LAYOUT-05
**Success Criteria** (what must be TRUE):
  1. Navigating to a slide route (e.g., `/1`) shows only the slide content, with no visible toolbars by default.
  2. A "Master UI" controller manages the state and visibility of different UI layers (Audience, Presenter, Dev).
  3. Presenter-specific elements like `DrawingToolbar` and `ThemeToggle` are conditionally loaded/rendered.
**Plans**: 1 plan
- [x] 11-01-PLAN.md — UI State & Master Controller implementation
**UI hint**: yes

### Phase 12: Keyboard Shortcuts & Interaction Polish
**Goal**: Provide professional-level tool access via shortcuts and refined interactions.
**Depends on**: Phase 11
**Requirements**: LAYOUT-04
**Success Criteria** (what must be TRUE):
  1. Standard Slidev-compatible shortcuts (e.g., 'D' for drawing, 'T' for theme) toggle their respective UI elements.
  2. UI transitions for appearing/disappearing toolbars are smooth and non-disruptive.
  3. The "Master Overlay" can be summoned with a specific shortcut to show all available tools.
**Plans**: 1 plan
- [x] 12-01-PLAN.md — Shortcut Engine & Interaction Polish
**UI hint**: yes

### Phase 13: Core Click Logic & State
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
- [ ] 13-01-PLAN.md — Core Indexing & Directives
- [ ] 13-02-PLAN.md — Advanced Reveal Components
- [ ] 13-03-PLAN.md — Global Variables & Store Sync

### Phase 14: Content Built-in Components
**Goal**: Implement essential structural and media components for presentation utility.
**Depends on**: Phase 13
**Requirements**: CONT-01, CONT-02, CONT-03, CONT-04
**Success Criteria** (what must be TRUE):
  1. User can add `<Toc />` to a slide to automatically generate a functional Table of Contents from slide headers.
  2. User can embed social posts using `<Tweet id="..." />` with appropriate placeholder shells.
  3. User can include `<Youtube id="..." />` and `<Video src="..." />` with functional synchronized autoplay and reset logic.
  4. User can use `<Link to="..." />` to create stylized internal navigation and external links.
**Plans**: TBD
**UI hint**: yes

### Phase 15: Visual Polish & Annotations
**Goal**: Add "wow factor" through dynamic text scaling and hand-drawn style annotations.
**Depends on**: Phase 13
**Requirements**: VIS-02, INT-01
**Success Criteria** (what must be TRUE):
  1. Text wrapped in `<AutoFitText>` automatically scales to optimally fill its container without overflow.
  2. User can highlight text or elements with dynamic, hand-drawn styles using `<s-mark>` (powered by rough-notation).
**Plans**: TBD
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
| 13. Core Click Logic & State | 0/3 | In progress | - |
| 14. Content Built-in Components | 0/0 | Not started | - |
| 15. Visual Polish & Annotations | 0/0 | Not started | - |
| 16. Advanced Code Transitions | 0/0 | Not started | - |
| 17. Interactive Persistence | 0/0 | Not started | - |
