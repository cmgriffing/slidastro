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
