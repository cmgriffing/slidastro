import { describe, it, expect } from 'vitest';
import { renderMarkdown, renderSlide } from '../src/renderer';
import LZString from 'lz-string';

describe('magic-move transformation', () => {
  it('should transform magic-move blocks', async () => {
    const markdown = `
\`\`\`\`md magic-move
\`\`\`ts
const a = 1;
\`\`\`
\`\`\`ts
const a = 2;
\`\`\`
\`\`\`\`
`;
    const html = await renderMarkdown(markdown);
    
    expect(html).toContain('class="shiki-magic-move-container"');
    expect(html).toContain('data-tokens="');
    
    // Extract tokens and decompress
    const match = html.match(/data-tokens="([^"]+)"/);
    expect(match).toBeTruthy();
    const compressed = match![1];
    const decompressed = LZString.decompressFromBase64(compressed);
    expect(decompressed).toBeTruthy();
    
    const tokens = JSON.parse(decompressed);
    expect(Array.isArray(tokens)).toBe(true);
    // There should be at least two steps
    expect(tokens.length).toBeGreaterThanOrEqual(2);
  });

  it('should handle options in magic-move', async () => {
    const markdown = `
\`\`\`\`md magic-move {duration: 1000}
\`\`\`ts
const a = 1;
\`\`\`
\`\`\`ts
const a = 2;
\`\`\`
\`\`\`\`
`;
    const html = await renderMarkdown(markdown);
    expect(html).toContain('data-options=');
    expect(html).toContain('duration');
    expect(html).toContain('1000');
  });

  it('should assign click indices in renderSlide', async () => {
    const markdown = `
\`\`\`\`magic-move
\`\`\`ts
const a = 1;
\`\`\`
\`\`\`ts
const a = 2;
\`\`\`
\`\`\`ts
const a = 3;
\`\`\`
\`\`\`\`
`;
    const result = await renderSlide(markdown);
    expect(result.html).toContain('data-click-start="1"');
    // 3 steps should result in 3 clicks used (1 for start, 2 more for transitions)
    expect(result.totalClicks).toBe(3);
  });
});
