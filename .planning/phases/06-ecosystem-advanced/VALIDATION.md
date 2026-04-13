# Phase 6: Ecosystem & Advanced Features - Validation Plan

This document outlines the validation strategy for Phase 6, ensuring that advanced rendering (Mermaid, Monaco), interactive features (Drauu, Recording), and Astro-native authoring (.astro, .mdx) are correctly implemented and integrated.

## Requirements Coverage

| Req ID | Requirement | Test Type | Test File |
|--------|-------------|-----------|-----------|
| ADV-01 | Mermaid Diagrams | E2E | `cypress/e2e/mermaid.cy.ts` |
| ADV-02 | Drauu Drawing Sync | E2E / Unit | `cypress/e2e/drawing.cy.ts`, `tests/drauu-sync.test.ts` |
| ADV-03 | In-Browser Recording | Unit | `tests/recording-logic.test.ts` |
| ADV-04 | Monaco Editor with ATA | E2E | `cypress/e2e/monaco.cy.ts` |
| FOUND-03| .astro / .mdx support | Unit | `tests/virtual-splitting.test.ts`, `tests/mdx-rendering.test.ts` |

## Automated Tests

### Unit Tests (Vitest)
Unit tests focus on the logic of state synchronization, file splitting, and media recording logic.

- **Drauu State Sync (`tests/drauu-sync.test.ts`)**:
  - Verify Nano Store updates on drawing events.
  - Verify sync events correctly update the store and Drauu instance.
- **Recording Logic (`tests/recording-logic.test.ts`)**:
  - Verify MediaRecorder initialization.
  - Verify canvas composition logic for PiP camera.
- **Virtual Splitting (`tests/virtual-splitting.test.ts`)**:
  - Verify `.astro` files are split by `---`.
  - Verify shared logic block is prepended to all virtual slides.
  - Verify `.mdx` frontmatter inheritance.
- **MDX Rendering (`tests/mdx-rendering.test.ts`)**:
  - Verify MDX content is correctly processed into the Astro virtual module pipeline.

### E2E Tests (Cypress)
E2E tests focus on visual rendering and multi-window interactivity.

- **Mermaid Rendering (`cypress/e2e/mermaid.cy.ts`)**:
  - Verify Mermaid diagrams render as SVGs.
  - Verify theme changes (dark/light) trigger a re-render with correct styles.
- **Monaco Editor (`cypress/e2e/monaco.cy.ts`)**:
  - Verify Monaco initializes in code blocks.
  - Verify Automatic Type Acquisition (ATA) pulls in types for external imports.
- **Interactive Drawing (`cypress/e2e/drawing.cy.ts`)**:
  - Verify drawing on one "presenter" window appears in the "audience" window.
  - Verify drawings persist across navigation.

## Manual Verification (Checkpoints)

1. **Recording Quality**: Manually start a recording, perform some slide transitions, stop, and verify the resulting `.webm` file plays correctly and includes both screen and camera feeds.
2. **Monaco UX**: Verify that the editor feels responsive and that hover-tooltips for types appear as expected.

## Success Criteria

- [ ] All Vitest suites pass.
- [ ] All Cypress specs pass.
- [ ] Mermaid diagrams update theme without page refresh.
- [ ] Drawings sync within < 100ms between tabs.
- [ ] .astro and .mdx entries work with `slidastro dev` and `slidastro build`.
