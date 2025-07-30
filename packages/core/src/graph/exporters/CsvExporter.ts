/**
 * Export graph as CSV: nodes (id, label, team, threatLevel, centrality) and edges (source, target, callCount, avgLatency, errorRate).
 */

import type { SerializedGraph } from '@apiwatch/shared';

export function exportNodesCsv(graph: SerializedGraph): string {
  const lines = ['id,label,team,threatLevel,centrality'];
  for (const n of graph.nodes) {
    lines.push(`${n.id},${escapeCsv(n.label)},${escapeCsv(n.teamId)},${n.threatLevel},${n.centralityScore}`);
  }
  return lines.join('\n');
}

export function exportEdgesCsv(graph: SerializedGraph): string {
  const lines = ['source,target,callCount,avgLatencyMs,errorRate'];
  for (const e of graph.edges) {
    lines.push(`${e.sourceApiId},${e.targetApiId},${e.callCount},${e.avgLatencyMs},${e.errorRate}`);
  }
  return lines.join('\n');
}

function escapeCsv(s: string): string {
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}
