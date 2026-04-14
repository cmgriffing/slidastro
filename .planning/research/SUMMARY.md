# Research Summary: Slidastro (Milestone v2.0)

**Domain:** Astro-powered developer presentation ecosystem
**Researched:** 2026-04-22
**Overall confidence:** HIGH

## Executive Summary

Slidastro has successfully completed its first major milestone (v1.0), achieving near-total feature parity with Slidev while leveraging Astro's island architecture for multi-framework component support. The project now stands as the premier "Astro-native" alternative to Slidev, offering developers the ability to mix React, Vue, Svelte, and Solid components within a single markdown-driven presentation.

The current ecosystem is rapidly evolving following the **Astro 5.0/6.0** releases and the **Cloudflare acquisition of Astro** in early 2026. This shift has placed "Edge-Native" and "Content-First" at the forefront of the roadmap. The next phase of Slidastro must capitalize on these trends to move beyond a "Slidev clone" and become a next-generation presentation platform.

Key opportunities for the next milestone include integrating **Shiki Magic Move** for high-fidelity code animations, leveraging **Astro Server Islands** and **Cloudflare D1/KV** for live interactive presentations (polls, live feedback), and incorporating **AI-native features** for automated slide and speaker note generation.

## Key Findings

**Stack:** Astro 6.x (Core), Vite 6.x, Shiki (Highlighter), Playwright (Export), Nano Stores (State), Cloudflare (Edge/D1).
**Architecture:** SPA shell in Astro with framework-agnostic core logic. Shifting towards Edge-native patterns for live interactivity.
**Critical Pitfall:** Maintaining HMR stability across the new Vite Environment API and ensuring Shiki Magic Move synchronization across multi-framework islands.

## Implications for Roadmap

Based on research, the suggested next milestone (Phase 7-8) structure:

1. **Phase 7: Cinematic Experience & Magic Move** - Focus on "The Wow Factor".
   - **Shiki Magic Move** integration: Smooth code morphing animations across all island frameworks.
   - **Advanced Transitions**: View Transitions API enhancements for element-level morphing (not just slide-level).
   - **Bento Layouts**: New modern layout system using CSS Grid/Subgrid.

2. **Phase 8: Edge-Native & Live Presentations** - Focus on "Real-time Interactivity".
   - **Cloudflare Integration**: Native support for D1 (database) and KV (key-value) for live session state.
   - **Live Audience Interaction**: Polls, Q&A, and live feedback components using Astro Server Islands.
   - **Remote Presenter 2.0**: Peer-to-peer sync (WebRTC) and Edge-based relay for low-latency remote control.

3. **Phase 9: AI-Native Slide Authoring** - Focus on "Authoring Velocity".
   - **Workers AI Integration**: Generate slides from prompts or long-form content directly in the CLI.
   - **Smart Notes**: Automatic generation of speaker notes from slide content.
   - **AI Image Generation**: Integrated DALL-E/Stable Diffusion for slide visuals.

**Phase ordering rationale:**
- Phase 7 addresses the most requested visual feature (Magic Move) which has high developer appeal.
- Phase 8 leverages the new Astro-Cloudflare synergy, creating a unique differentiator from Slidev.
- Phase 9 builds upon the Edge infrastructure to provide high-value AI features.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Core tech (Astro/Vite/Shiki) is stable and well-understood. |
| Features | HIGH | Magic Move and AI features are clearly defined in the ecosystem. |
| Architecture | MEDIUM | Edge-native patterns for presentations are relatively new; needs prototyping. |
| Pitfalls | MEDIUM | Multi-framework Magic Move sync is technically challenging. |

## Gaps to Address

- **Multi-Framework Magic Move**: Need to verify if `shiki-magic-move` wrappers for React/Svelte/etc. can share a single animation context easily in an Astro environment.
- **Durable Objects for Sync**: Investigate if Cloudflare Durable Objects are a better fit for live presentation sync than standard WebSockets/KV.
- **Mobile Touch Refinement**: Deeper research into gesture-based navigation for tablet-based presentations.
