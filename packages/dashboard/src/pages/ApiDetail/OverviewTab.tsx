import React from 'react';

interface ApiRecord {
  id: string;
  path: string;
  method: string;
  teamId: string;
  deprecated?: boolean;
  responses?: unknown;
}

interface OverviewTabProps {
  api: ApiRecord | null;
}

export function OverviewTab({ api }: OverviewTabProps): React.ReactElement {
  if (!api) return <div className="text-white/60 font-mono">Loading…</div>;
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <span className="px-2 py-1 rounded bg-accent/20 text-accent font-mono text-sm">{api.method}</span>
        <span className="px-2 py-1 rounded bg-white/10 font-mono text-sm">{api.path}</span>
        {api.deprecated && <span className="px-2 py-1 rounded bg-danger/20 text-danger text-sm">Deprecated</span>}
      </div>
      <div>
        <h4 className="text-white/80 text-sm font-mono mb-2">Team</h4>
        <p className="text-white font-mono">{api.teamId || '—'}</p>
      </div>
      {api.responses && (
        <div>
          <h4 className="text-white/80 text-sm font-mono mb-2">Response schema</h4>
          <pre className="p-4 rounded bg-background border border-white/10 text-xs text-white/90 overflow-auto max-h-64">
            {JSON.stringify(api.responses, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
