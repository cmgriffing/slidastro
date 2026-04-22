import { MagicMoveRenderer } from 'shiki-magic-move/renderer';
import LZString from 'lz-string';
import { $clicks } from '@slidastro/client';

export function initMagicMove() {
  console.log('initMagicMove called');
  const containers = document.querySelectorAll<HTMLElement>('.shiki-magic-move-container');

  containers.forEach((container) => {
    // Only initialize once
    if ((container as any)._magicMoveInitialized) return;
    (container as any)._magicMoveInitialized = true;

    const compressed = container.dataset.tokens;
    if (!compressed) return;

    let tokens, options, clickStart;
    try {
      tokens = JSON.parse(LZString.decompressFromBase64(compressed));
    } catch (e) {
      console.error('Failed to parse tokens:', e);
      return;
    }

    try {
      options = JSON.parse(container.dataset.options || '{}');
    } catch (e) {
      console.error('Failed to parse options:', e, 'Raw options:', container.dataset.options);
      return;
    }

    try {
      clickStart = parseInt(container.dataset.clickStart || '0', 10);
      const renderer = new MagicMoveRenderer(container);
      let currentStep = -1;

      const update = (clickCount: number) => {
        let stepIndex = Math.max(0, clickCount - clickStart);
        stepIndex = Math.min(stepIndex, tokens.length - 1);

        if (stepIndex !== currentStep) {
          const isFirst = currentStep === -1;
          currentStep = stepIndex;
          if (isFirst) {
            renderer.replace(tokens[stepIndex]);
          } else {
            renderer.render(tokens[stepIndex]);
          }
        }
      };

      // Initial update
      update($clicks.get());

      // Sync with clicks
      $clicks.listen((clickCount) => {
        update(clickCount);
      });
    } catch (e) {
      console.error('Failed to initialize Shiki Magic Move:', e);
    }
  });
}
