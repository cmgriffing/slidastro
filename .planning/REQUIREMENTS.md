# Requirements: Slidastro

## v1 Requirements

### Foundation
- **FOUND-01**: CLI tool (`slidastro dev`, `slidastro build`, `slidastro export`) published to npm
- **FOUND-02**: Markdown slide authoring with `---` separator and frontmatter (Slidev-compatible format)
- **FOUND-03**: Astro-native format support (`.mdx` and `.astro` slide files)
- **FOUND-04**: Dev server with hot module reload (HMR) for markdown edits
- **FOUND-05**: Multi-framework component support in slides (Astro islands: React, Vue, Svelte, Solid)

### Visuals & Styling
- **VIS-01**: Layouts system (built-in and custom/user-provided)
- **VIS-02**: Themes system (installable via npm, Slidev-compatible structure)
- **VIS-03**: Code syntax highlighting using Shiki
- **VIS-04**: LaTeX/math support via KaTeX

### Client & Interactivity
- **INTER-01**: SPA-style client navigation (no full-page reloads)
- **INTER-02**: Slide transitions and animations (fade, slide, etc.)
- **INTER-03**: Click-to-advance step animations (`v-click` equivalent)
- **INTER-04**: Overview/grid mode (slide navigator)

### Presenter Mode
- **PRES-01**: Dual-window presenter mode (audience view + speaker view)
- **PRES-02**: Speaker notes extraction and display
- **PRES-03**: State synchronization between windows (WebSocket/BroadcastChannel)
- **PRES-04**: Remote presenter control
- **PRES-05**: Presentation timer (stopwatch/countdown)

### Export & Build
- **EXP-01**: Static build command (`slidastro build`)
- **EXP-02**: Export to PDF (reliable, waits for async content)
- **EXP-03**: Export to PNG and PPTX
- **EXP-04**: Print mode (CSS @media print optimization)

### Advanced Features
- **ADV-01**: Mermaid diagram support
- **ADV-02**: Drawing and annotation tools overlay (drauu)
- **ADV-03**: In-browser recording mode
- **ADV-04**: Monaco editor integration for live code editing

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| FOUND-01 | Phase 1 | Complete |
| FOUND-02 | Phase 1 | Pending |
| FOUND-03 | Phase 6 | Pending |
| FOUND-04 | Phase 1 | Pending |
| FOUND-05 | Phase 1 | Pending |
| VIS-01 | Phase 2 | Pending |
| VIS-02 | Phase 2 | Pending |
| VIS-03 | Phase 2 | Pending |
| VIS-04 | Phase 2 | Pending |
| INTER-01 | Phase 3 | Pending |
| INTER-02 | Phase 3 | Pending |
| INTER-03 | Phase 3 | Pending |
| INTER-04 | Phase 3 | Pending |
| PRES-01 | Phase 4 | Complete |
| PRES-02 | Phase 4 | Complete |
| PRES-03 | Phase 4 | Complete |
| PRES-04 | Phase 4 | Complete |
| PRES-05 | Phase 4 | Complete |
| EXP-01 | Phase 5 | Pending |
| EXP-02 | Phase 5 | Pending |
| EXP-03 | Phase 5 | Pending |
| EXP-04 | Phase 5 | Pending |
| ADV-01 | Phase 6 | Pending |
| ADV-02 | Phase 6 | Pending |
| ADV-03 | Phase 6 | Pending |
| ADV-04 | Phase 6 | Pending |
