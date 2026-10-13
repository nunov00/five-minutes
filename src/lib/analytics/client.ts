import { parseAnalyticsEvent, type AnalyticsEvent } from './contracts';

const ENDPOINT = '/api/analytics/event';
const SEEN_KEY = 'five-minutes.analytics-seen.v1';
const MAX_SEEN = 512;
const root = document.documentElement;
const privacySignal = navigator.doNotTrack === '1'
  || (navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl === true;

function day() { return new Date().toISOString().slice(0, 10); }
function eventKey(event: AnalyticsEvent) { return `${day()}:${event.event}:${event.dimension}`; }

function firstToday(event: AnalyticsEvent): boolean {
  try {
    const current = JSON.parse(localStorage.getItem(SEEN_KEY) ?? '[]');
    const seen = Array.isArray(current) ? current.filter((value): value is string => typeof value === 'string') : [];
    const key = eventKey(event);
    if (seen.includes(key)) return false;
    const today = `${day()}:`;
    localStorage.setItem(SEEN_KEY, JSON.stringify([...seen.filter((value) => value.startsWith(today)), key].slice(-MAX_SEEN)));
  } catch {
    // Analytics must never make reading or navigation fail when storage is unavailable.
  }
  return true;
}

function send(value: unknown, onceToday = false) {
  if (privacySignal) return;
  const event = parseAnalyticsEvent(value);
  if (!event || (onceToday && !firstToday(event))) return;
  const body = JSON.stringify(value);
  void fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
    credentials: 'same-origin',
    keepalive: true,
  }).catch(() => undefined);
}

const lesson = document.querySelector<HTMLElement>('[data-reader-lesson]');
if (lesson?.dataset.lessonId && (lesson.dataset.edition === 'adult' || lesson.dataset.edition === 'teen')) {
  send({ event: 'lesson_view', lessonId: lesson.dataset.lessonId, edition: lesson.dataset.edition }, true);
} else {
  const path = location.pathname;
  const page = path === '/' ? 'home'
    : path.startsWith('/library') || path.startsWith('/editions/') && path.includes('/library') ? 'library'
      : path.startsWith('/topics') || path.startsWith('/editions/') && path.includes('/topics') ? 'topics'
        : path === '/search' ? 'search'
          : path === '/saved' ? 'saved'
            : path === '/feedback' ? 'feedback'
              : path === '/analytics' ? 'analytics' : 'other';
  send({ event: 'page_view', page }, true);
}

document.addEventListener('click', (click) => {
  const element = click.target instanceof Element ? click.target : null;
  const anchor = element?.closest<HTMLAnchorElement>('a[href]');
  const editionChoice = element?.closest<HTMLElement>('[data-global-selector] [data-edition-choice]')?.dataset.editionChoice;
  if (editionChoice === 'adult' || editionChoice === 'teen') send({ event: 'edition_switch', edition: editionChoice });
  const surprise = element?.closest<HTMLElement>('[data-surprise-edition]')?.dataset.surpriseEdition;
  if (surprise === 'adult' || surprise === 'teen') send({ event: 'surprise', edition: surprise });
  const related = element?.closest<HTMLElement>('[data-related-id]');
  if (anchor && related?.dataset.relatedId && (root.dataset.edition === 'adult' || root.dataset.edition === 'teen')) {
    send({ event: 'related', lessonId: related.dataset.relatedId, edition: root.dataset.edition });
  }
  if (element?.closest('[data-save-lesson]') && lesson?.dataset.lessonId
    && (lesson.dataset.edition === 'adult' || lesson.dataset.edition === 'teen')) {
    send({ event: 'save', lessonId: lesson.dataset.lessonId, edition: lesson.dataset.edition });
  }
  if (anchor) {
    try { if (new URL(anchor.href).origin !== location.origin) send({ event: 'outbound' }); } catch {}
  }
});
