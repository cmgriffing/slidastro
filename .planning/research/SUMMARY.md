# Research Summary: Slidastro v4.0 Full Feature Parity

**Milestone:** v4.0 Full Feature Parity
**Researched:** 2026-04-18
**Status:** COMPLETE

## Executive Summary

Slidastro v4.0 aims to achieve high-fidelity feature parity with the Slidev ecosystem while leveraging Astro's island architecture. The research concludes that the "Slidev feel" is primarily driven by sophisticated click-based state management and high-quality visual annotations. To succeed in an Astro environment, Slidastro must solve the challenge of synchronizing independent framework islands (React/Vue/Svelte) through a unified reactive state bridge.

The recommended approach involves implementing a **Master Click Controller** (using Nano Stores) that allows diverse components to register their click requirements and react to global navigation events. Key differentiators like `ShikiMagicMove` and `s-mark` (powered by Rough Notation) will provide the "wow factor," while standard features like `Toc` and `Video` ensure professional utility.

The primary risks identified are global click state desync between islands and performance overhead during complex code transitions. These will be mitigated by a robust registration-based click architecture and optimized tokenization strategies for code animations.

---

## Key Findings

### Technology Stack (from STACK.md)
*   **Core Engine:** Astro (^4.0.0) remains the foundation for multi-framework island support.
*   **Visual Annotations:** `rough-notation` (^0.5.2) for hand-drawn, dynamic annotations (`s-mark`).
*   **Code Transitions:** `shiki-magic-move` (^0.4.0) and `lz-string` for high-performance code morphing.
*   **Utilities:** `@vueuse/core` (^10.0.0) for responsive measurement (`AutoFitText`) and state management.

### Feature Landscape (from FEATURES.md)
*   **Table Stakes:** Advanced click logic (`s-clicks`, `s-after`), structural navigation (`Toc`, `Link`), and media embeds (`Youtube`, `Video`).
*   **Differentiators:** `ShikiMagicMove` for code, `s-mark` for annotations, and `AutoFitText` for responsive layouts.
*   **Anti-Features:** Explicitly avoid native video editing and WYSIWYG builders to maintain a "Developer-First" focus.

### Architecture Patterns (from ARCHITECTURE.md)
*   **Shared Click Context:** A centralized registry where components report their click requirements (e.g., "I need clicks 2 through 4").
*   **Master Controller:** A singleton bridge (Nano Stores) to sync independent Astro islands.
*   **Slot-based Switching:** Utilizing named slots (`<template #1-2>`) for complex content toggling based on click ranges.

### Critical Pitfalls (from PITFALLS.md)
*   **Island Desync:** Independent hydration can lead to "ghost clicks." Solution: Master Click Controller.
*   **Measurement Race Conditions:** `AutoFitText` calculation before fonts load. Solution: `ResizeObserver` + `document.fonts.ready`.
*   **Shiki Performance:** Tokenization overhead during transitions. Solution: Shared highlighter instance and server-side pre-tokenization.

---

## Implications for Roadmap

The research suggests a 4-phase approach to building v4.0, prioritized by dependency and risk.

### Phase 1: Core State & Click Logic
*   **Rationale:** Foundation for all interactive features. Without a shared click state, islands cannot synchronize.
*   **Delivers:** Master Click Controller, `s-clicks`, `s-after`, `s-switch`.
*   **Pitfalls to avoid:** Island desync (Pitfall 1).

### Phase 2: Structural & Standard Content
*   **Rationale:** High value for presentation utility with low technical risk.
*   **Delivers:** `Toc`, `Link`, `$page`, `$total`, `Youtube`, `Video`.
*   **Pitfalls to avoid:** Performance traps with many embeds (Performance Traps).

### Phase 3: Visual & High-Fidelity Enhancements
*   **Rationale:** Major differentiators that require more complex integration and performance tuning.
*   **Delivers:** `s-mark`, `AutoFitText`, `ShikiMagicMove`.
*   **Pitfalls to avoid:** Layout measurement errors (Pitfall 2) and Shiki jank (Pitfall 3).

### Phase 4: Interactive & Persistent Features
*   **Rationale:** Features requiring a bridge back to the source Markdown (First-POST magic).
*   **Delivers:** `s-drag`, `s-click-gap`.
*   **Pitfalls to avoid:** Source-truth divergence/Markdown corruption (Pitfall 4).

---

## Research Flags & Gaps

| Area | Flag | Recommendation |
|------|------|----------------|
| **Click Logic** | Standard Pattern | Can proceed directly to implementation. |
| **ShikiMagicMove** | Needs Research | Deep-dive into Astro-specific pre-tokenization (v4.x). |
| **s-drag Persistence** | Needs Research | Validate WebSocket/First-POST bridge for Markdown updates. |
| **PDF Export** | Gap | Research how `ShikiMagicMove` and `s-mark` behave in print mode. |

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | **HIGH** | Modern, well-supported libraries identified for all key features. |
| Features | **HIGH** | Directly mapped from Slidev source code and user expectations. |
| Architecture | **HIGH** | Addresses specific Astro island limitations with proven patterns. |
| Pitfalls | **HIGH** | Captures real-world issues with slide engines and hydration. |

**Overall Research Confidence: HIGH**

---

## Sources
*   `_slidev/packages/client/builtin/` (Component implementations)
*   `_slidev/packages/client/context.ts` (State management)
*   `_slidev/package.json` (Dependency versions)
*   Rough Notation Documentation
*   Shiki Magic Move Documentation
*   Slidev GitHub Issues (#1422)
