import type { Plugin } from 'vite';
import { parse } from '@slidastro/parser';
import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
import type { SlidastroData, SlideInfo } from '@slidastro/types';
import { renderMarkdown, renderSlide } from './renderer';

const require = createRequire(import.meta.url);
let cachedData: SlidastroData | undefined;

export function slidastroVitePlugin(entry: string): Plugin {
  const virtualModuleId = 'virtual:slidastro/slides';
  const resolvedVirtualModuleId = '\0' + virtualModuleId;

  const entryPath = path.isAbsolute(entry) ? entry : path.resolve(process.cwd(), entry);

  return {
    name: 'slidastro:vite-plugin',
    resolveId(id) {
      if (id === virtualModuleId) {
        return resolvedVirtualModuleId;
      }
    },
    async load(id) {
      if (id === resolvedVirtualModuleId) {
        const markdown = await fs.readFile(entryPath, 'utf-8');
        const parsedMarkdown = parse(markdown, entryPath);
        
        const slides: SlideInfo[] = await Promise.all(parsedMarkdown.slides.map(async (s, index) => {
          const { html, slots } = await renderSlide(s.content);
          return {
            ...s,
            index,
            source: s,
            contentHTML: html,
            slots,
            noteHTML: s.note ? await renderMarkdown(s.note) : undefined,
          };
        }));

        const headmatter = parsedMarkdown.slides[0]?.frontmatter || {};
        const themeName = (headmatter.theme as string) || 'default';
        
        const layoutsMap: Record<string, string> = {};
        let themeCSS: string | undefined;

        // 1. Discover theme assets
        if (themeName !== 'default') {
          const themePkgNames = [
            `slidastro-theme-${themeName}`,
            `@slidastro/theme-${themeName}`,
            `@slidastro-theme/${themeName}`,
            themeName
          ];
          
          let themePath: string | undefined;
          for (const pkgName of themePkgNames) {
            try {
              themePath = path.dirname(require.resolve(`${pkgName}/package.json`, { paths: [process.cwd()] }));
              break;
            } catch (e) {}
          }
          
          if (themePath) {
            // Scan theme for layouts
            const themeLayoutsDir = path.join(themePath, 'layouts');
            try {
              const files = await fs.readdir(themeLayoutsDir);
              for (const file of files) {
                if (file.endsWith('.astro')) {
                  const name = path.basename(file, '.astro');
                  layoutsMap[name] = path.join(themeLayoutsDir, file);
                }
              }
            } catch (e) {}
            
            // Resolve CSS
            const possibleCssPaths = [
              path.join(themePath, 'styles/index.css'),
              path.join(themePath, 'style.css'),
              path.join(themePath, 'index.css')
            ];
            
            for (const cssPath of possibleCssPaths) {
              try {
                await fs.access(cssPath);
                themeCSS = cssPath;
                break;
              } catch (e) {}
            }
          }
        }

        // 2. Discover local layouts (override theme layouts)
        const layoutsDir = path.join(path.dirname(entryPath), 'layouts');
        try {
          const files = await fs.readdir(layoutsDir);
          for (const file of files) {
            if (file.endsWith('.astro')) {
              const name = path.basename(file, '.astro');
              layoutsMap[name] = path.join(layoutsDir, file);
            }
          }
        } catch (e) {
          // ignore if layouts dir doesn't exist
        }

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
            monaco: false, 
            mermaid: false 
          },
          markdownFiles: { [entryPath]: parsedMarkdown },
          watchFiles: {},
          layoutsMap
        };

        cachedData = data;
        return `export default ${JSON.stringify(data)};`;
      }
    },
    // Handle HMR
    async handleHotUpdate({ file, server }) {
      if (file === entryPath) {
        const markdown = await fs.readFile(entryPath, 'utf-8');
        const parsedMarkdown = parse(markdown, entryPath);
        
        if (cachedData && cachedData.slides.length === parsedMarkdown.slides.length) {
          let onlyContentChanged = true;
          const updates: { index: number, contentHTML: string, slots?: Record<string, string> }[] = [];

          for (let i = 0; i < parsedMarkdown.slides.length; i++) {
            const oldSlide = cachedData.slides[i];
            const newSlide = parsedMarkdown.slides[i];
            
            // If frontmatter changed, it's not just content
            if (JSON.stringify(oldSlide.frontmatter) !== JSON.stringify(newSlide.frontmatter)) {
              onlyContentChanged = false;
              break;
            }

            if (oldSlide.content !== newSlide.content) {
              const { html, slots } = await renderSlide(newSlide.content);
              updates.push({ index: i, contentHTML: html, slots });
              // Update the cache for this slide
              cachedData.slides[i].content = newSlide.content;
              cachedData.slides[i].contentHTML = html;
              cachedData.slides[i].slots = slots;
            }
          }

          if (onlyContentChanged && updates.length > 0) {
            server.ws.send('slidastro:update-content', { updates });
            return [];
          }
        }

        const mod = server.moduleGraph.getModuleById(resolvedVirtualModuleId);
        if (mod) {
          server.moduleGraph.invalidateModule(mod);
          return [mod];
        }
      }
    }
  };
}
