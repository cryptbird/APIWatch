import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { GraphNode } from '@apiwatch/shared';

interface GraphContextMenuProps {
  node: GraphNode | null;
  x: number;
  y: number;
  onClose: () => void;
}

export function GraphContextMenu({ node, x, y, onClose }: GraphContextMenuProps): React.ReactElement | null {
  const navigate = useNavigate();
  if (!node) return null;

  const viewDetails = (): void => {
    navigate(`/apis/${node.id}`);
    onClose();
  };
  const viewDiff = (): void => {
    navigate(`/apis/${node.id}?tab=changes`);
    onClose();
  };

  return (
    <div
      className="fixed z-50 py-1 rounded bg-sidebar border border-white/20 shadow-xl font-mono text-sm min-w-[160px]"
      style={{ left: x, top: y }}
    >
      <button
        type="button"
        onClick={viewDetails}
        className="w-full text-left px-3 py-2 text-white/90 hover:bg-white/10"
      >
        View Details
      </button>
      <button
        type="button"
        onClick={viewDiff}
        className="w-full text-left px-3 py-2 text-white/90 hover:bg-white/10"
      >
        View Diff
      </button>
      <button
        type="button"
        className="w-full text-left px-3 py-2 text-white/90 hover:bg-white/10"
      >
        Notify Team
      </button>
    </div>
  );
}
