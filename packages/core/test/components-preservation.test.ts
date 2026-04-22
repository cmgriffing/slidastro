import { describe, it, expect } from 'vitest';
import { renderSlide } from '../src/renderer';

describe('custom components preservation', () => {
  it('preserves <s-link> without wrapping in <p>', async () => {
    const content = '<s-link to="next">Next</s-link>';
    const { html } = await renderSlide(content);
    // If it's wrapped in <p>, it would be <p><s-link ...>...</s-link></p>
    expect(html.trim()).toBe('<s-link to="next">Next</s-link>');
  });

  it('preserves <s-toc> without wrapping in <p>', async () => {
    const content = '<s-toc />';
    const { html } = await renderSlide(content);
    expect(html.trim()).toBe('<s-toc />');
  });
});
