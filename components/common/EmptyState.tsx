'use client';
import React from 'react';
import { useFilterStore } from '@/store/filterStore';

const EmptyState = ({ hasFilters }: { hasFilters: boolean }) => {
  const clearAll = useFilterStore(s => s.clearAll);
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center" role="status">
      <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center mb-5">
        <svg className="w-10 h-10 text-[#008BCA]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h2 className="text-base font-semibold text-[#1A1A2E] mb-1">
        {hasFilters ? 'No internships match your filters' : 'No internships found'}
      </h2>
      <p className="text-sm text-[#9199A3] max-w-xs mb-5">
        {hasFilters ? 'Try adjusting or removing some filters to see more results.' : 'Check back later for new listings.'}
      </p>
      {hasFilters && (
        <button onClick={clearAll} className="px-4 py-2 bg-[#008BCA] text-white text-sm font-medium rounded-md hover:bg-[#0077b5] transition-colors">
          Clear all filters
        </button>
      )}
    </div>
  );
};
export default EmptyState;
