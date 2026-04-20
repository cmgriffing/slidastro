import { visit } from 'unist-util-visit';
import type { Root, Element } from 'hast';
import { ClickIndexer } from '../utils/indexing';

/**
 * Rehype plugin to transform s-click and s-after directives into data attributes and classes.
 * Supports both MDX (camelCase properties) and standard HTML (kebab-case).
 */
export function rehypeClicks() {
  const indexer = new ClickIndexer();

  return (tree: Root) => {
    indexer.reset();
    visit(tree, 'element', (node: Element) => {
      const props = node.properties || {};
      
      // MDX/Astro properties might be camelCased (sClick, sAfter)
      // or standard (s-click, s-after)
      const sClick = props.sClick ?? props['s-click'];
      const sAfter = props.sAfter ?? props['s-after'];

      if (sClick !== undefined || sAfter !== undefined) {
        const directive = sClick !== undefined ? 's-click' : 's-after';
        const value = sClick !== undefined ? sClick : sAfter;
        
        // Convert to string for indexer, handling boolean true for bare directives
        const stringValue = typeof value === 'string' ? value : undefined;
        
        const index = indexer.resolve(directive, stringValue);
        
        props['data-step-click'] = index.toString();
        
        // Handle class names. rehype-raw or other plugins might represent them as string or array
        let classNames: string[] = [];
        if (typeof props.className === 'string') {
          classNames = props.className.split(/\s+/);
        } else if (Array.isArray(props.className)) {
          classNames = props.className.map(String);
        }

        if (!classNames.includes('slidastro-click')) {
          classNames.push('slidastro-click');
        }
        if (!classNames.includes('slidastro-click-hidden')) {
          classNames.push('slidastro-click-hidden');
        }
        props.className = classNames;

        // Remove the original properties to clean up HTML
        delete props.sClick;
        delete props['s-click'];
        delete props.sAfter;
        delete props['s-after'];
      }
    });
  };
}
