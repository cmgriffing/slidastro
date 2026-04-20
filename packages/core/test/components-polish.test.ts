import { describe, it, expect } from 'vitest';
import { renderSlide } from '../src/renderer';

describe('Polish Components', () => {
  describe('AutoFitText', () => {
    it('transforms AutoFitText tags with default attributes', async () => {
      const content = `<AutoFitText>Hello World</AutoFitText>`;
      const { html } = await renderSlide(content);
      expect(html).toContain('class="slidastro-autofit"');
      expect(html).toContain('data-max="100"');
      expect(html).toContain('data-min="30"');
      expect(html).toContain('<div class="slidastro-autofit-content">Hello World</div>');
    });

    it('preserves custom max/min attributes', async () => {
      const content = `<AutoFitText max="200" min="50">Large Text</AutoFitText>`;
      const { html } = await renderSlide(content);
      expect(html).toContain('data-max="200"');
      expect(html).toContain('data-min="50"');
    });

    it('handles Vue-style :max and :min attributes', async () => {
      const content = `<AutoFitText :max="150" :min="40">Vue Style</AutoFitText>`;
      const { html } = await renderSlide(content);
      expect(html).toContain('data-max="150"');
      expect(html).toContain('data-min="40"');
    });
  });

  describe('s-mark', () => {
    it('transforms s-mark tags with default attributes', async () => {
      const content = `<s-mark>Highlighted Text</s-mark>`;
      const { html } = await renderSlide(content);
      expect(html).toContain('class="slidastro-mark"');
      expect(html).toContain('data-type="highlight"');
      expect(html).toContain('Highlighted Text');
    });

    it('maps all attributes correctly', async () => {
      const content = `<s-mark type="box" color="red" strokeWidth="3" duration="1000">Boxed Text</s-mark>`;
      const { html } = await renderSlide(content);
      expect(html).toContain('data-type="box"');
      expect(html).toContain('data-color="red"');
      expect(html).toContain('data-stroke-width="3"');
      expect(html).toContain('data-duration="1000"');
    });

    it('handles click-based triggers with "at" attribute', async () => {
      const content = `<s-mark at="2">Appears at 2</s-mark>`;
      const { html } = await renderSlide(content);
      expect(html).toContain('class="slidastro-mark slidastro-click"');
      expect(html).toContain('data-at="2"');
    });

    it('handles click-based triggers with "click" attribute (Slidev compatibility)', async () => {
      const content = `<s-mark click="3">Appears at 3</s-mark>`;
      const { html } = await renderSlide(content);
      expect(html).toContain('class="slidastro-mark slidastro-click"');
      expect(html).toContain('data-at="3"');
    });
  });

  describe('Combined Usage', () => {
    it('works correctly when nested', async () => {
      const content = `
<AutoFitText>
  This is <s-mark type="underline">underlined</s-mark>
</AutoFitText>`;
      const { html } = await renderSlide(content);
      expect(html).toContain('class="slidastro-autofit"');
      expect(html).toContain('class="slidastro-mark"');
      expect(html).toContain('data-type="underline"');
    });
  });
});
