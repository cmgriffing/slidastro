export function initSlideScale(canvasWidth: number, canvasHeight: number) {
  const container = document.querySelector('.slide-container') as HTMLElement;

  if (!container) return;

  function update() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    if (width <= 0 || height <= 0) return;

    const scale = Math.min(width / canvasWidth, height / canvasHeight);
    
    container.style.transform = `scale(${scale})`;
  }

  window.addEventListener('resize', () => requestAnimationFrame(update));
  update();
  
  // Also run on a small delay to ensure everything is rendered
  setTimeout(update, 10);
}
