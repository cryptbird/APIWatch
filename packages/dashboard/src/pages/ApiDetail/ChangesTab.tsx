import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../api/client';
import { ChangeTimeline } from '../../components/ChangeTimeline';

interface ChangesTabProps {
  apiId: string;
}

interface ChangeEvent {
  id: string;
  fromVersion: number;
  toVersion: number;
  threatLevel: string;
  createdAt: string;
  diffPayload?: { summary?: string; before?: unknown; after?: unknown };
}

interface ChangesRes {
  events: ChangeEvent[];
  nextCursor: string | null;
}

export function ChangesTab({ apiId }: ChangesTabProps): React.ReactElement {
  const { data, isLoading } = useQuery({
    queryKey: ['changes', apiId],
    queryFn: async () => {
      const res = await apiClient.get<ChangesRes>(`/changes/${apiId}?limit=20`);
      return res.data;
    },
  });

  const changes = (data?.events ?? []).map((e) => ({
    ...e,
    createdAt: e.createdAt,
    diffPayload: e.diffPayload,
  }));

  if (isLoading) return <div className="text-white/60 font-mono">Loading…</div>;
  return <ChangeTimeline changes={changes} />;
}
