import MarkdownIt from 'markdown-it';
import Shiki from '@shikijs/markdown-it';
import { katex } from '@mdit/plugin-katex';
import { ClickIndexer } from './utils/indexing';

let rendererPromise: Promise<MarkdownIt> | undefined;

async function getRenderer(): Promise<MarkdownIt> {
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

export async function renderMarkdown(content: string, page?: number, total?: number): Promise<string> {
  let processed = content;
  if (page !== undefined) {
    processed = processed.replace(/{{\s*\$page\s*}}/g, page.toString());
    processed = processed.replace(/{{\s*\$page\.value\s*}}/g, page.toString());
  }
  if (total !== undefined) {
    processed = processed.replace(/{{\s*\$total\s*}}/g, total.toString());
    processed = processed.replace(/{{\s*\$total\.value\s*}}/g, total.toString());
  }

  const md = await getRenderer();
  return md.render(processed);
}

export async function renderSlide(
  content: string, 
  page?: number, 
  total?: number, 
  allSlides?: { title?: string, index: number }[]
): Promise<{ html: string, slots: Record<string, string>, totalClicks: number }> {
  let processedContent = content;
  if (page !== undefined) {
    processedContent = processedContent.replace(/{{\s*\$page\s*}}/g, page.toString());
    processedContent = processedContent.replace(/{{\s*\$page\.value\s*}}/g, page.toString());
  }
  if (total !== undefined) {
    processedContent = processedContent.replace(/{{\s*\$total\s*}}/g, total.toString());
    processedContent = processedContent.replace(/{{\s*\$total\.value\s*}}/g, total.toString());
  }

  const md = await getRenderer();
  const indexer = new ClickIndexer();

  // Handle s-link tags
  processedContent = processedContent.replace(/<s-link([^>]*?)>([\s\S]*?)<\/s-link>/g, (match, attrs, inner) => {
    const toMatch = attrs.match(/to="([^"]+)"/);
    const hrefMatch = attrs.match(/href="([^"]+)"/);
    const classMatch = attrs.match(/class="([^"]+)"/);
    
    const to = toMatch ? toMatch[1] : '';
    const href = hrefMatch ? hrefMatch[1] : (to === 'next' || to === 'prev' ? '#' : (to && !isNaN(Number(to)) ? `/${to}` : ''));
    const className = classMatch ? classMatch[1] : '';
    
    return `<a href="${href}" class="slidastro-link ${className}" data-to="${to}">${inner}</a>`;
  });

  // Handle s-toc tags
  processedContent = processedContent.replace(/<s-toc\s*\/?>/g, (match) => {
    if (!allSlides) return '<div class="slidastro-toc"></div>';
    
    const items = allSlides
      .filter(s => s.title)
      .map(s => `<li><a href="/${s.index + 1}" class="slidastro-link" data-to="${s.index + 1}">${s.title}</a></li>`)
      .join('\n');
    
    return `<div class="slidastro-toc"><ul>${items}</ul></div>`;
  });

  // Handle s-tweet tags
  processedContent = processedContent.replace(/<s-tweet([^>]*?)\/>/g, (match, attrs) => {
    const idMatch = attrs.match(/id="([^"]+)"/);
    if (!idMatch) return '';
    return `<div class="slidastro-tweet-wrapper" data-tweet-id="${idMatch[1]}"><blockquote class="twitter-tweet"><a href="https://twitter.com/i/status/${idMatch[1]}"></a></blockquote></div><script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>`;
  });

  // Handle s-youtube tags
  processedContent = processedContent.replace(/<s-youtube([^>]*?)\/>/g, (match, attrs) => {
    const idMatch = attrs.match(/id="([^"]+)"/);
    if (!idMatch) return '';
    return `<div class="slidastro-youtube-wrapper aspect-video" data-index="${page ? page - 1 : -1}"><lite-youtube videoid="${idMatch[1]}"></lite-youtube></div>`;
  });

  // Handle s-video tags
  processedContent = processedContent.replace(/<s-video([^>]*?)\/>/g, (match, attrs) => {
    const srcMatch = attrs.match(/src="([^"]+)"/);
    if (!srcMatch) return '';
    
    const controls = attrs.includes('controls') ? 'controls' : '';
    const autoplay = attrs.includes('autoplay') ? 'autoplay' : '';
    const loop = attrs.includes('loop') ? 'loop' : '';
    const muted = attrs.includes('muted') ? 'muted' : '';
    
    return `<div class="slidastro-video-wrapper" data-index="${page ? page - 1 : -1}"><video src="${srcMatch[1]}" ${controls} ${autoplay} ${loop} ${muted} class="w-full h-full"></video></div>`;
  });

  // Handle AutoFitText tags
  processedContent = processedContent.replace(/<(?:SAutoFitText|AutoFitText)([^>]*?)>([\s\S]*?)<\/(?:SAutoFitText|AutoFitText)>/g, (match, attrs, inner) => {
    const maxMatch = attrs.match(/(?::?max)="([^"]+)"/);
    const minMatch = attrs.match(/(?::?min)="([^"]+)"/);
    
    const max = maxMatch ? maxMatch[1] : '100';
    const min = minMatch ? minMatch[1] : '30';
    
    return `<div class="slidastro-autofit" data-max="${max}" data-min="${min}"><div class="slidastro-autofit-content">${inner}</div></div>`;
  });

  // 0. Handle <s-clicks> and <s-switch> containers
  processedContent = processedContent.replace(/<(s-clicks|s-switch|SClicks|SSwitch)>([\s\S]*?)<\/\1>/g, (match, tag, inner) => {
    const isSequential = tag.toLowerCase().includes('clicks');

    // Render inner content to HTML first to ensure we have tags to target (e.g. for markdown lists)
    const renderedInner = md.render(inner);

    // Target tags in the rendered HTML
    return renderedInner.replace(/<([a-zA-Z0-9-]+)([^>]*?)>/g, (tagMatch, tagName, attrs) => {
      if (tagName.startsWith('/') || tagName === 's-click' || tagName === 's-after') return tagMatch;

      const sClickMatch = attrs.match(/s-click(?:="([^"]+)")?/);
      const sAfterMatch = attrs.match(/s-after/);

      let index: number;
      if (sClickMatch) {
        index = indexer.resolve('s-click', sClickMatch[1]);
      } else if (sAfterMatch) {
        index = indexer.resolve('s-after');
      } else {
        index = indexer.resolve('s-click');
      }

      const range = isSequential ? `${index}+` : `${index}`;

      let resultAttrs = attrs.replace(/\s(s-click|s-after)(?:="[^"]+")?/g, '');
      if (resultAttrs.includes('class="')) {
        resultAttrs = resultAttrs.replace('class="', 'class="slidastro-click slidastro-click-hidden ');
      } else {
        resultAttrs += ' class="slidastro-click slidastro-click-hidden"';
      }
      return `<${tagName}${resultAttrs} data-step-click="${range}">`;
    });
  });

  // 1. Handle <s-click> and <s-after> tags
  processedContent = processedContent.replace(/<(s-click|s-after)([^>]*?)>/g, (match, tag, attrs) => {
    const valueMatch = attrs.match(/(?:s-click|s-after|at|click)="([^"]+)"/) || attrs.match(/="([^"]+)"/);
    const value = valueMatch ? valueMatch[1] : undefined;
    const index = indexer.resolve(tag, value);

    let range = index.toString();
    if (tag === 's-click' && !value) {
      range = `${index}+`;
    } else if (tag === 's-after') {
      range = `${index}+`;
    } else if (value && !value.includes('-') && !value.includes('+')) {
      range = `${index}+`;
    }

    return `<div class="slidastro-click slidastro-click-hidden" data-step-click="${range}">`;
  }).replace(/<\/(s-click|s-after)>/g, '</div>');

  // 2. Handle s-click and s-after attributes on other tags
  // This is a bit naive but works for most common cases in markdown
  processedContent = processedContent.replace(/<([a-zA-Z0-9-]+)([^>]*?)\s(s-click|s-after)(?:="([^"]+)")?([^>]*?)>/g, (match, tag, before, directive, value, after) => {
    const index = indexer.resolve(directive, value);

    let range = index.toString();
    if (directive === 's-click' && !value) {
      range = `${index}+`;
    } else if (directive === 's-after') {
      range = `${index}+`;
    } else if (value && !value.includes('-') && !value.includes('+')) {
      range = `${index}+`;
    }

    let resultAttrs = `${before}${after}`;
    if (resultAttrs.includes('class="')) {
      resultAttrs = resultAttrs.replace('class="', 'class="slidastro-click slidastro-click-hidden ');
    } else {
      resultAttrs += ' class="slidastro-click slidastro-click-hidden"';
    }

    return `<${tag}${resultAttrs} data-step-click="${range}">`;
  });

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

  // Final cleanup: remove <p> wrapping around custom components if they are the only thing in the <p>
  // This ensures they are treated as block-level elements in the final output
  const componentRegex = /<p>(<(s-link|s-toc|s-tweet|s-youtube|s-video|div class="slidastro-autofit")[^>]*?>.*?<\/(s-link|s-toc|s-tweet|s-youtube|s-video|div)>|<(s-toc|s-tweet|s-youtube|s-video)[^>]*?\/>)<\/p>/g;
  
  Object.keys(slots).forEach(key => {
    slots[key] = slots[key].replace(componentRegex, '$1');
  });

  return {
    html: slots.default || '',
    slots,
    totalClicks: indexer.getMax()
  };
}
