# Phase 13: Core Click Logic & State - Research

**Researched:** 2025-04-16
**Domain:** Click Synchronization & Advanced Reveal Logic
**Confidence:** HIGH

## Summary

This phase establishes a unified, cross-framework click state and advanced reveal logic for Slidastro, bridging the gap with Slidev's feature set. The research identifies a "Positioning Logic" (absolute and relative indexing) as the most robust way to handle clicks across standard Markdown and MDX/Astro slides. By using NanoStores for state and a combination of `markdown-it` (for MDX-agnostic Markdown) and `rehype` (for MDX/Astro) plugins, we can ensure consistent behavior across all slide types.

**Primary recommendation:** Implement a centralized "Positioning Logic" for click indices that supports absolute (e.g., `s-click="3"`) and relative (e.g., `s-click`, `s-after`) indexing, synchronized via NanoStores across all framework islands.

<user_constraints>
## User Constraints (from CONTEXT.md)

*No CONTEXT.md was found for this phase yet. Proceeding based on ROADMAP.md and REQUIREMENTS.md.*

### Locked Decisions
- Use `s-` prefix for all built-in directives and components (e.g., `s-click`, `s-after`, `<s-clicks>`, `<s-switch>`). [VERIFIED: ROADMAP.md]
- Use NanoStores for cross-framework state synchronization. [VERIFIED: REQUIREMENTS.md]
- Prioritize "First-POST magic" (developer experience) and API-first approach. [VERIFIED: GEMINI.md]

### the agent's Discretion
- Implementation details of the indexing algorithm.
- Choice of specific `markdown-it` and `rehype` plugins/utilities.
- Method of injecting global variables `$page` and `$total`.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| CLICK-01 | Implement `s-after` directive | Relative indexing `+0` (shares index with previous relative click). |
| CLICK-02 | Implement `s-clicks` component | Recursive child indexing using the "Positioning Logic". |
| CLICK-03 | Implement `s-switch` component | Click range visibility logic (`checkVisibility` utility). |
| CLICK-04 | Expose `$page` and `$total` | Global variable injection via MDX scope and Markdown interpolation. |
| CLICK-05 | Centralized Master Controller | NanoStore atoms (`$page`, `$clicks`) with `BroadcastChannel` sync. |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `nanostores` | ^0.10.x | State management | Framework-agnostic, lightweight, and already integrated. [VERIFIED: package.json] |
| `markdown-it` | ^14.x | Markdown rendering | Standard for non-Astro/MDX slides in Slidastro. [VERIFIED: package.json] |
| `@astrojs/mdx` | ^5.x | MDX support | Native Astro way to handle interactive content. [VERIFIED: package.json] |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `rehype` | ^13.x | HTML transformation | For transforming `s-` props into `data-step-click` in MDX/Astro slides. [ASSUMED] |
| `unist-util-visit`| ^5.x | AST traversal | Essential for Rehype/Remark plugins. [ASSUMED] |

**Installation:**
```bash
pnpm add -F @slidastro/core rehype unist-util-visit
```

## Architecture Patterns

### Positioning Logic (The "At" Index)
Every element with a click animation is assigned an `at` index. This index determines the specific click count at which the element's state changes.

- **Absolute Indexing**: `<div s-click="3">` (at = 3).
- **Relative Indexing**:
    - **Default (`s-click`)**: `at = lastResolvedIndex + 1`. Update `lastResolvedIndex = at`.
    - **After (`s-after`)**: `at = lastResolvedIndex`. (No change to `lastResolvedIndex`).
- **Ranges**: `s-click="[2, 5]"` or `s-click="2-4"`.

### Recommended Internal Structure
```
packages/core/src/
├── utils/
│   ├── indexing.ts      # Shared positioning logic
│   └── clicks.ts        # Visibility and range helpers
├── plugins/
│   ├── markdown-it-clicks.ts  # Standard Markdown transformation
│   └── rehype-clicks.ts       # MDX/Astro transformation
└── components/
    ├── SClicks.astro    # Wrapper for sequential reveals
    └── SSwitch.astro    # Wrapper for conditional blocks
```

### Pattern 1: Multi-Framework Sync
Islands (React, Vue, Svelte) should subscribe to `$clicks` from `@slidastro/client` using their respective NanoStore adapters (e.g., `@nanostores/react`).

### Anti-Patterns to Avoid
- **Hard-coded Indices:** Manual numbering is fragile; always prefer relative indexing.
- **Dom-Mutating logic in Islands:** Islands should be pure and react to store changes, not manually toggle classes on elements outside their scope.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Cross-framework state | Custom EventBus | NanoStores | Reliable, tested, framework-agnostic. |
| AST Traversal | String Regex | Rehype/Markdown-it tokens | Regex is prone to errors with nested tags and attributes. |
| Browser Sync | Custom WebSocket | `BroadcastChannel` | Simple, no-server-needed sync for local browser tabs. |

## Common Pitfalls

### Pitfall 1: Index Collision
**What goes wrong:** Multiple islands or components accidentally sharing the same click index because they don't know about each other.
**How to avoid:** Use the unified `lastResolvedIndex` calculated during the build-time AST traversal.

### Pitfall 2: Hydration Mismatch
**What goes wrong:** Client-side click state doesn't match the server-rendered `data-step-click` attributes.
**How to avoid:** Ensure `initNavigation()` is called on every page load (including `astro:after-swap`) to reset and recalculate `totalClicks`.

## Code Examples

### Unified Indexing Logic (Hypothetical)
```typescript
// packages/core/src/utils/indexing.ts
export class ClickIndexer {
  private lastResolvedIndex = 0;

  resolve(directive: string, value?: string): number {
    if (directive === 's-after') {
      return this.lastResolvedIndex;
    }
    
    if (value && !value.startsWith('+') && !value.startsWith('-')) {
      const abs = parseInt(value, 10);
      this.lastResolvedIndex = abs;
      return abs;
    }

    const delta = value ? parseInt(value, 10) : 1;
    this.lastResolvedIndex += delta;
    return this.lastResolvedIndex;
  }
}
```

### Rehype Plugin Pattern
```typescript
// packages/core/src/plugins/rehype-clicks.ts
import { visit } from 'unist-util-visit';
import { ClickIndexer } from '../utils/indexing';

export function rehypeClicks() {
  return (tree) => {
    const indexer = new ClickIndexer();
    visit(tree, 'element', (node) => {
      if (node.properties.sClick !== undefined) {
        node.properties['data-step-click'] = indexer.resolve('s-click', node.properties.sClick);
        node.properties.className = [...(node.properties.className || []), 'slidastro-click'];
      }
      if (node.properties.sAfter !== undefined) {
        node.properties['data-step-click'] = indexer.resolve('s-after');
        node.properties.className = [...(node.properties.className || []), 'slidastro-click'];
      }
    });
  };
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `step-click` (Slidastro v0.1) | `s-click` | Phase 13 | Standardization with `s-` prefix. |
| Simple Regex | AST Transformation | Phase 13 | Supports nested components and complex attributes. |
| Page-only state | NanoStore atoms | Phase 11 | Full cross-island and presenter synchronization. |

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `v-after` in Slidev is simultaneous | Summary | If `s-after` is expected to auto-advance, the implementation will be wrong. |
| A2 | Rehype is the best place for MDX sync | Architecture | If Astro's MDX doesn't expose Rehype correctly, we need another way. |
| A3 | NanoStore synchronization is sufficient | Summary | If complex multi-user state is needed, NanoStores might need extra work. |

## Open Questions

1. **Should `s-click` support modifiers?** Slidev has `.hide`, `.fade`, etc.
   - Recommendation: Start with basic visibility and add modifiers in Phase 15 (Visual Polish).
2. **How to handle clicks inside loops?**
   - Recommendation: The AST transformation should handle them naturally by iterating over children.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Runtime | ✓ | 20.x | — |
| pnpm | Package Manager | ✓ | 9.x | — |
| Astro | Core Engine | ✓ | 5.18.1 | — |
| Rehype | MDX Plugin | ✗ | — | Install via pnpm |

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest |
| Config file | `packages/core/vitest.config.ts` |
| Quick run command | `pnpm --filter @slidastro/core test` |
| Full suite command | `pnpm test` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| CLICK-01 | `s-after` shares index | Unit | `vitest packages/core/test/indexing.test.ts` | ❌ Wave 0 |
| CLICK-02 | `<s-clicks>` sequential | Integration| `vitest packages/core/test/renderer.test.ts` | ❌ Wave 0 |
| CLICK-05 | NanoStore Sync | E2E | `cypress run` | ✅ |

### Wave 0 Gaps
- [ ] `packages/core/test/indexing.test.ts` — covers REQ-01, REQ-02
- [ ] `packages/core/test/rehype-clicks.test.ts` — covers MDX integration

## Sources

### Primary (HIGH confidence)
- Slidev Official Docs - [Animations/Clicks](https://sli.dev/guide/animations)
- NanoStores README - [Synchronization & Frameworks](https://github.com/nanostores/nanostores)

### Secondary (MEDIUM confidence)
- Astro MDX Docs - [Customizing MDX](https://docs.astro.build/en/guides/integrations-guide/mdx/#custom-remark-and-rehype-plugins)

### Tertiary (LOW confidence)
- Community Slidev clones in other frameworks (researching "Astro-vclick").

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Libraries are well-known and already in project.
- Architecture: HIGH - Positioning logic is the industry standard (Slidev).
- Pitfalls: MEDIUM - Based on common AST transformation challenges.

**Research date:** 2025-04-16
**Valid until:** 2025-05-16
