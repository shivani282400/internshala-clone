'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useFilterStore } from '../store/filterStore';
import { applyFilters, sortInternships } from '../utils/filterUtils';
import { STALE_TIME_MS } from '../constants/filters';
import type { Internship, SortOption } from '../types/internship';

const PAGE_SIZE = 20;

interface InternshipsPage {
  internships: Internship[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  source: 'live' | 'mock';
}

async function fetchInternships(page: number): Promise<InternshipsPage> {
  const res = await fetch(`/api/internships?page=${page}&limit=${PAGE_SIZE}`);
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json();
}

export const internshipQueryKeys = {
  all:  ['internships'] as const,
  list: (limit: number) => [...internshipQueryKeys.all, 'list', limit] as const,
};

export function useInternships({ sortBy = 'relevance' }: { sortBy?: SortOption } = {}) {
  // useShallow: Zustand does a shallow comparison instead of reference equality,
  // so this selector doesn't return a new object every render → no infinite loop.
  const filters = useFilterStore(
    useShallow((s) => ({
      profiles:     s.profiles,
      locations:    s.locations,
      durations:    s.durations,
      stipend:      s.stipend,
      searchQuery:  s.searchQuery,
      workFromHome: s.workFromHome,
      partTime:     s.partTime,
    })),
  );

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: internshipQueryKeys.list(PAGE_SIZE),
    queryFn: ({ pageParam }) => fetchInternships(pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => (
      lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined
    ),
    staleTime: STALE_TIME_MS,
    retry: 2,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 8000),
  });

  const allInternships = useMemo(
    () => data?.pages.flatMap((page) => page.internships) ?? [],
    [data],
  );
  const latestPage = data?.pages.at(-1);

  const filteredInternships = useMemo(() => {
    const filtered = sortInternships(applyFilters(allInternships, filters), sortBy);
    return filtered;
  }, [allInternships, sortBy, filters]);

  const availableProfiles = useMemo(
    () => [...new Set(allInternships.map((i) => i.profile_name))].sort(),
    [allInternships],
  );

  const availableLocations = useMemo(
    () => [...new Set(allInternships.flatMap((i) =>
      i.work_from_home ? ['Work From Home'] : i.location_names,
    ))].sort(),
    [allInternships],
  );

  return {
    allInternships, filteredInternships,
    availableProfiles, availableLocations,
    totalCount:    latestPage?.total ?? allInternships.length,
    total:         latestPage?.total ?? allInternships.length,
    filteredCount: filteredInternships.length,
    page:          latestPage?.page ?? 1,
    totalPages:    latestPage?.totalPages ?? 1,
    loadMore:      fetchNextPage,
    hasNextPage:   Boolean(hasNextPage),
    isLoadingMore: isFetchingNextPage,
    isLoading, isError, error: error as Error | null, refetch,
  };
}
