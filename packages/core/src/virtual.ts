import type { Plugin } from 'vite';
import { parse } from '@slidastro/parser';
import fs from 'node:fs/promises';
import path from 'node:path';

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
        
        // Simple SlidastroData construction for Phase 1
        const data = {
          entry: parsedMarkdown,
          slides: parsedMarkdown.slides.map((s) => ({
            ...s,
            source: s,
          })),
          config: {
            theme: 'default',
            title: parsedMarkdown.slides[0]?.frontmatter?.title || 'Slidastro',
            aspectRatio: 16 / 9,
            canvasWidth: 980,
            colorSchema: 'auto',
            highlighter: 'shiki',
            drawings: { enabled: false, persist: false, presenterOnly: true, syncAll: false },
            transition: null
          },
          headmatter: parsedMarkdown.slides[0]?.frontmatter || {},
          features: { katex: false, monaco: false, mermaid: false },
          markdownFiles: { [entryPath]: parsedMarkdown },
          watchFiles: {}
        };

        return `export default ${JSON.stringify(data)};`;
      }
    },
    // Handle HMR
    async handleHotUpdate({ file, server }) {
      if (file === entryPath) {
        const mod = server.moduleGraph.getModuleById(resolvedVirtualModuleId);
        if (mod) {
          server.moduleGraph.invalidateModule(mod);
          return [mod];
        }
      }
    }
  };
}
