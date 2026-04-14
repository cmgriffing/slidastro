# Technology Stack: Slidastro (v2.0)

**Project:** Slidastro
**Researched:** 2026-04-22

## Recommended Stack

### Core Framework
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **Astro** | 6.x | Core rendering and island orchestration | Content-layer 2.0, Server Islands, and superior island performance. |
| **Vite** | 6.x | Build pipeline and HMR | The engine behind Astro, provides fast development experience. |

### Presentation & Content
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **Shiki** | 1.x | Syntax highlighting | High-fidelity token-based highlighting with Magic Move support. |
| **Shiki Magic Move** | Latest | Morphing code animations | Key feature for developer slides, enables smooth transitions between code steps. |
| **Markdown-it** | Latest | Markdown parsing | Battle-tested, extensible, and matches Slidev's implementation. |
| **Mermaid** | 11.x | Diagramming | Industry standard for code-driven diagrams. |

### Client-Side
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **Preact** | Latest | SPA shell framework | Lightweight and efficient for the presentation shell. |
| **Nano Stores** | Latest | State management | Framework-agnostic, tiny, and ideal for multi-island synchronization. |
| **Drauu** | Latest | Live drawing/annotation | Direct parity with Slidev's drawing capabilities. |

### Infrastructure & Edge
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **Cloudflare Pages** | — | Hosting | Native Astro integration, superior edge performance. |
| **Cloudflare D1** | — | Live session database | SQLite on the edge for polls and live interaction data. |
| **Workers AI** | — | AI-assisted slide features | On-device/edge inference for generating slides and notes. |

### Development & Export
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **Playwright** | Latest | PDF/PNG/PPTX export | Reliable headless browser automation for high-quality exports. |
| **cac** | Latest | CLI parser | Lightweight and sufficient for command structure. |
| **tsdown** | Latest | Package builder | Modern, fast build tool consistent with the Slidev ecosystem. |

## Alternatives Considered

| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| Core | **Astro** | **Vite + Vue** | Slidev already does this; Astro enables multi-framework islands. |
| Sync | **WebSockets/D1** | **Firebase** | Cloudflare-native fits better with the current Astro ecosystem direction. |
| Animation | **Magic Move** | **Motion One** | Magic Move is specifically optimized for Shiki/code token animations. |

## Installation

```bash
# Core
npm install @slidastro/cli @slidastro/core @slidastro/parser

# Dev dependencies
npm install -D astro vite shiki-magic-move playwright
```

## Sources

- [Astro Documentation](https://docs.astro.build/)
- [Shiki Magic Move Repo](https://github.com/shikijs/shiki-magic-move)
- [Cloudflare Astro Integration](https://developers.cloudflare.com/pages/framework-guides/deploy-an-astro-site/)
