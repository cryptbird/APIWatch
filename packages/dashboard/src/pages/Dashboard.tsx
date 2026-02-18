import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import { KpiWidget } from '../components/KpiWidget';

interface GraphStats {
  nodeCount: number;
  edgeCount: number;
  cycleCount: number;
}

export function Dashboard(): React.ReactElement {
  const { data: stats } = useQuery({
    queryKey: ['graph', 'stats'],
    queryFn: async () => {
      const res = await apiClient.get<GraphStats>('/graph/stats');
      return res.data;
    },
  });

  return (
    <div className="p-6">
      <h1 className="text-xl font-mono text-accent mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiWidget title="Total APIs" value={stats?.nodeCount ?? '—'} />
        <KpiWidget title="Active dependencies" value={stats?.edgeCount ?? '—'} />
        <KpiWidget title="Critical alerts" value={0} badge={undefined} />
        <KpiWidget title="Teams" value="—" />
      </div>
    </div>
  );
}
