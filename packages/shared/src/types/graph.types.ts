/**
 * Shared graph and dependency types for APIWatch.
 */

import type { ThreatLevel } from './api.types.js';

export interface GraphNode {
  id: string;
  repoId: string;
  teamId: string;
  squadId: string;
  locationId: string;
  label: string;
  inDegree: number;
  outDegree: number;
  centralityScore: number;
  threatLevel: ThreatLevel;
}

export interface GraphEdge {
  id: string;
  sourceApiId: string;
  targetApiId: string;
  callCount: number;
  lastCalledAt: Date;
  avgLatencyMs: number;
  errorRate: number;
}

export interface SerializedGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
  metadata: {
    nodeCount: number;
    edgeCount: number;
    cycleCount: number;
    computedAt: string;
  };
}

export interface GraphDiff {
  nodesAdded: string[];
  nodesRemoved: string[];
  edgesAdded: Array<{ source: string; target: string }>;
  edgesRemoved: Array<{ source: string; target: string }>;
}
