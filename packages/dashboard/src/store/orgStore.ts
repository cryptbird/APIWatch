/**
 * Selected org for multi-organization support. Used for X-Org-Id header (6.3).
 */

import { create } from 'zustand';

interface Org {
  id: string;
  name: string;
}

interface OrgState {
  orgs: Org[];
  selectedOrgId: string | null;
  setOrgs: (orgs: Org[]) => void;
  setSelectedOrgId: (id: string | null) => void;
}

export const useOrgStore = create<OrgState>((set) => ({
  orgs: [],
  selectedOrgId: null,
  setOrgs: (orgs) => set((s) => ({ orgs, selectedOrgId: s.selectedOrgId ?? orgs[0]?.id ?? null })),
  setSelectedOrgId: (id) => set({ selectedOrgId: id }),
}));
