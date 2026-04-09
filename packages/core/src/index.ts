import type { AstroIntegration } from 'astro';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { slidastroVitePlugin } from './virtual';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export interface SlidastroOptions {
  entry: string;
}

export function slidastroIntegration(options: SlidastroOptions): AstroIntegration {
  return {
    name: '@slidastro/core',
    hooks: {
      'astro:config:setup': ({ injectRoute, updateConfig }) => {
        updateConfig({
          vite: {
            plugins: [slidastroVitePlugin(options.entry)],
          },
        });

        injectRoute({
          pattern: '/[...no]',
          entrypoint: path.resolve(__dirname, 'templates/SlideView.astro'),
        });
      },
    },
  };
}
