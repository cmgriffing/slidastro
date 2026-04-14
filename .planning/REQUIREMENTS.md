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

## v2 Requirements (Polishing & Experience)

### Core Polish
- **POL-01**: Rename `v-click` and `<v-click>` to `s-click` and `<s-click>` (framework-neutral naming)
- **POL-02**: Support `s-click` as a directive/attribute on any element, not just as a tag
- **POL-03**: Improve rendering consistency and transition quality (fix "off" feeling during animations)
- **POL-04**: Enhanced `s-click` logic to support complex sequences and ranges (e.g., `s-click="1-3"`, `s-click="2"`)
- **POL-05**: Implement full set of Slidev-compatible layouts (center, fact, full, image-left, image-right, etc.)
- **POL-06**: Refine layout styling with UnoCSS for professional "Slidev-level" visual quality
- **POL-07**: Robust slot handling and responsive design for all built-in layouts

### Presenter Experience Parity
- **PRES-06**: Show all relevant URLs (Main, Presenter, Overview, Print) when starting the dev server.
- **PRES-07**: Refine the Presenter Mode UI to match Slidev's layout and features (notes, timer, next slide preview).
- **PRES-08**: Improve synchronization between Presenter and Slide modes for a seamless experience.

## Future / Postponed

### Cinematic Experience (Postponed)
- **VIS-05**: Shiki Magic Move integration for high-fidelity code animations
- **VIS-06**: Advanced View Transitions (element-level morphing between slides)
- **VIS-07**: Modern Bento Layout system using CSS Grid/Subgrid

### Edge-Native & Live Mode (Postponed)
- **LIVE-01**: Cloudflare D1/KV integration for persistent live session state
- **LIVE-02**: Real-time audience interaction components (polls, Q&A)
- **LIVE-03**: Low-latency remote presenter control via WebRTC or Edge relay
- **LIVE-04**: Astro Server Islands for dynamic, per-request slide content

### AI-Native Authoring (Postponed)
- **AI-01**: Integrated Workers AI for slide generation from prompts
- **AI-02**: Automated speaker notes generation from slide content
- **AI-03**: AI-driven image generation for slide visuals

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| FOUND-01 | Phase 1 | Complete |
| FOUND-02 | Phase 1 | Complete |
| FOUND-03 | Phase 6 | Complete |
| FOUND-04 | Phase 1 | Complete |
| FOUND-05 | Phase 1 | Complete |
| VIS-01 | Phase 2 | Complete |
| VIS-02 | Phase 2 | Complete |
| VIS-03 | Phase 2 | Complete |
| VIS-04 | Phase 2 | Complete |
| INTER-01 | Phase 3 | Complete |
| INTER-02 | Phase 3 | Complete |
| INTER-03 | Phase 3 | Complete |
| INTER-04 | Phase 3 | Complete |
| PRES-01 | Phase 4 | Complete |
| PRES-02 | Phase 4 | Complete |
| PRES-03 | Phase 4 | Complete |
| PRES-04 | Phase 4 | Complete |
| PRES-05 | Phase 4 | Complete |
| EXP-01 | Phase 5 | Complete |
| EXP-02 | Phase 5 | Complete |
| EXP-03 | Phase 5 | Complete |
| EXP-04 | Phase 5 | Complete |
| ADV-01 | Phase 6 | Complete |
| ADV-02 | Phase 6 | Complete |
| ADV-03 | Phase 6 | Complete |
| ADV-04 | Phase 6 | Complete |
| POL-01 | Phase 7 | Complete |
| POL-02 | Phase 7 | Complete |
| POL-03 | Phase 7 | Complete |
| POL-04 | Phase 7 | Complete |
| POL-05 | Phase 8 | Pending |
| POL-06 | Phase 8 | Pending |
| POL-07 | Phase 8 | Pending |
| PRES-06 | Phase 9 | Pending |
| PRES-07 | Phase 9 | Pending |
| PRES-08 | Phase 9 | Pending |
| VIS-05 | Postponed | - |
| VIS-06 | Postponed | - |
| VIS-07 | Postponed | - |
| LIVE-01 | Postponed | - |
| LIVE-02 | Postponed | - |
| LIVE-03 | Postponed | - |
| LIVE-04 | Postponed | - |
| AI-01 | Postponed | - |
| AI-02 | Postponed | - |
| AI-03 | Postponed | - |
