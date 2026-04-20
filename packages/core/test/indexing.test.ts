import { describe, it, expect, beforeEach } from 'vitest';
import { ClickIndexer } from '../src/utils/indexing';

describe('ClickIndexer', () => {
  let indexer: ClickIndexer;

  beforeEach(() => {
    indexer = new ClickIndexer();
  });

  it('should start at 0 and increment on s-click', () => {
    expect(indexer.resolve('s-click')).toBe(1);
    expect(indexer.resolve('s-click')).toBe(2);
    expect(indexer.resolve('s-click')).toBe(3);
  });

  it('should support absolute indexing with s-click="3"', () => {
    expect(indexer.resolve('s-click')).toBe(1);
    expect(indexer.resolve('s-click', '5')).toBe(5);
    expect(indexer.resolve('s-click')).toBe(6);
  });

  it('should support s-after by returning the last resolved index', () => {
    expect(indexer.resolve('s-click')).toBe(1);
    expect(indexer.resolve('s-click')).toBe(2);
    expect(indexer.resolve('s-after')).toBe(2);
    expect(indexer.resolve('s-after')).toBe(2);
    expect(indexer.resolve('s-click')).toBe(3);
  });

  it('should reset properly', () => {
    expect(indexer.resolve('s-click')).toBe(1);
    indexer.reset();
    expect(indexer.resolve('s-click')).toBe(1);
  });

  it('should handle multiple s-after after absolute index', () => {
    expect(indexer.resolve('s-click', '10')).toBe(10);
    expect(indexer.resolve('s-after')).toBe(10);
    expect(indexer.resolve('s-after')).toBe(10);
    expect(indexer.resolve('s-click')).toBe(11);
  });
});
