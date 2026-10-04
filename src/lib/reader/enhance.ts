import { isEdition, readerStorage } from './state';
import { forwardDestination, RETURN_ORIGIN_KEY, validatedOrigin, type DiscoveryBounds } from './navigation';

const root = document.documentElement;
root.classList.add('reader-enhanced');
const store = readerStorage(() => localStorage);
const bounds: DiscoveryBounds = JSON.parse(root.dataset.discoveryBounds ?? '{"topics":[],"libraryPages":1}');
const note = document.querySelector<HTMLElement>('#preference-note');
const selector = document.querySelector<HTMLElement>('[data-global-selector]');
function showNote() { if (note) note.hidden = false; }
export function reflectEdition(edition: string | null) {
  selector?.querySelectorAll<HTMLAnchorElement>('[data-edition-choice]').forEach(link => {
    if (link.dataset.editionChoice === edition) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });
}
function recordOrigin() {
  if (root.dataset.discovery !== 'true') return;
  const path = validatedOrigin(location.pathname + location.search + location.hash, bounds);
  if (path) try { sessionStorage.setItem(RETURN_ORIGIN_KEY, JSON.stringify({version:1,path})); } catch { /* Today fallback */ }
}
function restore() {
  const url = new URL(location.href);
  if (url.searchParams.get('preference') === 'not-saved') showNote();
  const edition = store.read()?.edition;
  if (root.dataset.neutralDiscovery === 'true' && edition) {
    const target = forwardDestination(location.pathname, edition, location.search, location.hash);
    if (target) { location.replace(target); return; }
  }
  const pageEdition = root.dataset.edition;
  if (pageEdition) reflectEdition(pageEdition);
  else if (root.dataset.search !== 'true') reflectEdition(null);
  const returnLink = document.querySelector<HTMLAnchorElement>('[data-return]');
  if (returnLink) {
    let target: string | null = null;
    try {
      const entry = JSON.parse(sessionStorage.getItem(RETURN_ORIGIN_KEY) ?? 'null');
      if (entry?.version === 1) target = validatedOrigin(entry.path, bounds);
    } catch { /* corrupt/blocked session storage */ }
    returnLink.href = target ?? '/';
    returnLink.textContent = target ? 'Return to discovery' : 'Back to Today';
  }
  recordOrigin();
}
function keepContext() {
  document.querySelectorAll<HTMLAnchorElement>('[data-edition-choice]').forEach(link => {
    const destination = new URL(link.href);
    destination.search = location.search;
    if (root.dataset.search === 'true') destination.searchParams.set('edition', link.dataset.editionChoice!);
    destination.hash = location.hash;
    link.href = destination.pathname + destination.search + destination.hash;
  });
}
document.addEventListener('click', event => {
  const link = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>('a[data-edition-choice]') : null;
  const edition = link?.dataset.editionChoice;
  if (!link || !isEdition(edition)) return;
  if (!store.chooseEdition(edition)) {
    showNote();
    const url = new URL(link.href);url.searchParams.set('preference','not-saved');link.href=url.pathname+url.search+url.hash;
  }
});
window.addEventListener('pageshow', () => { keepContext(); restore(); });
window.addEventListener('popstate', recordOrigin);
window.addEventListener('hashchange', recordOrigin);
document.addEventListener('search-context', recordOrigin);
keepContext();restore();
