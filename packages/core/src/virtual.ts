import type { Plugin } from 'vite';
import { parse } from '@slidastro/parser';
import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
import type { SlidastroData, SlideInfo } from '@slidastro/types';
import { renderMarkdown, renderSlide } from './renderer';
import { splitSlides } from './utils/markdown';

const require = createRequire(import.meta.url);
let cachedData: SlidastroData | undefined;

export function slidastroVitePlugin(entry: string): Plugin {
  const virtualModuleId = 'virtual:slidastro/slides';
  const resolvedVirtualModuleId = '\0' + virtualModuleId;
  const slideVirtualIdPrefix = 'virtual:slidastro/slide/';

  const entryPath = path.isAbsolute(entry) ? entry : path.resolve(process.cwd(), entry);

  return {
    name: 'slidastro:vite-plugin',
    resolveId(id) {
      if (!id || typeof id !== 'string') return;
      if (id === virtualModuleId) {
        return resolvedVirtualModuleId;
      }
      if (id.startsWith(slideVirtualIdPrefix)) {
        return '\0' + id;
      }
    },
    async load(id) {
      if (!id || typeof id !== 'string') return;
      if (id === resolvedVirtualModuleId) {
        const isAstro = entryPath.endsWith('.astro');
        const isMdx = entryPath.endsWith('.mdx');
        
        const content = await fs.readFile(entryPath, 'utf-8');
        let parsedMarkdown;

        if (isAstro || isMdx) {
          const rawSlides = splitSlides(content, isAstro, isMdx);
          parsedMarkdown = {
            filepath: entryPath,
            raw: content,
            slides: rawSlides.map((s, i) => {
              let title = '';
              const frontmatterMatch = s.match(/^---\n([\s\S]*?)\n---/);
              if (frontmatterMatch) {
                const titleMatch = frontmatterMatch[1].match(/^title:\s*(.*)$/m);
                if (titleMatch) title = titleMatch[1].trim();
              }
              if (!title) {
                const headingMatch = s.replace(/^---\n[\s\S]*?\n---/, '').match(/^#+\s+(.*)$/m);
                if (headingMatch) title = headingMatch[1].trim();
              }
              return {
                filepath: entryPath,
                index: i,
                start: 0,
                contentStart: 0,
                end: s.split('\n').length,
                raw: s,
                contentRaw: s,
                content: s.trim(),
                frontmatter: {},
                frontmatterRaw: '',
                note: undefined,
                title
              };
            })
          };
        } else {
          parsedMarkdown = parse(content, entryPath);
        }
        
        const slideMetadata = parsedMarkdown.slides.map((s, i) => ({
          title: (s as any).title,
          index: i
        }));

        const slides: SlideInfo[] = await Promise.all(parsedMarkdown.slides.map(async (s, index) => {
          let html = '';
          let slots = {};
          let totalClicks = 0;
          
          const rendered = await renderSlide(s.content, index + 1, parsedMarkdown.slides.length, slideMetadata);
          totalClicks = rendered.totalClicks;

          if (!isAstro && !isMdx) {
            html = rendered.html;
            slots = rendered.slots;
          }

          const extension = isAstro ? '.astro' : (isMdx ? '.mdx' : '');
          const virtualId = extension ? `${slideVirtualIdPrefix}${index}${extension}` : '';

          return {
            ...s,
            index,
            source: s,
            contentHTML: html,
            slots,
            totalClicks,
            noteHTML: s.note ? await renderMarkdown(s.note, index + 1, parsedMarkdown.slides.length) : undefined,
            isNative: isAstro || isMdx,
            virtualId,
          };
        }));

        const headmatter = parsedMarkdown.slides[0]?.frontmatter || {};
        const themeName = (headmatter.theme as string) || 'default';
        
        const layoutsMap: Record<string, string> = {};
        let themeCSS: string | undefined;

        // Discover local layouts
        const layoutsDir = path.join(path.dirname(entryPath), 'layouts');
        try {
          const files = await fs.readdir(layoutsDir);
          for (const file of files) {
            if (file.endsWith('.astro')) {
              const name = path.basename(file, '.astro');
              layoutsMap[name] = path.join(layoutsDir, file);
            }
          }
        } catch (e) {}

        let aspectRatio = 16 / 9;
        if (typeof headmatter.aspectRatio === 'number') {
          aspectRatio = headmatter.aspectRatio;
        } else if (typeof headmatter.aspectRatio === 'string') {
          const [w, h] = headmatter.aspectRatio.split('/').map(Number);
          if (w && h) aspectRatio = w / h;
        }

        const canvasWidth = headmatter.canvasWidth || 980;
        const canvasHeight = Math.round(canvasWidth / aspectRatio);

        const data: SlidastroData = {
          entry: parsedMarkdown,
          slides,
          config: {
            theme: themeName,
            title: (headmatter.title as string) || 'Slidastro',
            aspectRatio,
            canvasWidth,
            canvasHeight,
            colorSchema: headmatter.colorSchema || 'auto',
            highlighter: 'shiki',
            themeCSS,
            drawings: { enabled: false, persist: false, presenterOnly: true, syncAll: false },
            transition: null
          },
          headmatter,
          features: { 
            katex: parsedMarkdown.slides.some(s => s.content.includes('$')),
            monaco: parsedMarkdown.slides.some(s => s.content.includes('{monaco}') || s.content.match(/```\w*monaco/)), 
            mermaid: parsedMarkdown.slides.some(s => s.content.includes('```mermaid')) 
          },
          markdownFiles: { [entryPath]: parsedMarkdown },
          watchFiles: {},
          layoutsMap
        };

        cachedData = data;
        return `export default ${JSON.stringify(data)};`;
      }

      if (id.startsWith('\0' + slideVirtualIdPrefix)) {
        const baseId = id.slice(1);
        const isAstro = baseId.endsWith('.astro');
        const isMdx = baseId.endsWith('.mdx');
        const match = baseId.match(/(\d+)(\.astro|\.mdx)$/);
        if (match) {
          const slideNo = parseInt(match[1], 10);
          if (cachedData && cachedData.slides[slideNo]) {
            let content = cachedData.slides[slideNo].content;
            const $page = slideNo + 1;
            const $total = cachedData.slides.length;

            if (isAstro) {
              if (content.startsWith('---')) {
                const parts = content.split('---');
                parts[1] = `\nconst $page = ${$page};\nconst $total = ${$total};\n${parts[1]}`;
                content = parts.join('---');
              } else {
                content = `---\nconst $page = ${$page};\nconst $total = ${$total};\n---\n${content}`;
              }
            } else if (isMdx) {
              content = `export const $page = ${$page};\nexport const $total = ${$total};\n${content}`;
            }
            return content;
          }
        }
      }
    }
  };
}
