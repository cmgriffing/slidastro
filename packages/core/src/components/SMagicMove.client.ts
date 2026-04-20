import { MagicMoveRenderer } from 'shiki-magic-move/core';
import LZString from 'lz-string';
import { $clicks } from '@slidastro/client';

export function initMagicMove() {
  const containers = document.querySelectorAll<HTMLElement>('.shiki-magic-move-container');

  containers.forEach((container) => {
    // Only initialize once
    if ((container as any)._magicMoveInitialized) return;
    (container as any)._magicMoveInitialized = true;

    const compressed = container.dataset.tokens;
    if (!compressed) return;

    try {
      const tokens = JSON.parse(LZString.decompressFromBase64(compressed));
      const options = JSON.parse(container.dataset.options || '{}');
      const clickStart = parseInt(container.dataset.clickStart || '0', 10);

      const renderer = new MagicMoveRenderer(container);
      let currentStep = -1;

      const update = (clickCount: number) => {
        let stepIndex = Math.max(0, clickCount - clickStart);
        stepIndex = Math.min(stepIndex, tokens.length - 1);

        // If clickCount is less than clickStart, we shouldn't show anything or show the first step?
        // Actually, if it's a magic-move block, it usually occupies space and shows the first step by default
        // unless it's wrapped in an s-click.
        // But the renderer should handle showing the correct state.
        
        // If clickCount < clickStart, we might want to hide it or show the first step but "hidden".
        // However, the ClickIndexer in renderer.ts resolves 'magic-move' which usually means it appears AT that click.
        
        if (clickCount < clickStart) {
          // Before the magic move starts, we might want to hide it.
          // But usually the container itself might have 'slidastro-click-hidden' if it's meant to be hidden.
          // For now, let's just render the first step if we are before it, or maybe don't render.
          container.style.opacity = '0';
          container.style.pointerEvents = 'none';
          return;
        } else {
          container.style.opacity = '1';
          container.style.pointerEvents = 'auto';
        }

        if (stepIndex !== currentStep) {
          currentStep = stepIndex;
          renderer.render({
            tokens: tokens[stepIndex],
            ...options,
          });
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
