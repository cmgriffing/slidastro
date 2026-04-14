import { cac } from 'cac';
import { dev } from 'astro';
import { slidastroIntegration } from '@slidastro/core';
import ansis from 'ansis';
import { build } from './build';
import { exportPresentation } from './export';

export async function main() {
  const cli = cac('slidastro');

  cli
    .command('dev <entry>', 'Start dev server')
    .option('--port <port>', 'Port to run dev server on', { default: 4321 })
    .action(async (entry: string, options: { port: number }) => {
      console.log(ansis.cyan(`\n  Starting dev server for ${ansis.bold(entry)} on port ${options.port}...`));
      
      try {
        const server = await dev({
          root: process.cwd(),
          server: {
            port: options.port,
          },
          integrations: [
            slidastroIntegration({ entry }),
          ],
        });

        const { address, port } = server.address;
        const host = address === '::1' || address === '127.0.0.1' ? 'localhost' : address;
        const url = `http://${host}:${port}/`;

        console.log(`\n  ${ansis.green('➜')}  ${ansis.bold('Main:')}      ${ansis.cyan(url)}`);
        console.log(`  ${ansis.green('➜')}  ${ansis.bold('Presenter:')} ${ansis.cyan(`${url}presenter/1`)}`);
        console.log(`  ${ansis.green('➜')}  ${ansis.bold('Overview:')}  ${ansis.cyan(`${url}overview`)}`);
        console.log(`  ${ansis.green('➜')}  ${ansis.bold('Print:')}     ${ansis.cyan(`${url}print`)}`);
        console.log();
      } catch (err) {
        console.error(ansis.red('\n  Failed to start dev server:'), err);
        process.exit(1);
      }
    });

  cli
    .command('build <entry>', 'Build presentation')
    .option('--outDir <dir>', 'Output directory', { default: 'dist' })
    .action(async (entry: string, options: { outDir: string }) => {
      await build(entry, options);
    });

  cli
    .command('export <entry>', 'Export presentation')
    .option('--format <format>', 'Export format (pdf, png or pptx)', { default: 'pdf' })
    .option('--out <path>', 'Output path')
    .action(async (entry: string, options: { format: 'pdf' | 'png' | 'pptx', out: string }) => {
      await exportPresentation(entry, options);
    });

  cli.help();
  cli.version('0.0.1');

  cli.parse();
}
