import { build as astroBuild } from 'astro';
import { slidastroIntegration } from '@slidastro/core';
import path from 'node:path';

export interface BuildOptions {
  outDir?: string;
}

export async function build(entry: string, options: BuildOptions = {}) {
  const root = process.cwd();
  const outDir = options.outDir || 'dist';

  console.log(`Building presentation for ${entry} to ${outDir}...`);

  try {
    await astroBuild({
      root,
      outDir: path.resolve(root, outDir),
      integrations: [
        slidastroIntegration({ entry }),
      ],
    });
    console.log('Build completed successfully.');
  } catch (err) {
    console.error('Build failed:', err);
    process.exit(1);
  }
}
