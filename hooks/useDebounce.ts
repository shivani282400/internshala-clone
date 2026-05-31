'use client';

import { useState, useEffect } from 'react';
import { DEBOUNCE_DELAY_MS } from '../constants/filters';

export function useDebounce<T>(value: T, delay: number = DEBOUNCE_DELAY_MS): T {
  const [debounced, setDebounced] = useState<T>(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}
