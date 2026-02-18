/**
 * Tarjan's algorithm for strongly connected components.
 * Returns SCCs; each SCC of size > 1 is a cycle (SCC of size 1 with self-loop also).
 */

export function findSCCs(
  nodeIds: string[],
  getOutNeighbors: (id: string) => string[]
): string[][] {
  const indexMap = new Map<string, number>();
  nodeIds.forEach((id, i) => indexMap.set(id, i));
  const n = nodeIds.length;
  const low = new Array(n).fill(-1);
  const index = new Array(n).fill(-1);
  const onStack = new Array(n).fill(false);
  const stack: number[] = [];
  const sccs: string[][] = [];
  let nextIndex = 0;

  function strongConnect(v: number): void {
    index[v] = nextIndex;
    low[v] = nextIndex;
    nextIndex++;
    stack.push(v);
    onStack[v] = true;
    const id = nodeIds[v]!;
    for (const wId of getOutNeighbors(id)) {
      const w = indexMap.get(wId);
      if (w === undefined) continue;
      if (index[w] === -1) {
        strongConnect(w);
        low[v] = Math.min(low[v]!, low[w]!);
      } else if (onStack[w]) {
        low[v] = Math.min(low[v]!, index[w]!);
      }
    }
    if (low[v] === index[v]) {
      const comp: string[] = [];
      let w: number;
      do {
        w = stack.pop()!;
        onStack[w] = false;
        comp.push(nodeIds[w]!);
      } while (w !== v);
      sccs.push(comp);
    }
  }

  for (let i = 0; i < n; i++) {
    if (index[i] === -1) strongConnect(i);
  }
  return sccs;
}

/**
 * Extract cycles from SCCs: SCCs with more than one node, or one node with self-loop.
 */
export function sccsToCycles(
  sccs: string[][],
  getOutNeighbors: (id: string) => string[]
): string[][] {
  const cycles: string[][] = [];
  for (const scc of sccs) {
    if (scc.length > 1) {
      cycles.push(scc);
    } else if (scc.length === 1) {
      const id = scc[0]!;
      if (getOutNeighbors(id).includes(id)) cycles.push(scc);
    }
  }
  return cycles;
}
