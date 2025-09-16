import React from 'react';

interface DiffViewerProps {
  before?: unknown;
  after?: unknown;
}

export function DiffViewer({ before, after }: DiffViewerProps): React.ReactElement {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <h5 className="text-white/70 text-xs font-mono mb-1">Before</h5>
        <pre className="p-3 rounded bg-background border border-white/10 text-xs text-white/90 overflow-auto max-h-48">
          {before != null ? JSON.stringify(before, null, 2) : '—'}
        </pre>
      </div>
      <div>
        <h5 className="text-white/70 text-xs font-mono mb-1">After</h5>
        <pre className="p-3 rounded bg-background border border-white/10 text-xs text-white/90 overflow-auto max-h-48">
          {after != null ? JSON.stringify(after, null, 2) : '—'}
        </pre>
      </div>
    </div>
  );
}
