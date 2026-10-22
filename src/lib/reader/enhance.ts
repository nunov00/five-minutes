import { readerStorage } from './state';
import { RETURN_ORIGIN_KEY, validatedOrigin, type DiscoveryBounds } from './navigation';
import { analyticsStorage } from '../analytics/storage';

const root = document.documentElement;
root.classList.add('reader-enhanced');
const store = readerStorage(() => localStorage);
const analyticsStore = analyticsStorage(() => localStorage);
const bounds: DiscoveryBounds = JSON.parse(root.dataset.discoveryBounds ?? '{"topics":[],"libraryPages":1}');
const note = document.querySelector<HTMLElement>('#preference-note');
const recovery = document.querySelector<HTMLElement>('#reader-recovery');
function showNote(invalid = false) {
  if (note) {
    note.textContent = invalid
      ? 'Saved reader data cannot be read by this version. It has been kept unchanged; reader changes cannot be saved until it is reset.'
      : 'Your choice will not be remembered on this device.';
    note.hidden = false;
  }
  if (recovery) recovery.hidden = !invalid;
}
function recordOrigin() {
  if (root.dataset.discovery !== 'true') return;
  const path = validatedOrigin(location.pathname + location.search + location.hash, bounds);
  if (path) try { sessionStorage.setItem(RETURN_ORIGIN_KEY, JSON.stringify({version:1,path})); } catch { /* Today fallback */ }
}
function restore() {
  const status = store.inspect();
  if (status.kind !== 'valid') showNote(status.kind === 'invalid');
  root.dataset.edition = 'adult';
  const returnLink = document.querySelector<HTMLAnchorElement>('[data-return]');
  if (returnLink) {
    let target: string | null = null;
    try {
      const entry = JSON.parse(sessionStorage.getItem(RETURN_ORIGIN_KEY) ?? 'null');
      if (entry?.version === 1) target = validatedOrigin(entry.path, bounds);
    } catch { /* corrupt/blocked session storage */ }
    returnLink.href = target ?? '/';
    returnLink.textContent = target ? 'Return to discovery' : 'Back to home';
  }
  recordOrigin();
}
document.querySelector('#reset-reader-state')?.addEventListener('click', () => {
  if (store.reset()) { analyticsStore.reset(); location.reload(); }
  else showNote();
});
window.addEventListener('pageshow', restore);
window.addEventListener('popstate', recordOrigin);
window.addEventListener('hashchange', recordOrigin);
document.addEventListener('search-context', recordOrigin);
restore();
