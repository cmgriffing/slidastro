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
