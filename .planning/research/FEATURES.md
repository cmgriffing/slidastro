# Feature Landscape: Slidastro (v2.0)

**Domain:** Astro-powered developer presentation ecosystem
**Researched:** 2026-04-22

## Table Stakes (Already Built)

Features users expect in any developer-focused slide tool. Missing these = product feels incomplete.

| Feature | Why Expected | Status | Complexity |
|---------|--------------|--------|------------|
| Markdown Splitter | Essential for slide authoring with `---` | Done | High |
| Slidev Compatibility | Must render existing Slidev .md files | Done | High |
| Shiki Highlighting | Standard for code-heavy presentations | Done | Low |
| Mermaid Diagrams | Table-stakes for architectural slides | Done | Medium |
| KaTeX Math | Necessary for academic/scientific slides | Done | Low |
| Presenter Mode | Dual-window with notes and timer | Done | High |
| PDF/PPTX Export | Essential for offline distribution | Done | High |
| Recording Mode | Important for asynchronous sharing | Done | Medium |

## Differentiators

Features that set Slidastro apart from Slidev and other slide tools.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Multi-Framework Islands | Use React, Svelte, Vue, Solid in one deck | High | Unique to Slidastro/Astro |
| Shiki Magic Move | Keynote-quality code morphing animations | Medium-High | Now an ecosystem standard |
| Cloudflare Native | Built-in edge hosting and D1/KV support | Medium | Superior performance and live features |
| Server Islands (Live) | Real-time interactive components (polls) | High | Uses Astro's latest architecture |
| AI-Native Authoring | Generate slides/notes with Cloudflare AI | High | Significant productivity boost |

## Anti-Features

Features to explicitly NOT build to maintain focus.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| Native Mobile Apps | Too much overhead, web-first is sufficient | Focus on PWA and mobile touch UX |
| WYSIWYG Editor | Compromises the "Markdown-first" DX | Improve VS Code extension support |
| Version Control | Git already does this perfectly | Integrate with Git-based workflows |

## Feature Dependencies

```
Astro Core → Multi-Framework Islands
Cloudflare D1 → Live Audience Interaction
Shiki → Shiki Magic Move
Workers AI → AI-Native Authoring
```

## MVP Recommendation (v2.0)

Prioritize:
1. **Shiki Magic Move Integration**: The most requested visual feature for developer slides.
2. **Astro Server Islands for Live Polls**: Demonstrates the power of Astro's live-refresh architecture.
3. **AI Slide Generation**: Leverages the current AI trend to increase authoring speed.

Defer: **Custom Addon System** (already complex enough with the current theme system).

## Sources

- [Slidev Features List](https://sli.dev/)
- [Shiki Magic Move Documentation](https://shiki-magic-move.netlify.app/)
- [Astro Server Islands Guide](https://docs.astro.build/en/guides/server-islands/)
