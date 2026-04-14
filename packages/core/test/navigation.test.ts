import { describe, it, expect } from 'vitest';
import { checkVisibility, getMaxClick } from '../src/utils/clicks';

describe('navigation logic', () => {
  describe('checkVisibility', () => {
    it('handles single number', () => {
      expect(checkVisibility('1', 0)).toBe(false);
      expect(checkVisibility('1', 1)).toBe(true);
      expect(checkVisibility('1', 2)).toBe(true);
    });

    it('handles ranges', () => {
      expect(checkVisibility('1-3', 0)).toBe(false);
      expect(checkVisibility('1-3', 1)).toBe(true);
      expect(checkVisibility('1-3', 2)).toBe(true);
      expect(checkVisibility('1-3', 3)).toBe(true);
      expect(checkVisibility('1-3', 4)).toBe(false);
    });

    it('handles open ranges with +', () => {
      expect(checkVisibility('2+', 1)).toBe(false);
      expect(checkVisibility('2+', 2)).toBe(true);
      expect(checkVisibility('2+', 10)).toBe(true);
    });
  });

  describe('getMaxClick', () => {
    it('handles single number', () => {
      expect(getMaxClick('3')).toBe(3);
    });

    it('handles ranges', () => {
      expect(getMaxClick('1-5')).toBe(5);
    });

    it('handles open ranges (though we might not need this)', () => {
      // Current implementation returns NaN or something for open ranges
      // Wait, getMaxClick doesn't handle '+' currently
      // Let's see it again:
      /*
      export function getMaxClick(range: string): number {
        if (range.includes('-')) {
          const [, end] = range.split('-').map(Number);
          return isNaN(end) ? parseInt(range, 10) : end;
        }
        return parseInt(range, 10);
      }
      */
      expect(getMaxClick('2+')).toBe(2); // parseInt('2+') is 2
    });
  });
});
