# Features: Slidastro

**Domain:** Developer slide presentation tool (Astro-powered, Slidev-compatible)
**Researched:** 2026-04-07
**Source:** Full Slidev v52.14.2 source analysis + competitor research

---

## Table Stakes (must have or users leave)

These features are expected by anyone coming from Slidev or any modern developer presentation tool. Missing any of these makes the product feel broken or incomplete.

### Authoring & Content

| Feature | Description | Complexity | Vue-Specific | Notes |
|---------|-------------|------------|--------------|-------|
| Markdown slide authoring | `---` separator, YAML frontmatter per slide, global headmatter | Medium | No | Parser is framework-agnostic; can reuse/port `@slidev/parser` directly |
| Dual frontmatter styles | Both `---`/`---` and ` ```yaml ``` ` code block frontmatter | Low | No | Handled entirely in parser |
| Speaker notes | `<!-- notes -->` HTML comments in markdown become speaker notes | Low | No | Parser-level feature |
| Code syntax highlighting (Shiki) | Language-aware highlighting with themes, line numbers, line highlighting | Medium | No | Shiki is framework-agnostic; Astro has native Shiki support |
| Code block features | Line numbers (`{lines:true}`), line highlighting (`{1,3-5}`), code copy button | Medium | No | markdown-it plugins + CSS |
| Inline code snippets (`<<<`) | Import external code files with region support (`#region`) | Medium | No | Pure markdown transform, framework-agnostic |
| LaTeX/KaTeX math rendering | Block and inline math equations | Low | No | KaTeX is framework-agnostic |
| Mermaid diagrams | Textual diagram rendering | Medium | Partial | Mermaid is JS-based; Vue component wrapper needs Astro equivalent |
| PlantUML diagrams | Server-rendered UML diagrams | Low | No | URL-based rendering, framework-agnostic |
| Embedded styles (scoped CSS) | Per-slide `<style>` blocks with scoped styles | Medium | Partial | Vue scoped styles need Astro equivalent (`<style>` in `.astro` is scoped by default) |
| UnoCSS / Tailwind utility classes | On-demand atomic CSS in slides | Medium | No | UnoCSS works with Astro; alternatively use Tailwind |
| Image support | Markdown images, frontmatter background images, image preloading | Low | No | Standard web features |

### Presentation & Navigation

| Feature | Description | Complexity | Vue-Specific | Notes |
|---------|-------------|------------|--------------|-------|
| Keyboard navigation | Arrow keys, space, page up/down for next/prev slide and click | Low | Yes (VueUse) | Reimplement with vanilla JS or Astro-compatible lib |
| Click animations (v-click) | Progressive reveal of elements on click/advance | High | Yes (Vue directives) | Core differentiator of Slidev; needs complete reimplementation as Astro directives or web components |
| v-after directive | Show element at same click as previous v-click | High | Yes | Part of click system |
| v-click-hide directive | Hide element on specific click | High | Yes | Part of click system |
| Slide transitions | fade, slide-left/right/up/down, fade-out, view-transition | Medium | Yes (Vue TransitionGroup) | Need CSS-based or View Transitions API approach |
| Touch/swipe navigation | Swipe left/right on touch devices | Low | Yes (VueUse) | Reimplement with vanilla JS pointer events |
| Fullscreen mode | Toggle fullscreen via keyboard (F key) | Low | No | Standard Fullscreen API |
| Dark/light mode toggle | Toggle color scheme, respects system preference | Low | Yes (VueUse) | Reimplement with vanilla JS |
| Progress bar | Visual progress indicator at top of slide | Low | Partial | CSS + JS state |
| Slide number display | Current slide / total slides | Low | No | Simple counter |
| Goto dialog | Press 'g' to jump to specific slide number | Low | Yes | Reimplement as vanilla dialog |

### Presenter Mode

| Feature | Description | Complexity | Vue-Specific | Notes |
|---------|-------------|------------|--------------|-------|
| Dual-window presenter view | Separate window showing current slide, next slide, notes, timer | High | Yes | Complete reimplementation needed; uses BroadcastChannel API for sync (framework-agnostic) |
| Speaker notes display | Rendered markdown notes with adjustable font size | Medium | Partial | Markdown rendering is agnostic; UI is Vue |
| Editable notes (dev mode) | Edit speaker notes live in presenter view | Medium | Yes | Needs file write-back mechanism |
| Timer (stopwatch/countdown) | Configurable timer with start/pause/reset | Medium | Yes (VueUse) | Reimplement timer logic |
| Clicks slider | Visual slider showing click progress per slide | Medium | Yes | UI component |
| Next slide preview | Shows what comes after current slide | Medium | Yes | Rendering pipeline |
| Presenter cursor sync | Show presenter's cursor position on audience view | Medium | Yes | SharedState via BroadcastChannel |
| Screen capture mirror | Mirror actual screen in presenter view | Medium | Partial | Uses getDisplayMedia API |
| Multiple presenter layouts | 3 different layout arrangements for presenter view | Medium | Yes | CSS grid layouts |

### Layouts System

| Feature | Description | Complexity | Vue-Specific | Notes |
|---------|-------------|------------|--------------|-------|
| Built-in layouts | default, cover, center, intro, section, statement, fact, quote, end, full, none, error, 404 | Medium | Yes (Vue SFCs) | Must rewrite as Astro components |
| Image layouts | image, image-left, image-right | Medium | Yes | Astro components |
| Two-column layouts | two-cols, two-cols-header | Medium | Yes | Astro components |
| Iframe layouts | iframe, iframe-left, iframe-right | Medium | Yes | Astro components |
| Custom layouts (user-defined) | Users create layouts in `layouts/` directory | Medium | Yes | Astro component convention |
| Slot sugar syntax | `:: slot-name ::` markdown syntax for layout slots | Medium | Yes (Vue slots) | Needs Astro slot equivalent; this is a major Vue-specific pattern |

### Export & Build

| Feature | Description | Complexity | Vue-Specific | Notes |
|---------|-------------|------------|--------------|-------|
| PDF export | Via Playwright/Chromium headless rendering | High | No | Browser-based; framework-agnostic |
| PNG export | Per-slide PNG screenshots | High | No | Browser-based |
| PPTX export | PowerPoint generation from PNG snapshots + notes | High | No | Uses pptxgenjs; framework-agnostic |
| SPA build | Static site build for hosting | Medium | No | Astro has this natively |
| Dev server with HMR | Hot module reload during authoring | Low | No | Astro's dev server provides this |
| PDF with table of contents | Outline/bookmarks in exported PDF | Medium | No | pdf-lib based; framework-agnostic |
| Export with clicks | Generate separate pages per click state | High | Partial | Needs click system to work with export |
| Markdown export | Export as markdown with embedded PNGs | Medium | No | Framework-agnostic |

### Themes & Styling

| Feature | Description | Complexity | Vue-Specific | Notes |
|---------|-------------|------------|--------------|-------|
| Theme system | npm-installable themes that provide layouts, styles, components | High | Yes | Theme packages are Vue component packages; needs Astro theme equivalent |
| Theme config (CSS variables) | `themeConfig` frontmatter injects `--slidev-theme-x` CSS vars | Low | No | CSS custom properties |
| Web fonts | Auto-load Google Fonts/Coollabs from config | Low | No | Font loading is framework-agnostic |
| Custom fonts config | `fonts.sans`, `fonts.mono`, `fonts.serif` with fallbacks | Low | No | CSS generation |
| Favicon config | Custom favicon per presentation | Low | No | HTML head |

---

## Differentiators (competitive advantage over Slidev)

These are features that make Slidastro uniquely valuable and justify its existence alongside Slidev.

### Multi-Framework Components (PRIMARY differentiator)

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| React components in slides | Use any React component library (Recharts, React Three Fiber, etc.) | Medium | Astro island architecture handles this natively |
| Vue components in slides | Full Vue ecosystem compatibility (keeps Slidev users comfortable) | Medium | Astro Vue integration |
| Svelte components in slides | Access Svelte component ecosystem | Medium | Astro Svelte integration |
| Solid components in slides | Access Solid component ecosystem | Medium | Astro Solid integration |
| Mixed frameworks per slide | Use React chart + Vue animation + Svelte widget on same slide | High | Astro's killer feature; no other presentation tool does this |
| Framework-specific islands | Components hydrate independently; non-interactive content is static HTML | Medium | Astro islands architecture |
| Zero-JS by default | Static content ships no JavaScript; interactive islands opt-in | Low | Astro default behavior |

### Astro Ecosystem Benefits

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| MDX support (native) | Write slides in `.mdx` with full component import support | Medium | Astro has first-class MDX |
| `.astro` slide format | Write slides as Astro components for maximum flexibility | Medium | New format not in Slidev |
| Content Collections | Use Astro content collections for slide organization | Medium | Advanced organizational pattern |
| Astro integrations ecosystem | Access to 500+ Astro integrations | Low | Free ecosystem benefit |
| View Transitions API (native) | Astro has first-class View Transitions support | Medium | Better than Slidev's manual implementation |
| Partial hydration | Only hydrate interactive components, not entire slide | Low | Performance advantage over Slidev's full Vue hydration |

### Format Advantages

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Slidev `.md` format compatibility | Drop-in replacement; existing Slidev presentations work | High | Requires full parser compatibility |
| Triple format support | `.md` (Slidev-compat), `.mdx` (Astro-native), `.astro` (full power) | Medium | Unique to Slidastro |
| Progressive enhancement path | Start with Slidev `.md`, migrate to `.mdx` for more power, `.astro` for full control | Low | Migration story |

---

## Anti-Features (deliberately exclude)

### Do NOT Build

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| VS Code extension (v1) | Huge scope, Slidev's is mature and complex (full language server); defer to v2+ | Support Astro VS Code extension which already exists; add slide preview later |
| Fork/patch Slidev source | Creates maintenance burden; Slidev evolves rapidly | Reference `_slidev/` as spec; clean-room implementation |
| Vue-only component system | Defeats the entire purpose of Slidastro | Multi-framework via Astro islands |
| Custom bundler/build system | Astro already provides excellent build pipeline | Use Astro's build system directly |
| Slidev plugin compatibility | Slidev plugins are Vite+Vue specific; impossible to be compatible | Build Astro-native plugin/addon system instead |
| Browser-based editor (SPA) | Slidev's integrated editor is deeply Vue-coupled; complex and low ROI | Rely on VS Code / editor of choice; focus on file-watching HMR |
| Online playground (v1) | StackBlitz/WebContainers integration is complex; defer | Link to StackBlitz template for Astro |
| Mobile app | Web-only is the right approach for developer tools | Responsive web presenter mode works on mobile browsers |
| Reveal.js multiplex (remote audience sync) | Complex server infrastructure; niche use case | Focus on presenter mode; audience shares URL of built SPA |
| AI slide generation | Gimmick; not core to developer workflow | Stay focused on authoring DX |
| WYSIWYG editor | Developers prefer code/markdown; WYSIWYG is antithetical to the tool's identity | Best-in-class markdown authoring |

### Build Later (v2+)

| Feature | Why Defer | Priority Signal |
|---------|-----------|-----------------|
| VS Code extension | High value but enormous scope | After core is stable |
| Custom code runners | Monaco run is complex; focus on display first | After Monaco integration |
| Drawing persistence to disk | Nice-to-have; drawings are ephemeral in most use cases | After drawing overlay works |
| Theme marketplace / gallery | Need theme system working first | After themes are stable |
| Addons system | Need core extension points defined first | After plugin architecture is clear |
| Twoslash (TypeScript hover types) | Nice developer feature but complex integration | After Shiki highlighting works |
| SEO meta tags | Only matters for published/hosted slides | After SPA build works |
| Remote presenter control | WebSocket server complexity | After local presenter mode works |

---

## Feature Complexity Map

### Critical Path (highest complexity, most risk)

| Feature | Complexity | Risk | Why Complex |
|---------|------------|------|-------------|
| Click animation system | Very High | High | Slidev's v-click is deeply tied to Vue's reactivity and directive system. Needs complete reimplementation as either custom elements, Astro directives, or a runtime JS system. This is the single hardest feature to port. |
| Slidev `.md` format parser | High | Medium | Parser itself is portable, but markdown-to-component pipeline must output Astro components instead of Vue components. Slot sugar (`:: name ::`) maps to Vue slots; needs Astro slot equivalent. |
| Presenter mode sync | High | Medium | BroadcastChannel API is framework-agnostic, but the reactive state system is Vue-specific. SharedState (page, clicks, cursor, timer) needs framework-agnostic implementation. |
| Theme system | High | Medium | Existing Slidev themes are Vue component packages. Either: (a) create Astro theme format and build new themes, or (b) create compatibility layer (very hard). Option (a) is better. |
| Layout system | Medium-High | Low | 21 layouts need rewriting as Astro components. Straightforward but tedious. Slot mapping from Vue to Astro needs design. |
| Export pipeline | High | Low | Playwright-based; mostly framework-agnostic. Main risk is ensuring click states render correctly in headless browser. |

### Medium Complexity

| Feature | Complexity | Notes |
|---------|------------|-------|
| Monaco editor integration | Medium | Monaco is framework-agnostic; wrapper component needed |
| Mermaid rendering | Medium | Mermaid is JS; needs Astro component wrapper |
| Drawing overlay (Drauu) | Medium | Drauu is vanilla JS; needs integration layer |
| Slide transitions | Medium | CSS transitions + View Transitions API; Astro has good support |
| v-motion animations | Medium | @vueuse/motion is Vue-specific; use Motion One or CSS animations |
| v-mark (rough notation) | Medium | rough-notation is vanilla JS; needs click integration |
| UnoCSS integration | Medium | UnoCSS works with Astro via official integration |

### Low Complexity

| Feature | Complexity | Notes |
|---------|------------|-------|
| KaTeX math | Low | Framework-agnostic library |
| PlantUML | Low | Server-rendered via URL |
| Dark mode | Low | CSS + localStorage |
| Keyboard shortcuts | Low | Vanilla JS key handling |
| Web fonts | Low | CSS generation |
| Fullscreen | Low | Fullscreen API |
| Wake lock | Low | Wake Lock API |
| Image preloading | Low | Standard Image() preloading |
| Progress bar | Low | CSS width calculation |
| YouTube/Tweet embeds | Low | Iframe wrappers |
| Aspect ratio config | Low | CSS container |
| Favicon | Low | HTML head |

---

## Feature Dependencies

```
Markdown Parser (foundation)
  |
  +---> Slide Separation (---)
  |       |
  |       +---> Frontmatter Parsing (YAML)
  |       |       |
  |       |       +---> Layout Selection
  |       |       +---> Per-slide Config
  |       |       +---> Theme Config
  |       |
  |       +---> Content Rendering
  |               |
  |               +---> Code Highlighting (Shiki)
  |               |       +---> Line Numbers / Highlighting
  |               |       +---> Code Copy Button
  |               |       +---> Magic Move (depends on Shiki)
  |               |       +---> Monaco Editor (depends on Shiki)
  |               |       +---> Twoslash (depends on Shiki)
  |               |
  |               +---> KaTeX (independent)
  |               +---> Mermaid (independent)
  |               +---> PlantUML (independent)
  |               +---> Slot Sugar Transform
  |
  +---> Speaker Notes Extraction
          |
          +---> Presenter Mode (depends on Notes + Navigation)

Navigation System
  |
  +---> Slide Routing
  |       +---> URL-based navigation
  |       +---> Route aliases
  |
  +---> Click System (depends on Routing)
  |       +---> v-click / v-after / v-click-hide
  |       +---> v-motion (depends on clicks)
  |       +---> v-mark (depends on clicks)
  |       +---> Clicks slider UI
  |       +---> Export with clicks
  |
  +---> Keyboard Shortcuts (depends on Routing)
  +---> Touch/Swipe (depends on Routing)
  +---> Overview/Grid Mode (depends on Routing)

Presenter Mode
  |
  +---> BroadcastChannel Sync
  |       +---> SharedState (page, clicks, timer, cursor)
  |       +---> Drawing Sync
  |
  +---> Timer
  +---> Next Slide Preview (depends on Rendering)
  +---> Notes Display (depends on Parser)
  +---> Screen Mirror (depends on getDisplayMedia)

Rendering Pipeline
  |
  +---> Layout System (Astro components)
  |       +---> Built-in layouts
  |       +---> Custom layouts
  |       +---> Theme layouts
  |
  +---> Component System
  |       +---> Framework Islands (React, Vue, Svelte, Solid)
  |       +---> Built-in Components (Toc, Arrow, Link, etc.)
  |
  +---> Styling
          +---> UnoCSS / Tailwind
          +---> Scoped Styles
          +---> Theme CSS Variables
          +---> Web Fonts

Themes
  |
  +---> Theme Resolution (npm packages)
  +---> Theme Layouts (depends on Layout System)
  +---> Theme Components (depends on Component System)
  +---> Theme Styles (depends on Styling)

Export
  |
  +---> Dev Server (Astro dev)
  +---> SPA Build (Astro build)
  +---> PDF Export (depends on Playwright + SPA Build)
  |       +---> PDF TOC (depends on slide titles)
  +---> PNG Export (depends on Playwright)
  +---> PPTX Export (depends on PNG Export + pptxgenjs)

CLI
  |
  +---> `slidastro dev` (depends on Dev Server)
  +---> `slidastro build` (depends on SPA Build)
  +---> `slidastro export` (depends on Export)
```

---

## MVP Recommendation

### Phase 1: Core Authoring (must have to demo)
1. **Markdown parser** - Parse Slidev `.md` format, extract slides + frontmatter + notes
2. **Basic rendering** - Render slides as Astro pages with `---` separation
3. **Code highlighting** - Shiki integration (Astro has this built in)
4. **Built-in layouts** - default, cover, center, two-cols (minimum viable set)
5. **Dev server** - `slidastro dev` with HMR
6. **Keyboard navigation** - Arrow keys, space for next/prev

### Phase 2: Interactive Features (must have for real use)
7. **Click animation system** - v-click equivalent (this is the hardest and most important)
8. **Slide transitions** - CSS-based transitions between slides
9. **KaTeX math** - Math equation rendering
10. **Mermaid diagrams** - Diagram rendering
11. **Dark mode** - Toggle + system preference
12. **Overview mode** - Grid view of all slides

### Phase 3: Presenter & Export (must have for conferences)
13. **Presenter mode** - Dual window with notes, timer, next preview
14. **PDF export** - Via Playwright
15. **Speaker notes** - Display in presenter mode
16. **Timer** - Stopwatch/countdown
17. **PPTX export** - PowerPoint generation

### Phase 4: Differentiators (competitive advantage)
18. **Multi-framework components** - React/Vue/Svelte/Solid islands
19. **MDX format** - Native Astro MDX support
20. **`.astro` format** - Full Astro component slides
21. **Drawing overlay** - Drauu integration
22. **Monaco editor** - Code editing in slides

### Defer
- Theme system (needs ecosystem)
- Addons system
- VS Code extension
- Recording
- Twoslash
- Code runners
- Remote presenter

---

## Competitor Gap Analysis

### Features Slidev Has That Others Lack

| Feature | Slidev | Reveal.js | Marp | Spectacle |
|---------|--------|-----------|------|-----------|
| Click animations (v-click) | Yes | Fragments (simpler) | No | Appear (simpler) |
| Monaco live coding | Yes | No | No | Yes (partial) |
| Drawing overlay | Yes | No | No | No |
| Magic Move (code morphing) | Yes | No | No | No |
| Recording | Yes | No | No | No |
| Presenter cursor sync | Yes | No | No | No |
| Draggable elements | Yes | No | No | No |
| v-mark (rough notation) | Yes | No | No | No |
| Editable notes in dev | Yes | No | No | No |

### Features Others Have That Slidev Lacks

| Feature | Who Has It | Slidev Status | Slidastro Opportunity |
|---------|-----------|---------------|----------------------|
| Audience multiplex (remote follow) | Reveal.js | Not built-in | Defer; WebSocket complexity |
| Auto-Animate (element morphing between slides) | Reveal.js | View Transitions (partial) | Use View Transitions API (Astro has great support) |
| Vertical slides (2D navigation) | Reveal.js | No | Could add as differentiator |
| PDF-first output (print quality) | Marp | Export only | Astro SSG could enable better PDF |
| React JSX slides | Spectacle | No (Vue only) | **Slidastro's PRIMARY differentiator** |
| CommonMark strict compliance | Marp | Close but custom extensions | Support both strict and extended |
| Theme CSS-only (no components) | Marp | Component themes | Support both CSS-only and component themes |
| Slide backgroundImage auto-sizing | Marp | Manual | Could auto-size via CSS |
| Plugin system (formal) | Reveal.js | Addons/Vite plugins | Astro integration system |
| Markdown-only (no framework required) | Marp | Vue required | Static slides need no framework; islands for interactive |

### Slidastro Unique Advantages (No Competitor Has)

1. **Multi-framework components** - React + Vue + Svelte + Solid in one presentation
2. **Island architecture** - Only hydrate interactive parts; static content is zero-JS
3. **Triple format** - `.md` (Slidev-compat) + `.mdx` (components) + `.astro` (full power)
4. **Astro ecosystem** - 500+ integrations, growing community
5. **Partial hydration** - Ship less JavaScript than any other interactive presentation tool
6. **Progressive migration** - Start with Slidev format, graduate to MDX/Astro

---

## Sources

- Slidev v52.14.2 source code at `/Volumes/T7/repos/slidastro/_slidev/` (HIGH confidence - direct source analysis)
- [Slidev documentation](https://sli.dev) (HIGH confidence)
- [Reveal.js documentation](https://revealjs.com/) (HIGH confidence)
- [Marp ecosystem](https://marp.app/) (HIGH confidence)
- [Spectacle on GitHub](https://github.com/FormidableLabs/spectacle) (MEDIUM confidence)
- [Slidev vs Marp vs Reveal.js 2026 comparison](https://www.pkgpulse.com/blog/slidev-vs-marp-vs-revealjs-code-first-presentations-2026) (MEDIUM confidence)
- [10 Code-Based Presentation Tools 2025](https://medium.com/demohub-tutorials/10-code-based-presentation-tools-for-developers-ranked-2025-fe764698f132) (LOW confidence)
