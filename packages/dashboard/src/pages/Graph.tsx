import React, { useState, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { apiClient } from '../api/client';
import { ForceGraph } from '../components/ForceGraph';
import { GraphContextMenu } from '../components/GraphContextMenu';
import { GraphFilters } from '../components/GraphFilters';
import { GraphSearch } from '../components/GraphSearch';
import type { GraphNode, GraphEdge } from '@apiwatch/shared';

interface GraphApiResponse {
  nodes: GraphNode[];
  edges: GraphEdge[];
  metadata: { nodeCount: number; edgeCount: number; cycleCount: number; computedAt: string };
  nextCursor: string | null;
}

export function GraphPage(): React.ReactElement {
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 800, height: 600 });
  const [searchParams] = useSearchParams();
  const highlightedId = searchParams.get('apiId') ?? undefined;
  const [contextMenu, setContextMenu] = useState<{ node: GraphNode; x: number; y: number } | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['graph', 'full'],
    queryFn: async (): Promise<GraphApiResponse> => {
      const res = await apiClient.get<GraphApiResponse>('/graph/full');
      return res.data;
    },
  });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const { width, height } = entries[0]?.contentRect ?? {};
      if (width && height) setSize({ width, height });
    });
    ro.observe(el);
    setSize({ width: el.clientWidth, height: el.clientHeight });
    return () => ro.disconnect();
  }, []);

  const graphData = data
    ? { nodes: data.nodes, edges: data.edges }
    : null;

  useEffect(() => {
    const onClose = (): void => setContextMenu(null);
    const handler = (): void => onClose();
    if (contextMenu) {
      window.addEventListener('click', handler);
      return () => window.removeEventListener('click', handler);
    }
  }, [contextMenu]);

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-white/10 flex items-center gap-4">
        <h1 className="text-xl font-mono text-accent shrink-0">API dependency graph</h1>
        <GraphSearch onSearch={() => {}} resultCount={0} />
        {data?.metadata && (
          <span className="text-white/60 text-sm font-mono shrink-0 ml-auto">
            {data.metadata.nodeCount} nodes · {data.metadata.edgeCount} edges
          </span>
        )}
      </div>
      <div className="flex-1 min-h-0 flex">
        <div ref={containerRef} className="flex-1 min-h-0 relative">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center text-white/60 font-mono">
            Loading…
          </div>
        ) : (
          <>
            <ForceGraph
              data={graphData}
              width={size.width}
              height={size.height}
              highlightedId={highlightedId}
              onNodeRightClick={(node, event) => setContextMenu({ node, x: event.clientX, y: event.clientY })}
            />
            {contextMenu && (
              <GraphContextMenu
                node={contextMenu.node}
                x={contextMenu.x}
                y={contextMenu.y}
                onClose={() => setContextMenu(null)}
              />
            )}
          </>
        )}
        </div>
        <GraphFilters />
      </div>
    </div>
  );
}
