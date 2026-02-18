import React, { useMemo, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ForceGraph2D from 'react-force-graph-2d';
import { GraphTooltip } from './GraphTooltip';
import { getNodeColor, nodeRadius, getEdgeColor, edgeWidth } from '../utils/graphColors';
import type { GraphNode, GraphEdge } from '@apiwatch/shared';

interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

interface ForceGraphProps {
  data: GraphData | null;
  width: number;
  height: number;
  highlightedId?: string | null;
  onNodeRightClick?: (node: GraphNode, event: MouseEvent) => void;
}

type FGNode = GraphNode & { x?: number; y?: number };
type FGLink = { source: string; target: string; callCount: number; errorRate: number };

export function ForceGraph({ data, width, height, highlightedId, onNodeRightClick }: ForceGraphProps): React.ReactElement {
  const navigate = useNavigate();
  const [hoverNode, setHoverNode] = useState<GraphNode | null>(null);

  const graphData = useMemo(() => {
    if (!data?.nodes?.length) return { nodes: [], links: [] };
    const nodes = data.nodes.map((n) => ({ ...n }));
    const links: FGLink[] = data.edges.map((e) => ({
      source: e.sourceApiId,
      target: e.targetApiId,
      callCount: e.callCount ?? 0,
      errorRate: e.errorRate ?? 0,
    }));
    return { nodes, links };
  }, [data]);

  const nodePaint = useCallback(
    (node: FGNode, ctx: CanvasRenderingContext2D, globalScale: number) => {
      const label = node.label ?? node.id;
      const threatLevel = node.threatLevel ?? 'unknown';
      const color = getNodeColor(threatLevel);
      const r = nodeRadius(node.centralityScore ?? 0);
      const isCritical = threatLevel === 'CRITICAL';
      const isHighlighted = highlightedId === node.id;

      ctx.beginPath();
      ctx.arc(node.x ?? 0, node.y ?? 0, r, 0, 2 * Math.PI);
      if (isCritical) {
        ctx.shadowColor = color;
        ctx.shadowBlur = 12;
      }
      ctx.fillStyle = color;
      ctx.fill();
      ctx.shadowBlur = 0;

      if (isHighlighted) {
        ctx.strokeStyle = '#ff9500';
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      const fontSize = 12 / globalScale;
      ctx.font = `${fontSize}px "JetBrains Mono", monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      ctx.fillText(label, node.x ?? 0, (node.y ?? 0) + r + fontSize);
    },
    [highlightedId]
  );

  const linkWidth = useCallback((link: FGLink) => edgeWidth(link.callCount), []);
  const linkColor = useCallback((link: FGLink) => getEdgeColor(link.errorRate), []);

  if (!data) {
    return (
      <div className="w-full h-full flex items-center justify-center text-white/60 font-mono">
        Loading graph…
      </div>
    );
  }

  return (
    <>
      <ForceGraph2D
        graphData={graphData}
        width={width}
        height={height}
        nodeId="id"
        linkSource="source"
        linkTarget="target"
        nodeCanvasObject={nodePaint}
        linkWidth={linkWidth}
        linkDirectionalArrowLength={4}
        linkDirectionalArrowRelPos={1}
        linkColor={linkColor}
        onNodeClick={(node) => navigate(`/apis/${(node as FGNode).id}`)}
        onNodeRightClick={onNodeRightClick ? (node, event) => onNodeRightClick(node as GraphNode, event) : undefined}
        onNodeHover={(node) => setHoverNode(node as GraphNode | null)}
        onBackgroundClick={() => {}}
        enableZoomInteraction
        enablePanInteraction
      />
      {hoverNode && <GraphTooltip node={hoverNode} x={0} y={0} />}
    </>
  );
}
