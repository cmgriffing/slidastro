import type { AstroIntegration } from 'astro';
import { slidastroVitePlugin } from './virtual';

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
          entrypoint: '@slidastro/core/templates/SlideView.astro',
        });
      },
    },
  };
}
