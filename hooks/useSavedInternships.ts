'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useToastStore } from '@/store/toastStore';

const STORAGE_KEY = 'savedInternships';

function readSavedIds(): number[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];

    const parsed = JSON.parse(stored);
    return Array.isArray(parsed)
      ? parsed.filter((id): id is number => typeof id === 'number')
      : [];
  } catch {
    return [];
  }
}

export function useSavedInternships() {
  const [savedIds, setSavedIds] = useState<number[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    setSavedIds(readSavedIds());
  }, []);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(savedIds));
    }
  }, [savedIds, isMounted]);

  const savedIdSet = useMemo(() => new Set(savedIds), [savedIds]);

  const toggleSaved = useCallback((id: number) => {
    setSavedIds((current) => {
      const isCurrentlySaved = current.includes(id);
      if (isCurrentlySaved) {
        useToastStore.getState().addToast('Removed from saved internships', 'info');
        return current.filter((savedId) => savedId !== id);
      } else {
        useToastStore.getState().addToast('Internship saved', 'success');
        return [...current, id];
      }
    });
  }, []);

  const isSaved = useCallback((id: number) => savedIdSet.has(id), [savedIdSet]);

  return {
    savedIds,
    savedIdSet,
    savedCount: isMounted ? savedIds.length : 0,
    toggleSaved,
    isSaved,
  };
}
