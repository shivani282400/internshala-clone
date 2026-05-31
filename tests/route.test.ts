import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from '@/app/api/summarise/route';

describe('POST /api/summarise', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  const mockInternship = {
    title: 'Software Engineering Intern',
    company_name: 'Test Corp',
    profile_name: 'Engineering',
    location_names: ['Mumbai', 'Bangalore'],
    work_from_home: false,
    stipend: { salary: '₹15,000 /month' },
    duration: '3 Months',
    start_date: 'Immediately',
    is_ppo: true,
    part_time: false,
  };

  it('should return 500 error if GROQ_API_KEY is not set', async () => {
    delete process.env.GROQ_API_KEY;

    const req = new NextRequest('http://localhost/api/summarise', {
      method: 'POST',
      body: JSON.stringify(mockInternship),
    });

    const res = await POST(req);
    expect(res.status).toBe(500);

    const json = await res.json();
    expect(json).toEqual({
      error: 'GROQ_API_KEY not set in environment variables',
    });
  });

  it('should call Groq API and return the summary when API key is set', async () => {
    process.env.GROQ_API_KEY = 'test_groq_key_123';

    const mockGroqResponse = {
      choices: [
        {
          message: {
            content: '🚀 Stipend: ₹15,000 /month\n📍 Location: Mumbai, Bangalore\n📅 Duration: 3 Months\n✨ PPO available upon completion',
          },
        },
      ],
    };

    const fetchMock = vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockGroqResponse,
    } as Response);

    const req = new NextRequest('http://localhost/api/summarise', {
      method: 'POST',
      body: JSON.stringify(mockInternship),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json).toEqual({
      summary: '🚀 Stipend: ₹15,000 /month\n📍 Location: Mumbai, Bangalore\n📅 Duration: 3 Months\n✨ PPO available upon completion',
    });

    // Verify fetch parameters
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [calledUrl, calledInit] = fetchMock.mock.calls[0];
    expect(calledUrl).toBe('https://api.groq.com/openai/v1/chat/completions');
    expect(calledInit?.method).toBe('POST');
    expect(calledInit?.headers).toEqual({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer test_groq_key_123',
    });

    const body = JSON.parse(calledInit?.body as string);
    expect(body.model).toBe('llama-3.1-8b-instant');
    expect(body.temperature).toBe(0.3);
    expect(body.max_tokens).toBe(200);
    expect(body.messages[0].role).toBe('user');
    expect(body.messages[0].content).toContain('Return exactly 4 bullet points.');
    expect(body.messages[0].content).toContain('Rules:');
  });

  it('should handle Groq API error response and log to console.error', async () => {
    process.env.GROQ_API_KEY = 'test_groq_key_123';

    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    vi.mocked(global.fetch).mockResolvedValue({
      ok: false,
      status: 401,
      text: async () => 'Unauthorized',
    } as Response);

    const req = new NextRequest('http://localhost/api/summarise', {
      method: 'POST',
      body: JSON.stringify(mockInternship),
    });

    const res = await POST(req);
    expect(res.status).toBe(401);

    const json = await res.json();
    expect(json).toEqual({ error: 'Failed to generate summary' });

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      '[/api/summarise] Groq error:',
      'Unauthorized',
    );
  });
});
