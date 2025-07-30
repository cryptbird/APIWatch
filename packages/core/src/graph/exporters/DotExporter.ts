/**
 * Export graph as DOT format for Graphviz (node styling by threat, size by centrality).
 */

import type { SerializedGraph } from '@apiwatch/shared';

export function exportToDot(graph: SerializedGraph): string {
  const lines = ['digraph G {'];
  for (const n of graph.nodes) {
    const color = n.threatLevel === 'CRITICAL' ? 'red' : n.threatLevel === 'NEUTRAL' ? 'orange' : 'green';
    const width = Math.max(0.5, 1 + n.centralityScore * 0.2);
    lines.push(`  "${n.id}" [label="${n.label.replace(/"/g, '\\"')}", color=${color}, width=${width.toFixed(2)}];`);
  }
  for (const e of graph.edges) {
    lines.push(`  "${e.sourceApiId}" -> "${e.targetApiId}" [label="${e.callCount} calls"];`);
  }
  lines.push('}');
  return lines.join('\n');
}
