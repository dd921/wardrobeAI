/**
 * Union-Find (Disjoint Set Union) data structure for efficient grouping
 * Used for clustering similar images with O(α(n)) amortized operations
 */
export class UnionFind {
  private parent: Map<string, string>;
  private rank: Map<string, number>;

  constructor() {
    this.parent = new Map();
    this.rank = new Map();
  }

  /**
   * Add an element to the set (creates its own set)
   */
  makeSet(x: string): void {
    if (!this.parent.has(x)) {
      this.parent.set(x, x);
      this.rank.set(x, 0);
    }
  }

  /**
   * Find the representative (root) of the set containing x
   * Uses path compression for efficiency (iterative to avoid stack overflow)
   */
  find(x: string): string {
    if (!this.parent.has(x)) {
      this.makeSet(x);
    }

    // Find root iteratively
    let root = x;
    while (this.parent.get(root) !== root) {
      root = this.parent.get(root)!;
    }

    // Path compression: point all nodes directly to root
    let current = x;
    while (this.parent.get(current) !== root) {
      const next = this.parent.get(current)!;
      this.parent.set(current, root);
      current = next;
    }

    return root;
  }

  /**
   * Union two sets by rank (union by rank optimization)
   * Returns true if a merge happened, false if already in same set
   */
  union(x: string, y: string): boolean {
    const rootX = this.find(x);
    const rootY = this.find(y);

    if (rootX === rootY) {
      return false; // Already in the same set
    }

    const rankX = this.rank.get(rootX) || 0;
    const rankY = this.rank.get(rootY) || 0;

    // Union by rank: attach smaller tree under larger tree
    if (rankX < rankY) {
      this.parent.set(rootX, rootY);
    } else if (rankX > rankY) {
      this.parent.set(rootY, rootX);
    } else {
      this.parent.set(rootY, rootX);
      this.rank.set(rootX, rankX + 1);
    }

    return true;
  }

  /**
   * Check if two elements are in the same set
   */
  connected(x: string, y: string): boolean {
    return this.find(x) === this.find(y);
  }

  /**
   * Get all distinct groups as arrays of element IDs
   */
  getGroups(): Map<string, string[]> {
    const groups = new Map<string, string[]>();
    const elements = Array.from(this.parent.keys());

    for (const element of elements) {
      const root = this.find(element);
      if (!groups.has(root)) {
        groups.set(root, []);
      }
      groups.get(root)!.push(element);
    }

    return groups;
  }

  /**
   * Get the number of distinct groups
   */
  getGroupCount(): number {
    const roots = new Set<string>();
    const elements = Array.from(this.parent.keys());
    for (const element of elements) {
      roots.add(this.find(element));
    }
    return roots.size;
  }
}
