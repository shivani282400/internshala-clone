import { NextResponse } from 'next/server';
import type { Internship } from '@/types/internship';
import { MOCK_INTERNSHIPS } from '@/lib/mockData';

// ─── GET /api/internships ─────────────────────────────────────────────────────
//
// Acts as a same-origin CORS proxy for the Internshala API.
// The browser calls /api/internships (same origin = no CORS).
// This route calls internshala.com server-side — no browser CORS restriction.
//
// Why this works:
//   Browser → /api/internships (same origin ✅)
//   Server  → internshala.com  (server-to-server, no CORS ✅)
//
// Fallback: if Internshala's API is unreachable (IP block, timeout, etc.),
//           we return realistic mock internships so the UI never breaks.

export const revalidate = 300;

const INTERNSHALA_URL = 'https://internshala.com/internships_ajax/';
const MAX_RESULTS = 100;

type InternshalaAjaxResponse = {
  internship_list_html: string;
  next_page_number?: number;
  is_last_page?: boolean;
  seo?: { heading?: string };
};

const REQUEST_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept': 'application/json, text/javascript, */*; q=0.01',
  'Accept-Language': 'en-US,en;q=0.9',
  'X-Requested-With': 'XMLHttpRequest',
  'Referer': 'https://internshala.com/internships/',
};

function decodeHtml(value: string): string {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

function cleanText(value = ''): string {
  return decodeHtml(value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim());
}

function extract(pattern: RegExp, html: string): string {
  return pattern.exec(html)?.[1] ?? '';
}

function parseSalaryValue(stipend: string): number {
  const match = stipend.replace(/,/g, '').match(/\d+/);
  return match ? parseInt(match[0], 10) : 0;
}

function parseInternships(html: string): Internship[] {
  const marker = '<div class="container-fluid individual_internship';

  return html
    .split(marker)
    .slice(1)
    .map((chunk) => `${marker}${chunk}`)
    .map((card) => {
      const id = parseInt(extract(/internshipId="(\d+)"/, card), 10);
      const href = extract(/data-href='([^']+)'/, card) || extract(/href="([^"]*\/internship\/detail\/[^"]+)"/, card);
      const title = cleanText(extract(/class="job-title-href"[^>]*>([\s\S]*?)<\/a>/, card));
      const company_name = cleanText(extract(/<p class="company-name">\s*([\s\S]*?)\s*<\/p>/, card));
      const logoSrc = extract(/<div class="internship_logo">[\s\S]*?<img src="([^"]+)"/, card);
      const stipendText = cleanText(extract(/<span class='stipend'>([\s\S]*?)<\/span>/, card));
      const rowHtml = extract(/<div class="detail-row-1">([\s\S]*?)<\/div>\s*<\/div>/, card);
      const rowValues = [...rowHtml.matchAll(/<span[^>]*>([\s\S]*?)<\/span>/g)].map((match) => cleanText(match[1]));
      const work_from_home = /Work from home/i.test(rowValues[0] ?? '');
      const location_names = work_from_home ? [] : (rowValues[0] ? rowValues[0].split(',').map((l) => l.trim()) : []);
      const duration = rowValues[rowValues.length - 1] ?? '';
      const posted_on = cleanText(extract(/status-success[\s\S]*?<span>([\s\S]*?)<\/span>/, card));
      const part_time = /<span>\s*Part time\s*<\/span>/i.test(card);
      const activelyHiring = /actively-hiring-badge/i.test(card);
      const salaryType: Internship['stipend']['salaryType'] = /unpaid/i.test(stipendText) ? 'unpaid' : 'fixed';

      const internship: Internship = {
        id,
        title,
        company_name,
        company_url: '',
        company_logo: logoSrc.startsWith('/static/') ? '' : logoSrc.split('/').pop() ?? '',
        is_premium: /premium/i.test(card),
        is_ppo: /With job offer/i.test(card),
        work_from_home,
        profile_name: title,
        part_time,
        start_date: 'Starts Immediately',
        duration,
        stipend: {
          salary: stipendText,
          salaryValue1: parseSalaryValue(stipendText),
          salaryValue2: null,
          salaryType,
          currency: 'INR',
          scale: stipendText.includes('/month') ? 'permonth' : '',
        },
        posted_on,
        application_deadline: '',
        expiring_in: posted_on,
        location_names,
        url: href.replace('/internship/detail/', ''),
        is_active: true,
        application_status_message: {
          to_show: activelyHiring,
          message: activelyHiring ? 'Actively hiring' : '',
          type: 'success',
        },
      };
      return internship;
    })
    .filter((internship) => Number.isFinite(internship.id) && internship.title && internship.company_name);
}

function pageUrl(page: number): string {
  return page === 1 ? INTERNSHALA_URL : `${INTERNSHALA_URL}page-${page}/`;
}

async function fetchInternshalaPage(page: number, signal: AbortSignal): Promise<InternshalaAjaxResponse> {
  let res: Response | undefined;

  for (let attempt = 0; attempt < 3; attempt++) {
    res = await fetch(pageUrl(page), {
      signal,
      headers: REQUEST_HEADERS,
      next: { revalidate },
    });

    if (res.ok) break;
  }

  if (!res?.ok) throw new Error(`Internshala returned ${res?.status} for page ${page}`);
  return res.json();
}

function getTotalCount(data: InternshalaAjaxResponse, fallback: number): number {
  const headingCount = parseInt(data.seo?.heading?.replace(/,/g, '').match(/\d+/)?.[0] ?? '', 10);
  return Number.isFinite(headingCount) ? Math.min(headingCount, MAX_RESULTS) : fallback;
}

function uniqueById(internships: Internship[]): Internship[] {
  const seen = new Set<number>();

  return internships.filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}

async function fetchInternshipsForPage(signal: AbortSignal, neededCount: number): Promise<{ internships: Internship[]; total: number }> {
  const firstPage = await fetchInternshalaPage(1, signal);
  const internships = parseInternships(firstPage.internship_list_html);
  const total = getTotalCount(firstPage, internships.length);
  let nextPage = firstPage.next_page_number ?? 2;
  let reachedLastPage = firstPage.is_last_page ?? internships.length === 0;
  const targetCount = Math.min(neededCount, MAX_RESULTS, total);

  while (!reachedLastPage && internships.length < targetCount) {
    const pageData = await fetchInternshalaPage(nextPage, signal);
    const pageInternships = parseInternships(pageData.internship_list_html);
    internships.push(...pageInternships);

    if (internships.length >= MAX_RESULTS) break;

    reachedLastPage = pageData.is_last_page ?? pageInternships.length === 0;
    nextPage = pageData.next_page_number ?? nextPage + 1;
  }

  return { internships: uniqueById(internships).slice(0, MAX_RESULTS), total };
}

function paginate(internships: Internship[], page: number, limit: number): Internship[] {
  const start = (page - 1) * limit;
  return internships.slice(start, start + limit);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get('page') || 1);
  const limit = Number(searchParams.get('limit') || 20);
  const safePage = Number.isFinite(page) && page > 0 ? page : 1;
  const safeLimit = Number.isFinite(limit) && limit > 0 ? Math.min(limit, MAX_RESULTS) : 20;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);

    const { internships: allInternships, total } = await fetchInternshipsForPage(controller.signal, safePage * safeLimit);
    clearTimeout(timeout);
    const internships = paginate(allInternships, safePage, safeLimit);
    const totalPages = Math.ceil(total / safeLimit);

    return NextResponse.json(
      { internships, page: safePage, limit: safeLimit, total, totalPages, source: 'live' },
      { headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=300' } },
    );
  } catch (err) {
    // Internshala's WAF blocks server IPs — fall back to realistic mock data
    console.warn('[/api/internships] Live fetch failed, using mock:', err instanceof Error ? err.message : err);
    const total = Math.min(MOCK_INTERNSHIPS.length, MAX_RESULTS);
    const totalPages = Math.ceil(total / safeLimit);
    const internships = paginate(MOCK_INTERNSHIPS.slice(0, MAX_RESULTS), safePage, safeLimit);

    return NextResponse.json(
      { internships, page: safePage, limit: safeLimit, total, totalPages, source: 'mock' },
      { headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=300' } },
    );
  }
}
