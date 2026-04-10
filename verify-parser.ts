import { parse } from './packages/parser/src/core.ts'
import fs from 'node:fs'

const markdown = `---
title: Slide 1
---
# Slide 1 Content

---
# Slide 2 Content
\`\`\`markdown
---
Inside code block
---
\`\`\`

---
# Slide 3 Content
`

const parsed = parse(markdown, 'test.md')
console.log('Slide count:', parsed.slides.length)
parsed.slides.forEach((slide, i) => {
  console.log(`Slide ${i + 1} content contains 'Inside code block':`, slide.contentRaw.includes('Inside code block'))
  console.log(`Slide ${i + 1} raw:\n${slide.raw}\n---`)
})

if (parsed.slides.length === 3) {
  console.log('SUCCESS: Parser correctly split 3 slides')
} else {
  console.log('FAILURE: Parser failed to split slides correctly. Found', parsed.slides.length)
}
