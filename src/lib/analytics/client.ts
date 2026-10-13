import { parseAnalyticsEvent } from './contracts';
import { analyticsCollectionAllowed, analyticsStorage } from './storage';

const ENDPOINT = '/api/analytics/event';
const root = document.documentElement;
const store = analyticsStorage(() => localStorage);
const privacySignal = !analyticsCollectionAllowed(navigator as Navigator & { globalPrivacyControl?: boolean });

function send(value: unknown, onceToday = false) {
  if (privacySignal) return;
  const event = parseAnalyticsEvent(value);
  if (!event || (onceToday && !store.firstToday(event))) return;
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
