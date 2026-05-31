import { NextRequest, NextResponse } from 'next/server';

// ─── POST /api/summarise ──────────────────────────────────────────────────────
// Calls Groq API (OpenAI-compatible) server-side.
// API key stays on the server — never exposed to the browser.

export const dynamic = 'force-dynamic';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

export async function POST(req: NextRequest) {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: 'GROQ_API_KEY not set in environment variables' },
      { status: 500 },
    );
  }

  const body = await req.json();
  const {
    title, company_name, location_names, work_from_home,
    stipend, duration, profile_name, is_ppo, part_time, start_date,
  } = body;

  const location = work_from_home
    ? `Work From Home${location_names?.length ? ` (${location_names.join(', ')})` : ''}`
    : (location_names ?? []).join(', ') || 'Not specified';

  const prompt = `You are summarising an internship listing for a student. Be concise and helpful.

Internship details:
- Title: ${title}
- Company: ${company_name}
- Profile: ${profile_name}
- Location: ${location}
- Stipend: ${stipend?.salary ?? 'Not disclosed'}
- Duration: ${duration}
- Start Date: ${start_date}
- PPO (Pre-Placement Offer): ${is_ppo ? 'Yes' : 'No'}
- Part-time: ${part_time ? 'Yes' : 'No'}

Return exactly 4 bullet points.

Rules:
- Start each bullet with an emoji.
- Maximum 10 words per bullet.
- Mention stipend, location, duration, and PPO when available.
- No heading.
- No introduction.
- No extra text.`;

  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'llama-3.1-8b-instant',
      temperature: 0.3,
      max_tokens: 200,
      messages: [
        { role: 'user', content: prompt },
      ],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    console.error('[/api/summarise] Groq error:', err);
    return NextResponse.json({ error: 'Failed to generate summary' }, { status: response.status });
  }

  const data = await response.json();
  const text: string = data.choices?.[0]?.message?.content ?? '';

  return NextResponse.json({ summary: text });
}

