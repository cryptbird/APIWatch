import React from 'react';

interface KpiWidgetProps {
  title: string;
  value: string | number;
  trend?: string;
  badge?: 'critical' | null;
}

export function KpiWidget({ title, value, trend, badge }: KpiWidgetProps): React.ReactElement {
  return (
    <div className="rounded border border-white/10 bg-sidebar/50 p-4">
      <p className="text-white/60 text-sm font-mono mb-1">{title}</p>
      <div className="flex items-center gap-2">
        <span className="text-xl font-mono text-white">{value}</span>
        {badge === 'critical' && (
          <span className="px-2 py-0.5 rounded text-xs font-mono bg-danger text-white">CRITICAL</span>
        )}
        {trend && <span className="text-white/50 text-sm">{trend}</span>}
      </div>
    </div>
  );
}
