'use client';

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { FilterState, DurationOption, StipendRange } from '../types/internship';
import { DEFAULT_FILTERS } from '../constants/filters';

interface FilterStore extends FilterState {
  toggleProfile:    (p: string) => void;
  toggleLocation:   (l: string) => void;
  toggleDuration:   (d: DurationOption) => void;
  setStipend:       (s: StipendRange) => void;
  setSearchQuery:   (q: string) => void;
  toggleWorkFromHome: () => void;
  togglePartTime:   () => void;
  clearAll:         () => void;
  hasActiveFilters: () => boolean;
  activeFilterCount: () => number;
}

export const useFilterStore = create<FilterStore>()(
  devtools(
    (set, get) => ({
      ...DEFAULT_FILTERS,

      toggleProfile: (p) => set((s) => ({
        profiles: s.profiles.includes(p) ? s.profiles.filter((x) => x !== p) : [...s.profiles, p],
      }), false, 'toggleProfile'),

      toggleLocation: (l) => set((s) => ({
        locations: s.locations.includes(l) ? s.locations.filter((x) => x !== l) : [...s.locations, l],
      }), false, 'toggleLocation'),

      toggleDuration: (d) => set((s) => ({
        durations: s.durations.includes(d) ? s.durations.filter((x) => x !== d) : [...s.durations, d],
      }), false, 'toggleDuration'),

      setStipend:     (stipend)      => set({ stipend },     false, 'setStipend'),
      setSearchQuery: (searchQuery)  => set({ searchQuery }, false, 'setSearchQuery'),
      toggleWorkFromHome: ()         => set((s) => ({ workFromHome: !s.workFromHome }), false, 'toggleWFH'),
      togglePartTime:    ()          => set((s) => ({ partTime:     !s.partTime     }), false, 'togglePT'),
      clearAll:          ()          => set({ ...DEFAULT_FILTERS },                     false, 'clearAll'),

      hasActiveFilters: () => {
        const s = get();
        return s.profiles.length > 0 || s.locations.length > 0 || s.durations.length > 0
          || s.stipend !== 'any' || s.searchQuery !== '' || s.workFromHome || s.partTime;
      },

      activeFilterCount: () => {
        const s = get();
        let n = s.profiles.length + s.locations.length + s.durations.length;
        if (s.stipend !== 'any') n++;
        if (s.workFromHome)      n++;
        if (s.partTime)          n++;
        return n;
      },
    }),
    { name: 'FilterStore' },
  ),
);
