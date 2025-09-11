/**
 * Graph filter state: team, threat level, location, framework. Live filtering (6.9).
 */

import { create } from 'zustand';

export interface GraphFiltersState {
  teamIds: string[];
  threatLevels: string[];
  locationId: string | null;
  framework: string | null;
  setTeamIds: (ids: string[]) => void;
  setThreatLevels: (levels: string[]) => void;
  setLocationId: (id: string | null) => void;
  setFramework: (fw: string | null) => void;
  toggleTeam: (id: string) => void;
  toggleThreatLevel: (level: string) => void;
}

export const useGraphFilterStore = create<GraphFiltersState>((set) => ({
  teamIds: [],
  threatLevels: [],
  locationId: null,
  framework: null,
  setTeamIds: (teamIds) => set({ teamIds }),
  setThreatLevels: (threatLevels) => set({ threatLevels }),
  setLocationId: (locationId) => set({ locationId }),
  setFramework: (framework) => set({ framework }),
  toggleTeam: (id) =>
    set((s) => ({
      teamIds: s.teamIds.includes(id) ? s.teamIds.filter((t) => t !== id) : [...s.teamIds, id],
    })),
  toggleThreatLevel: (level) =>
    set((s) => ({
      threatLevels: s.threatLevels.includes(level)
        ? s.threatLevels.filter((l) => l !== level)
        : [...s.threatLevels, level],
    })),
}));
