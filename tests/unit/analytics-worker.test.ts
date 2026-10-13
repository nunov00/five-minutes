import { describe, expect, it, vi } from 'vitest';
import { handleRequest, type FeedbackEnv } from '../../deploy/cloudflare/worker';

const origin = 'https://five-minutes-v2.vitoria-nuno.workers.dev';
const lessonId = '018f47a2-5d7b-7c31-9d4f-0d9a8b6c2e10';

function analyticsEnv(fetch: (request: Request) => Promise<Response>, overrides: Partial<FeedbackEnv> = {}): FeedbackEnv {
  return {
    ASSETS: { fetch: vi.fn(async () => new Response('asset')) },
    ANALYTICS_ALLOWED_HOSTNAME: new URL(origin).hostname,
    ANALYTICS: { idFromName: vi.fn(() => 'global-id'), get: vi.fn(() => ({ fetch })) },
    ...overrides,
  };
}

function event(body: unknown, headers: Record<string, string> = {}) {
  return new Request(`${origin}/api/analytics/event`, {
    method: 'POST',
    headers: { Origin: origin, 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(body),
  });
}

describe('Cloudflare analytics boundary', () => {
  it('fails closed without the production binding and on Preview hostnames', async () => {
    const unavailable = await handleRequest(new Request(`${origin}/api/analytics`), { ASSETS: { fetch: vi.fn() } });
    const preview = await handleRequest(
      new Request('https://branch-five-minutes-v2.vitoria-nuno.workers.dev/api/analytics'),
      analyticsEnv(vi.fn()),
    );
    expect(unavailable.status).toBe(503);
    expect(preview.status).toBe(503);
  });

  it('accepts a same-origin allow-listed event and forwards no request metadata', async () => {
    let internal: Request | undefined;
    const binding = analyticsEnv(vi.fn(async (request: Request) => { internal = request; return Response.json({ ok: true }, { status: 202 }); }));
    const response = await handleRequest(event(
      { event: 'lesson_view', edition: 'adult', lessonId },
      { 'CF-Connecting-IP': '192.0.2.20', 'User-Agent': 'private-agent', Referer: `${origin}/adult/example` },
    ), binding);

    expect(response.status).toBe(202);
    expect(await internal?.json()).toEqual({ event: 'lesson_view', dimension: `adult:${lessonId}` });
    expect(internal?.headers.get('CF-Connecting-IP')).toBeNull();
    expect(internal?.headers.get('User-Agent')).not.toBe('private-agent');
    expect(internal?.headers.get('Referer')).toBeNull();
  });

  it('rejects cross-origin, unknown, high-cardinality and oversized events', async () => {
    const fetch = vi.fn();
    const binding = analyticsEnv(fetch);
    expect((await handleRequest(event({ event: 'page_view', page: 'home' }, { Origin: 'https://example.com' }), binding)).status).toBe(403);
    expect((await handleRequest(event({ event: 'page_view', page: '/private/path' }), binding)).status).toBe(400);
    expect((await handleRequest(event({ event: 'outbound', url: 'https://private.example' }), binding)).status).toBe(400);
    expect((await handleRequest(event({ event: 'page_view', page: 'home', padding: 'x'.repeat(1_100) }), binding)).status).toBe(413);
    expect(fetch).not.toHaveBeenCalled();
  });

  it('returns only the aggregate summary and bounds unsupported ranges to 30 days', async () => {
    let url = '';
    const summary = { schemaVersion: 1, totals: { views: 2 }, private: undefined };
    const binding = analyticsEnv(vi.fn(async (request: Request) => { url = request.url; return Response.json(summary); }));
    const response = await handleRequest(new Request(`${origin}/api/analytics?days=999`), binding);

    expect(response.status).toBe(200);
    expect(url).toBe('https://analytics.internal/summary?days=30');
    expect(await response.json()).toEqual({ schemaVersion: 1, totals: { views: 2 } });
    expect(response.headers.get('cache-control')).toBe('public, max-age=60');
  });

  it('turns object failures into a generic unavailable response', async () => {
    const binding = analyticsEnv(vi.fn(async () => { throw new Error('storage internals'); }));
    const response = await handleRequest(event({ event: 'page_view', page: 'home' }), binding);
    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ error: 'Analytics is temporarily unavailable.' });
  });
});
