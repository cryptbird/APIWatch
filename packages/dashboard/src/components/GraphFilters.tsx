import React from 'react';
import { useGraphFilterStore } from '../store/graphFilterStore';

const THREAT_LEVELS = ['LOW', 'NEUTRAL', 'CRITICAL'] as const;

/**
 * Right-side filter panel: team, threat level, location, framework (6.9).
 */
export function GraphFilters(): React.ReactElement {
  const { threatLevels, toggleThreatLevel } = useGraphFilterStore();

  return (
    <div className="w-64 shrink-0 p-4 border-l border-white/10 bg-sidebar/50 flex flex-col gap-4">
      <h3 className="font-mono text-accent text-sm">Filters</h3>
      <div>
        <p className="text-white/70 text-xs mb-2">Threat level</p>
        <div className="space-y-1">
          {THREAT_LEVELS.map((level) => (
            <label key={level} className="flex items-center gap-2 text-sm text-white/90 cursor-pointer">
              <input
                type="checkbox"
                checked={threatLevels.includes(level)}
                onChange={() => toggleThreatLevel(level)}
                className="rounded border-white/30"
              />
              {level}
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
