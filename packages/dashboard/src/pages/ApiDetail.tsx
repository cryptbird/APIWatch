import React from 'react';
import { useParams } from 'react-router-dom';

export function ApiDetail(): React.ReactElement {
  const { apiId } = useParams<{ apiId: string }>();
  return (
    <div className="p-6">
      <h1 className="text-xl font-mono text-accent">API Detail</h1>
      <p className="text-white/80 mt-2">API: {apiId ?? '—'}</p>
    </div>
  );
}
