import React from 'react';
import { getNodeColor } from '../utils/graphColors';
import type { GraphNode } from '@apiwatch/shared';

interface GraphTooltipProps {
  node: GraphNode | null;
  x: number;
  y: number;
}

export function GraphTooltip({ node }: GraphTooltipProps): React.ReactElement | null {
  if (!node) return null;
  const color = getNodeColor(node.threatLevel);
  return (
    <div
      className="absolute bottom-4 left-4 z-50 px-3 py-2 rounded bg-sidebar border border-white/20 shadow-xl font-mono text-sm pointer-events-none"
    >
      <div className="font-semibold text-white truncate max-w-[200px]" title={node.label}>
        {node.label}
      </div>
      <div className="text-white/70 mt-1">
        <span className="inline-block w-2 h-2 rounded-full mr-1.5 align-middle" style={{ backgroundColor: color }} />
        {node.threatLevel}
      </div>
      <div className="text-white/60 text-xs mt-1">
        Centrality: {node.centralityScore.toFixed(2)} · In: {node.inDegree} · Out: {node.outDegree}
      </div>
    </div>
  );
}
