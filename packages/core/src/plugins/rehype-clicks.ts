import { visit } from 'unist-util-visit';
import type { Root, Element, Node } from 'hast';
import { ClickIndexer } from '../utils/indexing';

/**
 * Rehype plugin to transform s-click and s-after directives into data attributes and classes.
 * Supports both MDX (camelCase properties) and standard HTML (kebab-case).
 * Also handles <s-clicks> and <s-switch> containers for automatic child indexing.
 */
export function rehypeClicks(): (tree: Root) => void {
  const indexer = new ClickIndexer();

  return (tree: Root) => {
    indexer.reset();

    function applyClick(node: Element, range: string) {
      const props = node.properties || {};
      props['data-step-click'] = range;

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
    }

    function process(node: Node, mode: 'normal' | 'sequential' | 'switch' = 'normal') {
      if (node.type !== 'element') {
        if ('children' in node) {
          (node as any).children.forEach((child: Node) => process(child, mode));
        }
        return;
      }

      const element = node as Element;
      const tagName = element.tagName.toLowerCase();
      const props = element.properties || {};

      let currentMode = mode;
      if (tagName === 's-clicks' || tagName === 'sclicks' || tagName === 'SClicks') {
        currentMode = 'sequential';
      } else if (tagName === 's-switch' || tagName === 'sswitch' || tagName === 'SSwitch') {
        currentMode = 'switch';
      }

      const sClick = props.sClick ?? props['s-click'];
      const sAfter = props.sAfter ?? props['s-after'];

      // If inside a container and not the container itself, and no explicit click
      const isContainer = currentMode !== mode;
      if (mode !== 'normal' && !isContainer) {
        if (sClick === undefined && sAfter === undefined) {
          const index = indexer.resolve('s-click');
          const range = mode === 'sequential' ? `${index}+` : `${index}`;
          applyClick(element, range);
        }
      }

      if (sClick !== undefined || sAfter !== undefined) {
        const directive = sClick !== undefined ? 's-click' : 's-after';
        const value = sClick !== undefined ? sClick : sAfter;
        const stringValue = typeof value === 'string' ? value : undefined;
        const index = indexer.resolve(directive, stringValue);

        let range = index.toString();
        if (directive === 's-click' && !stringValue) {
          range = `${index}+`;
        } else if (directive === 's-after') {
          range = `${index}+`;
        } else if (stringValue && !stringValue.includes('-') && !stringValue.includes('+')) {
          // Absolute index, default to show-onwards (+)
          range = `${index}+`;
        }

        applyClick(element, range);

        // Remove the original properties to clean up HTML
        delete props.sClick;
        delete props['s-click'];
        delete props.sAfter;
        delete props['s-after'];
      }

      if (element.children) {
        element.children.forEach((child) => process(child, currentMode));
      }
    }

    process(tree);
  };
}
