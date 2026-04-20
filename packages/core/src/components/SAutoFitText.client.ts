export async function initAutoFitText() {
  const elements = document.querySelectorAll('.slidastro-autofit');
  if (elements.length === 0) return;

  const updateElement = (container: HTMLElement) => {
    const content = container.querySelector('.slidastro-autofit-content') as HTMLElement;
    if (!content) return;

    const maxStr = container.getAttribute('data-max');
    const minStr = container.getAttribute('data-min');
    
    const max = maxStr ? parseFloat(maxStr) : 100;
    const min = minStr ? parseFloat(minStr) : 30;

    let low = min;
    let high = max;
    
    // Binary search for the best fit
    // 10 iterations gives ~0.1% precision for a range of 100
    for (let i = 0; i < 12; i++) {
      const mid = (low + high) / 2;
      content.style.fontSize = `${mid}px`;

      const fitsWidth = content.offsetWidth <= container.offsetWidth;
      
      // We check height as well. If the container is 0 (not rendered yet or auto height), we ignore it.
      // In many layouts, the container will have a fixed height or be part of a flexbox.
      const containerHeight = container.offsetHeight;
      const fitsHeight = containerHeight <= 0 || content.offsetHeight <= containerHeight;

      if (fitsWidth && fitsHeight) {
        low = mid;
      } else {
        high = mid;
      }

      if (Math.abs(high - low) < 0.1) break;
    }

    content.style.fontSize = `${low}px`;
  };

  const updateAll = async () => {
    // Ensure fonts are loaded so measurements are accurate
    if (typeof document !== 'undefined' && 'fonts' in document) {
      await (document as any).fonts.ready;
    }
    
    elements.forEach(el => updateElement(el as HTMLElement));
  };

  // Initial update
  updateAll();

  // Handle resizing
  const observer = new ResizeObserver(() => {
    requestAnimationFrame(updateAll);
  });

  elements.forEach(el => observer.observe(el));
}
