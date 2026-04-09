import { describe, it, expect } from 'vitest'
import { parse } from '../src/core'

describe('parser', () => {
  it('should split slides by ---', () => {
    const md = 'Slide 1\n---\nSlide 2'
    const data = parse(md, 'test.md')
    expect(data.slides).toHaveLength(2)
    expect(data.slides[0].content.trim()).toBe('Slide 1')
    expect(data.slides[1].content.trim()).toBe('Slide 2')
  })

  it('should ignore --- inside code blocks', () => {
    const md = 'Slide 1\n```\n---\n```\nSlide 2'
    const data = parse(md, 'test.md')
    expect(data.slides).toHaveLength(1)
  })

  it('should extract frontmatter', () => {
    const md = '---\ntitle: Hello\n---\n# Slide'
    const data = parse(md, 'test.md')
    expect(data.slides[0].frontmatter.title).toBe('Hello')
    expect(data.slides[0].content.trim()).toBe('# Slide')
  })

  it('should extract speaker notes', () => {
    const md = '# Slide\n\n<!-- note -->\nThis is a note\n<!-- end note -->'
    const data = parse(md, 'test.md')
    expect(data.slides[0].note?.trim()).toBe('This is a note')
  })

  it('should handle single slide deck', () => {
    const md = '# Only one slide'
    const data = parse(md, 'test.md')
    expect(data.slides).toHaveLength(1)
    expect(data.slides[0].content.trim()).toBe('# Only one slide')
  })
})
