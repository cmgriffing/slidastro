export function checkVisibility(range: string, currentClick: number): boolean {
  if (range.includes('-')) {
    const [start, end] = range.split('-').map(Number);
    return currentClick >= start && currentClick <= end;
  }
  if (range.endsWith('+')) {
    const start = parseInt(range, 10);
    return currentClick >= start;
  }
  const start = parseInt(range, 10);
  return currentClick >= start;
}

export function getMaxClick(range: string): number {
  if (range.includes('-')) {
    const [, end] = range.split('-').map(Number);
    return isNaN(end) ? parseInt(range, 10) : end;
  }
  return parseInt(range, 10);
}
