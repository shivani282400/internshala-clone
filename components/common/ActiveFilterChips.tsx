'use client';
import React from 'react';
import { useFilterStore } from '@/store/filterStore';
import { STIPEND_OPTIONS, DURATION_OPTIONS } from '@/constants/filters';

const X = () => (
  <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12"/>
  </svg>
);

const Chip = ({ label, onRemove }: { label: string; onRemove: () => void }) => (
  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-[#008BCA] border border-blue-200">
    {label}
    <button onClick={onRemove} aria-label={`Remove ${label}`} className="hover:text-red-500 ml-0.5"><X /></button>
  </span>
);

const ActiveFilterChips = () => {
  const { profiles, locations, durations, stipend, workFromHome, partTime, searchQuery,
    toggleProfile, toggleLocation, toggleDuration, setStipend, toggleWorkFromHome,
    togglePartTime, setSearchQuery, clearAll, hasActiveFilters } = useFilterStore();

  if (!hasActiveFilters()) return null;
  const stipendLabel = STIPEND_OPTIONS.find(o => o.value === stipend)?.label;

  return (
    <div className="flex flex-wrap items-center gap-2 py-2" role="group" aria-label="Active filters">
      <span className="text-xs font-medium text-[#9199A3]">Filters:</span>
      {profiles.map(p  => <Chip key={p}  label={p}  onRemove={() => toggleProfile(p)} />)}
      {locations.map(l => <Chip key={l}  label={l}  onRemove={() => toggleLocation(l)} />)}
      {durations.map(d => {
        const label = DURATION_OPTIONS.find(o => o.value === d)?.label ?? d;
        return <Chip key={d} label={label} onRemove={() => toggleDuration(d)} />;
      })}
      {stipend !== 'any'  && <Chip label={`Stipend: ${stipendLabel}`} onRemove={() => setStipend('any')} />}
      {workFromHome       && <Chip label="Work From Home"             onRemove={toggleWorkFromHome} />}
      {partTime           && <Chip label="Part-time"                  onRemove={togglePartTime} />}
      {searchQuery        && <Chip label={`"${searchQuery}"`}         onRemove={() => setSearchQuery('')} />}
      <button onClick={clearAll} className="text-xs text-[#008BCA] hover:underline font-medium ml-1">Clear all</button>
    </div>
  );
};
export default ActiveFilterChips;
