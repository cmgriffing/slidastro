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

### Milestone v3.0: Root View & Layout Refinement (Active)
- [x] **Phase 10: Analysis & Normal Mode Layout** - Refine slide centering and professional presentation stage (completed 2024-05-22)
- [ ] **Phase 11: UI Separation & Master Controller** - Decouple presenter-focused UI from root view with a master controller
- [ ] **Phase 12: Keyboard Shortcuts & Interaction Polish** - Refine accessibility and tool toggling

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
- [ ] 11-01-PLAN.md — UI State & Master Controller implementation
**UI hint**: yes

### Phase 12: Keyboard Shortcuts & Interaction Polish
**Goal**: Provide professional-level tool access via shortcuts and refined interactions.
**Depends on**: Phase 11
**Requirements**: LAYOUT-04
**Success Criteria** (what must be TRUE):
  1. Standard Slidev-compatible shortcuts (e.g., 'D' for drawing, 'T' for theme) toggle their respective UI elements.
  2. UI transitions for appearing/disappearing toolbars are smooth and non-disruptive.
  3. The "Master Overlay" can be summoned with a specific shortcut to show all available tools.
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
| 8. Layout Parity and Styling | 3/3 | Complete | 2026-04-14 |
| 9. Presenter Experience Parity | 3/3 | Complete | 2026-04-14 |
| 10. Analysis & Normal Mode Layout | 2/2 | Complete | 2024-05-22 |
| 11. UI Separation & Master Controller | 0/1 | Active | - |
| 12. Keyboard Shortcuts & Interaction Polish | 0/1 | Not started | - |
