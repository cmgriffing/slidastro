# Domain Pitfalls: Slidastro (v2.0)

**Domain:** Astro-powered slide presentations
**Researched:** 2026-04-22

## Critical Pitfalls

Mistakes that cause rewrites or major issues in the new milestone.

### Pitfall 1: Shiki Magic Move Token Desync
**What goes wrong:** Shiki Magic Move relies on consistent tokenization between two states. If different framework islands (React/Vue/Svelte) tokenize the same code differently, the animation will flicker or break.
**Why it happens:** Custom Shiki transformers or different highlighter versions across islands.
**Consequences:** Broken "Keynote-style" code transitions.
**Prevention:** Centralize the Shiki highlighter instance in a shared module and pass tokens, not raw code, to islands.

### Pitfall 2: Edge Database Latency (D1)
**What goes wrong:** Real-time polls or interactive components feel sluggish because they perform a D1 database write/read on every action.
**Why it happens:** Cold starts or regional latency for D1 writes.
**Consequences:** Laggy audience interaction, poor "First-POST" experience.
**Prevention:** Use **Durable Objects** for the active "Presentation Session" state and batch-sync to D1 periodically for persistence.

## Moderate Pitfalls

### Pitfall 1: View Transition Interruption
**What goes wrong:** Astro View Transitions can sometimes interrupt ongoing island hydration or animations.
**Why it happens:** Navigating too quickly between slides while the previous slide's transitions are still active.
**Prevention:** Use the `navigate()` function with `history: 'replace'` and ensure animations are finished before next navigation is allowed (debounce/lock).

### Pitfall 2: AI Hallucinations in Slide Generation
**What goes wrong:** Workers AI generates invalid Markdown or non-existent Astro components.
**Why it happens:** Lack of structured output enforcement from the LLM.
**Prevention:** Use **JSON-mode** or **Function Calling** for the LLM to ensure valid slide metadata and components are produced.

## Minor Pitfalls

### Pitfall 1: Mobile Gesture Interference
**What goes wrong:** Slide navigation gestures (swipes) interfere with native browser "Back" gestures.
**Prevention:** Use CSS `touch-action: pan-y` to allow vertical scrolling but capture horizontal swipes for navigation.

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|---------------|------------|
| Phase 7: Magic Move | Island-to-Island Token Desync | Shared Shiki Highlighter (Pitfall #1) |
| Phase 8: Live Interactivity | D1 Latency | Durable Objects for Session State (Pitfall #2) |
| Phase 9: AI Authoring | Invalid MD/Component syntax | Structured JSON output from LLM (Moderate Pitfall #2) |

## Sources

- [Slidev GitHub Discussions on Magic Move](https://github.com/slidevjs/slidev/discussions)
- [Cloudflare D1 Best Practices](https://developers.cloudflare.com/d1/platform-limits/best-practices/)
- [Workers AI Structured Output Guide](https://developers.cloudflare.com/workers-ai/models/llm-structured-output/)
