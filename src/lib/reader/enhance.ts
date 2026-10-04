import { isEdition, readerStorage } from './state';
import { forwardDestination, RETURN_ORIGIN_KEY, validatedOrigin, type DiscoveryBounds } from './navigation';

const root = document.documentElement;
root.classList.add('reader-enhanced');
const store = readerStorage(() => localStorage);
const bounds: DiscoveryBounds = JSON.parse(root.dataset.discoveryBounds ?? '{"topics":[],"libraryPages":1}');
const note = document.querySelector<HTMLElement>('#preference-note');
const selector = document.querySelector<HTMLElement>('[data-global-selector]');
const recovery = document.querySelector<HTMLElement>('#reader-recovery');
const NOTICE_KEY = 'five-minutes.session-preference-notice.v1';
function showNote(invalid = false) {
  if (note) {
    note.textContent = invalid
      ? 'Saved reader data cannot be read by this version. It has been kept unchanged; edition choices cannot be saved until it is reset.'
      : 'Your choice will not be remembered on this device.';
    note.hidden = false;
  }
  if (recovery) recovery.hidden = !invalid;
}
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
  const status = store.inspect();
  if (status.kind !== 'valid') showNote(status.kind === 'invalid');
  try {
    if (sessionStorage.getItem(NOTICE_KEY) === 'not-saved') {
      sessionStorage.removeItem(NOTICE_KEY);
      showNote(status.kind === 'invalid');
    }
  } catch { /* The destination still detects blocked reader storage. */ }
  const edition = status.kind === 'valid' ? status.state.edition : null;
  if (root.dataset.neutralDiscovery === 'true' && edition) {
    const target = forwardDestination(location.pathname, edition, location.search, location.hash);
    if (target) { location.replace(target); return; }
  }
  const pageEdition = root.dataset.edition;
  if (root.dataset.preferenceSurface === 'true') reflectEdition(edition);
  else if (pageEdition) reflectEdition(pageEdition);
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
    const destinationIsSearch = destination.pathname === '/search';
    destination.search = location.search;
    if (destinationIsSearch) destination.searchParams.set('edition', link.dataset.editionChoice!);
    destination.hash = location.hash;
    link.href = destination.pathname + destination.search + destination.hash;
  });
}
document.addEventListener('click', event => {
  const link = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>('a[data-edition-choice]') : null;
  const edition = link?.dataset.editionChoice;
  if (!link || !isEdition(edition) || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  if (!store.chooseEdition(edition)) {
    showNote(store.inspect().kind === 'invalid');
    try { sessionStorage.setItem(NOTICE_KEY, 'not-saved'); } catch { /* No URL notice is shared. */ }
  }
  // A first choice completes the neutral handoff; an edition switch remains normal history.
  if (root.dataset.neutralDiscovery === 'true') { event.preventDefault(); location.replace(link.href); }
});
document.querySelector('#reset-reader-state')?.addEventListener('click', () => {
  if (store.reset()) location.reload();
  else showNote();
});
window.addEventListener('pageshow', () => { keepContext(); restore(); });
window.addEventListener('popstate', recordOrigin);
window.addEventListener('hashchange', recordOrigin);
document.addEventListener('search-context', recordOrigin);
keepContext();restore();
