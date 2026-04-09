import { parse as parseYaml } from 'yaml'
import type { SlidastroMarkdown, SourceSlideInfo } from '@slidastro/types'

export function parse(markdown: string, filepath: string): SlidastroMarkdown {
  const lines = markdown.split(/\r?\n/)
  const slides: SourceSlideInfo[] = []

  let start = 0

  function pushSlide(end: number) {
    if (start >= end && slides.length > 0) return
    const raw = lines.slice(start, end).join('\n')
    const slide = parseSlide(raw, filepath, slides.length)
    slide.start = start
    slide.contentStart += start
    slide.end = end
    slides.push(slide)
    start = end + 1
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trimEnd()
    
    // Frontmatter check
    if (line === '---' && (i === 0 || start === i)) {
      // Find end of frontmatter
      let j = i + 1
      for (; j < lines.length; j++) {
        if (lines[j].trimEnd() === '---') {
          break
        }
      }
      // If we found the end, we skip to it and continue searching for the next slide separator
      if (j < lines.length) {
        i = j
      }
      continue
    }

    // Slide separator check
    if (line === '---') {
      pushSlide(i)
    }
    // Skip code blocks
    else if (line.trimStart().startsWith('```')) {
      const fence = line.match(/^\s*`+/)![0]
      i++
      for (; i < lines.length; i++) {
        if (lines[i].trimStart().startsWith(fence)) {
          break
        }
      }
    }
  }

  pushSlide(lines.length)

  return {
    filepath,
    raw: markdown,
    slides
  }
}

function parseSlide(raw: string, filepath: string, index: number): SourceSlideInfo {
  let frontmatter: Record<string, any> = {}
  let content = raw
  let note: string | undefined
  let frontmatterRaw = ''

  // Extract frontmatter
  let contentStart = 0
  if (raw.trimStart().startsWith('---')) {
    const lines = raw.split(/\r?\n/)
    const startIdx = lines.findIndex(l => l.trimEnd() === '---')
    const endIdx = lines.slice(startIdx + 1).findIndex(l => l.trimEnd() === '---')
    
    if (endIdx !== -1) {
      frontmatterRaw = lines.slice(startIdx + 1, startIdx + 1 + endIdx).join('\n')
      try {
        frontmatter = parseYaml(frontmatterRaw) || {}
      } catch (e) {
        console.error('Failed to parse frontmatter', e)
      }
      contentStart = startIdx + 1 + endIdx + 1
      content = lines.slice(contentStart).join('\n')
    }
  }

  // Extract notes (HTML comments)
  // Simplified: look for <!-- note --> ... <!-- end note -->
  const noteMatch = content.match(/<!--\s*note\s*-->([\s\S]*)<!--\s*end\s*note\s*-->/)
  if (noteMatch) {
    note = noteMatch[1].trim()
    content = content.replace(noteMatch[0], '').trim()
  } else {
    // Also support <!-- ... --> at the end of slide as notes
    const endNoteMatch = content.match(/<!--([\s\S]*?)-->\s*$/)
    if (endNoteMatch) {
      note = endNoteMatch[1].trim()
      content = content.replace(endNoteMatch[0], '').trim()
    }
  }

  return {
    filepath,
    index,
    start: 0,
    contentStart,
    end: 0,
    raw,
    contentRaw: content,
    content: content.trim(),
    frontmatter,
    frontmatterRaw,
    note
  }
}
