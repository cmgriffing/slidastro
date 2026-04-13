# Phase 5: Export & Build - Discussion Summary

Phase 5 focuses on the "First-POST magic" applied to production delivery and high-fidelity exports.

## Key Decisions

1.  **Astro Programmatic Build**: Use Astro's `build` API directly from `@slidastro/cli`. This ensures that all integrations (including our own) are correctly applied without requiring a user-facing `astro.config.mjs`.
2.  **Playwright-Core for Export**: Use `playwright-core` with a lazy-install approach for Chromium. This keeps the initial installation size of `@slidastro/cli` small while ensuring a robust export engine is available when needed.
3.  **Dedicated `/print` Route**: Implement a specialized route in `@slidastro/core` that renders all slides vertically for PDF capture. This is more efficient than capturing individual slides and merging them.
4.  **SPA by Default**: The static build will produce an SPA to maintain the interactive features like `astro:transitions` and synchronized state (if hosted on a WebSocket-compatible environment).

## Complexity & Risks

- **Playwright Installation**: Automating the installation of Chromium in different environments (CI, macOS, Linux) can be tricky. We will provide a clear feedback loop if it fails.
- **Print Scaling**: Ensuring that slides with custom aspect ratios (e.g., 4:3 vs 16:9) scale correctly for standard A4/Letter PDF pages requires precise `@media print` CSS.

## Next Steps

1.  Review and approve Plan 5.1 (Build).
2.  Review and approve Plan 5.2 (Export).
3.  Execute Phase 5.
