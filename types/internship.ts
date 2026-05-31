// ─── Core domain types ────────────────────────────────────────────────────────

export interface StipendInfo {
  salary: string;
  salaryValue1: number;
  salaryValue2: number | null;
  salaryType: 'fixed' | 'negotiable' | 'unpaid' | 'performance_based';
  currency: string;
  scale: string;
}

export interface ApplicationStatusMessage {
  to_show: boolean;
  message: string;
  type: string;
}

export interface Internship {
  id: number;
  title: string;
  company_name: string;
  company_url: string;
  company_logo: string;
  is_premium: boolean;
  is_ppo: boolean;
  work_from_home: boolean;
  profile_name: string;
  part_time: boolean;
  start_date: string;
  duration: string;
  stipend: StipendInfo;
  posted_on: string;
  application_deadline: string;
  expiring_in: string;
  location_names: string[];
  url: string;
  is_active: boolean;
  application_status_message: ApplicationStatusMessage;
}

// ─── API response shape ───────────────────────────────────────────────────────

export interface InternshipsApiResponse {
  internships_meta: Record<string, Internship>;
  internship_ids?: number[];
  total_count?: number;
}

// ─── Filter types ─────────────────────────────────────────────────────────────

export type StipendRange = 'any' | '0' | '2000' | '5000' | '10000' | '20000';
export type DurationOption = 'any' | '1' | '2' | '3' | '6';
export type SortOption = 'relevance' | 'stipend_high' | 'stipend_low' | 'posted_recent';

export interface FilterState {
  profiles: string[];
  locations: string[];
  durations: DurationOption[];
  stipend: StipendRange;
  searchQuery: string;
  workFromHome: boolean;
  partTime: boolean;
}
