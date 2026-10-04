import type { BrowserCatalogueEntry } from '../discovery/types';
import type { LessonEdition } from '../urls';
import { isAppearance, MAX_READER_STATE_CHARS, readerStorage, type ReaderAppearance, type ReaderStateV1 } from './state';

const root = document.documentElement;
const store = readerStorage(() => localStorage);
root.classList.add('reader-features');

const emit = () => document.dispatchEvent(new Event('reader-state-change'));
const current = () => store.read();
const lesson = document.querySelector<HTMLElement>('[data-reader-lesson]');

function applyAppearance(appearance: ReaderAppearance) {
  root.dataset.appearance = appearance;
  document.querySelectorAll<HTMLInputElement>('input[name="appearance"]').forEach(input => { input.checked = input.value === appearance; });
}

function reflectLessonControls(state: ReaderStateV1) {
  if (!lesson) return;
  const id = lesson.dataset.lessonId;
  if (!id) return;
  const saved = state.saved.includes(id);
  const read = Boolean(state.read[id]);
  const save = lesson.querySelector<HTMLButtonElement>('[data-save-lesson]');
  const readButton = lesson.querySelector<HTMLButtonElement>('[data-read-lesson]');
  if (save) { save.hidden = false; save.setAttribute('aria-pressed', String(saved)); save.textContent = saved ? 'Saved' : 'Save'; }
  if (readButton) { readButton.hidden = false; readButton.setAttribute('aria-pressed', String(!read)); readButton.textContent = read ? 'Mark unread' : 'Mark read'; }
}

function reflectMarkers(state: ReaderStateV1) {
  document.querySelectorAll<HTMLElement>('[data-reader-markers]').forEach(marker => {
    const id = marker.closest<HTMLElement>('[data-lesson-id]')?.dataset.lessonId;
    if (!id) return;
    const labels = [state.saved.includes(id) ? 'Saved' : '', state.read[id] ? 'Read' : ''].filter(Boolean);
    marker.textContent = labels.join(' · ');
    marker.hidden = labels.length === 0;
  });
}

function link(text: string, href: string) {
  const anchor = document.createElement('a'); anchor.textContent = text; anchor.href = href; return anchor;
}

function renderPersonalLists(state: ReaderStateV1, catalogue: readonly BrowserCatalogueEntry[]) {
  const byId = new Map(catalogue.map(entry => [entry.id, entry]));
  const savedList = document.querySelector<HTMLOListElement>('[data-saved-list]');
  const recentList = document.querySelector<HTMLOListElement>('[data-recent-list]');
  const savedEmpty = document.querySelector<HTMLElement>('[data-saved-empty]');
  const recentEmpty = document.querySelector<HTMLElement>('[data-recent-empty]');
  let missingSaved = 0, missingRecent = 0;
  savedList?.replaceChildren(); recentList?.replaceChildren();
  state.saved.forEach(id => {
    const entry = byId.get(id); if (!entry) { missingSaved++; return; }
    const item = document.createElement('li'); item.dataset.lessonId = id;
    const title = document.createElement('strong'); title.textContent = entry[state.edition ?? 'adult'].title;
    const choices = document.createElement('span'); choices.className = 'personal-links';
    choices.append(link('Adult', entry.adult.path), document.createTextNode(' · '), link('Teen', entry.teen.path));
    item.append(title, choices); savedList?.append(item);
  });
  state.recent.forEach(recent => {
    const entry = byId.get(recent.id); if (!entry) { missingRecent++; return; }
    const item = document.createElement('li'); item.dataset.lessonId = recent.id;
    item.append(link(entry[recent.edition].title, entry[recent.edition].path));
    const meta = document.createElement('span'); meta.className = 'personal-links'; meta.textContent = `${recent.edition === 'adult' ? 'Adult' : 'Teen'} · ${new Intl.DateTimeFormat('en-GB',{dateStyle:'medium'}).format(new Date(recent.visitedAt))}`;
    item.append(meta); recentList?.append(item);
  });
  if (savedEmpty) { savedEmpty.hidden = state.saved.length > 0; savedEmpty.textContent = 'No saved lessons yet.'; }
  if (recentEmpty) { recentEmpty.hidden = state.recent.length > 0; recentEmpty.textContent = 'No recently read lessons yet.'; }
  const missing = document.querySelector<HTMLElement>('[data-missing-items]');
  if (missing) { const count = missingSaved + missingRecent; missing.hidden = count === 0; missing.textContent = `${count} local ${count === 1 ? 'entry is' : 'entries are'} being kept, but its lesson is not in this catalogue.`; }
}

let catalogue: readonly BrowserCatalogueEntry[] | null = null;
async function loadCatalogue() {
  const app = document.querySelector<HTMLElement>('[data-personal-page]');
  if (!app?.dataset.catalogue || catalogue) return;
  try {
    const response = await fetch(app.dataset.catalogue); if (!response.ok) throw new Error();
    catalogue = await response.json() as BrowserCatalogueEntry[];
  } catch {
    const status = document.querySelector<HTMLElement>('[data-personal-status]');
    if (status) status.textContent = 'Your lesson lists could not load. Your local data has not changed.';
  }
}

async function refresh() {
  const state = current();
  if (!state) {
    const status = document.querySelector<HTMLElement>('[data-personal-status]');
    if (status) status.textContent = 'Reader data is unavailable. It has not been changed.';
    const savedEmpty = document.querySelector<HTMLElement>('[data-saved-empty]'); if (savedEmpty) savedEmpty.textContent = 'Saved lessons cannot be shown.';
    const recentEmpty = document.querySelector<HTMLElement>('[data-recent-empty]'); if (recentEmpty) recentEmpty.textContent = 'Recent lessons cannot be shown.';
    document.querySelectorAll<HTMLInputElement | HTMLButtonElement>('[data-personal-page] input, [data-personal-page] button').forEach(control => { control.disabled = true; });
    return;
  }
  applyAppearance(state.appearance); reflectLessonControls(state); reflectMarkers(state);
  await loadCatalogue(); if (catalogue) renderPersonalLists(state, catalogue);
}

if (lesson?.dataset.lessonId && (lesson.dataset.edition === 'adult' || lesson.dataset.edition === 'teen')) {
  store.visitLesson(lesson.dataset.lessonId, lesson.dataset.edition as LessonEdition); emit();
}

lesson?.querySelector('[data-save-lesson]')?.addEventListener('click', () => { if (lesson.dataset.lessonId && store.toggleSaved(lesson.dataset.lessonId)) { emit(); void refresh(); } });
lesson?.querySelector('[data-read-lesson]')?.addEventListener('click', () => {
  const state = current(), id = lesson.dataset.lessonId; if (!state || !id) return;
  if (store.setRead(id, !state.read[id])) { emit(); void refresh(); }
});

document.querySelectorAll<HTMLInputElement>('input[name="appearance"]').forEach(input => input.addEventListener('change', () => {
  if (isAppearance(input.value) && store.setAppearance(input.value)) { applyAppearance(input.value); emit(); }
}));

document.querySelector<HTMLButtonElement>('[data-export-reader]')?.addEventListener('click', () => {
  const json = store.exportJson(); if (!json) return;
  const url = URL.createObjectURL(new Blob([json], {type:'application/json'}));
  const anchor = document.createElement('a'); anchor.href = url; anchor.download = 'five-minutes-reader-data.json'; anchor.click(); window.setTimeout(() => URL.revokeObjectURL(url), 1000);
});

document.querySelector<HTMLButtonElement>('[data-import-reader]')?.addEventListener('click', async () => {
  const file = document.querySelector<HTMLInputElement>('[data-import-file]')?.files?.[0];
  const confirm = document.querySelector<HTMLInputElement>('[data-import-confirm]');
  const status = document.querySelector<HTMLElement>('[data-import-status]');
  if (!file || !confirm?.checked) { if (status) status.textContent = 'Choose a file and confirm that it may replace this device’s reader data.'; return; }
  if (file.size > MAX_READER_STATE_CHARS) { if (status) status.textContent = 'That file is too large. Nothing was changed.'; return; }
  const raw = await file.text();
  if (!store.replaceFromJson(raw)) { if (status) status.textContent = 'That file is not valid Five Minutes reader data. Nothing was changed.'; return; }
  if (status) status.textContent = 'Reader data imported.'; confirm.checked = false; emit(); await refresh();
});

window.addEventListener('storage', () => void refresh());
window.addEventListener('pageshow', () => void refresh());
document.addEventListener('reader-state-change', () => void refresh());
void refresh();
