# Phase 6: Ecosystem & Advanced Features - Research

**Researched:** 2024-05-22
**Domain:** Frontend interactivity (Mermaid, Drauu, Monaco) and Astro-native slide authoring.
**Confidence:** HIGH

## Summary

This phase focuses on expanding Slidastro's capabilities to match and exceed Slidev's advanced features while maintaining its "Astro-native" identity. The primary challenges are supporting multi-slide authoring within native `.astro` and `.mdx` files and ensuring robust state synchronization for interactive elements like live drawing (Drauu).

**Primary recommendation:** Use a virtual module architecture to split multi-slide `.astro`/`.mdx` files into individual components, and leverage Nano Stores combined with the existing sync layer for Drauu state.

## User Constraints

No explicit `CONTEXT.md` was provided for this phase. The research is based on the Phase 6 goals and the current state of the codebase.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `mermaid` | 11.14.0 | Diagrams & Flowcharts | Industry standard for markdown diagrams. [VERIFIED: npm registry] |
| `drauu` | 1.0.0 | SVG Drawing | Lightweight, SVG-based, and used by Slidev. [VERIFIED: npm registry] |
| `monaco-editor` | 0.55.1 | Code Editing | The most powerful browser-based editor. [VERIFIED: npm registry] |
| `@shikijs/monaco` | 4.0.2 | Syntax Highlighting | Provides Shiki highlighting within Monaco. [VERIFIED: npm registry] |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|--------------|
| `@typescript/ata` | 0.9.8 | Type Acquisition | To provide TS types in Monaco for external imports. [VERIFIED: npm registry] |
| `nano-stores` | ^0.9.0 | State Sync | Lightweight reactive state for sync across windows. [CITED: project pattern] |

**Installation:**
```bash
npm install mermaid drauu monaco-editor @shikijs/monaco @typescript/ata
```

## Architecture Patterns

### Recommended Project Structure for Multi-Slide Formats
To support multi-slide `.astro` and `.mdx` files, we should avoid rendering them to static HTML during the build if they contain interactive components. Instead, we should treat each slide as a virtual Astro component.

```
virtual:slidastro/
├── slides.ts          # Main entry, imports individual slides
└── slide/
    ├── 1.astro        # Virtual component for slide 1
    ├── 2.astro        # Virtual component for slide 2
    └── ...
```

### Pattern 1: Multi-Slide Splitting (Astro/MDX)
**What:** Split a single `.astro` or `.mdx` file into multiple virtual components using `---` as a separator.
**When to use:** When the user provides a `.astro` or `.mdx` file as the presentation entry point.
**Example (Logic for Vite Plugin):**
```typescript
// Source: Proposed architecture based on Slidev and Astro's virtual modules
function splitSlides(content: string, isAstro: boolean) {
  const parts = content.split(/^---$/m);
  const headmatter = parts[0]; // Logic/Frontmatter
  const slides = parts.slice(1);
  
  return slides.map(slide => {
    if (isAstro) {
      // Prepend shared frontmatter to every slide to preserve variables
      return `${headmatter}\n---\n${slide}`;
    }
    return slide;
  });
}
```

### Pattern 2: Drauu State Sync
**What:** Synchronizing SVG paths and drawing state (color, tool, active) across windows.
**When to use:** Whenever the presenter or a synced viewer draws on the slide.
**Protocol:**
1. **Change Event:** `drauu.on('end', () => broadcast(drauu.dump()))`
2. **Sync Layer:** Use `BroadcastChannel` for same-origin tabs and `Vite HMR WebSocket` for cross-network/dev sync.
3. **Store:** Keep drawings in a `$drawings` Nano Store keyed by `slideIndex`.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| SVG Drawing | Custom canvas drawing | `drauu` | Handles paths, shapes, and serialization to SVG out of the box. |
| Diagram Rendering | Custom SVG generators | `mermaid` | Supports complex diagrams (Gantt, Flow, Sequence) via simple syntax. |
| Code Intelligence | Custom regex highlighters | `monaco-editor` + `@typescript/ata` | Provides full IDE-like features including autocompletion and types. |
| Media Recording | Custom frame capture | `MediaRecorder` API | Native browser API for high-performance recording. |

## Common Pitfalls

### Pitfall 1: Astro Frontmatter Scope
**What goes wrong:** Variables defined in the first `---` block of an `.astro` file are not available in subsequent slides if simply split.
**How to avoid:** Prepend the shared frontmatter (logic block) to every virtual slide component during the splitting process.

### Pitfall 2: Monaco Worker Loading
**What goes wrong:** Monaco workers (`editor.worker`, `ts.worker`) failing to load due to path issues in Vite/Astro.
**How to avoid:** Use a custom `MonacoEnvironment.getWorkerUrl` that resolves workers using `require.resolve` and `/@fs` prefix for reliable loading. [VERIFIED: codebase]

### Pitfall 3: Drauu Z-Index and Events
**What goes wrong:** Drawing layer blocking clicks on slide elements (links, buttons).
**How to avoid:** Set `pointer-events: none` on the drawing SVG by default, and toggle to `auto` only when "Drawing Mode" is active.

## Code Examples

### Multi-Slide Astro Virtual Module Generation
```typescript
// Proposed logic for virtual:slidastro/slides.ts
import { slides } from './parsed';

const imports = slides.map((s, i) => 
  `import Slide${i} from 'virtual:slidastro/slide/${i}.astro';`
).join('\n');

const slideMap = slides.map((s, i) => 
  `{ component: Slide${i}, frontmatter: ${JSON.stringify(s.frontmatter)} }`
).join(',\n');

export default `
${imports}
export default {
  slides: [${slideMap}]
};
`;
```

### Drauu Sync Integration
```typescript
// packages/core/src/components/Drauu.client.ts (Refined)
import { createDrauu } from 'drauu'
import { $drawings, syncDrawing } from '@slidastro/client'

export function initDrauu(slideIndex: number) {
  const drauu = createDrauu({ el: '#drauu-layer' })
  
  // Load initial state
  const saved = $drawings.get()[slideIndex]
  if (saved) drauu.load(saved)

  // Sync changes
  drauu.on('end', () => {
    const data = drauu.dump()
    syncDrawing(slideIndex, data)
  })

  // Listen for external updates
  $drawings.listen((state) => {
    if (state[slideIndex]) drauu.load(state[slideIndex])
  })
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `markdown-it-mermaid` | `mermaid.run()` | Mermaid v10+ | Better ESM support and dynamic rendering without re-parsing markdown. |
| Custom Canvas | `drauu` (SVG) | 2021+ | Scalable drawings that can be easily edited or stored as text. |
| Static Highlight | Monaco + Shiki | 2023+ | Perfectly matched highlighting between static code and interactive editor. |

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Multi-slide `.astro` should use `---` as separator | Architecture | Users might find it confusing due to frontmatter syntax. |
| A2 | `localStorage` is sufficient for drawing persistence | Architecture | Loss of data if browser cache is cleared; not portable. |
| A3 | Prepending frontmatter works for all `.astro` slides | Pitfalls | Might cause issues if slides have conflicting logic. |

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | All | ✓ | 20.x | — |
| Chrome/Edge | Recording | ✓ | — | Firefox/Safari (limited MediaRecorder support) |
| Internet | ATA (Monaco) | ✓ | — | Disable type acquisition |

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest |
| Config file | `vitest.config.ts` |
| Quick run command | `npm test` |
| Full suite command | `npm test --run` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| FOUND-03 | Multi-slide `.astro`/`.mdx` parsing | unit | `vitest parser` | ❌ |
| ADV-01 | Mermaid diagrams render in DOM | e2e | `cypress run` | ❌ |
| ADV-02 | Drauu drawing syncs across windows | e2e | `cypress run` | ❌ |
| ADV-04 | Monaco editor initializes with ATA | e2e | `cypress run` | ❌ |

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V5 Input Validation | yes | Sanitize markdown/SVG input if stored or shared. |
| V12 Files and Resources | yes | Securely store `.slidastro/drawings/` if using disk persistence. |

### Known Threat Patterns for this Stack

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| XSS via Mermaid/Drauu SVG | Tampering | Use `dompurify` on any user-generated SVG content before rendering. |
| Malicious code in Monaco | Elevation of Privilege | Monaco runs in main thread; avoid executing code from Monaco without sandbox. |

## Sources

### Primary (HIGH confidence)
- `packages/core/src/virtual.ts` - Current implementation of virtual modules.
- `packages/core/src/renderer.ts` - Current markdown rendering logic.
- `packages/core/src/components/Drauu.client.ts` - Initial drawing implementation.
- `npm view` - Verified library versions.

### Secondary (MEDIUM confidence)
- Slidev Documentation - Patterns for multi-slide formats and Drauu sync.
- Astro Documentation - Virtual modules and custom integrations.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Verified via npm and codebase.
- Architecture: HIGH - Built on existing project patterns.
- Pitfalls: MEDIUM - Based on common Astro/Monaco challenges.

**Research date:** 2024-05-22
**Valid until:** 2024-06-22
