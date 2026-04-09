# Architecture: Slidastro

**Domain:** CLI slide presentation tool (Astro-powered Slidev equivalent)
**Researched:** 2026-04-07
**Overall confidence:** MEDIUM-HIGH (Slidev analysis: HIGH, Astro integration patterns: MEDIUM)

## System Overview

Slidastro replaces Slidev's Vite+Vue pipeline with Astro's build system while preserving the same markdown-to-slide data flow. The fundamental insight from studying Slidev is that it has two distinct halves: a **Node-side pipeline** (parser, Vite plugins, virtual modules) and a **client-side SPA** (Vue router, shared state, composables). Slidastro must replicate both halves, substituting Astro's integration API and island architecture for Vue-specific patterns.

### Slidev Architecture (Reference)

Slidev's pipeline:

```
slides.md --> @slidev/parser (split on ---) --> SlidevData
    |
    v
ViteSlidevPlugin (20+ Vite plugins):
  - loaders.ts: serves virtual modules (/@slidev/slides/N/md, /@slidev/slides/N/frontmatter)
  - layoutWrapper.ts: wraps each slide's Vue SFC with its layout component
  - markdown.ts: transforms markdown to Vue SFC via unplugin-vue-markdown
  - serverRef.ts: syncs state between presenter/viewer via vite-plugin-vue-server-ref
  - 16 more plugins (icons, unocss, monaco, etc.)
    |
    v
@slidev/client (Vue SPA):
  - vue-router with routes: /play/:no, /presenter/:no, /overview, /export, /print
  - SlidesShow.vue: TransitionGroup rendering SlideWrapper for each route
  - SlideContainer.vue: CSS transform scaling to maintain aspect ratio
  - Shared state via BroadcastChannel + server-reactive (WebSocket)
  - Clicks system: ClicksContext tracks per-slide click progression
  - Drawings: drauu library with SVG overlay, state synced via server-ref
```

### Slidastro Architecture (Target)

```
slides.md --> @slidastro/parser (same split logic) --> SlidastroData
    |
    v
Astro Integration (@slidastro/core):
  - astro:config:setup hook:
    - injectRoute() for each view (/slide/:no, /presenter/:no, /overview, /export)
    - Vite plugin for virtual modules (slide data, configs, layouts registry)
    - updateConfig() with MDX integration + framework integrations
  - astro:server:setup hook:
    - WebSocket server for presenter<->viewer state sync
    - File watcher for markdown re-parse on change
    |
    v
Astro Pages + Islands:
  - /slide/[no].astro: main slide view (SSR shell + client islands)
  - /presenter/[no].astro: presenter view (current slide + next + notes + timer)
  - /overview.astro: grid of all slides
  - /export.astro: print-optimized view
  - SlideRenderer (client:load island): handles clicks, transitions, keyboard nav
  - DrawingOverlay (client:load island): drauu SVG canvas
  - PresenterSync (client:only island): WebSocket + BroadcastChannel state
```

## Component Map

### Node-Side Components

| Component | Responsibility | Communicates With |
|-----------|---------------|-------------------|
| **@slidastro/parser** | Split markdown on `---`, extract frontmatter, detect features, resolve `src` imports | Core integration (provides SlidastroData) |
| **@slidastro/types** | Shared TypeScript interfaces (SlideInfo, SlidastroConfig, ClicksContext, etc.) | All packages |
| **@slidastro/core** (Astro integration) | Orchestrates everything: registers routes, creates virtual modules, configures Astro/Vite | Astro build pipeline, parser, theme resolver |
| **@slidastro/cli** | yargs CLI (dev/build/export commands), calls Astro programmatic API | Core integration (via Astro config) |
| **Theme Resolver** (inside core) | Resolves theme name to npm package or local path, reads package.json `slidastro` meta | Core integration |
| **Layout Registry** (inside core) | Scans layout directories (client, theme, user), builds name->path map | Virtual modules, slide renderer |
| **WebSocket Server** (inside core) | Real-time state sync between presenter and viewer windows | Astro dev server (via astro:server:setup) |
| **Export Engine** (inside cli) | Spawns Playwright, navigates to /export route, captures PDF/PNG/PPTX | CLI, Astro preview server |

### Client-Side Components

| Component | Responsibility | Hydration | Communicates With |
|-----------|---------------|-----------|-------------------|
| **SlideRenderer** | Renders current slide component, handles click progression, keyboard nav | `client:load` | NavigationStore, ClicksEngine |
| **NavigationStore** | Tracks current slide number, click count, navigation direction | `client:load` (shared module) | SlideRenderer, PresenterSync, NavControls |
| **ClicksEngine** | Per-slide click context: registers v-click elements, calculates totals, manages visibility | `client:load` (shared module) | SlideRenderer, slide components |
| **NavControls** | Forward/back/overview buttons, keyboard shortcuts, swipe detection | `client:load` | NavigationStore |
| **SlideContainer** | CSS transform scaling to maintain aspect ratio within viewport | `client:load` | NavigationStore (for print mode check) |
| **TransitionManager** | CSS/JS transitions between slides (slide, fade, etc.) | `client:load` | NavigationStore (direction), SlideRenderer |
| **PresenterSync** | BroadcastChannel (same-origin tabs) + WebSocket (cross-network) state sync | `client:only` | NavigationStore, WebSocket Server |
| **DrawingOverlay** | drauu SVG canvas overlay, brush controls, undo/redo | `client:load` | PresenterSync (drawing state sync) |
| **PresenterTimer** | Stopwatch/countdown, per-slide timing | `client:load` | PresenterSync (timer state) |
| **PresenterMouse** | Renders cursor position from presenter on viewer display | `client:load` | PresenterSync |

## Data Flow

### 1. Parse Phase (startup)

```
User's slides.md
    |
    v
@slidastro/parser.load(userRoot, filepath)
    |-- Read markdown file
    |-- Split on --- (respecting code blocks)
    |-- For each raw slide:
    |     |-- Extract frontmatter (--- or ```yaml style)
    |     |-- Extract content
    |     |-- Extract speaker notes (trailing HTML comment)
    |     |-- Extract title (from frontmatter or first heading)
    |     |-- Detect images used
    |     |-- If frontmatter.src exists, recursively load external file
    |
    v
SlidastroData {
  slides: SlideInfo[]        // ordered, disabled slides excluded
  entry: SlidastroMarkdown   // the root markdown AST
  headmatter: Record         // first slide's frontmatter = global config
  features: DetectedFeatures // katex, mermaid, monaco detection
  config: SlidastroConfig    // merged: defaults + theme + headmatter
  markdownFiles: Record      // all loaded .md files (for HMR tracking)
  watchFiles: Record         // filepath -> slide indexes (for HMR)
}
```

### 2. Route Generation Phase (Astro integration setup)

```
SlidastroData
    |
    v
astro:config:setup hook:
    |
    |-- For N slides, injectRoute():
    |     /1, /2, ... /N  --> SlideView.astro (dynamic [no] route)
    |     /presenter/1..N --> PresenterView.astro
    |     /overview        --> OverviewView.astro
    |     /export          --> ExportView.astro
    |
    |-- Register Vite plugin for virtual modules:
    |     "virtual:slidastro/slides"      --> slide metadata + async component loaders
    |     "virtual:slidastro/config"      --> resolved SlidastroConfig
    |     "virtual:slidastro/layouts"     --> layout name -> component map
    |     "virtual:slidastro/styles"      --> theme + user CSS imports
    |
    |-- updateConfig():
    |     Add @astrojs/mdx (for .mdx slide components)
    |     Add framework integrations based on detected usage (React, Vue, Svelte, Solid)
    |     Add Shiki config for code highlighting
    |     Add UnoCSS/Tailwind for utility CSS
```

### 3. Slide Rendering Phase (per request/build)

```
Request: GET /3
    |
    v
SlideView.astro (Astro page component):
    |-- Import slide data from "virtual:slidastro/slides"
    |-- Get slide[2] (0-indexed) metadata: frontmatter, layout name
    |-- Resolve layout component from "virtual:slidastro/layouts"
    |-- Render slide content through markdown pipeline:
    |     1. Apply markdown transformers (v-click directives, code blocks, etc.)
    |     2. Convert to HTML via remark/rehype (Astro's MDX pipeline)
    |     3. Wrap in layout component
    |
    v
HTML shell (SSR):
    <html>
      <body>
        <SlideContainer> <!-- sets up CSS scaling -->
          <Layout> <!-- the resolved layout (default, cover, two-cols, etc.) -->
            <SlideContent /> <!-- rendered markdown HTML -->
          </Layout>
        </SlideContainer>
        <script> <!-- hydration scripts for islands -->
          SlideRenderer (client:load)  -- handles clicks, transitions
          NavControls (client:load)    -- keyboard/mouse navigation
          DrawingOverlay (client:load) -- if drawings enabled
          PresenterSync (client:only)  -- if in dev mode
        </script>
      </body>
    </html>
```

### 4. State Synchronization (presenter mode)

```
Presenter Window (/presenter/3)          Viewer Window (/3)
    |                                        |
    v                                        v
NavigationStore                          NavigationStore
    |                                        |
    +--> BroadcastChannel (same origin) <----+
    |                                        |
    +--> WebSocket (cross-network) <---------+
         |
         v
    WebSocket Server (astro:server:setup)
         |
         v
    Shared State: { page, clicks, clicksTotal, timer, cursor }
```

### 5. Export Phase

```
CLI: slidastro export slides.md --format pdf
    |
    v
1. Start Astro preview server (astro.build() then serve static)
2. Launch Playwright browser
3. Navigate to /export (renders all slides vertically for print)
4. For each slide:
   |-- Wait for load (images, mermaid, iframes)
   |-- Capture screenshot or PDF page
5. Merge pages into final PDF/PPTX
6. Shut down server and browser
```

## Astro-Specific Decisions

### Decision 1: Astro Integration (not standalone Vite)

Slidastro will be packaged as an Astro integration, not a raw Vite plugin setup. This is the correct approach because:

- Astro's `injectRoute()` handles dynamic route generation cleanly
- `astro:config:setup` provides the right hook timing for registering virtual modules
- `astro:server:setup` gives access to the Vite dev server for WebSocket setup
- The programmatic API (`dev()`, `build()`) lets the CLI drive Astro without a user-facing astro.config.mjs

The CLI will create a temporary Astro config programmatically:

```typescript
// Inside @slidastro/cli dev command
import { dev } from 'astro';
import { slidastroIntegration } from '@slidastro/core';

const server = await dev({
  root: tempProjectDir,  // or user's working directory
  integrations: [
    slidastroIntegration({
      entry: 'slides.md',
      mode: 'dev',
    }),
    // Framework integrations added dynamically based on detected usage
  ],
});
```

**Confidence: HIGH** -- Astro's programmatic API is documented and stable.

### Decision 2: Layout System via Astro Components (not Vue slots)

Slidev layouts are Vue SFCs using `<slot>` and named `<slot name="right">`. Slidastro layouts must be Astro components using `<slot>` and `<slot name="right">`.

**The slot separator syntax** (`::right::`) in Slidev markdown maps named content to Vue slots. In Slidastro, the parser will split content at `::slotname::` markers and pass them as named children to the layout's Astro component.

```astro
---
// layouts/two-cols.astro
---
<div class="slidev-layout two-columns grid grid-cols-2">
  <div class="col-left">
    <slot />
    <slot name="left" />
  </div>
  <div class="col-right">
    <slot name="right" />
  </div>
</div>
```

Astro supports named slots natively in `.astro` components. The markdown transformer will need a remark/rehype plugin that converts `::slotname::` markers into the appropriate slot targeting.

**Important caveat:** Named slots in MDX have known issues when used via frontmatter layouts (GitHub issue #7547). The workaround is to use the import-and-wrap pattern rather than frontmatter `layout:` property. The slide rendering pipeline should handle this internally -- the user writes `layout: two-cols` in frontmatter, and the build pipeline wraps content in the layout component using explicit imports, not MDX's frontmatter layout feature.

**Confidence: MEDIUM** -- Named slots work in .astro components but have edge cases in MDX. The pipeline must handle wrapping internally.

### Decision 3: Client-Side Navigation via SPA Islands (not file-based routing)

Astro's file-based routing creates separate pages that require full-page navigation. Slide presentations need instant, in-page transitions. The solution:

- Use a **single Astro page** (`/[...slug].astro`) that renders the shell
- The **SlideRenderer island** (`client:load`) handles all slide switching client-side
- Slide components are loaded as async modules (same as Slidev's `defineAsyncComponent`)
- The URL updates via `history.pushState` (no full page reload)
- The presenter and overview views are separate Astro pages (they have different shells)

This mirrors Slidev's approach: it uses Vue Router inside a single `index.html` SPA. Slidastro uses a single Astro page that hydrates into a client-side SPA for the slide show.

```astro
---
// pages/[...slug].astro
// This page handles: /1, /2, ..., /N (slide views)
import SlideApp from '../components/SlideApp';
import { getSlideData } from 'virtual:slidastro/slides';

const data = getSlideData();
---
<html>
<head>
  <title>{data.config.title}</title>
</head>
<body>
  <SlideApp client:load slides={data.slides} config={data.config} />
</body>
</html>
```

The `SlideApp` is a framework component (likely Preact or Solid for bundle size, though React works too) that manages all slide rendering, transitions, and navigation client-side.

**Confidence: MEDIUM** -- This pattern is standard for SPAs in Astro. The question is which framework to use for the client-side shell. Preact is recommended for minimal overhead.

### Decision 4: Click Animations via Custom Directives + CSS

Slidev's `v-click` is a Vue directive. In Slidastro, click animations will use:

1. **Data attributes in markdown**: A remark plugin transforms `<v-click>` tags into `<div data-click="N">` elements
2. **CSS classes**: The ClicksEngine toggles `.slidev-vclick-hidden` / `.slidev-vclick-current` / `.slidev-vclick-prior` classes based on current click count
3. **Client-side JavaScript**: A MutationObserver or explicit registration scans for `data-click` elements on slide mount

```typescript
// Simplified ClicksEngine
class ClicksEngine {
  current = 0;
  total = 0;
  elements: Map<HTMLElement, number> = new Map();

  register(el: HTMLElement, clickIndex: number) {
    this.elements.set(el, clickIndex);
    this.total = Math.max(this.total, clickIndex);
  }

  advance() {
    if (this.current < this.total) this.current++;
    this.updateVisibility();
  }

  updateVisibility() {
    for (const [el, idx] of this.elements) {
      el.classList.toggle('slidev-vclick-hidden', idx > this.current);
      el.classList.toggle('slidev-vclick-current', idx === this.current);
      el.classList.toggle('slidev-vclick-prior', idx < this.current);
    }
  }
}
```

**Confidence: HIGH** -- This is framework-agnostic and simpler than Slidev's Vue-specific approach.

### Decision 5: Presenter Sync via WebSocket + BroadcastChannel

Slidev uses `vite-plugin-vue-server-ref` for state sync (WebSocket to Vite dev server) and `BroadcastChannel` for same-origin tab sync (built mode, no server). Slidastro replicates this:

- **Dev mode**: WebSocket server attached in `astro:server:setup` hook
- **Built mode**: `BroadcastChannel` API between tabs (no server needed)
- **Remote mode**: WebSocket to a standalone sync server (could be a separate process)

The state shape mirrors Slidev's:

```typescript
interface SharedState {
  page: number;
  clicks: number;
  clicksTotal: number;
  timer: { status: 'stopped' | 'running' | 'paused'; startedAt: number; pausedAt: number };
  cursor?: { x: number; y: number };
  lastUpdate?: { id: string; type: 'presenter' | 'viewer'; time: number };
}
```

**Confidence: HIGH** -- BroadcastChannel is widely supported. WebSocket in astro:server:setup is documented.

### Decision 6: Multi-Framework Support via Astro Islands

This is Slidastro's key differentiator. In Slidev, all components must be Vue. In Slidastro:

- The slide shell (navigation, transitions, clicks) uses a single framework (Preact recommended)
- User components in slides can use ANY framework Astro supports
- Components are rendered as Astro islands with appropriate `client:*` directives
- The markdown pipeline detects framework-specific components and applies correct hydration

```markdown
---
layout: default
---

# My Slide

<ReactChart client:load data={chartData} />
<SvelteAnimation client:visible />
<SolidCounter client:load />
```

Astro handles the hydration boundaries automatically. The markdown transformer must preserve `client:*` directives during the markdown-to-HTML pipeline.

**Confidence: HIGH** -- This is Astro's core feature (islands architecture).

### Decision 7: Theme System Compatible with Slidev Themes

Slidastro themes follow the same convention as Slidev themes:

- npm package named `slidastro-theme-*` or `@slidastro/theme-*`
- `package.json` with `"slidastro"` field for metadata
- Contains `/layouts/`, `/styles/`, `/components/` directories
- Can also support Slidev themes with an adapter layer (layouts would need porting from Vue to Astro)

Initially, Slidastro ships with a `@slidastro/theme-default` that ports all 21 of Slidev's built-in layouts to Astro components.

**Confidence: MEDIUM** -- Theme structure is straightforward. Slidev theme compatibility layer is lower confidence.

## Package Structure

Use a monorepo with these packages:

| Package | Purpose | Key Exports |
|---------|---------|-------------|
| `slidastro` | CLI entry point, `bin/slidastro.mjs` | CLI commands |
| `@slidastro/core` | Astro integration, Vite plugins, virtual modules, WebSocket server | `slidastroIntegration()` |
| `@slidastro/parser` | Markdown parsing (port of @slidev/parser) | `parse()`, `load()`, `resolveConfig()` |
| `@slidastro/types` | Shared TypeScript interfaces | Type exports only |
| `@slidastro/client` | Client-side components (SlideApp, NavControls, etc.) | Framework components |
| `@slidastro/theme-default` | Default theme (layouts, styles) | Astro components |

**Rationale for monorepo over single package:**
1. Parser should be independently usable (editor plugins, VS Code extension later)
2. Types must be shared without circular dependencies
3. Client components bundle separately from Node code
4. Themes are independently installable

Use **pnpm workspace** with **tsdown** for building (same tooling as Slidev).

## Key Type Definitions

```typescript
// @slidastro/types

interface SlideInfo {
  index: number;
  content: string;
  frontmatter: Record<string, any>;
  note?: string;
  title?: string;
  level?: number;
  images: string[];
  source: SourceSlideInfo;
}

interface SlidastroConfig {
  theme: string;
  title: string;
  aspectRatio: number;
  canvasWidth: number;
  colorSchema: 'auto' | 'dark' | 'light';
  highlighter: 'shiki';
  fonts: ResolvedFontOptions;
  drawings: { enabled: boolean; persist: boolean; presenterOnly: boolean; syncAll: boolean };
  transition: string | null;
  // ... mirrors SlidevConfig for compatibility
}

interface SlidastroData {
  slides: SlideInfo[];
  config: SlidastroConfig;
  features: DetectedFeatures;
  headmatter: Record<string, unknown>;
  markdownFiles: Record<string, SlidastroMarkdown>;
}
```

## Suggested Build Order

The build order is driven by dependency relationships between components.

### Phase 1: Foundation (no client-side code)

**Build:** `@slidastro/types` --> `@slidastro/parser` --> `@slidastro/core` (basic integration) --> `slidastro` (CLI)

1. **@slidastro/types** -- Zero dependencies. Define all interfaces.
2. **@slidastro/parser** -- Port `@slidev/parser/core` and `@slidev/parser/fs`. The parser is well-isolated (only depends on `yaml` package). Can be tested independently.
3. **@slidastro/core** (minimal) -- Create the Astro integration skeleton:
   - `astro:config:setup`: inject a single catch-all route
   - Vite plugin: serve virtual module with parsed slide data
   - No themes, no layouts, no client interactivity yet
4. **slidastro** (CLI) -- Wire up yargs with `dev` command that calls Astro's `dev()` programmatic API

**Deliverable:** `slidastro dev slides.md` starts a server that shows raw slide HTML at numbered URLs. No styling, no navigation, no interactivity.

### Phase 2: Visual Foundation (layouts + themes + styling)

**Build:** Layout system --> Default theme --> Slide container (CSS scaling)

1. **Layout Registry** -- Virtual module that scans layout directories, builds name->path map
2. **@slidastro/theme-default** -- Port Slidev's 21 layouts from Vue to Astro. Start with: `default`, `cover`, `center`, `two-cols`, `image`, `image-left`, `image-right`, `section`, `full`, `none`
3. **SlideContainer** -- CSS transform-based scaling to maintain aspect ratio (this is pure CSS + a tiny bit of JS for resize observation)
4. **Markdown transformers** -- Named slot splitting (`::right::` etc.), code block syntax highlighting (Shiki), KaTeX math blocks

**Deliverable:** Slides render with correct layouts, aspect ratio, code highlighting. Still no client-side navigation.

### Phase 3: Client-Side SPA + Navigation

**Build:** SlideApp client component --> Navigation --> Clicks --> Transitions

1. **@slidastro/client** -- Create the client-side SPA shell:
   - `SlideApp` component (Preact/Solid): manages which slide component is mounted
   - Async slide component loading (matching Slidev's lazy-load pattern)
   - URL-based navigation (`/1`, `/2`, etc.) via `history.pushState`
2. **NavigationStore** -- Shared state: current page, clicks, direction
3. **Keyboard/mouse controls** -- Arrow keys, space, click-to-advance, swipe
4. **ClicksEngine** -- `data-click` attribute scanning, CSS class toggling, click counting
5. **Transitions** -- CSS transition classes applied on slide change (fade, slide-left, etc.)

**Deliverable:** Full slide show experience with navigation, clicks, transitions. Single-window only.

### Phase 4: Presenter Mode + State Sync

**Build:** WebSocket server --> BroadcastChannel --> Presenter view --> Notes display

1. **WebSocket server** in `astro:server:setup` -- Relay state changes between connections
2. **PresenterSync** client component -- BroadcastChannel + WebSocket client
3. **Presenter page** (`/presenter/[no].astro`) -- Current slide + next slide preview + notes + timer + click slider
4. **Speaker notes** rendering (markdown in HTML comments)
5. **Timer** -- Stopwatch/countdown with start/pause/reset

**Deliverable:** Two-window presenter experience with synchronized navigation.

### Phase 5: Drawing, Recording, Overview

**Build:** Drawing overlay --> Overview grid --> Recording

1. **DrawingOverlay** -- drauu integration, SVG canvas over slides, state sync via PresenterSync
2. **Overview mode** (`/overview`) -- Grid of all slides with click-to-navigate
3. **Recording** -- MediaRecorder API to capture screen + audio (client-only feature)

**Deliverable:** Full interactive presentation features.

### Phase 6: Export + Build

**Build:** Export route --> Playwright integration --> PDF/PNG/PPTX generation

1. **Export route** (`/export`) -- Renders all slides in a vertical print layout
2. **Print styles** -- CSS @media print, page-break-after for each slide
3. **Playwright export** -- CLI command that builds, serves, captures via Playwright
4. **PDF generation** with metadata and TOC (pdf-lib)
5. **PPTX generation** (pptxgenjs) from PNG captures
6. **Static build** -- `slidastro build` produces a deployable SPA

**Deliverable:** Complete export pipeline matching Slidev's capabilities.

### Phase 7: Ecosystem

**Build:** Theme system --> Addon system --> MDX/Astro-native formats

1. **Theme resolver** -- npm package resolution, theme meta reading, auto-install prompts
2. **Addon system** -- Additional functionality via npm packages
3. **MDX format** -- Native .mdx slide files (one file per slide, or single file with `---` separators)
4. **Astro format** -- Native .astro slide files for maximum flexibility
5. **Monaco editor** integration (if warranted)
6. **Mermaid** diagram rendering

**Deliverable:** Extensible platform with theme/addon ecosystem.

## Critical Architecture Boundaries

### 1. Parser MUST be framework-agnostic

The parser produces a plain data structure (SlidastroData). It has NO knowledge of Astro, Vite, or any framework. This allows:
- Independent testing
- Reuse in editor plugins
- Future format support without touching rendering

### 2. Astro integration MUST be the only Astro-aware code

Only `@slidastro/core` should import from `astro` or use Astro APIs. The CLI calls Astro programmatically. Themes are Astro components. But the parser, types, and export engine are Astro-free.

### 3. Client components MUST be framework-specific but isolated

The `@slidastro/client` package picks ONE framework (Preact recommended) for internal UI. User slide components can use ANY framework via Astro islands. The internal framework choice does NOT constrain users.

### 4. State sync MUST work with and without a server

- Dev mode: WebSocket through Vite/Astro dev server
- Built SPA: BroadcastChannel between tabs
- Remote: Optional standalone WebSocket server

The client code must handle all three modes transparently.

### 5. Virtual modules MUST provide all slide data

Following Slidev's pattern, all slide data flows through virtual modules. The client never reads markdown files directly. This enables:
- HMR (Vite invalidates virtual module, client receives update)
- Build optimization (tree-shaking unused slides in SPA build)
- Consistent data format across dev/build/export

## Sources

- Slidev source code (v52.14.2) at `/Volumes/T7/repos/slidastro/_slidev/` -- studied parser, CLI, client, and types packages
- [Astro Programmatic API](https://docs.astro.build/en/reference/programmatic-reference/) -- dev(), build(), preview() signatures
- [Astro Integration API](https://docs.astro.build/en/reference/integrations-reference/) -- injectRoute(), astro:config:setup, astro:server:setup hooks
- [Astro Integration Kit](https://astro-integration-kit.netlify.app/) -- addVirtualImports, createResolver utilities
- [Named Slots in MDX issue](https://github.com/withastro/astro/issues/7547) -- known limitations with frontmatter layouts
- [Astro Content Loader API](https://docs.astro.build/en/reference/content-loader-reference/) -- custom data loading patterns
