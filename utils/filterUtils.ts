import type { Internship, FilterState, SortOption, DurationOption } from '../types/internship';

export function parseDurationMonths(duration: string): number {
  const match = duration.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
}

function matchesDuration(internship: Internship, durations: DurationOption[]): boolean {
  if (durations.length === 0) return true;
  const months = parseDurationMonths(internship.duration);
  return durations.some((d) => {
    if (d === '6') return months >= 6;
    return months === parseInt(d, 10);
  });
}

export function applyFilters<T extends Internship>(internships: T[], filters: FilterState): T[] {
  return internships.filter((internship) => {
    if (filters.profiles.length > 0) {
      const matches = filters.profiles.some((p) =>
        internship.profile_name.toLowerCase().includes(p.toLowerCase()),
      );
      if (!matches) return false;
    }

    if (filters.locations.length > 0) {
      const internshipLocations = internship.work_from_home
        ? ['Work From Home', ...internship.location_names]
        : internship.location_names;
      const matches = filters.locations.some((loc) =>
        internshipLocations.some((il) => il.toLowerCase().includes(loc.toLowerCase())),
      );
      if (!matches) return false;
    }

    if (!matchesDuration(internship, filters.durations)) return false;

    if (filters.stipend !== 'any') {
      const min = parseInt(filters.stipend, 10);
      const val = internship.stipend.salaryValue1 ?? 0;
      if (filters.stipend === '0') { if (val !== 0) return false; }
      else { if (val < min) return false; }
    }

    if (filters.workFromHome && !internship.work_from_home) return false;
    if (filters.partTime && !internship.part_time) return false;

    if (filters.searchQuery.trim()) {
      const q = filters.searchQuery.toLowerCase();
      const searchable = [
        internship.title,
        internship.company_name,
        internship.profile_name,
        ...internship.location_names,
      ].join(' ').toLowerCase();
      if (!searchable.includes(q)) return false;
    }

    return true;
  });
}

export function sortInternships<T extends Internship>(internships: T[], sortBy: SortOption): T[] {
  const sorted = [...internships];
  switch (sortBy) {
    case 'stipend_high': return sorted.sort((a, b) => (b.stipend.salaryValue1 ?? 0) - (a.stipend.salaryValue1 ?? 0));
    case 'stipend_low':  return sorted.sort((a, b) => (a.stipend.salaryValue1 ?? 0) - (b.stipend.salaryValue1 ?? 0));
    case 'posted_recent': return sorted.sort((a, b) => b.id - a.id);
    default: return sorted;
  }
}

export function getLogoUrl(logo: string): string {
  if (!logo) return '';
  if (logo.startsWith('http')) return logo;
  return `https://internshala-uploaded.internshala.com/logo/${logo}`;
}

export function getCompanyInitials(name: string): string {
  return name.split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? '').join('');
}
