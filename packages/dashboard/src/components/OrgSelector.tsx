import React, { useState, useRef, useEffect } from 'react';
import { useOrgStore } from '../store/orgStore';

/**
 * Org selector for multi-organization support. Shown in sidebar header when user has multiple orgs.
 */
export function OrgSelector(): React.ReactElement | null {
  const { orgs, selectedOrgId, setSelectedOrgId } = useOrgStore();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onOutside = (e: MouseEvent): void => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onOutside);
    return () => document.removeEventListener('mousedown', onOutside);
  }, []);

  if (orgs.length <= 1) {
    return orgs.length === 1 ? (
      <span className="text-white/80 text-sm font-mono truncate">{orgs[0]?.name}</span>
    ) : null;
  }

  const current = orgs.find((o) => o.id === selectedOrgId) ?? orgs[0];

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1 px-2 py-1 rounded hover:bg-white/10 text-white/90 text-sm font-mono"
      >
        <span className="truncate max-w-[120px]">{current?.name}</span>
        <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <ul className="absolute top-full left-0 mt-1 w-48 py-1 rounded bg-sidebar border border-white/10 shadow-lg z-50">
          {orgs.map((org) => (
            <li key={org.id}>
              <button
                type="button"
                onClick={() => {
                  setSelectedOrgId(org.id);
                  setOpen(false);
                }}
                className={`w-full text-left px-3 py-2 text-sm font-mono hover:bg-white/10 ${org.id === selectedOrgId ? 'text-accent' : 'text-white/90'}`}
              >
                {org.name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
