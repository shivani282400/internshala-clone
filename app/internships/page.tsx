'use client';
import React, { useState, useCallback, useMemo } from 'react';
import Navbar from '@/components/common/Navbar';
import FilterSidebar from '@/components/internships/FilterSidebar';
import InternshipList from '@/components/internships/InternshipList';
import ActiveFilterChips from '@/components/common/ActiveFilterChips';
import { useInternships } from '@/hooks/useInternships';
import { useSavedInternships } from '@/hooks/useSavedInternships';
import { useFilterStore } from '@/store/filterStore';
import type { SortOption } from '@/types/internship';

export default function InternshipsPage() {
  const [sortBy, setSortBy] = useState<SortOption>('relevance');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'saved'>('all');

  const { filteredInternships, availableProfiles, availableLocations,
    isLoading, isError, error, totalCount, filteredCount, refetch,
    loadMore, hasNextPage, isLoadingMore } = useInternships({ sortBy });
  const { savedIdSet, savedCount, toggleSaved } = useSavedInternships();

  const { hasActiveFilters, activeFilterCount } = useFilterStore();
  const handleSort = useCallback((s: SortOption) => setSortBy(s), []);
  const handleLoadMore = useCallback(() => { void loadMore(); }, [loadMore]);
  const visibleInternships = useMemo(
    () => activeTab === 'saved'
      ? filteredInternships.filter((internship) => savedIdSet.has(internship.id))
      : filteredInternships,
    [activeTab, filteredInternships, savedIdSet],
  );
  const visibleCount = activeTab === 'saved' ? visibleInternships.length : filteredCount;

  return (
    <div className="min-h-screen bg-[#F6F7F8]">
      <Navbar />

      {/* Page header — "6407 Total Internships" */}
      <div className="bg-white border-b border-[#E2E5E8] py-5 text-center">
        {isLoading ? (
          <div className="h-7 w-56 bg-gray-200 animate-pulse-soft rounded mx-auto mb-2" />
        ) : (
          <h1 className="text-2xl font-bold text-[#1A1A2E]">
            {totalCount.toLocaleString()} Total Internship{totalCount !== 1 ? 's' : ''}
          </h1>
        )}
        <p className="text-sm text-[#9199A3] mt-1">Latest Summer Internships in India</p>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">

        {/* Mobile filter button */}
        <div className="md:hidden mb-4">
          <button onClick={() => setMobileFilterOpen(true)}
            className="flex items-center gap-2 px-4 py-2 border border-[#E2E5E8] rounded-lg bg-white text-sm font-medium text-[#4d4d4d] hover:bg-gray-50 transition-colors">
            <svg className="w-4 h-4 text-[#008BCA]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z"/>
            </svg>
            Filters
            {activeFilterCount() > 0 && (
              <span className="bg-[#008BCA] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {activeFilterCount()}
              </span>
            )}
          </button>
        </div>

        <ActiveFilterChips />

        <div className="flex flex-wrap gap-2 mb-4" role="tablist" aria-label="Internship views">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'all'}
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded border text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-[#008BCA]/30 ${
              activeTab === 'all'
                ? 'bg-[#008BCA] text-white border-[#008BCA]'
                : 'bg-white text-[#4d4d4d] border-[#E2E5E8] hover:bg-gray-50'
            }`}
          >
            All Internships
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'saved'}
            onClick={() => setActiveTab('saved')}
            className={`px-4 py-2 rounded border text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-[#008BCA]/30 ${
              activeTab === 'saved'
                ? 'bg-[#008BCA] text-white border-[#008BCA]'
                : 'bg-white text-[#4d4d4d] border-[#E2E5E8] hover:bg-gray-50'
            }`}
          >
            Saved ({savedCount})
          </button>
        </div>

        <div className="flex gap-5 mt-3">
          {/* Sidebar */}
          <aside className="hidden md:block w-[270px] flex-shrink-0">
            <FilterSidebar availableProfiles={availableProfiles} availableLocations={availableLocations} />
          </aside>

          {/* List */}
          <div className="flex-1 min-w-0">
            <InternshipList
              internships={visibleInternships}
              isLoading={isLoading} isError={isError} errorMessage={error?.message}
              hasFilters={hasActiveFilters()} totalCount={totalCount} filteredCount={visibleCount}
              sortBy={sortBy} onSortChange={handleSort} onRetry={refetch}
              hasNextPage={activeTab === 'all' && hasNextPage} isLoadingMore={isLoadingMore} onLoadMore={handleLoadMore}
              savedIdSet={savedIdSet} onToggleSaved={toggleSaved} isSavedView={activeTab === 'saved'}
            />
          </div>
        </div>
      </main>

      {/* Mobile drawer */}
      {mobileFilterOpen && (
        <>
          <div className="fixed inset-0 bg-black/40 z-30 md:hidden animate-fade-in"
            onClick={() => setMobileFilterOpen(false)} aria-hidden="true" />
          <div className="fixed inset-y-0 left-0 w-[300px] max-w-[90vw] bg-[#F6F7F8] z-40
                         overflow-y-auto shadow-2xl md:hidden animate-slide-in p-4"
            role="dialog" aria-modal="true" aria-label="Filters">
            <div className="flex justify-between items-center mb-4">
              <span className="font-semibold text-[#1A1A2E]">Filters</span>
              <button onClick={() => setMobileFilterOpen(false)} className="text-[#9199A3] hover:text-[#1A1A2E] p-1">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
            <FilterSidebar availableProfiles={availableProfiles} availableLocations={availableLocations} />
          </div>
        </>
      )}
    </div>
  );
}
