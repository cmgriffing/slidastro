# Technology Stack: Slidastro v4.0

**Project:** Slidastro
**Researched:** 2026-04-18

## Recommended Stack

### Core Framework (Existing)
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Astro | ^4.0.0 | Core Engine | Multi-framework island architecture. |

### Supporting Libraries (New for v4.0)
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `rough-notation` | ^0.5.2 | Visual Annotations | Powering the `s-mark` directive. |
| `shiki-magic-move` | ^0.4.0 | Code Transitions | Powering the `ShikiMagicMove` component. |
| `lz-string` | ^1.5.0 | Data Compression | For compressed code steps in `ShikiMagicMove`. |
| `vueuse` | ^10.0.0 | Utilities | `useElementSize`, `useVModel` for `AutoFitText` and others. |

### External Services
| Service | Purpose | Notes |
|---------|---------|-------|
| Twitter Widgets | `Tweet` component | Requires external JS loading; handle async loading/retries. |
| YouTube Embed | `Youtube` component | Standard iframe embedding. |

## Alternatives Considered

| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| Annotations | `rough-notation` | SVG overlay | `rough-notation` provides a hand-drawn look consistent with Slidev. |
| Code Motion | `shiki-magic-move` | Framer Motion | `shiki-magic-move` is specifically optimized for Shiki tokens and code. |

## Installation

```bash
# New dependencies
npm install rough-notation shiki-magic-move lz-string @vueuse/core
```

## Sources

- `_slidev/packages/client/builtin/` imports.
- `_slidev/package.json` for versions.
