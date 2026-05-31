'use client';
import React, { memo } from 'react';
import type { Internship, SortOption } from '@/types/internship';
import InternshipCard from './InternshipCard';
import { SkeletonGrid } from '../common/Skeleton';
import EmptyState from '../common/EmptyState';
import ErrorState from '../common/ErrorState';

const SORT_OPTIONS: { label: string; value: SortOption }[] = [
  { label: 'Relevance',            value: 'relevance' },
  { label: 'Stipend: High → Low',  value: 'stipend_high' },
  { label: 'Stipend: Low → High',  value: 'stipend_low' },
  { label: 'Recently Posted',      value: 'posted_recent' },
];

interface Props {
  internships: Internship[];
  isLoading: boolean; isError: boolean; errorMessage?: string;
  hasFilters: boolean; totalCount: number; filteredCount: number;
  sortBy: SortOption; onSortChange: (s: SortOption) => void; onRetry?: () => void;
  hasNextPage: boolean; isLoadingMore: boolean; onLoadMore: () => void;
  savedIdSet: Set<number>; onToggleSaved: (id: number) => void;
  isSavedView: boolean;
}

const InternshipList = memo(({ internships, isLoading, isError, errorMessage, hasFilters,
  totalCount, filteredCount, sortBy, onSortChange, onRetry,
  hasNextPage, isLoadingMore, onLoadMore, savedIdSet, onToggleSaved, isSavedView }: Props) => {
  if (isLoading) return <SkeletonGrid count={6} />;
  if (isError)   return <ErrorState message={errorMessage} onRetry={onRetry} />;

  return (
    <section aria-label="Internship listings">
      {internships.length > 0 && (
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <p className="text-sm text-[#9199A3]" aria-live="polite">
            Showing <span className="font-semibold text-[#1A1A2E]">{filteredCount.toLocaleString()}</span>
            {hasFilters && totalCount !== filteredCount && (
              <> of <span className="font-semibold text-[#1A1A2E]">{totalCount.toLocaleString()}</span></>
            )} internship{filteredCount !== 1 ? 's' : ''}
          </p>
          <label className="flex items-center gap-2 text-sm text-[#9199A3]">
            Sort by:
            <select value={sortBy} onChange={e => onSortChange(e.target.value as SortOption)}
              className="text-sm text-[#1A1A2E] border border-[#E2E5E8] rounded px-2 py-1 bg-white
                         focus:outline-none focus:ring-1 focus:ring-[#008BCA]/30 cursor-pointer">
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </label>
        </div>
      )}
      {internships.length === 0
        ? isSavedView
          ? (
            <div className="bg-white rounded border border-[#E2E5E8] px-5 py-10 text-center flex flex-col items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-3">
                <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
              </div>
              <h2 className="text-base font-semibold text-[#1A1A2E] mb-1">No saved internships yet</h2>
              <p className="text-sm text-[#9199A3] max-w-sm">Save internships to quickly access them later.</p>
            </div>
          )
          : <EmptyState hasFilters={hasFilters} />
        : <ul className="space-y-3" role="list">
            {internships.map(i => (
              <li key={i.id}>
                <InternshipCard internship={i} isSaved={savedIdSet.has(i.id)} onToggleSaved={onToggleSaved} />
              </li>
            ))}
          </ul>}
      {hasNextPage && internships.length > 0 && (
        <div className="flex justify-center mt-5">
          <button
            type="button"
            onClick={onLoadMore}
            disabled={isLoadingMore}
            className="text-sm font-semibold text-white bg-[#008BCA] hover:bg-[#0077b5] disabled:bg-[#9199A3]
                       px-5 py-2 rounded transition-colors duration-150"
          >
            {isLoadingMore ? 'Loading...' : 'Load More'}
          </button>
        </div>
      )}
    </section>
  );
});

InternshipList.displayName = 'InternshipList';
export default InternshipList;
