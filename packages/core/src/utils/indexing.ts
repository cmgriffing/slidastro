/**
 * Utility to handle click indexing for s-click and s-after directives.
 * Maintains state during a single slide's transformation.
 */
export class ClickIndexer {
  private lastResolvedIndex = 0;

  /**
   * Resolves a directive and optional value into a click index.
   * 
   * @param directive The directive name ('s-click', 's-after', etc.)
   * @param value Optional value (e.g., "3" in s-click="3")
   * @returns The resolved index
   */
  resolve(directive: string, value?: string): number {
    // Absolute indexing: s-click="3"
    if (value && !isNaN(parseInt(value))) {
      this.lastResolvedIndex = parseInt(value);
      return this.lastResolvedIndex;
    }

    // Relative After: s-after (stays at last index)
    if (directive === 's-after') {
      return this.lastResolvedIndex;
    }

    // Relative Default: s-click (increments last index)
    return ++this.lastResolvedIndex;
  }

  /**
   * Resets the indexer for a new slide.
   */
  reset() {
    this.lastResolvedIndex = 0;
  }
}
