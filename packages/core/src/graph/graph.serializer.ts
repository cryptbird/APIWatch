/**
 * Build SerializedGraph from nodes, edges, and cycle count for frontend.
 */

import type { SerializedGraph, GraphNode, GraphEdge } from '@apiwatch/shared';

export function toSerializedGraph(
  nodes: GraphNode[],
  edges: GraphEdge[],
  cycleCount: number
): SerializedGraph {
  return {
    nodes,
    edges,
    metadata: {
      nodeCount: nodes.length,
      edgeCount: edges.length,
      cycleCount,
      computedAt: new Date().toISOString(),
    },
  };
}
