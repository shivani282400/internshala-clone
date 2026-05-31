'use client';
import React, { useState, memo, useCallback, useRef } from 'react';
import type { Internship } from '@/types/internship';
import { getLogoUrl, getCompanyInitials } from '@/utils/filterUtils';

// ─── AI Summary Cache ─────────────────────────────────────────────────────────
// Module-level Map — persists for the browser session across re-renders/unmounts.
// Key: internship.id, Value: summary string
// Why not useState/useRef? Those reset on unmount. This survives list re-renders.
const summaryCache = new Map<number, string>();

// ─── InternshipCard ───────────────────────────────────────────────────────────
const InternshipCard = memo(({ internship, isSaved, onToggleSaved }: { internship: Internship; isSaved?: boolean; onToggleSaved?: (id: number) => void }) => {
  const [logoError,      setLogoError]      = useState(false);
  const [summary,        setSummary]        = useState<string | null>(summaryCache.get(internship.id) ?? null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError,   setSummaryError]   = useState<string | null>(null);
  const [summaryOpen,    setSummaryOpen]    = useState(false);

  // Prevent double-firing if user clicks while a request is in-flight
  const inFlight = useRef(false);

  const logoUrl = getLogoUrl(internship.company_logo);
  const initials = getCompanyInitials(internship.company_name);
  const detailUrl = `https://internshala.com/internship/detail/${internship.url}`;

  const handleGenerateSummary = useCallback(async () => {
    // Already have it — just toggle open
    if (summary) { setSummaryOpen(o => !o); return; }
    if (inFlight.current) return;

    inFlight.current = true;
    setSummaryLoading(true);
    setSummaryError(null);
    setSummaryOpen(true);

    try {
      const res = await fetch('/api/summarise', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(internship),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error ?? 'Failed to generate summary');
      }

      summaryCache.set(internship.id, data.summary);
      setSummary(data.summary);
    } catch (err) {
      setSummaryError(err instanceof Error ? err.message : 'Something went wrong');
      setSummaryOpen(false);
    } finally {
      setSummaryLoading(false);
      inFlight.current = false;
    }
  }, [internship, summary]);

  return (
    <article
      className="bg-white rounded border border-[#E2E5E8] hover:shadow-[0_4px_20px_rgba(0,0,0,0.10)] transition-shadow duration-200 rounded-lg p-5 animate-fade-in"
      aria-label={`${internship.title} at ${internship.company_name}`}
    >
      {/* Row 1: Title + Logo */}
      <div className="flex items-start justify-between gap-3 mb-1">
        <h2 className="text-base font-semibold text-[#1A1A2E] leading-snug hover:text-[#008BCA] transition-colors flex-1 min-w-0 flex items-center gap-2 flex-wrap">
          <a href={detailUrl} target="_blank" rel="noopener noreferrer" className="line-clamp-2">
            {internship.title}
          </a>
          {isSaved && (
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-red-600 bg-red-50 border border-red-100 px-1.5 py-0.5 rounded select-none">
              ❤️ Saved
            </span>
          )}
        </h2>
        <div className="flex-shrink-0 w-14 h-10 border border-[#E2E5E8] rounded bg-white flex items-center justify-center overflow-hidden">
          {logoUrl && !logoError ? (
            <img src={logoUrl} alt={`${internship.company_name} logo`}
              className="w-full h-full object-contain p-1" onError={() => setLogoError(true)} loading="lazy" />
          ) : (
            <span className="text-sm font-bold text-[#008BCA]">{initials}</span>
          )}
        </div>
      </div>

      {/* Row 2: Company + Actively Hiring */}
      <div className="flex items-center gap-2 mb-3">
        <p className="text-sm text-[#4d4d4d] font-medium">{internship.company_name}</p>
        {internship.application_status_message?.to_show && (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#1BAC4B] bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-[#1BAC4B]" aria-hidden="true" />
            {internship.application_status_message.message || 'Actively hiring'}
          </span>
        )}
      </div>

      {/* Row 3: Meta */}
      <dl className="flex flex-wrap items-center gap-x-5 gap-y-1.5 mb-3">
        <MetaItem icon={<LocIcon />} label="Location">
          {internship.work_from_home
            ? `Work From Home${internship.location_names.length ? ` (${internship.location_names.join(', ')})` : ''}`
            : internship.location_names.join(', ')}
        </MetaItem>
        <MetaItem icon={<StipendIcon />} label="Stipend">{internship.stipend.salary}</MetaItem>
        <MetaItem icon={<CalIcon />} label="Duration">{internship.duration}</MetaItem>
      </dl>

      {/* Badges */}
      {(internship.is_ppo || internship.part_time || internship.is_premium) && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {internship.is_ppo     && <Badge color="green"  label="★ PPO" />}
          {internship.part_time  && <Badge color="purple" label="Part-time" />}
          {internship.is_premium && <Badge color="amber"  label="★ Premium" />}
        </div>
      )}

      {/* ── AI Summary Panel ─────────────────────────────────────────────── */}
      {summaryOpen && (
        <div className="mt-3 mb-1 rounded-lg border border-purple-200 bg-purple-50 px-4 py-3">
          {summaryLoading ? (
            <div className="flex items-center gap-2 text-sm text-purple-600">
              {/* Animated sparkle while loading */}
              <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707"/>
              </svg>
              <span>Generating AI summary…</span>
            </div>
          ) : summary ? (
            <div>
              <p className="text-[11px] font-semibold text-purple-500 uppercase tracking-wide mb-2 flex items-center gap-1">
                <SparkleIcon />
                AI Summary
              </p>
              {/* Split on newlines, render each bullet */}
              <ul className="space-y-1" aria-label="AI-generated internship summary">
                {summary
                  .split('\n')
                  .map(line => line.trim())
                  .filter(Boolean)
                  .map((line, i) => (
                    <li key={i} className="text-sm text-purple-900 leading-snug">{line}</li>
                  ))}
              </ul>
            </div>
          ) : null}
        </div>
      )}

      {summaryError && (
        <p className="mt-2 text-xs text-red-500" role="alert">{summaryError}</p>
      )}

      {/* Footer */}
      <div className="border-t border-[#E2E5E8] mt-2 pt-2.5 flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          {internship.expiring_in ? (
            <div className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-[#9199A3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <span className="text-xs text-[#9199A3]">{internship.expiring_in}</span>
            </div>
          ) : null}
        </div>

        <div className="flex items-center gap-2 ml-auto">
          {/* Save/Saved button */}
          <button
            onClick={() => onToggleSaved?.(internship.id)}
            aria-label={isSaved ? "Remove saved internship" : "Save internship"}
            className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border transition-all duration-150 cursor-pointer
              ${isSaved
                ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'
                : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
              }`}
          >
            <span aria-hidden="true">{isSaved ? '❤️' : '♡'}</span>
            {isSaved ? 'Saved' : 'Save'}
          </button>

          {/* AI Summary button */}
          <button
            onClick={handleGenerateSummary}
            disabled={summaryLoading}
            aria-label={summaryOpen && summary ? 'Hide AI summary' : `Generate AI summary for ${internship.title}`}
            aria-expanded={summaryOpen}
            className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border transition-all duration-150
              ${summaryOpen && summary
                ? 'bg-purple-100 text-purple-700 border-purple-300 hover:bg-purple-50'
                : 'bg-white text-purple-600 border-purple-300 hover:bg-purple-50'}
              disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <SparkleIcon />
            {summaryLoading
              ? 'Generating…'
              : summaryOpen && summary
                ? 'Hide summary'
                : summary
                  ? 'AI Summary'
                  : 'AI Summary'}
          </button>

          {/* Apply now */}
          <a href={detailUrl} target="_blank" rel="noopener noreferrer"
            className="text-xs font-semibold text-[#008BCA] border border-[#008BCA] px-4 py-1.5 rounded-full
                       hover:bg-[#008BCA] hover:text-white transition-all duration-150 whitespace-nowrap">
            Apply now
          </a>
        </div>
      </div>
    </article>
  );
});

InternshipCard.displayName = 'InternshipCard';

// ─── Sub-components ───────────────────────────────────────────────────────────

const MetaItem = ({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) => (
  <div className="flex items-center gap-1.5">
    <span className="text-[#9199A3] flex-shrink-0" aria-hidden="true">{icon}</span>
    <dt className="sr-only">{label}:</dt>
    <dd className="text-sm text-[#4d4d4d]">{children}</dd>
  </div>
);

const Badge = ({ color, label }: { color: 'green' | 'purple' | 'amber'; label: string }) => {
  const cls = {
    green:  'text-green-700 bg-green-50 border-green-200',
    purple: 'text-purple-700 bg-purple-50 border-purple-200',
    amber:  'text-amber-700 bg-amber-50 border-amber-200',
  }[color];
  return <span className={`text-[11px] font-semibold border px-2 py-0.5 rounded-full ${cls}`}>{label}</span>;
};

const SparkleIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"/>
  </svg>
);

const LocIcon     = () => <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>;
const StipendIcon = () => <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg>;
const CalIcon     = () => <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>;

export default InternshipCard;
