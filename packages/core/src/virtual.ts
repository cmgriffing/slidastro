import type { Plugin } from 'vite';
import { parse } from '@slidastro/parser';
import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
import type { SlidastroData, SlideInfo } from '@slidastro/types';
import { renderMarkdown, renderSlide } from './renderer';

const require = createRequire(import.meta.url);
let cachedData: SlidastroData | undefined;

function splitSlides(content: string, isAstro: boolean, isMdx: boolean) {
  const lines = content.split('\n');
  const slides: string[] = [];
  let current: string[] = [];
  let firstLogicBlock = '';
  let inFrontmatter = false;
  let frontmatterCount = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    
    if (trimmed === '---') {
      if (frontmatterCount < 2) {
        frontmatterCount++;
        current.push(line);
        if (frontmatterCount === 2) {
          firstLogicBlock = current.join('\n');
        }
        continue;
      }
      
      // This is a separator
      slides.push(current.join('\n'));
      current = [];
      if ((isAstro || isMdx) && firstLogicBlock) {
        current.push(firstLogicBlock);
      }
    } else {
      current.push(line);
    }
  }
  if (current.length > 0) {
    slides.push(current.join('\n'));
  }
  return slides;
}

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
            slides: rawSlides.map((s, i) => ({
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
              note: undefined
            }))
          };
        } else {
          parsedMarkdown = parse(content, entryPath);
        }
        
        const slides: SlideInfo[] = await Promise.all(parsedMarkdown.slides.map(async (s, index) => {
          let html = '';
          let slots = {};
          
          if (!isAstro && !isMdx) {
            const rendered = await renderSlide(s.content);
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
            noteHTML: s.note ? await renderMarkdown(s.note) : undefined,
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
        const match = baseId.match(/(\d+)(\.astro|\.mdx)$/);
        if (match) {
          const slideNo = parseInt(match[1], 10);
          if (cachedData && cachedData.slides[slideNo]) {
            return cachedData.slides[slideNo].content;
          }
        }
      }
    }
  };
}
