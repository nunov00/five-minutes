interface TurnstileApi {
  render(container: HTMLElement, options: {
    sitekey: string;
    action: string;
    callback(token: string): void;
    'error-callback'(): void;
    'expired-callback'(): void;
  }): string | number;
  reset(widgetId: string | number): void;
}

export {};

declare global {
  interface Window { turnstile?: TurnstileApi }
}

const form = document.querySelector<HTMLFormElement>('[data-feedback-form]');
const widget = document.querySelector<HTMLElement>('[data-turnstile-widget]');
const submit = document.querySelector<HTMLButtonElement>('[data-feedback-submit]');
const statusElement = document.querySelector<HTMLElement>('[data-feedback-status]');

function setStatus(message: string, kind: 'quiet' | 'error' | 'success' = 'quiet') {
  if (!statusElement) return;
  statusElement.textContent = message;
  statusElement.dataset.kind = kind;
}

function loadTurnstile(): Promise<TurnstileApi> {
  if (window.turnstile) return Promise.resolve(window.turnstile);
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    script.async = true;
    script.defer = true;
    script.addEventListener('load', () => window.turnstile ? resolve(window.turnstile) : reject(new Error('Turnstile unavailable')));
    script.addEventListener('error', () => reject(new Error('Turnstile unavailable')));
    document.head.append(script);
  });
}

async function initialise() {
  if (!form || !widget || !submit) return;
  try {
    const response = await fetch('/api/feedback/config', { headers: { Accept: 'application/json' }, cache: 'no-store' });
    const config = await response.json().catch(() => null) as null | { siteKey?: unknown };
    if (!response.ok || typeof config?.siteKey !== 'string' || !config.siteKey) throw new Error('Feedback unavailable');
    const turnstile = await loadTurnstile();
    let verificationToken = '';
    const widgetId = turnstile.render(widget, {
      sitekey: config.siteKey,
      action: 'feedback',
      callback(token) {
        verificationToken = token;
        submit.disabled = false;
        setStatus('Verification complete.');
      },
      'error-callback'() {
        verificationToken = '';
        submit.disabled = true;
        setStatus('Verification could not be completed. Please try again.', 'error');
      },
      'expired-callback'() {
        verificationToken = '';
        submit.disabled = true;
        setStatus('Verification expired. Please verify again.', 'error');
      },
    });

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (!form.reportValidity() || !verificationToken) {
        if (!verificationToken) setStatus('Complete the verification before sending.', 'error');
        return;
      }
      submit.disabled = true;
      setStatus('Sending…');
      const data = new FormData(form);
      let verificationReset = false;
      try {
        const result = await fetch('/api/feedback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            category: data.get('category'),
            message: data.get('message'),
            website: data.get('website'),
            turnstileToken: verificationToken,
          }),
        });
        const body = await result.json().catch(() => null) as null | { error?: unknown };
        verificationToken = '';
        turnstile.reset(widgetId);
        verificationReset = true;
        if (!result.ok) throw new Error(typeof body?.error === 'string' ? body.error : 'Feedback could not be sent.');
        form.reset();
        setStatus('Thank you. Your feedback was sent privately.', 'success');
      } catch (error) {
        if (!verificationReset) {
          verificationToken = '';
          turnstile.reset(widgetId);
        }
        submit.disabled = true;
        setStatus(error instanceof Error ? error.message : 'Feedback could not be sent.', 'error');
      }
    });
  } catch {
    setStatus('Feedback is temporarily unavailable. Please try again later.', 'error');
  }
}

void initialise();
