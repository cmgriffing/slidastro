import { annotate } from 'rough-notation'
import { $clicks } from '@slidastro/client'

export function initSMark() {
  const marks = document.querySelectorAll('.slidastro-mark')
  
  marks.forEach((el) => {
    const element = el as HTMLElement
    // Only initialize once
    if ((element as any)._slidastro_annotated) return;
    (element as any)._slidastro_annotated = true;

    const type = (element.dataset.type as any) || 'highlight'
    const color = element.dataset.color
    const strokeWidth = element.dataset.strokeWidth ? Number(element.dataset.strokeWidth) : undefined
    const duration = element.dataset.duration ? Number(element.dataset.duration) : undefined
    const at = element.dataset.at ? Number(element.dataset.at) : undefined

    const annotation = annotate(element, {
      type,
      color,
      strokeWidth,
      animationDuration: duration,
    })

    if (at === undefined) {
      // Show immediately if no click requirement
      annotation.show()
    } else {
      // Sync with clicks
      $clicks.listen((click) => {
        if (click >= at) {
          annotation.show()
        } else {
          annotation.hide()
        }
      })
      
      // Initial state
      if ($clicks.get() >= at) {
        annotation.show()
      }
    }
  })
}
