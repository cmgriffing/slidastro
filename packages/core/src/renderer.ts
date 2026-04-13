import MarkdownIt from 'markdown-it';
import Shiki from '@shikijs/markdown-it';
import { katex } from '@mdit/plugin-katex';

let rendererPromise: Promise<MarkdownIt> | undefined;

async function getRenderer() {
  if (rendererPromise) return rendererPromise;

  rendererPromise = (async () => {
    const md = new MarkdownIt({
      html: true,
      linkify: true,
      breaks: true,
    });

    md.use((md) => {
      md.block.ruler.before('fence', 'mermaid_monaco', (state, startLine, endLine, silent) => {
        const pos = state.bMarks[startLine] + state.tShift[startLine];
        const max = state.eMarks[startLine];

        if (pos + 3 > max) return false;
        const marker = state.src.slice(pos, pos + 3);
        if (marker !== '```') return false;

        const info = state.src.slice(pos + 3, max).trim();
        if (info !== 'mermaid' && !info.includes('monaco')) return false;

        if (silent) return true;

        // Find end of block
        let nextLine = startLine;
        while (nextLine < endLine) {
          nextLine++;
          const nextPos = state.bMarks[nextLine] + state.tShift[nextLine];
          const nextMax = state.eMarks[nextLine];
          if (state.src.slice(nextPos, nextMax).trim() === '```') break;
        }

        const token = state.push(info === 'mermaid' ? 'mermaid_block' : 'monaco_block', 'div', 0);
        token.info = info;
        token.content = state.getLines(startLine + 1, nextLine, state.tShift[startLine], true);
        token.markup = '```';
        token.map = [startLine, nextLine + 1];

        state.line = nextLine + 1;
        return true;
      });

      md.renderer.rules.mermaid_block = (tokens, idx) => {
        const token = tokens[idx];
        return `<div class="mermaid">${token.content}</div>`;
      };

      md.renderer.rules.monaco_block = (tokens, idx) => {
        const token = tokens[idx];
        const info = token.info.trim();
        const lang = info.replace(/\{monaco\}|monaco/g, '').trim() || 'typescript';
        const content = token.content.replace(/"/g, '&quot;');
        return `<div class="monaco-container" data-lang="${lang}" data-content="${content}"></div>`;
      };
    });

    md.use(await Shiki({
      themes: {
        light: 'vitesse-light',
        dark: 'vitesse-dark',
      },
    }));

    md.use(katex);

    return md;
  })();

  return rendererPromise;
}

export async function renderMarkdown(content: string) {
  const md = await getRenderer();
  return md.render(content);
}

export async function renderSlide(content: string): Promise<{ html: string, slots: Record<string, string> }> {
  const md = await getRenderer();

  // v-click support
  let clickIndex = 0;
  const processedContent = content.replace(/<v-click>/g, () => `<div class="slidev-vclick" data-click="${++clickIndex}">`)
    .replace(/<\/v-click>/g, '</div>');

  const slots: Record<string, string> = {};
  // Split by ::name:: at the beginning of a line
  const parts = processedContent.split(/^::\s*(\w+)\s*::/m);

  let currentSlot = 'default';
  let currentContent = parts[0] || '';

  for (let i = 1; i < parts.length; i += 2) {
    const slotName = parts[i];
    const slotContent = parts[i + 1] || '';

    if (currentContent.trim()) {
      slots[currentSlot] = md.render(currentContent);
    }

    currentSlot = slotName;
    currentContent = slotContent;
  }

  if (currentContent.trim()) {
    slots[currentSlot] = md.render(currentContent);
  }

  return {
    html: slots.default || '',
    slots
  };
}
