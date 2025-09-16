import React from 'react';
import { useNavigate } from 'react-router-dom';

interface NotificationItem {
  id: string;
  acknowledgedAt?: string | null;
  payload?: { apiId?: string; apiPath?: string; threatLevel?: string; changeSummary?: string; affectedCount?: number };
  sentAt?: string;
}

interface NotificationCardProps {
  item: NotificationItem;
  onAcknowledge: (id: string) => void;
}

export function NotificationCard({ item, onAcknowledge }: NotificationCardProps): React.ReactElement {
  const navigate = useNavigate();
  const p = item.payload ?? {};
  const threatLevel = (p.threatLevel as string) ?? 'NEUTRAL';
  const color = threatLevel === 'CRITICAL' ? 'bg-danger' : threatLevel === 'NEUTRAL' ? 'bg-amber-500' : 'bg-success';

  return (
    <div className="rounded border border-white/10 bg-sidebar/50 p-4 flex items-start justify-between gap-4">
      <div className="min-w-0 flex-1">
        <span className={`inline-block px-2 py-0.5 rounded text-xs font-mono ${color} text-white mr-2`}>
          {threatLevel}
        </span>
        <span className="font-mono text-white">{p.apiPath ?? p.apiId ?? '—'}</span>
        <p className="text-white/70 text-sm mt-1">{p.changeSummary ?? 'Change detected'}</p>
        <p className="text-white/50 text-xs mt-1">
          {typeof p.affectedCount === 'number' ? `${p.affectedCount} affected` : ''}
          {item.sentAt ? ` · ${new Date(item.sentAt).toLocaleString()}` : ''}
        </p>
      </div>
      <div className="flex gap-2 shrink-0">
        <button
          type="button"
          onClick={() => p.apiId && navigate(`/apis/${p.apiId}`)}
          className="px-3 py-1 rounded bg-accent/20 text-accent font-mono text-sm hover:bg-accent/30"
        >
          View
        </button>
        {!item.acknowledgedAt && (
          <button
            type="button"
            onClick={() => onAcknowledge(item.id)}
            className="px-3 py-1 rounded bg-white/10 text-white font-mono text-sm hover:bg-white/20"
          >
            Acknowledge
          </button>
        )}
      </div>
    </div>
  );
}
