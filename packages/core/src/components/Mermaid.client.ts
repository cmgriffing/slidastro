import mermaid from 'mermaid/dist/mermaid.esm.mjs'

let initialized = false

async function renderDiagram(el: HTMLElement, isDark: boolean) {
  let src = el.getAttribute('data-mermaid-src')
  if (!src) {
    src = el.innerText.trim()
    if (!src) return // Don't render empty nodes
    el.setAttribute('data-mermaid-src', src)
  }

  const id = `mermaid-${Math.random().toString(36).slice(2, 11)}`
  try {
    mermaid.initialize({
      startOnLoad: false,
      theme: isDark ? 'dark' : 'default',
    })
    const { svg } = await mermaid.render(id, src)
    el.innerHTML = svg
    el.removeAttribute('data-processed')
  } catch (e) {
    console.error('Mermaid render error:', e)
    // If it fails, don't leave it empty or with garbled text if possible
  }
}

export async function initMermaid() {
  try {
    const isDark = document.documentElement.classList.contains('dark')
    const els = document.querySelectorAll('.mermaid')
    
    if (els.length > 0) {
      if (!initialized) {
        initialized = true

        // Handle theme changes
        const observer = new MutationObserver(async (mutations) => {
          for (const mutation of mutations) {
            if (mutation.attributeName === 'class') {
              const currentDark = document.documentElement.classList.contains('dark')
              const diagrams = document.querySelectorAll('.mermaid')
              for (const el of Array.from(diagrams)) {
                await renderDiagram(el as HTMLElement, currentDark)
              }
            }
          }
        })
        observer.observe(document.documentElement, { attributes: true })
      }

      // Small delay to ensure innerText is available and not yet processed by mermaid's internal observer if any
      setTimeout(async () => {
        for (const el of Array.from(els)) {
          await renderDiagram(el as HTMLElement, isDark)
        }
      }, 50)

      // Handle s-click or other dynamic additions
      const contentObserver = new MutationObserver(async (mutations) => {
        for (const mutation of mutations) {
          for (const node of mutation.addedNodes) {
            if (node instanceof HTMLElement) {
              const currentDark = document.documentElement.classList.contains('dark')
              const diagrams = node.querySelectorAll('.mermaid')
              for (const el of Array.from(diagrams)) {
                await renderDiagram(el as HTMLElement, currentDark)
              }
              if (node.classList.contains('mermaid')) {
                await renderDiagram(node, currentDark)
              }
            }
          }
        }
      })

      const slideContent = document.getElementById('slide-content')
      if (slideContent) {
        contentObserver.observe(slideContent, { childList: true, subtree: true })
      }
    }
  } catch (e) {
    console.error('Mermaid init error:', e)
  }
}
