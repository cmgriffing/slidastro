import { parse as parseYaml } from 'yaml'
import type { SlidastroMarkdown, SourceSlideInfo } from '@slidastro/types'

export function parse(markdown: string, filepath: string): SlidastroMarkdown {
  const lines = markdown.split(/\r?\n/)
  const slides: SourceSlideInfo[] = []

  let currentLines: string[] = []
  let startLine = 0
  let inCodeBlock = false

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const trimmed = line.trimEnd()

    if (trimmed.startsWith('```')) {
      inCodeBlock = !inCodeBlock
    }

    if (!inCodeBlock && trimmed === '---') {
      // Is this a separator or frontmatter?
      // A separator is --- that is NOT part of a frontmatter block.
      // A frontmatter block starts at the beginning of a slide.
      
      const isStartOfSlide = currentLines.length === 0 || (currentLines.length === 1 && currentLines[0].trimEnd() === '')
      
      if (i === 0 || isStartOfSlide) {
        // This is the START of frontmatter for the current slide
        currentLines.push(line)
        // Find the end of this frontmatter to avoid treating it as a separator
        let j = i + 1
        for (; j < lines.length; j++) {
          currentLines.push(lines[j])
          if (lines[j].trimEnd() === '---') {
            break
          }
        }
        i = j
      } else {
        // This is a separator
        pushSlide(currentLines, startLine, i)
        currentLines = []
        
        // Check if the next slide starts with frontmatter
        // The current line (i) is the potential start '---'
        let j = i + 1
        let hasFrontmatter = false
        for (; j < lines.length; j++) {
          const nextLine = lines[j]
          const trimmedNext = nextLine.trimEnd()
          if (trimmedNext === '---') {
            hasFrontmatter = true
            break
          }
          // Simple heuristic: frontmatter lines usually contain ':' or are empty or part of a list
          if (trimmedNext !== '' && !trimmedNext.includes(':') && !trimmedNext.trim().startsWith('-')) {
            break
          }
        }

        if (hasFrontmatter) {
          // Treat this '---' as the start of the next slide's frontmatter
          currentLines.push(line)
          for (let k = i + 1; k <= j; k++) {
            currentLines.push(lines[k])
          }
          startLine = i
          i = j
        } else {
          // Just a separator, next slide starts after it
          startLine = i + 1
        }
      }
    } else {
      currentLines.push(line)
    }
  }

  pushSlide(currentLines, startLine, lines.length)

  return {
    filepath,
    raw: markdown,
    slides
  }

  function pushSlide(slideLines: string[], start: number, end: number) {
    const raw = slideLines.join('\n')
    if (!raw.trim() && slides.length > 0) return
    
    const slide = parseSlide(raw, filepath, slides.length)
    slide.start = start
    slide.end = end
    slides.push(slide)
  }
}

function parseSlide(raw: string, filepath: string, index: number): SourceSlideInfo {
  let frontmatter: Record<string, any> = {}
  let content = raw
  let note: string | undefined
  let frontmatterRaw = ''
  let contentStart = 0

  const lines = raw.split(/\r?\n/)
  
  if (lines[0]?.trimEnd() === '---') {
    let endIdx = -1
    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trimEnd() === '---') {
        endIdx = i
        break
      }
    }

    if (endIdx !== -1) {
      frontmatterRaw = lines.slice(1, endIdx).join('\n')
      try {
        frontmatter = parseYaml(frontmatterRaw) || {}
      } catch (e) {
        // ignore
      }
      contentStart = endIdx + 1
      content = lines.slice(contentStart).join('\n')
    }
  }

  // Extract notes
  const noteMatch = content.match(/<!--\s*note\s*-->([\s\S]*)<!--\s*end\s*note\s*-->/)
  if (noteMatch) {
    note = noteMatch[1].trim()
    content = content.replace(noteMatch[0], '').trim()
  } else {
    const endNoteMatch = content.match(/<!--([\s\S]*?)-->\s*$/)
    if (endNoteMatch) {
      note = endNoteMatch[1].trim()
      content = content.replace(endNoteMatch[0], '').trim()
    }
  }

  // Extract title from frontmatter or first heading
  let title = frontmatter.title
  if (!title) {
    const headingMatch = content.match(/^#+\s+(.*)$/m)
    if (headingMatch) {
      title = headingMatch[1].trim()
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
    note,
    title
  }
}
