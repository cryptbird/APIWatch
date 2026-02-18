import React from 'react';
import { useParams } from 'react-router-dom';

export function TeamViewPage(): React.ReactElement {
  const { teamId } = useParams<{ teamId: string }>();
  return (
    <div className="p-6">
      <h1 className="text-xl font-mono text-accent">Team</h1>
      <p className="text-white/80 mt-2">Team: {teamId ?? '—'}</p>
    </div>
  );
}
