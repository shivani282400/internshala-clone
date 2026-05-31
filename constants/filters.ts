import type { DurationOption, StipendRange } from '../types/internship';

export const STALE_TIME_MS = 5 * 60 * 1000;
export const DEBOUNCE_DELAY_MS = 300;

export const STIPEND_OPTIONS: { label: string; value: StipendRange }[] = [
  { label: 'Any',       value: 'any' },
  { label: 'Unpaid',    value: '0' },
  { label: '₹2,000+',  value: '2000' },
  { label: '₹5,000+',  value: '5000' },
  { label: '₹10,000+', value: '10000' },
  { label: '₹20,000+', value: '20000' },
];

export const DURATION_OPTIONS: { label: string; value: DurationOption }[] = [
  { label: '1 Month',   value: '1' },
  { label: '2 Months',  value: '2' },
  { label: '3 Months',  value: '3' },
  { label: '6+ Months', value: '6' },
];

export const DEFAULT_FILTERS = {
  profiles:     [] as string[],
  locations:    [] as string[],
  durations:    [] as DurationOption[],
  stipend:      'any' as StipendRange,
  searchQuery:  '',
  workFromHome: false,
  partTime:     false,
};
