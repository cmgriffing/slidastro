import { useDraggable } from '@vueuse/core'

/**
 * Initialize draggable elements on the slide.
 * Elements with class .slidastro-drag will be made draggable.
 */
export function initSDrag() {
  const elements = document.querySelectorAll<HTMLElement>('.slidastro-drag')
  
  elements.forEach((el) => {
    // Avoid double initialization
    if (el.dataset.draggableInitialized === 'true') return
    el.dataset.draggableInitialized = 'true'

    const initialX = parseFloat(el.dataset.x || '0')
    const initialY = parseFloat(el.dataset.y || '0')

    // Initialize draggable behavior
    // We use onMove to update the element's style manually
    useDraggable(el, {
      initialValue: { x: initialX, y: initialY },
      onMove: (pos) => {
        el.style.left = `${pos.x}px`
        el.style.top = `${pos.y}px`
        
        // Update data attributes to keep them in sync
        el.dataset.x = String(pos.x)
        el.dataset.y = String(pos.y)
      },
      preventDefault: true,
    })
  })
}
