import { createDrauu } from 'drauu'
import { $drawings } from '@slidastro/client'

let drauu: any
let currentSlideIndex = -1

export function initDrauu(slideIndex: number) {
  const svg = document.querySelector('#drauu-layer') as SVGElement
  if (!svg) return

  currentSlideIndex = slideIndex

  if (!drauu) {
    drauu = createDrauu({
      el: svg,
      brush: {
        color: '#ff0000',
        size: 3,
      },
    })

    drauu.on('end', () => {
      const svgContent = drauu.dump()
      $drawings.setKey(currentSlideIndex, svgContent)
      localStorage.setItem(`slidastro-drauu-${currentSlideIndex}`, svgContent)
    })

    // Keyboard shortcuts for tools
    window.addEventListener('keydown', (e) => {
      if (e.key === 'd') {
        toggleDrauu()
      }
      if (drauu && document.body.classList.contains('drauu-active')) {
        if (e.key === 'e') drauu.mode = 'erase'
        if (e.key === 'p') drauu.mode = 'draw'
        if (e.key === 'c') {
          drauu.clear()
          $drawings.setKey(currentSlideIndex, '')
          localStorage.removeItem(`slidastro-drauu-${currentSlideIndex}`)
        }
      }
    })

    // Listen for changes from Nano Store (sync)
    $drawings.listen((value) => {
      if (value[currentSlideIndex] !== undefined && value[currentSlideIndex] !== drauu.dump()) {
        drauu.load(value[currentSlideIndex])
      }
    })
  }

  loadDrauu()
}

function toggleDrauu() {
  const active = document.body.classList.toggle('drauu-active')
  if (drauu) {
    // @ts-ignore
    drauu.options.el.style.pointerEvents = active ? 'auto' : 'none'
  }
}

function loadDrauu() {
  if (!drauu) return
  const savedLocal = localStorage.getItem(`slidastro-drauu-${currentSlideIndex}`)
  const savedStore = $drawings.get()[currentSlideIndex]
  
  drauu.clear()
  if (savedLocal) {
    drauu.load(savedLocal)
    if (!savedStore) {
      $drawings.setKey(currentSlideIndex, savedLocal)
    }
  } else if (savedStore) {
    drauu.load(savedStore)
  }
}

export function setDrauuMode(mode: 'draw' | 'erase' | 'stylus') {
  if (drauu) drauu.mode = mode
}

export function clearDrauu() {
  if (drauu) {
    drauu.clear()
    $drawings.setKey(currentSlideIndex, '')
    localStorage.removeItem(`slidastro-drauu-${currentSlideIndex}`)
  }
}
