import { describe, it, expect } from 'vitest';
import { renderSlide } from '../src/renderer';

describe('component-based indexing', () => {
  it('assigns sequential indices to children of <s-clicks>', async () => {
    const content = `
<s-clicks>
  <p>Item 1</p>
  <p>Item 2</p>
</s-clicks>
`;
    const { html } = await renderSlide(content);
    expect(html).toContain('<p data-step-click="1+" class="slidastro-click slidastro-click-hidden">Item 1</p>');
    expect(html).toContain('<p data-step-click="2+" class="slidastro-click slidastro-click-hidden">Item 2</p>');
  });

  it('assigns exact indices to children of <s-switch>', async () => {
    const content = `
<s-switch>
  <p>State 1</p>
  <p>State 2</p>
</s-switch>
`;
    const { html } = await renderSlide(content);
    expect(html).toContain('<p data-step-click="1" class="slidastro-click slidastro-click-hidden">State 1</p>');
    expect(html).toContain('<p data-step-click="2" class="slidastro-click slidastro-click-hidden">State 2</p>');
  });

  it('handles mixed explicit and automatic indexing', async () => {
    const content = `
<s-clicks>
  <p>Item 1</p>
  <p s-click="5">Item 5</p>
  <p>Item 6</p>
</s-clicks>
`;
    const { html } = await renderSlide(content);
    expect(html).toContain('data-step-click="1+"');
    expect(html).toContain('data-step-click="5+"');
    expect(html).toContain('data-step-click="6+"');
  });
});
