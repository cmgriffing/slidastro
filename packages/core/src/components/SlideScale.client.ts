export function initSlideScale(canvasWidth: number, canvasHeight: number) {
  const container = document.querySelector('.slide-container') as HTMLElement;
  const content = document.querySelector('#slide-content-wrapper') as HTMLElement;

  if (!container || !content) return;

  function update() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    if (width <= 0 || height <= 0) return;

    const scale = Math.min(width / canvasWidth, height / canvasHeight);
    
    content.style.transform = `scale(${scale})`;
    
    const left = (width - canvasWidth * scale) / 2;
    const top = (height - canvasHeight * scale) / 2;
    
    container.style.position = 'absolute';
    container.style.left = `${left}px`;
    container.style.top = `${top}px`;
  }

  window.addEventListener('resize', () => requestAnimationFrame(update));
  update();
  
  // Also run on a small delay to ensure everything is rendered
  setTimeout(update, 0);
}
