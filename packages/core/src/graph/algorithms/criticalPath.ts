/**
 * Critical path: longest path in graph; dependency depth (max depth of upstream callers).
 */

import type { GraphNode } from '@apiwatch/shared';

export function getDependencyDepth(
  apiId: string,
  getInNeighbors: (id: string) => string[]
): number {
  const visited = new Set<string>();
  let maxDepth = 0;
  const queue: Array<{ id: string; depth: number }> = [{ id: apiId, depth: 0 }];
  visited.add(apiId);
  while (queue.length > 0) {
    const { id, depth } = queue.shift()!;
    maxDepth = Math.max(maxDepth, depth);
    for (const n of getInNeighbors(id)) {
      if (!visited.has(n)) {
        visited.add(n);
        queue.push({ id: n, depth: depth + 1 });
      }
    }
  }
  return maxDepth;
}

/**
 * Critical path: chain of highest-centrality nodes. Returns ordered list of node IDs (longest path by centrality).
 */
export function getCriticalPath(
  nodes: GraphNode[],
  getOutNeighbors: (id: string) => string[]
): string[] {
  if (nodes.length === 0) return [];
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const sorted = [...nodes].sort((a, b) => b.centralityScore - a.centralityScore);
  const path: string[] = [];
  const used = new Set<string>();
  for (const start of sorted) {
    if (used.has(start.id)) continue;
    const chain: string[] = [];
    const dfs = (id: string): void => {
      if (used.has(id)) return;
      chain.push(id);
      used.add(id);
      const out = getOutNeighbors(id).filter((x) => byId.has(x) && !used.has(x));
      const next = out.map((x) => byId.get(x)!).sort((a, b) => b.centralityScore - a.centralityScore)[0];
      if (next) dfs(next.id);
    };
    dfs(start.id);
    if (chain.length > path.length) {
      path.length = 0;
      path.push(...chain);
    }
  }
  return path;
}
