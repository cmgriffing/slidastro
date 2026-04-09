# Pitfalls: Slidastro

**Domain:** Astro-based slide presentation CLI tool with Slidev feature parity
**Researched:** 2026-04-07
**Confidence:** HIGH (based on Slidev v52.14.2 source analysis + Astro docs + community issues)

---

## Critical Pitfalls

These cause architectural rewrites or fundamental breakage if not addressed early.

### 1. Astro's MPA Architecture vs Single-Page Slide Navigation

**Risk level:** High
**What goes wrong:** Astro is fundamentally a Multi-Page Application framework. Each "page" is a separate HTML document. Slide presentations require instant, zero-flicker navigation between slides with smooth transitions, click-based animations, and keyboard-driven flow. Naive implementation creates one Astro page per slide, causing full page reloads on every slide advance -- destroying the presentation experience.

**Why it happens:** Developers assume Astro's `<ClientRouter />` (view transitions) equals SPA behavior. It does not. View transitions still perform full page navigations with DOM replacement; they just animate between states. Under the hood, each navigation fetches a new HTML document. This introduces network latency, re-executes scripts, re-hydrates islands, and breaks stateful components (timers, drawing canvas, animation state).

**Warning signs:**
- Noticeable flash or delay when advancing slides
- Presenter timer resets on slide change
- Drawing overlay disappears between slides
- Animation state lost when navigating backward
- `client:load` components re-mount on every slide

**Prevention:**
- Treat the entire slide deck as a **single Astro page** that renders all slides into one document, with client-side JavaScript managing which slide is visible (similar to Slidev's `SlidesShow.vue` pattern of `v-show` toggling)
- Use Astro only for the build/SSR pipeline and content processing; the runtime navigation must be a client-side SPA shell (a React, Svelte, or vanilla JS component hydrated with `client:load`)
- Alternatively, render all slides server-side into a single page and use CSS/JS to show/hide slides, but this has performance implications for large decks

**Phase to address:** Phase 1 (Core Architecture). This is the foundational architectural decision. Getting it wrong means rewriting everything.

**Confidence:** HIGH -- verified from Astro docs on view transitions and the Slidev source showing all slides rendered in one `SlidesShow.vue` component with `v-show` toggling.

---

### 2. Replacing Slidev's 20+ Virtual Modules and Vite Plugin System

**Risk level:** High
**What goes wrong:** Slidev's architecture is built on ~15 virtual module templates (`/@slidev/slides`, `/@slidev/configs`, `/@slidev/layouts`, `/@slidev/styles`, etc.) and 18 custom Vite plugins (layout wrapper, context injection, markdown compilation, HMR patches, Monaco types, UnoCSS, etc.). These virtual modules dynamically generate code at build time that wires up slides, frontmatter, layouts, and configuration. Astro has no equivalent concept -- its integration API operates at a higher level.

**Why it happens:** Developers underestimate the depth of Slidev's Vite plugin layer. The `loaders.ts` file alone is 420+ lines handling slide loading, HMR, frontmatter reactivity, and module invalidation. The `layoutWrapper.ts` plugin dynamically wraps every slide's markdown output in a layout component with context injection. There is no "drop-in" replacement in Astro.

**Warning signs:**
- Trying to use Astro content collections to represent slides (too rigid, no dynamic virtual module equivalent)
- Finding yourself writing custom Vite plugins within Astro integrations to replicate Slidev behavior
- Layout resolution not working because there is no equivalent to the layout wrapper transform
- Frontmatter changes not triggering targeted HMR

**Prevention:**
- Accept that Slidastro needs its own **Astro integration** that hooks into `astro:config:setup` to add custom Vite plugins. Astro integrations can add Vite plugins via `updateConfig({ vite: { plugins: [...] } })`
- Implement virtual modules through Vite plugins registered via the Astro integration (Astro runs on Vite, so this works)
- Design the virtual module system upfront: `/@slidastro/slides`, `/@slidastro/config`, `/@slidastro/layouts`
- Study each of Slidev's virtual modules in `_slidev/packages/slidev/node/virtual/` and map them to Slidastro equivalents
- Do NOT try to use Astro's content collections for the slide data pipeline; they are too opinionated and their HMR has known issues with custom loaders (GitHub issue #13253)

**Phase to address:** Phase 1-2 (Core Architecture + Slide Loading). The virtual module strategy must be decided in Phase 1 and implemented in Phase 2.

**Confidence:** HIGH -- directly verified from Slidev source code analysis of `node/virtual/index.ts` and `node/vite/index.ts`.

---

### 3. Click Animation System Complexity

**Risk level:** High
**What goes wrong:** Slidev's click animation system (`useClicks.ts`) is deeply integrated with Vue's reactivity and manages relative click offsets, range-based visibility, nested click contexts, and bi-directional navigation. It requires every clickable element to register with a shared context during component mount, then uses computed properties to determine visibility at each click step. Re-implementing this in a framework-agnostic way (to support React, Svelte, Solid, etc.) is substantially harder than the Vue-only version.

**Why it happens:** The click system looks simple on the surface ("show element on click N") but the implementation handles: relative offsets (`+1`, `+2`), absolute positions, range-based visibility (`[2, 5]`), `clicksStart` frontmatter override, `clicksTotal` override, nested click groups, HMR-safe click counting, and bidirectional navigation (going backward must hide elements in reverse). Each island framework would need its own adapter.

**Warning signs:**
- Click animations work forward but break when navigating backward
- Nested `v-click` groups show/hide in wrong order
- Click count does not match expected total
- Different framework islands have inconsistent click behavior
- HMR causes click state to desync

**Prevention:**
- Implement the click system as a **framework-agnostic JavaScript core** (vanilla TS) that manages state centrally, then provide thin wrappers for each framework (React hook, Svelte store, Vue composable, etc.)
- Start with only absolute click positions (`at={3}`) before implementing relative offsets
- Port Slidev's click registration pattern (`relativeSizeMap`, `maxMap`) but decouple it from Vue's `onMounted`/`onUnmounted` lifecycle
- Test extensively with backward navigation from the start
- Consider using custom HTML attributes (`data-click-at`, `data-click-hide`) with a single observer rather than per-framework reactivity

**Phase to address:** Phase 3 (Click Animations). But the architecture for the click context must be designed in Phase 1 to ensure framework-agnostic compatibility.

**Confidence:** HIGH -- directly analyzed `useClicks.ts` (180 lines of non-trivial reactive logic).

---

### 4. Presenter Mode State Synchronization

**Risk level:** High
**What goes wrong:** Presenter mode requires real-time bidirectional sync between the presenter window (with speaker notes, timer, next-slide preview) and the audience window. Slidev achieves this through `vite-plugin-vue-server-ref` (server-side reactive state over Vite's WebSocket) combined with `BroadcastChannel` for same-origin tab sync. Astro has no built-in equivalent to server-reactive state.

**Why it happens:** In Slidev, the Vite dev server acts as the state hub -- the `serverRef` plugin maintains shared state (`nav`, `drawings`, `snapshots`) on the server and syncs it to all connected clients via Vite's HMR WebSocket. In production (built SPA), it falls back to `BroadcastChannel` and `localStorage`. Astro's dev server exposes a Vite instance, but there is no equivalent to `vite-plugin-vue-server-ref` for non-Vue frameworks.

**Warning signs:**
- Presenter window and audience window get out of sync
- Advancing slides in presenter mode does not update audience view
- Timer state resets when opening a new tab
- Drawing annotations only visible in one window
- Production build has no sync capability at all

**Prevention:**
- Implement a custom **WebSocket server** as an Astro integration that runs alongside the dev server. Use `astro:server:setup` hook to attach a WebSocket handler to the Astro dev server's HTTP server
- For production builds, implement `BroadcastChannel` sync (same as Slidev's fallback in `syncState.ts`) for same-device presenter mode
- For remote presenter mode, bundle a lightweight WebSocket server (or use WebRTC) that can be started alongside the presentation
- Design the sync layer as a standalone module from day one, not as an afterthought
- The shared state shape should match Slidev's: `{ page, clicks, clicksTotal, timer, cursor, lastUpdate }`

**Phase to address:** Phase 4 (Presenter Mode). But the sync architecture must be considered in Phase 1 to ensure the navigation system emits state changes.

**Confidence:** HIGH -- directly analyzed `syncState.ts`, `shared.ts`, and `serverRef.ts`.

---

### 5. Markdown Parser Edge Cases with `---` Separator

**Risk level:** High
**What goes wrong:** The `---` separator serves triple duty in Slidev markdown: (1) YAML frontmatter delimiters, (2) slide separators, and (3) horizontal rules in content. Code blocks containing `---` (common in YAML examples, diff output, etc.) must not be treated as separators. The parser must also handle two frontmatter styles: traditional `---`/`---` blocks and "yaml" code block style (` ```yaml`). Getting the parser wrong breaks every presentation.

**Why it happens:** Regex-based parsing of `---` is fragile. Slidev's parser (`core.ts`) handles this with a stateful line-by-line approach that tracks code block depth, distinguishes frontmatter from separators by checking if the next line has content, and handles edge cases like `----` (four dashes) being a separator but not frontmatter. A naive implementation will misparse slides.

**Warning signs:**
- Code blocks containing `---` split the slide unexpectedly
- YAML frontmatter not recognized or parsed as slide content
- Empty slides appearing between actual slides
- Horizontal rules (`---` in content) treated as slide separators
- Presentations with nested code blocks (backtick count mismatch) break parsing

**Prevention:**
- Port Slidev's parser directly from `_slidev/packages/parser/src/core.ts` (MIT licensed, 380 lines). It handles all edge cases
- Do NOT write a new parser from scratch -- the edge cases are subtle (code block tracking, frontmatter detection heuristics, `----` vs `---`, `preserveCR` for Windows)
- Write a comprehensive test suite against real-world Slidev presentations before shipping
- Support both frontmatter styles from day one (YAML frontmatter and code block style)
- Handle the `src` frontmatter property for importing external markdown files (Slidev supports this)

**Phase to address:** Phase 1 (Core Parser). This is the foundation of the data pipeline.

**Confidence:** HIGH -- directly analyzed Slidev's `core.ts` parser implementation.

---

## Moderate Pitfalls

These cause significant rework or user-facing bugs but are recoverable.

### 6. PDF Export is a Separate Product-Level Feature

**Risk level:** Medium-High
**What goes wrong:** PDF export requires spinning up a headless browser (Playwright/Chromium), navigating to each slide, waiting for all async content to load (fonts, images, Mermaid diagrams, iframes, Monaco editors), taking screenshots or generating PDF pages, then merging them. Slidev's export.ts is 650+ lines with complex wait logic for specific DOM states. It is not "just call page.pdf()".

**Why it happens:** Each slide may have: web fonts loading asynchronously, Mermaid diagrams rendering in a background container, lazy-loaded images, iframes (YouTube, Twitter embeds), Monaco editors with aria containers that break layout, and click-based animations that need to be iterated. The export must wait for ALL of these individually. Known Slidev issues include broken emoji rendering (#1872), missing icons (#1742), and click-based export bugs (#2034).

**Warning signs:**
- Exported PDFs have missing fonts or broken characters
- Mermaid diagrams appear as loading spinners in PDF
- PDF pages have wrong dimensions or cut-off content
- Export hangs indefinitely waiting for content to load
- Click-based export produces wrong number of pages

**Prevention:**
- Treat PDF export as a Phase 5+ feature, not an early deliverable
- Copy Slidev's approach: use Playwright-Chromium as an optional peer dependency
- Implement the `data-waitfor` attribute pattern for custom wait conditions
- Add explicit waits for: `.slidev-slide-loading` elements to detach, Mermaid rendering container to clear, iframes to load, web fonts to settle
- Support both "per-slide" (navigate to each slide individually) and "one-piece" (render all slides on one tall page) modes -- they have different tradeoffs
- Lock Playwright version in CI because PDF rendering varies across Chromium versions

**Phase to address:** Phase 5+ (Export). The core presentation must work well before tackling export.

**Confidence:** HIGH -- directly analyzed Slidev's `export.ts` (650+ lines of battle-tested export logic).

---

### 7. Island Hydration Timing Breaks Animations and Transitions

**Risk level:** Medium-High
**What goes wrong:** When using Astro islands for interactive slide components, hydration timing becomes unpredictable. A React chart component on slide 3 might start hydrating while slide 1 is displayed, causing layout shifts. View transitions between slides may interrupt hydration. Nested islands (e.g., a React component inside a Svelte layout) have known hydration issues (Astro GitHub #6301, #3947) where parent islands hydrate before children are ready.

**Why it happens:** Astro's island hydration directives (`client:load`, `client:idle`, `client:visible`) control WHEN hydration starts but not HOW it interacts with slide transitions. In a single-page slide app, all islands for all slides exist in the DOM simultaneously (hidden via CSS). `client:visible` will never trigger for hidden slides. `client:load` will hydrate everything at once, potentially overwhelming the browser on large decks. `client:idle` timing is unpredictable.

**Warning signs:**
- Components flash or show unstyled content briefly when slide becomes visible
- Interactive components on later slides do not work until scrolled into viewport
- Large decks (50+ slides) have slow initial load times
- Hydration errors in console about server/client mismatch
- Animations stutter during the first slide transition

**Prevention:**
- Implement a custom hydration strategy: hydrate the current slide immediately, pre-hydrate adjacent slides (prev/next), and defer all others
- Use Astro's `client:load` only for the SPA shell component; individual framework components within slides should be hydrated by the shell's own lazy-loading logic
- Consider implementing a "slide preload" system similar to Slidev's `preloadRoute` pattern (current + prev + next immediately, all others after 3 seconds)
- Test with 50+ slide decks during development
- Monitor island hydration with browser DevTools performance profiling

**Phase to address:** Phase 2-3 (Slide Rendering + Interactivity). Hydration strategy must be part of the rendering architecture.

**Confidence:** MEDIUM-HIGH -- based on Astro island architecture documentation and known GitHub issues, verified against Slidev's preloading patterns.

---

### 8. Theme and Layout Resolution Across Package Boundaries

**Risk level:** Medium
**What goes wrong:** Slidev's theme system resolves themes from multiple sources: local directories, npm packages (`slidev-theme-*`, `@slidev/theme-*`), and global installations. Themes provide layouts, components, styles, and configuration. The resolution order matters and involves searching `node_modules`, global directories, workspace roots, and prompting for installation. Replicating this for `slidastro-theme-*` packages requires a custom resolver.

**Why it happens:** The theme/layout resolution in `resolver.ts` (270 lines) handles: local path resolution (`./theme`), scoped packages (`@slidev/theme-*`), unscoped packages (`slidev-theme-*`), global npm/yarn installations, workspace root traversal, and interactive installation prompts. The layout wrapper plugin (`layoutWrapper.ts`) then dynamically imports the resolved layout component and wraps slide content. This cross-package resolution is framework-level complexity.

**Warning signs:**
- Themes installed globally are not found
- Layout names in frontmatter resolve to wrong components
- Theme styles bleed between slides or do not apply
- Theme components from npm packages cannot be imported
- Monorepo setups fail to find local themes

**Prevention:**
- Start with local-only themes (directory-based) before implementing npm package resolution
- Use Astro's existing integration resolution as a model -- themes can be Astro integrations that register components and styles
- For Slidev compatibility, support the `slidev-theme-*` naming convention but map to `slidastro-theme-*` equivalents
- Implement theme resolution as a separate module that can be tested independently
- The default layouts (`cover`, `default`, `center`, `two-cols`, etc.) should be built into Slidastro, not require a theme package

**Phase to address:** Phase 3-4 (Themes and Layouts). Basic layouts in Phase 2, full theme system in Phase 3-4.

**Confidence:** HIGH -- directly analyzed `resolver.ts` and `layoutWrapper.ts`.

---

### 9. Astro's Experimental Programmatic API Stability

**Risk level:** Medium
**What goes wrong:** Slidastro's CLI must programmatically start Astro's dev server, build pipeline, and preview server. Astro's programmatic API (`dev()`, `build()`, `preview()`) is marked **experimental** with the warning "API signature may change." Building the CLI on an unstable API means breakage on Astro version upgrades. The API returned by `dev()` exposes address, handle, watcher, and stop -- but not all the internals needed for custom HMR or WebSocket integration.

**Why it happens:** Astro's primary interface is its CLI, not its programmatic API. The programmatic API was added to support tools like Starlight and other meta-frameworks, but it is deliberately minimal. Unlike Slidev which creates a Vite server directly (full control), Slidastro would be wrapping Astro which wraps Vite (two layers of abstraction).

**Warning signs:**
- Astro minor version upgrade breaks CLI functionality
- Cannot access Vite's dev server instance for custom middleware
- HMR notifications not propagating through Astro's layer
- Build output location or structure changes unexpectedly
- Unable to inject custom Vite plugins after Astro's config is resolved

**Prevention:**
- Pin Astro to a specific minor version range in `package.json`
- Use the Astro integration API (`astro:config:setup`, `astro:server:setup`) rather than post-hoc manipulation -- integrations are the stable extension point
- Access Vite's server through the integration hooks rather than through the programmatic API's return value
- Write integration tests that verify CLI functionality against Astro dev/build/preview
- Monitor Astro's changelog for programmatic API changes
- Consider whether building directly on Vite (like Slidev) with Astro's renderer for component rendering might be more stable than wrapping Astro's full pipeline

**Phase to address:** Phase 1 (CLI Foundation). This is a fundamental architectural risk that must be validated early.

**Confidence:** MEDIUM -- verified from Astro docs that the API is experimental; the stability concern is a reasonable inference.

---

### 10. HMR for Single-File Multi-Slide Markdown

**Risk level:** Medium
**What goes wrong:** A single `.md` file contains all slides. When the user edits slide 15, only slide 15 should hot-reload -- not the entire presentation. Slidev achieves this through granular virtual modules (`/@slidev/slides/15/md`, `/@slidev/slides/15/frontmatter`) and surgical HMR invalidation that compares old vs new slide content, frontmatter, and notes individually. Without this, every keystroke reloads the entire deck.

**Why it happens:** Astro's HMR operates at the file level. If `slides.md` changes, Astro sees one file changed and wants to rebuild the entire page. Slidev's `handleHotUpdate` in `loaders.ts` intercepts this, diffs the old and new parsed slides, and selectively invalidates only the virtual modules that actually changed. It even special-cases note-only changes (sent via WebSocket without module reload). Replicating this granularity requires custom Vite plugin HMR handling.

**Warning signs:**
- Editing one slide causes all slides to re-render
- Slide transitions replay after every edit
- Scroll position or click state resets on save
- Development feels sluggish with large decks
- Console shows full page reload instead of HMR update

**Prevention:**
- Implement virtual modules per-slide from the start (not one module for all slides)
- Use Vite's `handleHotUpdate` hook (accessible through Astro integration's Vite plugin) to diff parsed slides and selectively invalidate
- Port Slidev's diffing logic: compare `content.trim()`, `title.trim()`, and deep-equal `frontmatter` for each slide
- Handle note-only changes via WebSocket message rather than module invalidation (Slidev's `slidev:update-note` pattern)
- Test HMR with a 30+ slide deck, editing slides at different positions

**Phase to address:** Phase 2 (Dev Server + HMR). HMR must work well from the development experience phase.

**Confidence:** HIGH -- directly analyzed Slidev's `loaders.ts` HMR implementation (270+ lines).

---

## Minor Pitfalls

### 11. Cross-Platform Path Handling

**Risk level:** Low-Medium
**What goes wrong:** Windows uses backslash paths (`C:\Users\...`), but Vite/Astro expect forward slashes for module IDs. File watching, virtual module resolution, and import paths break on Windows if paths are not normalized.

**Prevention:**
- Use `path.posix` or a `slash()` utility (as Slidev does) for all module IDs and import paths
- Use `path.normalize` for filesystem operations
- Test on Windows in CI from Phase 1
- Be especially careful with paths in virtual module content (template strings)

**Phase to address:** Phase 1 (CLI Foundation).

---

### 12. Port Conflict and Process Cleanup

**Risk level:** Low-Medium
**What goes wrong:** Default port 3030 (or 4321 for Astro) may be occupied. When the dev server crashes or the user Ctrl+C's, child processes (Playwright for export, WebSocket server for presenter mode) may remain running. Zombie processes accumulate, ports stay occupied.

**Prevention:**
- Use `get-port-please` (as Slidev does) with a fallback range rather than `strictPort`
- Register `process.on('exit')`, `SIGINT`, and `SIGTERM` handlers to clean up child processes
- The export command should always `server.close()` in a `finally` block (Slidev does this)
- Implement the restart debounce pattern from Slidev's CLI (500ms timeout before restart)

**Phase to address:** Phase 1 (CLI Foundation).

---

### 13. Slide Scaling and Aspect Ratio Math

**Risk level:** Low-Medium
**What goes wrong:** Slides must maintain exact aspect ratio (default 16:9, 960x540 logical pixels) regardless of window size. The scaling uses CSS transform `scale()` centered with `translate(-50%, -50%)`. Getting the math wrong causes content overflow, cut-off text, or misaligned elements. Print mode, export mode, and presenter mode all need different scaling calculations.

**Prevention:**
- Port Slidev's `SlideContainer.vue` scaling logic directly: `scale = Math.min(width / slideWidth, height / slideHeight)`
- Use CSS custom property `--slidev-slide-scale` propagated to all children
- Test with extreme window sizes (very wide, very narrow, mobile)
- Export mode sets viewport to exact slide dimensions, so scaling should be 1.0

**Phase to address:** Phase 2 (Slide Rendering).

---

### 14. UnoCSS / Tailwind Scoping Between Slides

**Risk level:** Low-Medium
**What goes wrong:** CSS utility classes from one slide can affect another slide since all slides are in the same DOM. Global styles from themes or slide-level `<style>` blocks can leak. UnoCSS's `@unocss-include` comment (used by Slidev in virtual modules) may not work in Astro's processing pipeline.

**Prevention:**
- Use scoped styles per slide (CSS containment or shadow DOM)
- If using UnoCSS, configure it through Astro's integration system, not as a standalone Vite plugin
- Test that adding `bg-red` to slide 5 does not affect slide 6
- Slidev uses `postcss-nested` for style processing; decide whether to use that or Astro's built-in style scoping

**Phase to address:** Phase 2-3 (Rendering + Styling).

---

### 15. Monaco Editor Integration Complexity

**Risk level:** Low (deferred feature) but High complexity when addressed
**What goes wrong:** Monaco editor in slides requires: loading Monaco's web workers, generating TypeScript type definitions for referenced modules, scanning code blocks for import statements to determine which types to load, and handling Monaco's aria containers that break PDF export. Slidev dedicates 3 separate plugins to this (`monacoTypes.ts`, `monacoWrite.ts`, `patchMonacoSourceMap.ts`).

**Prevention:**
- Defer Monaco integration to a late phase
- When implemented, study Slidev's three Monaco-related plugins carefully
- Consider using a simpler alternative (CodeMirror) as a first pass
- Monaco's web worker loading is the main technical challenge -- it requires specific Vite configuration

**Phase to address:** Phase 6+ (Advanced Features).

---

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|---------------|------------|
| Phase 1: Core Architecture | Choosing MPA routing instead of SPA shell | Decide on single-page architecture from day 1 (Pitfall #1) |
| Phase 1: CLI Foundation | Astro programmatic API instability | Pin Astro version, use integration hooks as stable extension points (Pitfall #9) |
| Phase 1: Parser | Subtle `---` separator edge cases | Port Slidev's parser directly, do not reinvent (Pitfall #5) |
| Phase 2: Rendering | Full-page HMR instead of per-slide | Implement virtual modules per-slide with surgical HMR (Pitfall #10) |
| Phase 2: Rendering | Island hydration timing | Custom hydration strategy for current + adjacent slides (Pitfall #7) |
| Phase 3: Animations | Click system not framework-agnostic | Build vanilla TS core with framework-specific thin wrappers (Pitfall #3) |
| Phase 3: Themes | Cross-package layout resolution | Start local-only, add npm resolution incrementally (Pitfall #8) |
| Phase 4: Presenter Mode | State sync between windows | Design sync layer as standalone module early (Pitfall #4) |
| Phase 5: PDF Export | Async content not rendering in export | Port Slidev's wait-for patterns, treat as standalone feature (Pitfall #6) |

## Sources

- Slidev v52.14.2 source: `_slidev/packages/` (parser, client, CLI analyzed directly)
- [Astro Programmatic API (experimental)](https://docs.astro.build/en/reference/programmatic-reference/)
- [Astro View Transitions](https://docs.astro.build/en/guides/view-transitions/)
- [Astro Islands Architecture](https://docs.astro.build/en/concepts/islands/)
- [Astro nested island hydration issues](https://github.com/withastro/astro/issues/6301)
- [Astro content collection HMR issues](https://github.com/withastro/astro/issues/13253)
- [Astro WebSocket API proposal](https://github.com/withastro/roadmap/discussions/695)
- [Astro client-side routing roadmap](https://github.com/withastro/roadmap/issues/532)
- [Slidev PDF export broken Unicode emoji](https://github.com/slidevjs/slidev/issues/1872)
- [Slidev PDF export icon issues](https://github.com/slidevjs/slidev/issues/1742)
- [Slidev PDF export clicks bug](https://github.com/slidevjs/slidev/issues/2034)
- [Playwright PDF headless Chromium issues](https://github.com/microsoft/playwright/issues/33566)
- [Slidev Mermaid scaling issues](https://github.com/slidevjs/slidev/issues/952)
