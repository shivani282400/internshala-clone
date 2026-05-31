import { describe, it, expect } from 'vitest';
import { applyFilters, sortInternships, parseDurationMonths } from '../utils/filterUtils';
import type { Internship, FilterState } from '../types/internship';

function make(overrides: Partial<Internship> = {}): Internship {
  return {
    id: 1, title: 'Dev Intern', company_name: 'Acme', company_url: '', company_logo: '',
    is_premium: false, is_ppo: false, work_from_home: false, profile_name: 'Web Development',
    part_time: false, start_date: 'Immediately', duration: '3 Months',
    stipend: { salary: '₹10,000', salaryValue1: 10000, salaryValue2: null, salaryType: 'fixed', currency: 'INR', scale: 'permonth' },
    posted_on: '1 day ago', application_deadline: '30 Jun', expiring_in: '1 day ago',
    location_names: ['Delhi'], url: 'test', is_active: true,
    application_status_message: { to_show: false, message: '', type: '' },
    ...overrides,
  };
}

const noFilters: FilterState = { profiles: [], locations: [], durations: [], stipend: 'any', searchQuery: '', workFromHome: false, partTime: false };

const data = [
  make({ id: 1, profile_name: 'Web Development', location_names: ['Delhi'],   stipend: { salary: '₹10,000', salaryValue1: 10000, salaryValue2: null, salaryType: 'fixed', currency: 'INR', scale: 'permonth' }, duration: '3 Months' }),
  make({ id: 2, profile_name: 'Data Science',    location_names: ['Mumbai'],  stipend: { salary: '₹5,000',  salaryValue1: 5000,  salaryValue2: null, salaryType: 'fixed', currency: 'INR', scale: 'permonth' }, duration: '2 Months' }),
  make({ id: 3, profile_name: 'Marketing',       location_names: [],          stipend: { salary: 'Unpaid',  salaryValue1: 0,     salaryValue2: null, salaryType: 'fixed', currency: 'INR', scale: 'permonth' }, duration: '1 Month',  work_from_home: true }),
  make({ id: 4, profile_name: 'Web Development', location_names: ['Bangalore'],stipend: { salary: '₹20,000',salaryValue1: 20000, salaryValue2: null, salaryType: 'fixed', currency: 'INR', scale: 'permonth' }, duration: '6 Months', part_time: true }),
];

describe('parseDurationMonths', () => {
  it('parses "3 Months" → 3', () => expect(parseDurationMonths('3 Months')).toBe(3));
  it('parses "1 Month" → 1',  () => expect(parseDurationMonths('1 Month')).toBe(1));
  it('returns 0 for ""',      () => expect(parseDurationMonths('')).toBe(0));
});

describe('applyFilters', () => {
  it('returns all when no filters', () => expect(applyFilters(data, noFilters)).toHaveLength(4));
  it('filters by profile',          () => expect(applyFilters(data, { ...noFilters, profiles: ['Web Development'] })).toHaveLength(2));
  it('filters by location',         () => expect(applyFilters(data, { ...noFilters, locations: ['Mumbai'] })).toHaveLength(1));
  it('filters WFH via location',    () => expect(applyFilters(data, { ...noFilters, locations: ['Work From Home'] })).toHaveLength(1));
  it('filters by WFH toggle',       () => expect(applyFilters(data, { ...noFilters, workFromHome: true })).toHaveLength(1));
  it('filters by part-time toggle', () => expect(applyFilters(data, { ...noFilters, partTime: true })).toHaveLength(1));
  it('filters stipend ≥ 5000',      () => expect(applyFilters(data, { ...noFilters, stipend: '5000' }).every(i => i.stipend.salaryValue1 >= 5000)).toBe(true));
  it('filters unpaid',              () => expect(applyFilters(data, { ...noFilters, stipend: '0' })).toHaveLength(1));
  it('filters duration 3 months',   () => expect(applyFilters(data, { ...noFilters, durations: ['3'] })).toHaveLength(1));
  it('filters duration 6+ months',  () => expect(applyFilters(data, { ...noFilters, durations: ['6'] })).toHaveLength(1));
  it('filters by search query',     () => expect(applyFilters(data, { ...noFilters, searchQuery: 'data' })).toHaveLength(1));
  it('AND logic — profile+stipend', () => expect(applyFilters(data, { ...noFilters, profiles: ['Web Development'], stipend: '10000' })).toHaveLength(2));
  it('returns empty for no match',  () => expect(applyFilters(data, { ...noFilters, profiles: ['NonExistent'] })).toHaveLength(0));
});

describe('sortInternships', () => {
  it('sorts stipend high→low', () => {
    const r = sortInternships(data, 'stipend_high');
    expect(r[0].stipend.salaryValue1).toBe(20000);
    expect(r[r.length - 1].stipend.salaryValue1).toBe(0);
  });
  it('sorts stipend low→high', () => {
    const r = sortInternships(data, 'stipend_low');
    expect(r[0].stipend.salaryValue1).toBe(0);
  });
  it('does not mutate original', () => {
    const orig = [...data];
    sortInternships(data, 'stipend_high');
    expect(data).toEqual(orig);
  });
});
