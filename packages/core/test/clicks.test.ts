import { describe, it, expect } from 'vitest';
import { renderSlide } from '../src/renderer';

describe('click transformations', () => {
  it('transforms <s-click> tags correctly', async () => {
    const content = '<s-click>Step 1</s-click>';
    const { html } = await renderSlide(content);
    expect(html).toContain('<div class="slidastro-click slidastro-click-hidden" data-step-click="1">');
    expect(html).toContain('Step 1');
  });

  it('transforms s-click attributes on tags', async () => {
    const content = '<p s-click>Step 1</p>';
    const { html } = await renderSlide(content);
    expect(html).toContain('<p class="slidastro-click slidastro-click-hidden" data-step-click="1">Step 1</p>');
  });

  it('transforms s-after attributes on tags', async () => {
    const content = '<p s-click>Step 1</p><p s-after>Also Step 1</p>';
    const { html } = await renderSlide(content);
    expect(html).toContain('<p class="slidastro-click slidastro-click-hidden" data-step-click="1">Step 1</p>');
    expect(html).toContain('<p class="slidastro-click slidastro-click-hidden" data-step-click="1">Also Step 1</p>');
  });

  it('auto-increments click index', async () => {
    const content = `
<s-click>Step 1</s-click>
<p s-click>Step 2</p>
<span s-click="3">Step 3</span>
<div s-click>Step 4</div>
`;
    const { html } = await renderSlide(content);
    expect(html).toContain('data-step-click="1"');
    expect(html).toContain('data-step-click="2"');
    expect(html).toContain('data-step-click="3"');
    expect(html).toContain('data-step-click="4"');
  });

  it('supports s-after after absolute index', async () => {
    const content = '<p s-click="5">Step 5</p><p s-after>Also Step 5</p>';
    const { html } = await renderSlide(content);
    expect(html).toContain('data-step-click="5"');
    expect(html).toContain('data-step-click="5"');
  });

  it('preserves existing classes when adding slidastro-click', async () => {
    const content = '<p class="my-class" s-click>Step 1</p>';
    const { html } = await renderSlide(content);
    expect(html).toContain('class="slidastro-click slidastro-click-hidden my-class"');
    expect(html).toContain('data-step-click="1"');
  });
});
