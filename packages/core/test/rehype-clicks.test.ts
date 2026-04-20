import { describe, it, expect } from 'vitest';
import { rehype } from 'rehype';
import { rehypeClicks } from '../src/plugins/rehype-clicks';

describe('rehypeClicks', () => {
  const processor = rehype().use(rehypeClicks);

  it('should transform s-click into data-step-click', async () => {
    const input = '<div s-click>Click me</div>';
    const output = await processor.process(input);
    expect(output.toString()).toContain('data-step-click="1"');
    expect(output.toString()).toContain('class="slidastro-click slidastro-click-hidden"');
    expect(output.toString()).not.toContain('s-click');
  });

  it('should transform absolute s-click="3"', async () => {
    const input = '<div s-click="3">Click me</div>';
    const output = await processor.process(input);
    expect(output.toString()).toContain('data-step-click="3"');
  });

  it('should transform s-after', async () => {
    const input = '<div><p s-click>1</p><p s-after>2</p></div>';
    const output = await processor.process(input);
    expect(output.toString()).toContain('data-step-click="1"');
    // The second one should also be 1 because it's s-after
    const matches = output.toString().match(/data-step-click="1"/g);
    expect(matches).toHaveLength(2);
  });

  it('should handle camelCase properties (MDX style)', async () => {
    // In actual MDX these would be passed as properties to the rehype plugin
    // Here we simulate it by using rehype-parse which might not produce camelCase
    // but we can test the plugin logic directly if needed.
    // However, rehype().use(rehypeClicks) works on HAST.
    
    const h = (tagName: string, properties: any) => ({
      type: 'element',
      tagName,
      properties,
      children: []
    });

    const tree: any = {
      type: 'root',
      children: [
        h('div', { sClick: '5' }),
        h('span', { sAfter: true })
      ]
    };

    rehypeClicks()(tree);

    expect(tree.children[0].properties['data-step-click']).toBe('5');
    expect(tree.children[0].properties.className).toContain('slidastro-click');
    expect(tree.children[1].properties['data-step-click']).toBe('5');
  });

  it('should append classes to existing ones', async () => {
    const input = '<div class="foo" s-click>Click me</div>';
    const output = await processor.process(input);
    expect(output.toString()).toContain('class="foo slidastro-click slidastro-click-hidden"');
  });
});
