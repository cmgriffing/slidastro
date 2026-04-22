import { useDraggable } from '@vueuse/core'

/**
 * Initialize draggable elements on the slide.
 * Elements with class .slidastro-drag will be made draggable.
 */
export function initSDrag() {
  const elements = document.querySelectorAll<HTMLElement>('.slidastro-drag')
  console.log(`[slidastro] Found ${elements.length} draggable elements`)

  // Global relay for manual updates (e.g. from tests)
  if (!(window as any)._slidastroDragRelayInitialized) {
    (window as any)._slidastroDragRelayInitialized = true;
    window.addEventListener('slidastro:manual-pos', (e: any) => {
      if (import.meta.hot) {
        import.meta.hot.send('slidastro:update-pos', e.detail);
      }
    });
  }
  
  elements.forEach((el) => {
    // Avoid double initialization
    if (el.dataset.draggableInitialized === 'true') return
    el.dataset.draggableInitialized = 'true'
    console.log(`[slidastro] Initializing draggable:`, el.dataset.dragId)

    const initialX = parseFloat(el.dataset.x || '0')
    const initialY = parseFloat(el.dataset.y || '0')
    
    const slideWrapper = el.closest('.content-wrapper') as HTMLElement
    if (!slideWrapper) return

    const slideIndex = parseInt(slideWrapper.dataset.index || '0', 10)
    const filepath = slideWrapper.dataset.filepath || ''
    const dragId = parseInt(el.dataset.dragId || '0', 10)

    // Visual polish
    el.style.cursor = 'grab'
    el.style.userSelect = 'none'

    let startMouseX = 0
    let startMouseY = 0
    let startX = initialX
    let startY = initialY

    const getScale = () => {
      const container = document.querySelector('.slide-container') as HTMLElement;
      if (!container) return 1;
      const transform = window.getComputedStyle(container).transform;
      if (transform && transform !== 'none') {
        const matrix = transform.match(/^matrix\((.+)\)$/);
        if (matrix) {
          const values = matrix[1].split(', ')
          return Math.sqrt(parseFloat(values[0]) * parseFloat(values[0]) + parseFloat(values[1]) * parseFloat(values[1]))
        }
      }
      return 1;
    }

    // Initialize draggable behavior
    useDraggable(el, {
      initialValue: { x: initialX, y: initialY },
      onStart: (_, event) => {
        const e = event as any;
        const clientX = e.clientX ?? (e.touches?.[0]?.clientX);
        const clientY = e.clientY ?? (e.touches?.[0]?.clientY);
        
        if (clientX === undefined || clientY === undefined) {
          console.warn('[slidastro] Drag start without coordinates', event)
          return
        }

        startMouseX = clientX
        startMouseY = clientY
        startX = parseFloat(el.dataset.x || '0')
        startY = parseFloat(el.dataset.y || '0')
        el.style.cursor = 'grabbing'
        el.style.opacity = '0.8'
        el.style.zIndex = '1000'
      },
      onMove: (_, event) => {
        const e = event as any;
        const clientX = e.clientX ?? (e.touches?.[0]?.clientX);
        const clientY = e.clientY ?? (e.touches?.[0]?.clientY);

        if (clientX === undefined || clientY === undefined) return

        const scale = getScale()
        const dx = (clientX - startMouseX) / scale
        const dy = (clientY - startMouseY) / scale
        
        const newX = Math.round(startX + dx)
        const newY = Math.round(startY + dy)
        console.log(`[slidastro] Drag move: dx=${dx}, dy=${dy}, newX=${newX}, newY=${newY}`)
        
        el.style.left = `${newX}px`
        el.style.top = `${newY}px`
        
        // Update data attributes to keep them in sync
        el.dataset.x = String(newX)
        el.dataset.y = String(newY)
      },
      onEnd: () => {
        el.style.cursor = 'grab'
        el.style.opacity = ''
        el.style.zIndex = ''
        
        const x = parseInt(el.dataset.x || '0', 10)
        const y = parseInt(el.dataset.y || '0', 10)

        // Only persist in development mode
        if (import.meta.hot) {
          console.log(`[slidastro] Persisting position: ${x}, ${y} for dragId ${dragId}`)
          import.meta.hot.send('slidastro:update-pos', {
            filepath,
            slideIndex,
            dragId,
            x,
            y
          })
        }
      },
    })
  })
}
