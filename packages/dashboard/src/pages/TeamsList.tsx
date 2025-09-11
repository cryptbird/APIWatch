import React from 'react';

export function TeamsList(): React.ReactElement {
  return (
    <div className="p-6">
      <h1 className="text-xl font-mono text-accent">Teams</h1>
      <p className="text-white/80 mt-2">Team list — link to /team/:teamId</p>
    </div>
  );
}
