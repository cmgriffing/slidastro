import { cac } from 'cac';
import { dev } from 'astro';
import { slidastroIntegration } from '@slidastro/core';

export async function main() {
  const cli = cac('slidastro');

  cli
    .command('dev <entry>', 'Start dev server')
    .option('--port <port>', 'Port to run dev server on', { default: 4321 })
    .action(async (entry: string, options: { port: number }) => {
      console.log(`Starting dev server for ${entry} on port ${options.port}...`);
      
      try {
        await dev({
          root: process.cwd(),
          server: {
            port: options.port,
          },
          integrations: [
            slidastroIntegration({ entry }),
          ],
        });
      } catch (err) {
        console.error('Failed to start dev server:', err);
        process.exit(1);
      }
    });

  cli
    .command('build <entry>', 'Build presentation')
    .action(async (entry: string) => {
      console.log('Build command is not implemented yet.');
    });

  cli
    .command('export <entry>', 'Export presentation')
    .action(async (entry: string) => {
      console.log('Export command is not implemented yet.');
    });

  cli.help();
  cli.version('0.0.1');

  cli.parse();
}
