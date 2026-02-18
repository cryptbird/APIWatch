/**
 * Centrality: in-degree, out-degree, weighted score (inDegree + 0.5*transitiveIn + callFrequency).
 */

import type { GraphNode, GraphEdge } from '@apiwatch/shared';

export interface GraphInput {
  nodes: GraphNode[];
  edges: GraphEdge[];
  getOutNeighbors: (id: string) => string[];
  getInNeighbors: (id: string) => string[];
}

function transitiveInDegree(id: string, getIn: (id: string) => string[], depth: number): number {
  if (depth <= 0) return 0;
  const inSet = getIn(id);
  let count = inSet.length;
  for (const n of inSet) {
    count += transitiveInDegree(n, getIn, depth - 1);
  }
  return count;
}

/**
 * Compute centrality score per node and return nodes with updated inDegree, outDegree, centralityScore.
 */
export function computeCentrality(input: GraphInput): GraphNode[] {
  const { nodes, edges, getOutNeighbors, getInNeighbors } = input;
  const totalCalls = edges.reduce((s, e) => s + e.callCount, 0) || 1;
  const nodeIds = new Set(nodes.map((n) => n.id));
  const outDegree = new Map<string, number>();
  const inDegree = new Map<string, number>();
  for (const id of nodeIds) {
    outDegree.set(id, getOutNeighbors(id).filter((x) => nodeIds.has(x)).length);
    inDegree.set(id, getInNeighbors(id).filter((x) => nodeIds.has(x)).length);
  }
  const callCountByNode = new Map<string, number>();
  for (const e of edges) {
    if (nodeIds.has(e.sourceApiId)) {
      callCountByNode.set(e.sourceApiId, (callCountByNode.get(e.sourceApiId) ?? 0) + e.callCount);
    }
  }
  return nodes.map((n) => {
    const inD = inDegree.get(n.id) ?? 0;
    const outD = outDegree.get(n.id) ?? 0;
    const transIn = transitiveInDegree(n.id, getInNeighbors, 2);
    const callFreq = (callCountByNode.get(n.id) ?? 0) / totalCalls;
    const centralityScore = inD + 0.5 * transIn + callFreq;
    return {
      ...n,
      inDegree: inD,
      outDegree: outD,
      centralityScore,
    };
  });
}
