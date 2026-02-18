import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../../api/client';

interface DependenciesTabProps {
  apiId: string;
}

interface DependentsRes {
  dependents: Array<{ id: string; label?: string; teamId?: string }>;
}

interface DependenciesRes {
  dependencies: Array<{ id: string; label?: string; teamId?: string }>;
}

export function DependenciesTab({ apiId }: DependenciesTabProps): React.ReactElement {
  const navigate = useNavigate();
  const { data: dependentsData } = useQuery({
    queryKey: ['graph', apiId, 'dependents'],
    queryFn: async () => {
      const r = await apiClient.get<DependentsRes>(`/graph/${apiId}/dependents?depth=3`);
      return r.data;
    },
  });
  const { data: depsData } = useQuery({
    queryKey: ['graph', apiId, 'dependencies'],
    queryFn: async () => {
      const r = await apiClient.get<DependenciesRes>(`/graph/${apiId}/dependencies?depth=3`);
      return r.data;
    },
  });

  const dependents = dependentsData?.dependents ?? [];
  const dependencies = depsData?.dependencies ?? [];

  const row = (item: { id: string; label?: string; teamId?: string }) => (
    <tr
      key={item.id}
      className="border-b border-white/10 hover:bg-white/5 cursor-pointer"
      onClick={() => navigate(`/apis/${item.id}`)}
    >
      <td className="py-2 font-mono text-accent">{item.label ?? item.id}</td>
      <td className="py-2 text-white/70 text-sm">{item.teamId ?? '—'}</td>
    </tr>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <h4 className="text-accent font-mono mb-2">Callers (who calls this API)</h4>
        <div className="rounded border border-white/10 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-white/5 text-left">
                <th className="px-3 py-2 font-mono">API</th>
                <th className="px-3 py-2 font-mono">Team</th>
              </tr>
            </thead>
            <tbody>{dependents.map(row)}</tbody>
          </table>
        </div>
      </div>
      <div>
        <h4 className="text-accent font-mono mb-2">Dependencies (what this API calls)</h4>
        <div className="rounded border border-white/10 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-white/5 text-left">
                <th className="px-3 py-2 font-mono">API</th>
                <th className="px-3 py-2 font-mono">Team</th>
              </tr>
            </thead>
            <tbody>{dependencies.map(row)}</tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
