import React, { useState } from 'react';
import { DiffViewer } from './DiffViewer';

interface ChangeEntry {
  id: string;
  fromVersion: number;
  toVersion: number;
  threatLevel: string;
  createdAt?: string | Date;
  diffPayload?: { summary?: string; before?: unknown; after?: unknown };
}

interface ChangeTimelineProps {
  changes: ChangeEntry[];
}

export function ChangeTimeline({ changes }: ChangeTimelineProps): React.ReactElement {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      {changes.map((c) => {
        const isExpanded = expandedId === c.id;
        const payload = c.diffPayload as { summary?: string; before?: unknown; after?: unknown } | undefined;
        return (
          <div
            key={c.id}
            className="rounded border border-white/10 bg-sidebar/50 overflow-hidden"
          >
            <div className="flex items-center gap-3 p-3">
              <span className="px-2 py-0.5 rounded text-xs font-mono bg-white/10">
                v{c.fromVersion} → v{c.toVersion}
              </span>
              <span
                className={`w-2 h-2 rounded-full ${
                  c.threatLevel === 'CRITICAL' ? 'bg-danger' : c.threatLevel === 'NEUTRAL' ? 'bg-amber-500' : 'bg-success'
                }`}
              />
              <span className="text-white/80 text-sm flex-1">{payload?.summary ?? 'Schema change'}</span>
              {c.createdAt && <span className="text-white/50 text-xs">{new Date(c.createdAt).toLocaleDateString()}</span>}
              <button
                type="button"
                onClick={() => setExpandedId(isExpanded ? null : c.id)}
                className="text-accent font-mono text-sm hover:underline"
              >
                {isExpanded ? 'Collapse' : 'Expand'}
              </button>
            </div>
            {isExpanded && payload && (
              <div className="border-t border-white/10 p-3">
                <DiffViewer before={payload.before} after={payload.after} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
