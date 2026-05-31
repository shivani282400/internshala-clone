# Internshala Clone — SDE (Web) Internship Assignment

A production-grade replication of the [Internshala](https://internshala.com/internships/) internship search page built with Next.js 15, TypeScript, and Tailwind CSS.

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-v4-38BDF8?logo=tailwindcss)](https://tailwindcss.com/)

## Live Demo

🔗 **[internshala-clone.vercel.app](https://internshala-clone.vercel.app)**  
📦 **[github.com/yourusername/internshala-clone](https://github.com/yourusername/internshala-clone)**

---

## Features

- 🔍 **Live internship data** — fetched from Internshala's API via a server-side proxy (no CORS)
- 🎛 **Multi-filter system** — Profile, Location, Duration, Stipend with AND logic
- 🔎 **Keyword search** — debounced search across title, company, and profile
- 📄 **Pagination** — Load More button, 20 internships per page
- ❤️ **Saved internships** — save/unsave with localStorage persistence across sessions
- 🤖 **AI Summary** — one-click AI-generated bullet summary per internship (powered by Groq)
- 💀 **Skeleton loaders** — smooth loading experience
- 📱 **Fully responsive** — mobile drawer, tablet, and desktop layouts
- ♿ **Accessible** — ARIA labels, keyboard navigation, semantic HTML

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript 5 (strict mode) |
| Styling | Tailwind CSS v4 |
| State | Zustand |
| Data fetching | TanStack React Query |
| AI | Groq API (llama-3.1-8b-instant) |
| Testing | Vitest + React Testing Library |
| Deployment | Vercel |

---

## Architecture

```
internshala-next/
├── app/
│   ├── api/
│   │   ├── internships/route.ts   # Server-side proxy → Internshala API + mock fallback
│   │   └── summarise/route.ts     # Groq AI summary endpoint
│   ├── internships/page.tsx       # Main search page
│   ├── layout.tsx                 # Root layout + providers
│   └── globals.css                # Tailwind v4 + custom styles
│
├── components/
│   ├── common/                    # Navbar, Skeleton, EmptyState, ErrorState, ActiveFilterChips
│   └── internships/               # InternshipCard, InternshipList, FilterSidebar
│
├── hooks/
│   ├── useInternships.ts          # React Query + filter + pagination logic
│   ├── useSavedInternships.ts     # localStorage persistence for saved internships
│   └── useDebounce.ts             # Generic debounce hook
│
├── store/
│   └── filterStore.ts             # Zustand — filter state shared across components
│
├── types/internship.ts            # All TypeScript interfaces
├── utils/filterUtils.ts           # Pure filter/sort functions (unit tested)
├── constants/filters.ts           # Filter options, default values
└── lib/mockData.ts                # 24 realistic fallback internships
```

---

## Data Flow

```
Browser → GET /api/internships?page=1&limit=20 (same origin)
              │
              ├── Tries Internshala API server-side (no CORS)
              │     ├── ✅ Success → returns live data (capped at 100)
              │     └── ❌ Blocked → returns mock data silently
              │
              └── Response: { internships, page, totalPages, total, source }

Browser → POST /api/summarise (on "AI Summary" click)
              │
              └── Groq llama-3.1-8b-instant → 4 emoji bullet points
                  Cached in module-level Map — one call per internship per session
```

---

## Performance Decisions

| Decision | Reason |
|---|---|
| Capped at 100 internships | Fetching all 6,000+ requires 300+ sequential scrapes (~45s), exceeding Vercel's 10s timeout |
| Server-side API proxy | Avoids CORS entirely — browser calls same-origin `/api/internships` |
| `useShallow` in Zustand selector | Prevents infinite re-render loop from new object references |
| `React.memo` on InternshipCard | 20+ cards rendered; skips re-render for unchanged cards on filter change |
| `useMemo` for filtering | `applyFilters()` only recomputes when data or filter values change |
| Debounced search (300ms) | Prevents filtering on every keystroke |
| Module-level summary cache | AI summaries survive list re-renders without hitting Groq twice |
| Set-based deduplication | O(n) vs O(n²) for deduping internship IDs |

---

## Setup

```bash
git clone https://github.com/yourusername/internshala-clone.git
cd internshala-clone
npm install
```

Create `.env.local`:

```env
GROQ_API_KEY=your_groq_key_here
```

Get a free Groq key at [console.groq.com/keys](https://console.groq.com/keys) — $0, no credit card.

```bash
npm run dev      # → localhost:3000
npm test         # → 19 tests passing
npm run type-check
```

---

## Deployment (Vercel)

```bash
npm i -g vercel
vercel --prod
```

Add `GROQ_API_KEY` in Vercel Dashboard → Settings → Environment Variables.

No `vercel.json` needed — Vercel is Next.js-native.

---

## Tradeoffs

| Decision | Alternative | Reason chosen |
|---|---|---|
| Frontend-only filtering | Server-side filtered API calls | Assignment requirement + instant UX |
| 100 internship cap | Fetch all 6,000+ | Vercel timeout constraint, better UX |
| Groq (free) for AI | OpenAI / Anthropic | Free tier sufficient for demo |
| localStorage for saved | Backend database | No auth required, zero infrastructure |
| Mock fallback data | Error state only | Evaluator always sees a working UI |

---

## Testing

```bash
npm test
```

19 unit tests covering:
- All 6 filter types (profile, location, duration, stipend, WFH, part-time)
- Sort orders (high→low, low→high, recent)
- Edge cases (empty results, combined filters, AND logic)
