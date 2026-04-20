import MagicString from 'magic-string';

/**
 * Splits a markdown-like file (standard MD, Astro, or MDX) into individual slides.
 */
export function splitSlides(content: string, isAstro: boolean, isMdx: boolean) {
  const lines = content.split('\n');
  const slides: string[] = [];
  let current: string[] = [];
  let firstLogicBlock = '';
  let frontmatterCount = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    
    if (trimmed === '---') {
      if (frontmatterCount < 2) {
        frontmatterCount++;
        current.push(line);
        if (frontmatterCount === 2) {
          firstLogicBlock = current.join('\n');
        }
        continue;
      }
      
      // This is a separator
      slides.push(current.join('\n'));
      current = [];
      if ((isAstro || isMdx) && firstLogicBlock) {
        current.push(firstLogicBlock);
      }
    } else {
      current.push(line);
    }
  }
  if (current.length > 0) {
    slides.push(current.join('\n'));
  }
  return slides;
}

/**
 * Returns the line index where each slide starts.
 */
export function getSlideStartIndices(content: string) {
  const lines = content.split('\n');
  const indices: number[] = [0];
  let frontmatterCount = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line === '---') {
      if (frontmatterCount < 2) {
        frontmatterCount++;
        continue;
      }
      indices.push(i);
    }
  }
  return indices;
}

/**
 * Surgically updates the x and y attributes of the dragId-th <s-drag> tag in the slideIndex-th slide.
 */
export function updateDragPosition(content: string, slideIndex: number, dragId: number, x: number, y: number): string {
  const ms = new MagicString(content);
  
  // 1. Find the slide boundaries in the original content
  const lines = content.split('\n');
  let currentSlide = 0;
  let slideStartOffset = 0;
  let slideEndOffset = content.length;
  let frontmatterCount = 0;
  let currentOffset = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    
    if (trimmed === '---') {
      if (frontmatterCount < 2) {
        frontmatterCount++;
      } else {
        // Separator
        if (currentSlide === slideIndex) {
            slideEndOffset = currentOffset;
            break;
        }
        currentSlide++;
        if (currentSlide === slideIndex) {
            slideStartOffset = currentOffset + line.length + 1; // +1 for \n
        }
      }
    }
    currentOffset += line.length + 1;
  }
  
  // Edge case for last slide
  if (currentSlide === slideIndex && slideEndOffset === content.length) {
      // already set
  } else if (currentSlide < slideIndex) {
      return content;
  }

  const slideContent = content.substring(slideStartOffset, slideEndOffset);
  
  // 2. Find the dragId-th <s-drag> tag within this slide
  // We match <s-drag ...> including multi-line
  const dragRegex = /<s-drag\b([^>]*?)>/g;
  let match;
  let count = 0;
  
  while ((match = dragRegex.exec(slideContent)) !== null) {
    if (count === dragId) {
      // Found it!
      const tagContent = match[0];
      let attrContent = match[1];
      const tagStart = slideStartOffset + match.index;
      const tagEnd = tagStart + tagContent.length;
      
      // Update x
      if (attrContent.match(/\s:?x="[^"]*"/)) {
        attrContent = attrContent.replace(/(\s:?x=")[^"]*(")/, `$1${x}$2`);
      } else if (attrContent.match(/\s:?x=[^ ]+/)) {
        attrContent = attrContent.replace(/(\s:?x=)[^ ]+/, `$1"${x}"`);
      } else {
        attrContent += ` x="${x}"`;
      }
      
      // Update y
      if (attrContent.match(/\s:?y="[^"]*"/)) {
        attrContent = attrContent.replace(/(\s:?y=")[^"]*(")/, `$1${y}$2`);
      } else if (attrContent.match(/\s:?y=[^ ]+/)) {
        attrContent = attrContent.replace(/(\s:?y=)[^ ]+/, `$1"${y}"`);
      } else {
        attrContent += ` y="${y}"`;
      }
      
      ms.overwrite(tagStart, tagEnd, `<s-drag${attrContent}>`);
      return ms.toString();
    }
    count++;
  }

  return content;
}
