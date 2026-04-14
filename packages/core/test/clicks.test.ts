import { describe, it, expect } from 'vitest';
import { renderSlide } from '../src/renderer';

describe('click transformations', () => {
  it('transforms <step-click> tags correctly', async () => {
    const content = '<step-click>Step 1</step-click>';
    const { html } = await renderSlide(content);
    expect(html).toContain('<div class="slidastro-click" data-step-click="1">');
    expect(html).toContain('Step 1');
  });

  it('transforms step-click attributes on tags', async () => {
    const content = '<p step-click>Step 2</p>';
    const { html } = await renderSlide(content);
    expect(html).toContain('<p class="slidastro-click" data-step-click="1">Step 2</p>');
  });

  it('auto-increments click index', async () => {
    const content = `
<step-click>Step 1</step-click>
<p step-click>Step 2</p>
<span step-click="3">Step 3</span>
<div step-click>Step 4</div>
`;
    const { html } = await renderSlide(content);
    expect(html).toContain('data-step-click="1"');
    expect(html).toContain('data-step-click="2"');
    expect(html).toContain('data-step-click="3"');
    expect(html).toContain('data-step-click="4"');
  });

  it('supports click ranges', async () => {
    const content = '<div step-click="1-3">Visible during 1, 2, 3</div>';
    const { html } = await renderSlide(content);
    expect(html).toContain('data-step-click="1-3"');
  });

  it('preserves existing classes when adding slidastro-click', async () => {
    const content = '<p class="my-class" step-click>Step 2</p>';
    const { html } = await renderSlide(content);
    expect(html).toContain('class="slidastro-click my-class"');
    expect(html).toContain('data-step-click="1"');
  });
});
