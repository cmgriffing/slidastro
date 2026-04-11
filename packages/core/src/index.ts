import type { AstroIntegration } from 'astro';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import UnoCSS from '@unocss/astro';
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
          integrations: [UnoCSS({
            injectReset: true,
          })],
          vite: {
            plugins: [slidastroVitePlugin(options.entry)],
          },
        });

        injectRoute({
          pattern: '/overview',
          entrypoint: path.resolve(__dirname, 'templates/OverviewView.astro'),
        });

        injectRoute({
          pattern: '/presenter/[...no]',
          entrypoint: path.resolve(__dirname, 'templates/PresenterView.astro'),
        });

        injectRoute({
          pattern: '/[...no]',
          entrypoint: path.resolve(__dirname, 'templates/SlideView.astro'),
        });
      },
    },
  };
}
