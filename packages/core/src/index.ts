import type { AstroIntegration } from 'astro';

export interface SlidastroOptions {
  entry: string;
}

export function slidastroIntegration(options: SlidastroOptions): AstroIntegration {
  return {
    name: '@slidastro/core',
    hooks: {
      'astro:config:setup': ({ injectRoute }) => {
        injectRoute({
          pattern: '/[...no]',
          entrypoint: '@slidastro/core/placeholder.astro',
        });
      },
    },
  };
}
