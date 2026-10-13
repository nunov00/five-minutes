import { describe, expect, it, vi } from 'vitest';
import { handleRequest, type FeedbackEnv } from '../../deploy/cloudflare/worker';

const origin = 'https://five-minutes-v2.vitoria-nuno.workers.dev';

function env(overrides: Partial<FeedbackEnv> = {}): FeedbackEnv {
  return {
    ASSETS: { fetch: vi.fn(async () => new Response('asset', { status: 200 })) },
    FEEDBACK_GITHUB_REPOSITORY: 'nunov00/five-minutes-feedback',
    FEEDBACK_GITHUB_TOKEN: 'github-secret',
    TURNSTILE_SECRET_KEY: 'turnstile-secret',
    TURNSTILE_SITE_KEY: 'public-site-key',
    ...overrides,
  };
}

function submission(body: Record<string, unknown>, headers: Record<string, string> = {}): Request {
  return new Request(`${origin}/api/feedback`, {
    method: 'POST',
    headers: { Origin: origin, 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(body),
  });
}

const validBody = {
  category: 'bug',
  message: 'The Library link is not working for me.',
  turnstileToken: 'verified-token',
  website: '',
};

describe('Cloudflare feedback Worker', () => {
  it('fails closed when runtime secrets are missing', async () => {
    const response = await handleRequest(
      new Request(`${origin}/api/feedback/config`),
      env({ FEEDBACK_GITHUB_TOKEN: undefined }),
    );

    expect(response.status).toBe(503);
    expect(response.headers.get('cache-control')).toBe('no-store');
    expect(await response.json()).toEqual({ error: 'Feedback is temporarily unavailable.' });
  });

  it('exposes only the public Turnstile site key', async () => {
    const response = await handleRequest(new Request(`${origin}/api/feedback/config`), env());

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ siteKey: 'public-site-key' });
  });

  it('passes non-API requests to the static asset binding', async () => {
    const bindings = env();
    const request = new Request(`${origin}/adult/example`);
    const response = await handleRequest(request, bindings);

    expect(await response.text()).toBe('asset');
    expect(bindings.ASSETS.fetch).toHaveBeenCalledWith(request);
  });

  it('rejects cross-origin and cross-site submissions before external calls', async () => {
    const fetcher = vi.fn();
    const request = submission(validBody, { Origin: 'https://example.com', 'Sec-Fetch-Site': 'cross-site' });
    const response = await handleRequest(request, env(), fetcher);

    expect(response.status).toBe(403);
    expect(fetcher).not.toHaveBeenCalled();
  });

  it('validates Turnstile and creates a private issue without forwarding request metadata', async () => {
    const calls: Array<{ input: string; init?: RequestInit }> = [];
    const fetcher = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      calls.push({ input: String(input), init });
      if (String(input).includes('siteverify')) {
        return Response.json({ success: true, hostname: new URL(origin).hostname, action: 'feedback' });
      }
      return Response.json({ number: 1 }, { status: 201 });
    });
    const request = submission(
      { ...validBody, message: 'A <broken> link & some useful detail.' },
      { 'CF-Connecting-IP': '192.0.2.10', 'User-Agent': 'private-reader-agent' },
    );
    const response = await handleRequest(request, env(), fetcher);

    expect(response.status).toBe(201);
    expect(await response.json()).toEqual({ ok: true });
    expect(calls).toHaveLength(2);

    const turnstileBody = String(calls[0].init?.body);
    expect(turnstileBody).toContain('secret=turnstile-secret');
    expect(turnstileBody).toContain('response=verified-token');
    expect(turnstileBody).not.toContain('192.0.2.10');

    expect(calls[1].input).toBe('https://api.github.com/repos/nunov00/five-minutes-feedback/issues');
    const githubHeaders = new Headers(calls[1].init?.headers);
    expect(githubHeaders.get('authorization')).toBe('Bearer github-secret');
    expect(githubHeaders.get('user-agent')).toBe('five-minutes-feedback-worker');
    const githubBody = JSON.parse(String(calls[1].init?.body));
    expect(githubBody.title).toBe('[Bug report] Anonymous feedback');
    expect(githubBody.body).toContain('&lt;broken&gt; link &amp; some useful detail.');
    expect(githubBody.body).not.toContain('192.0.2.10');
    expect(githubBody.body).not.toContain('private-reader-agent');
  });

  it('requires a matching Turnstile hostname and action', async () => {
    const fetcher = vi.fn(async () => Response.json({
      success: true,
      hostname: 'example.com',
      action: 'feedback',
    }));
    const response = await handleRequest(submission(validBody), env(), fetcher);

    expect(response.status).toBe(400);
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it('drops honeypot submissions without contacting Turnstile or GitHub', async () => {
    const fetcher = vi.fn();
    const response = await handleRequest(submission({ ...validBody, website: 'spam.example' }), env(), fetcher);

    expect(response.status).toBe(202);
    expect(await response.json()).toEqual({ ok: true });
    expect(fetcher).not.toHaveBeenCalled();
  });

  it('rejects unknown fields and oversized messages', async () => {
    const fetcher = vi.fn();
    const unknown = await handleRequest(submission({ ...validBody, email: 'person@example.com' }), env(), fetcher);
    const oversized = await handleRequest(submission({ ...validBody, message: 'x'.repeat(2_001) }), env(), fetcher);

    expect(unknown.status).toBe(400);
    expect(oversized.status).toBe(400);
    expect(fetcher).not.toHaveBeenCalled();
  });
});
