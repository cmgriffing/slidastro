import type { AstroIntegration } from 'astro';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import UnoCSS from '@unocss/astro';
import mdx from '@astrojs/mdx';
import fs from 'node:fs/promises';
import { slidastroVitePlugin } from './virtual';
import unoConfig from '../uno.config';
import { rehypeClicks } from './plugins/rehype-clicks';
import { updateDragPosition } from './utils/markdown';

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
          integrations: [
            UnoCSS({
              ...unoConfig,
              injectReset: true,
            }),
            mdx({
              rehypePlugins: [rehypeClicks],
            }),
          ],
          vite: {
            plugins: [slidastroVitePlugin(options.entry)],
          },
        });

        injectRoute({
          pattern: '/overview',
          entrypoint: path.resolve(__dirname, 'templates/OverviewView.astro'),
        });

        injectRoute({
          pattern: '/print',
          entrypoint: path.resolve(__dirname, 'templates/PrintView.astro'),
        });

        injectRoute({
          pattern: '/presenter/[...no]',
          entrypoint: path.resolve(__dirname, 'templates/PresenterView.astro'),
        });

        injectRoute({
          pattern: '/',
          entrypoint: path.resolve(__dirname, 'templates/SlideView.astro'),
        });

        injectRoute({
          pattern: '/[...no]',
          entrypoint: path.resolve(__dirname, 'templates/SlideView.astro'),
        });
      },
      'astro:server:setup': ({ server }) => {
        // Relay messages between clients for synchronization
        server.ws.on('slidastro:sync', (data, client) => {
          // Broadcast to all clients except the sender
          server.ws.send('slidastro:sync', data);
        });

        // Handle position updates (persistence)
        server.ws.on('slidastro:update-pos', async (data: { filepath: string, slideIndex: number, dragId: number, x: number, y: number }) => {
          // Security: Validate filepath
          const projectRoot = process.cwd();
          const fullPath = path.isAbsolute(data.filepath) ? data.filepath : path.resolve(projectRoot, data.filepath);
          
          if (!fullPath.startsWith(projectRoot)) {
            console.error('[slidastro] Security: Attempted to update file outside project root:', fullPath);
            return;
          }

          const ext = path.extname(fullPath).toLowerCase();
          if (!['.md', '.astro', '.mdx'].includes(ext)) {
            console.error('[slidastro] Security: Attempted to update unsupported file type:', ext);
            return;
          }

          try {
            const content = await fs.readFile(fullPath, 'utf-8');
            const updated = updateDragPosition(content, data.slideIndex, data.dragId, data.x, data.y);
            
            if (updated !== content) {
              await fs.writeFile(fullPath, updated, 'utf-8');
              console.log(`[slidastro] Updated ${path.relative(projectRoot, fullPath)} (Slide ${data.slideIndex + 1}, Drag ${data.dragId})`);
            }
          } catch (err) {
            console.error('[slidastro] Error updating position:', err);
          }
        });
      },
    },
  };
}
