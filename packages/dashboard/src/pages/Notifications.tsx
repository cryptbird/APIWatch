import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import { useAuthStore } from '../store/authStore';
import { NotificationCard } from '../components/NotificationCard';

const TABS = ['ALL', 'CRITICAL', 'NEUTRAL', 'LOW', 'UNREAD'] as const;

interface NotificationRow {
  id: string;
  acknowledgedAt?: string | null;
  payload?: Record<string, unknown>;
  sentAt?: string;
}

interface ListResponse {
  notifications: NotificationRow[];
}

export function NotificationsPage(): React.ReactElement {
  const [tab, setTab] = useState<string>('ALL');
  const userId = useAuthStore((s) => s.user?.id) ?? 'user-1';
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['notifications', userId, tab],
    queryFn: async () => {
      const params = new URLSearchParams({ userId, limit: '50' });
      if (tab === 'UNREAD') params.set('read', 'false');
      if (tab !== 'ALL' && tab !== 'UNREAD') params.set('threatLevel', tab);
      const res = await apiClient.get<ListResponse>(`/notifications?${params}`);
      return res.data;
    },
  });

  const acknowledge = useMutation({
    mutationFn: (id: string) => apiClient.post(`/notifications/${id}/acknowledge?userId=${userId}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const notifications = data?.notifications ?? [];

  return (
    <div className="p-6">
      <h1 className="text-xl font-mono text-accent mb-4">Notifications</h1>
      <nav className="flex gap-2 border-b border-white/10 mb-4">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`px-3 py-2 font-mono text-sm border-b-2 -mb-px ${tab === t ? 'border-accent text-accent' : 'border-transparent text-white/70 hover:text-white'}`}
          >
            {t}
          </button>
        ))}
      </nav>
      {isLoading && <div className="text-white/60 font-mono">Loading…</div>}
      {!isLoading && (
        <div className="space-y-3">
          {notifications.length === 0 ? (
            <p className="text-white/50">No notifications.</p>
          ) : (
            notifications.map((n) => (
              <NotificationCard
                key={n.id}
                item={n}
                onAcknowledge={(id) => acknowledge.mutate(id)}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}
