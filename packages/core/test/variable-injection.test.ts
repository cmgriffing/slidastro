import { describe, it, expect } from 'vitest';
import { renderSlide, renderMarkdown } from '../src/renderer';

describe('Variable Injection', () => {
  it('should replace {{$page}} and {{$total}} in renderMarkdown', async () => {
    const content = 'Page {{$page}} of {{$total}}';
    const rendered = await renderMarkdown(content, 1, 10);
    expect(rendered).toContain('Page 1 of 10');
  });

  it('should replace {{$page.value}} and {{$total.value}} in renderMarkdown', async () => {
    const content = 'Page {{$page.value}} of {{$total.value}}';
    const rendered = await renderMarkdown(content, 2, 10);
    expect(rendered).toContain('Page 2 of 10');
  });

  it('should replace {{$page}} and {{$total}} in renderSlide', async () => {
    const content = '# Slide {{$page}}\nTotal: {{$total}}';
    const rendered = await renderSlide(content, 5, 20);
    expect(rendered.html).toContain('<h1>Slide 5</h1>');
    expect(rendered.html).toContain('<p>Total: 20</p>');
  });

  it('should return correct totalClicks in renderSlide', async () => {
    const content = `
# Slide
<s-click>Step 1</s-click>
<s-click>Step 2</s-click>
<s-click="5">Step 5</s-click>
    `;
    const rendered = await renderSlide(content, 1, 1);
    expect(rendered.totalClicks).toBe(5);
  });
});
