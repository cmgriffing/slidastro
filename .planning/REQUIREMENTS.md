# Milestone v4.0 Requirements: Full Feature Parity

## Milestone Goal
Bridge the remaining gap between Slidastro and Slidev by implementing advanced built-in components and interactive logic, using framework-neutral `s-` prefixes.

## Requirements

### Advanced Click Logic & Context
- [ ] **CLICK-01**: Implement `s-after` directive to reveal content immediately after the previous click.
- [ ] **CLICK-02**: Implement `s-clicks` component/directive to reveal children one by one with nested support.
- [ ] **CLICK-03**: Implement `s-switch` component to display different content based on specific click ranges.
- [ ] **CLICK-04**: Expose `$page` (current slide index) and `$total` (total slide count) as global variables in Markdown and components.
- [ ] **CLICK-05**: Implement a centralized "Master Click Controller" (NanoStore) to synchronize independent Astro islands.

### Interactive Components
- [ ] **INT-01**: Implement `s-mark` component/directive for hand-drawn style annotations using `rough-notation`.
- [ ] **INT-02**: Implement `s-drag` component for draggable elements with dev-mode persistence (WebSocket bridge to .md).

### Content Built-ins
- [ ] **CONT-01**: Implement `Toc` component to automatically generate a Table of Contents from slide headers.
- [ ] **CONT-02**: Implement `Tweet` component for embedding Twitter/X posts with placeholder shells.
- [ ] **CONT-03**: Implement `Youtube` and `Video` components with synchronized autoplay/reset logic.
- [ ] **CONT-04**: Implement `Link` component for stylized internal and external links.

### Visual & Text Enhancements
- [ ] **VIS-01**: Implement `ShikiMagicMove` component for smooth code transitions between states.
- [ ] **VIS-02**: Implement `AutoFitText` component to automatically scale text content to fit its container.

## Future Requirements
- [ ] VS Code extension for Slidastro.
- [ ] Collaboration mode (real-time shared state).

## Out of Scope
- [ ] Forking Slidev core (keep Slidastro as a clean Astro-native implementation).
- [ ] Native mobile applications.

## Traceability
*To be filled by the roadmapper.*
