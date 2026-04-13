import { dev, preview } from 'astro';
import { slidastroIntegration } from '@slidastro/core';
import { chromium } from 'playwright-core';
import path from 'node:path';
import fs from 'node:fs/promises';
import { build } from './build';
import ansis from 'ansis';
import PptxGenJS from 'pptxgenjs';

export interface ExportOptions {
  format?: 'pdf' | 'png' | 'pptx';
  out?: string;
  timeout?: number;
}

export async function exportPresentation(entry: string, options: ExportOptions = {}) {
  const format = options.format || 'pdf';
  const timeout = options.timeout || 30000;
  const root = process.cwd();
  const outDir = '.slidastro/export-temp';
  const outPath = options.out || (entry.endsWith('.md') ? entry.replace('.md', `.${format}`) : `export.${format}`);

  console.log(ansis.cyan(`Exporting ${entry} as ${format.toUpperCase()}...`));

  // 1. Build the presentation
  await build(entry, { outDir });

  // 2. Start preview server
  const server = await preview({
    root,
    outDir: path.resolve(root, outDir),
    server: {
      port: 4321,
    },
  });

  const baseUrl = `http://localhost:4321`;

  try {
    // 3. Launch Playwright
    // Note: We use chromium.launch() which requires a browser to be installed.
    // If it fails, we should provide a helpful message.
    const browser = await chromium.launch().catch(err => {
      console.error(ansis.red('Failed to launch browser. Make sure Playwright browsers are installed: npx playwright install chromium'));
      throw err;
    });

    const context = await browser.newContext();
    const page = await context.newPage();

    console.log(ansis.blue('Navigating to print view...'));
    await page.goto(`${baseUrl}/print`, { waitUntil: 'networkidle', timeout });

    // Wait for any additional hydration or rendering if needed
    await page.waitForTimeout(1000);

    if (format === 'pdf') {
      console.log(ansis.blue('Generating PDF...'));
      await page.pdf({
        path: outPath,
        format: 'A4',
        landscape: true,
        printBackground: true,
        preferCSSPageSize: true,
      });
    } else if (format === 'png') {
      console.log(ansis.blue('Capturing PNGs...'));
      const slides = await page.$$('.print-slide');
      const baseName = outPath.replace('.png', '');
      
      for (let i = 0; i < slides.length; i++) {
        const slide = slides[i];
        await slide.screenshot({
          path: `${baseName}-${i + 1}.png`,
        });
      }
    } else if (format === 'pptx') {
      console.log(ansis.blue('Generating PPTX...'));
      const slides = await page.$$('.print-slide');
      const pptx = new PptxGenJS();
      
      // Get slide dimensions from the first slide's bounding box
      const firstSlide = slides[0];
      if (firstSlide) {
        const box = await firstSlide.boundingBox();
        if (box) {
          // pptxgenjs uses inches, 96 DPI is standard for web
          pptx.defineLayout({
            name: 'CUSTOM',
            width: box.width / 96,
            height: box.height / 96,
          });
          pptx.layout = 'CUSTOM';
        }
      }

      for (let i = 0; i < slides.length; i++) {
        const slide = slides[i];
        const screenshot = await slide.screenshot();
        const pptxSlide = pptx.addSlide();
        pptxSlide.addImage({
          data: `data:image/png;base64,${screenshot.toString('base64')}`,
          x: 0,
          y: 0,
          w: '100%',
          h: '100%',
        });
      }

      await pptx.writeFile({ fileName: outPath });
    }

    await browser.close();
    console.log(ansis.green(`Exported successfully to ${outPath}`));
  } catch (err) {
    console.error(ansis.red('Export failed:'), err);
  } finally {
    // 4. Cleanup
    await server.stop();
    await fs.rm(path.resolve(root, outDir), { recursive: true, force: true });
  }
}
