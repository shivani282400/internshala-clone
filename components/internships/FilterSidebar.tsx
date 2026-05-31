'use client';
import React, { useState, useCallback, useMemo } from 'react';
import { useFilterStore } from '@/store/filterStore';
import { DURATION_OPTIONS, STIPEND_OPTIONS } from '@/constants/filters';
import type { StipendRange } from '@/types/internship';

const MAX_STIPEND = 10000;

export default function FilterSidebar({ availableProfiles, availableLocations }: {
  availableProfiles: string[];
  availableLocations: string[];
}) {
  const { profiles, locations, durations, stipend, workFromHome, partTime,
    toggleProfile, toggleLocation, toggleDuration, setStipend,
    toggleWorkFromHome, togglePartTime, setSearchQuery, searchQuery,
    clearAll, hasActiveFilters } = useFilterStore();

  const [profileInput,  setProfileInput]  = useState('');
  const [locationInput, setLocationInput] = useState('');
  const [showProfileDD, setShowProfileDD] = useState(false);
  const [showLocationDD,setShowLocationDD]= useState(false);
  const [showMore,      setShowMore]      = useState(false);

  const sliderValue = stipend === 'any' || stipend === '0' ? 0 : parseInt(stipend, 10);
  const sliderPct   = Math.round((sliderValue / MAX_STIPEND) * 100);

  const handleSlider = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseInt(e.target.value, 10);
    if (v === 0)          setStipend('any');
    else if (v <= 2000)   setStipend('2000');
    else if (v <= 5000)   setStipend('5000');
    else                  setStipend('10000');
  }, [setStipend]);

  const profileSuggestions = useMemo(() =>
    availableProfiles.filter(p => p.toLowerCase().includes(profileInput.toLowerCase()) && profileInput.length > 0).slice(0, 8),
    [availableProfiles, profileInput]);

  const locationSuggestions = useMemo(() =>
    availableLocations.filter(l => l.toLowerCase().includes(locationInput.toLowerCase()) && locationInput.length > 0).slice(0, 8),
    [availableLocations, locationInput]);

  return (
    <div className="flex flex-col gap-4">

      {/* ── FILTERS CARD ── */}
      <div className="bg-white rounded border border-[#E2E5E8] hover:shadow-[0_4px_20px_rgba(0,0,0,0.10)] transition-shadow duration-200 rounded-lg">
        <div className="flex items-center gap-2 px-5 pt-4 pb-3 border-b border-[#E2E5E8]">
          <svg className="w-4 h-4 text-[#008BCA]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z"/>
          </svg>
          <h2 className="font-semibold text-sm text-[#1A1A2E]">Filters</h2>
        </div>

        <div className="px-5 py-4 space-y-5">

          {/* Profile */}
          <div>
            <label className="block text-sm font-medium text-[#1A1A2E] mb-1.5">Profile</label>
            <div className="relative">
              <input type="text" value={profileInput} placeholder="e.g. Marketing"
                onChange={e => { setProfileInput(e.target.value); setShowProfileDD(true); }}
                onFocus={() => setShowProfileDD(true)}
                onBlur={() => setTimeout(() => setShowProfileDD(false), 150)}
                className="w-full px-3 py-2.5 text-sm border border-[#E2E5E8] rounded bg-white placeholder-[#9199A3] text-[#1A1A2E] focus:outline-none focus:border-[#008BCA] focus:ring-1 focus:ring-[#008BCA]/20 transition-colors duration-150" autoComplete="off" />
              {showProfileDD && profileSuggestions.length > 0 && (
                <ul className="absolute z-20 top-full left-0 right-0 mt-1 bg-white border border-[#E2E5E8] rounded shadow-lg max-h-48 overflow-y-auto" role="listbox">
                  {profileSuggestions.map(p => (
                    <li key={p} role="option" aria-selected={profiles.includes(p)}
                      onMouseDown={() => { toggleProfile(p); setProfileInput(''); setShowProfileDD(false); }}
                      className={`px-3 py-2 text-sm cursor-pointer hover:bg-blue-50 hover:text-[#008BCA] flex justify-between ${profiles.includes(p) ? 'text-[#008BCA] bg-blue-50' : 'text-[#1A1A2E]'}`}>
                      {p}
                      {profiles.includes(p) && <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {profiles.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {profiles.map(p => (
                  <span key={p} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-[#008BCA] border border-blue-200">{p}
                    <button onClick={() => toggleProfile(p)} className="hover:text-red-500 ml-0.5" aria-label={`Remove ${p}`}>
                      <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12"/></svg>
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-[#1A1A2E] mb-1.5">Location</label>
            <div className="relative">
              <input type="text" value={locationInput} placeholder="e.g. Delhi"
                onChange={e => { setLocationInput(e.target.value); setShowLocationDD(true); }}
                onFocus={() => setShowLocationDD(true)}
                onBlur={() => setTimeout(() => setShowLocationDD(false), 150)}
                className="w-full px-3 py-2.5 text-sm border border-[#E2E5E8] rounded bg-white placeholder-[#9199A3] text-[#1A1A2E] focus:outline-none focus:border-[#008BCA] focus:ring-1 focus:ring-[#008BCA]/20 transition-colors duration-150" autoComplete="off" />
              {showLocationDD && locationSuggestions.length > 0 && (
                <ul className="absolute z-20 top-full left-0 right-0 mt-1 bg-white border border-[#E2E5E8] rounded shadow-lg max-h-48 overflow-y-auto" role="listbox">
                  {locationSuggestions.map(l => (
                    <li key={l} role="option" aria-selected={locations.includes(l)}
                      onMouseDown={() => { toggleLocation(l); setLocationInput(''); setShowLocationDD(false); }}
                      className={`px-3 py-2 text-sm cursor-pointer hover:bg-blue-50 hover:text-[#008BCA] flex justify-between ${locations.includes(l) ? 'text-[#008BCA] bg-blue-50' : 'text-[#1A1A2E]'}`}>
                      {l}
                      {locations.includes(l) && <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {locations.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {locations.map(l => (
                  <span key={l} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-[#008BCA] border border-blue-200">{l}
                    <button onClick={() => toggleLocation(l)} className="hover:text-red-500 ml-0.5" aria-label={`Remove ${l}`}>
                      <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12"/></svg>
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* WFH + Part-time */}
          {[{ label: 'Work from home', checked: workFromHome, onChange: toggleWorkFromHome },
            { label: 'Part-time',      checked: partTime,     onChange: togglePartTime }].map(item => (
            <label key={item.label} className="flex items-center gap-2.5 cursor-pointer select-none group">
              <input type="checkbox" checked={item.checked} onChange={item.onChange}
                className="h-[15px] w-[15px] rounded-sm cursor-pointer" style={{ accentColor: '#008BCA' }} />
              <span className="text-sm text-[#4d4d4d] group-hover:text-[#1A1A2E] transition-colors">{item.label}</span>
            </label>
          ))}

          {/* Stipend slider */}
          <div>
            <label className="block text-sm font-medium text-[#1A1A2E] mb-3">
              Desired minimum monthly stipend (₹)
            </label>
            <div className="px-1">
              <input type="range" min={0} max={MAX_STIPEND} step={500} value={sliderValue}
                onChange={handleSlider}
                style={{ background: `linear-gradient(to right, #008BCA ${sliderPct}%, #D1D5DB ${sliderPct}%)` }}
                aria-label="Minimum monthly stipend" />
              <div className="flex justify-between text-[11px] text-[#9199A3] mt-2 select-none">
                {['0','2K','4K','6K','8K','10K'].map(l => <span key={l}>{l}</span>)}
              </div>
              {sliderValue > 0 && (
                <p className="text-xs text-[#008BCA] font-medium mt-1.5">
                  Min ₹{sliderValue >= 1000 ? `${sliderValue/1000}K` : sliderValue}/month
                </p>
              )}
            </div>
          </div>

          {/* View more filters */}
          <button onClick={() => setShowMore(o => !o)}
            className="flex items-center gap-1 text-sm font-semibold text-[#008BCA] hover:underline"
            aria-expanded={showMore}>
            {showMore ? 'View less filters' : 'View more filters'}
            <svg className={`w-4 h-4 transition-transform ${showMore ? 'rotate-180' : ''}`}
              fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
            </svg>
          </button>

          {showMore && (
            <div className="animate-fade-in space-y-2">
              <p className="text-sm font-medium text-[#1A1A2E]">Duration</p>
              {DURATION_OPTIONS.map(opt => (
                <label key={opt.value} className="flex items-center gap-2.5 cursor-pointer group select-none">
                  <input type="checkbox" checked={durations.includes(opt.value)}
                    onChange={() => toggleDuration(opt.value)}
                    className="h-[15px] w-[15px] rounded-sm cursor-pointer" style={{ accentColor: '#008BCA' }} />
                  <span className="text-sm text-[#4d4d4d] group-hover:text-[#1A1A2E] transition-colors">{opt.label}</span>
                </label>
              ))}
            </div>
          )}

          {hasActiveFilters() && (
            <div className="flex justify-end pt-1 border-t border-[#E2E5E8]">
              <button onClick={clearAll} className="text-sm font-semibold text-[#008BCA] hover:underline">Clear all</button>
            </div>
          )}
        </div>
      </div>

      {/* ── KEYWORD SEARCH CARD ── */}
      <div className="bg-white rounded border border-[#E2E5E8] hover:shadow-[0_4px_20px_rgba(0,0,0,0.10)] transition-shadow duration-200 rounded-lg px-5 py-4">
        <h2 className="text-sm font-semibold text-[#1A1A2E] mb-3 text-center">Keyword Search</h2>
        <div className="flex">
          <input type="search" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            placeholder="e.g. Design, Mumbai, Infosys"
            className="flex-1 px-3 py-2 text-sm border border-[#E2E5E8] rounded-l bg-white placeholder-[#9199A3]
                       focus:outline-none focus:border-[#008BCA] focus:ring-1 focus:ring-[#008BCA]/20 transition-colors"
            aria-label="Search internships by keyword" />
          <button className="px-3 py-2 bg-[#008BCA] hover:bg-[#0077b5] text-white rounded-r transition-colors" aria-label="Search">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
          </button>
        </div>
      </div>

    </div>
  );
}
