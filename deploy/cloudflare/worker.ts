const CONFIG_PATH = '/api/feedback/config';
const SUBMIT_PATH = '/api/feedback';
const TURNSTILE_VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
const GITHUB_API_VERSION = '2022-11-28';
const MAX_REQUEST_BYTES = 8_192;
const MAX_MESSAGE_LENGTH = 2_000;
const MIN_MESSAGE_LENGTH = 10;
const MAX_TURNSTILE_TOKEN_LENGTH = 2_048;

const categories = {
  bug: 'Bug report',
  enhancement: 'Enhancement request',
  content: 'Content feedback',
  other: 'Other feedback',
} as const;

type FeedbackCategory = keyof typeof categories;

export interface FeedbackEnv {
  ASSETS: { fetch(request: Request): Promise<Response> };
  FEEDBACK_ALLOWED_HOSTNAME?: string;
  FEEDBACK_GITHUB_REPOSITORY?: string;
  FEEDBACK_GITHUB_TOKEN?: string;
  TURNSTILE_SECRET_KEY?: string;
  TURNSTILE_SITE_KEY?: string;
}

type Fetcher = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;

const jsonHeaders = {
  'Cache-Control': 'no-store',
  'Content-Type': 'application/json; charset=utf-8',
  'Referrer-Policy': 'no-referrer',
  'X-Content-Type-Options': 'nosniff',
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: jsonHeaders });
}

function isConfigured(env: FeedbackEnv): boolean {
  return Boolean(
    env.FEEDBACK_GITHUB_REPOSITORY
    && env.FEEDBACK_ALLOWED_HOSTNAME
    && env.FEEDBACK_GITHUB_TOKEN
    && env.TURNSTILE_SECRET_KEY
    && env.TURNSTILE_SITE_KEY,
  );
}

function feedbackAvailable(request: Request, env: FeedbackEnv): boolean {
  return isConfigured(env) && new URL(request.url).hostname === env.FEEDBACK_ALLOWED_HOSTNAME;
}

function sameOrigin(request: Request): boolean {
  const origin = request.headers.get('Origin');
  if (!origin || origin !== new URL(request.url).origin) return false;
  const fetchSite = request.headers.get('Sec-Fetch-Site');
  return fetchSite === null || fetchSite === 'same-origin';
}

function validRepository(value: string): boolean {
  return /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(value);
}

function escapeHtml(value: string): string {
  return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
}

async function readBodyWithinLimit(request: Request): Promise<string | null> {
  if (!request.body) return '';

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > MAX_REQUEST_BYTES) {
      await reader.cancel().catch(() => undefined);
      return null;
    }
    chunks.push(value);
  }

  const body = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return new TextDecoder().decode(body);
}

function parseFeedback(value: unknown):
  | { ok: true; category: FeedbackCategory; message: string; token: string; honeypot: string }
  | { ok: false } {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return { ok: false };
  const record = value as Record<string, unknown>;
  const allowed = new Set(['category', 'message', 'turnstileToken', 'website']);
  if (Object.keys(record).some((key) => !allowed.has(key))) return { ok: false };

  const category = record.category;
  const message = typeof record.message === 'string'
    ? record.message.replaceAll('\r\n', '\n').replaceAll('\r', '\n').trim()
    : '';
  const token = typeof record.turnstileToken === 'string' ? record.turnstileToken.trim() : '';
  const honeypot = typeof record.website === 'string' ? record.website.trim() : '';
  const hasUnsafeControl = /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(message);

  if (
    typeof category !== 'string'
    || !(category in categories)
    || message.length < MIN_MESSAGE_LENGTH
    || message.length > MAX_MESSAGE_LENGTH
    || hasUnsafeControl
    || token.length === 0
    || token.length > MAX_TURNSTILE_TOKEN_LENGTH
    || honeypot.length > 200
  ) return { ok: false };

  return { ok: true, category: category as FeedbackCategory, message, token, honeypot };
}

async function verifyTurnstile(
  token: string,
  hostname: string,
  secret: string,
  fetcher: Fetcher,
): Promise<boolean> {
  const body = new URLSearchParams({
    secret,
    response: token,
    idempotency_key: crypto.randomUUID(),
  });
  const response = await fetcher(TURNSTILE_VERIFY_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
  if (!response.ok) return false;

  const result = await response.json().catch(() => null) as null | {
    success?: unknown;
    hostname?: unknown;
    action?: unknown;
  };
  return result?.success === true && result.hostname === hostname && result.action === 'feedback';
}

async function createPrivateIssue(
  category: FeedbackCategory,
  message: string,
  repository: string,
  token: string,
  fetcher: Fetcher,
): Promise<boolean> {
  if (!validRepository(repository)) return false;
  const body = [
    `**Category:** ${categories[category]}`,
    '',
    '**Anonymous reader message:**',
    '',
    `<pre>${escapeHtml(message)}</pre>`,
    '',
    '_Submitted through the Five Minutes feedback form. The application did not attach a name, email address, IP address, user agent or page history._',
  ].join('\n');
  const response = await fetcher(`https://api.github.com/repos/${repository}/issues`, {
    method: 'POST',
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'User-Agent': 'five-minutes-feedback-worker',
      'X-GitHub-Api-Version': GITHUB_API_VERSION,
    },
    body: JSON.stringify({ title: `[${categories[category]}] Anonymous feedback`, body }),
  });
  return response.status === 201;
}

async function submitFeedback(request: Request, env: FeedbackEnv, fetcher: Fetcher): Promise<Response> {
  if (!feedbackAvailable(request, env)) return json({ error: 'Feedback is temporarily unavailable.' }, 503);
  if (!sameOrigin(request)) return json({ error: 'Request origin was not accepted.' }, 403);
  if (!request.headers.get('Content-Type')?.toLowerCase().startsWith('application/json')) {
    return json({ error: 'Expected a JSON request.' }, 415);
  }

  const declaredLength = Number(request.headers.get('Content-Length'));
  if (Number.isFinite(declaredLength) && declaredLength > MAX_REQUEST_BYTES) {
    return json({ error: 'Feedback is too large.' }, 413);
  }
  const raw = await readBodyWithinLimit(request);
  if (raw === null) {
    return json({ error: 'Feedback is too large.' }, 413);
  }
  const parsedJson = await Promise.resolve().then(() => JSON.parse(raw)).catch(() => null);
  const feedback = parseFeedback(parsedJson);
  if (!feedback.ok) return json({ error: 'Check the category, message and verification.' }, 400);

  // A filled honeypot is treated as accepted but is never sent to a provider.
  if (feedback.honeypot) return json({ ok: true }, 202);

  let verified = false;
  try {
    verified = await verifyTurnstile(
      feedback.token,
      env.FEEDBACK_ALLOWED_HOSTNAME!,
      env.TURNSTILE_SECRET_KEY!,
      fetcher,
    );
  } catch {
    return json({ error: 'Verification is temporarily unavailable.' }, 502);
  }
  if (!verified) return json({ error: 'Verification failed. Please try again.' }, 400);

  let created = false;
  try {
    created = await createPrivateIssue(
      feedback.category,
      feedback.message,
      env.FEEDBACK_GITHUB_REPOSITORY!,
      env.FEEDBACK_GITHUB_TOKEN!,
      fetcher,
    );
  } catch {
    return json({ error: 'Feedback could not be saved. Please try again later.' }, 502);
  }
  if (!created) return json({ error: 'Feedback could not be saved. Please try again later.' }, 502);
  return json({ ok: true }, 201);
}

export async function handleRequest(request: Request, env: FeedbackEnv, fetcher: Fetcher = fetch): Promise<Response> {
  const { pathname } = new URL(request.url);
  if (pathname === CONFIG_PATH) {
    if (request.method !== 'GET') return json({ error: 'Method not allowed.' }, 405);
    if (!feedbackAvailable(request, env)) return json({ error: 'Feedback is temporarily unavailable.' }, 503);
    return json({ siteKey: env.TURNSTILE_SITE_KEY });
  }
  if (pathname === SUBMIT_PATH) {
    if (request.method !== 'POST') return json({ error: 'Method not allowed.' }, 405);
    return submitFeedback(request, env, fetcher);
  }
  return env.ASSETS.fetch(request);
}

export default {
  fetch(request: Request, env: FeedbackEnv): Promise<Response> {
    return handleRequest(request, env);
  },
};
