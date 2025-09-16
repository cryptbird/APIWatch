import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import { OverviewTab } from './ApiDetail/OverviewTab';
import { DependenciesTab } from './ApiDetail/DependenciesTab';
import { ChangesTab } from './ApiDetail/ChangesTab';

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'dependencies', label: 'Dependencies' },
  { id: 'changes', label: 'Changes' },
  { id: 'analytics', label: 'Analytics' },
  { id: 'settings', label: 'Settings' },
] as const;

export function ApiDetail(): React.ReactElement {
  const { apiId } = useParams<{ apiId: string }>();
  const [tab, setTab] = useState<string>('overview');

  const { data: api, isLoading } = useQuery({
    queryKey: ['api', apiId],
    queryFn: async () => {
      const res = await apiClient.get(`/apis/${apiId}`);
      return res.data as { id: string; path: string; method: string; teamId: string; deprecated?: boolean; responses?: unknown };
    },
    enabled: !!apiId,
  });

  if (!apiId) {
    return (
      <div className="p-6">
        <p className="text-white/60">No API selected.</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-4">
        <Link to="/apis" className="text-accent hover:underline font-mono text-sm">← APIs</Link>
      </div>
      {isLoading && <div className="text-white/60 font-mono">Loading…</div>}
      {!isLoading && api && (
        <>
          <header className="flex flex-wrap items-center gap-3 mb-6">
            <span className="px-2 py-1 rounded bg-accent/20 text-accent font-mono">{api.method}</span>
            <span className="font-mono text-white">{api.path}</span>
            <span className="text-white/60 text-sm">Team: {api.teamId}</span>
          </header>
          <nav className="flex gap-2 border-b border-white/10 mb-4">
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={`px-3 py-2 font-mono text-sm border-b-2 -mb-px ${tab === t.id ? 'border-accent text-accent' : 'border-transparent text-white/70 hover:text-white'}`}
              >
                {t.label}
              </button>
            ))}
          </nav>
          {tab === 'overview' && <OverviewTab api={api} />}
          {tab === 'dependencies' && <DependenciesTab apiId={apiId} />}
          {tab === 'changes' && <ChangesTab apiId={apiId} />}
          {tab === 'analytics' && <div className="text-white/60 font-mono">Analytics — use UsageChart</div>}
          {tab === 'settings' && <div className="text-white/60 font-mono">Settings</div>}
        </>
      )}
      {!isLoading && !api && <div className="text-white/60">API not found.</div>}
    </div>
  );
}
