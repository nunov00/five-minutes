import type { LessonEdition } from '../urls';

export const READER_STATE_KEY = 'five-minutes.reader-state';
export const RECENT_LIMIT = 50;
export const MAX_READER_STATE_CHARS = 1_000_000;
export type ReaderAppearance = 'system' | 'light' | 'dark';
export interface ReaderStateV1 {
  version: 1;
  edition: LessonEdition | null;
  saved: string[];
  read: Record<string, string>;
  recent: { id: string; edition: LessonEdition; visitedAt: string }[];
  appearance: ReaderAppearance;
}
export interface StoragePort { getItem(key: string): string | null; setItem(key: string, value: string): void; }
export const emptyReaderState = (): ReaderStateV1 => ({ version: 1, edition: null, saved: [], read: {}, recent: [], appearance: 'system' });
export const isLessonId = (v: unknown): v is string => typeof v === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
const date = (v: unknown): v is string => typeof v === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(v) && Number.isFinite(Date.parse(v));
export function isEdition(value: unknown): value is LessonEdition { return value === 'adult' || value === 'teen'; }
export function isAppearance(value: unknown): value is ReaderAppearance { return value === 'system' || value === 'light' || value === 'dark'; }
export function parseReaderState(raw: string | null): ReaderStateV1 | null {
  if (raw === null) return emptyReaderState();
  if (raw.length > MAX_READER_STATE_CHARS) return null;
  try {
    const s = JSON.parse(raw);
    if (!s || s.version !== 1 || !(s.edition === null || isEdition(s.edition)) || !Array.isArray(s.saved) || !s.saved.every(isLessonId)
      || new Set(s.saved).size !== s.saved.length || !s.read || typeof s.read !== 'object' || Array.isArray(s.read)
      || !Object.entries(s.read).every(([key, value]) => isLessonId(key) && date(value)) || !Array.isArray(s.recent) || s.recent.length > RECENT_LIMIT
      || !s.recent.every((r: {id:unknown;edition:unknown;visitedAt:unknown}) => r && isLessonId(r.id) && isEdition(r.edition) && date(r.visitedAt))
      || new Set(s.recent.map((r: {id:string;edition:LessonEdition}) => `${r.id}:${r.edition}`)).size !== s.recent.length
      || !isAppearance(s.appearance)) return null;
    return s as ReaderStateV1;
  } catch { return null; }
}
export type ReaderStorageStatus = { kind: 'valid'; state: ReaderStateV1 } | { kind: 'invalid' | 'unavailable' };
/** Unknown/corrupt versions are preserved, never silently overwritten. */
export function readerStorage(getStorage: () => StoragePort) {
  const read = (): ReaderStateV1 | null => {
    try { return parseReaderState(getStorage().getItem(READER_STATE_KEY)); }
    catch { return null; }
  };
  const mutate = (change: (state: ReaderStateV1) => ReaderStateV1): boolean => {
    try {
      const storage = getStorage(), state = parseReaderState(storage.getItem(READER_STATE_KEY));
      if (!state) return false;
      const next = change(state), raw = JSON.stringify(next);
      if (!parseReaderState(raw)) return false;
      storage.setItem(READER_STATE_KEY, raw);
      return true;
    } catch { return false; }
  };
  const inspect = (): ReaderStorageStatus => {
    try {
      const state = parseReaderState(getStorage().getItem(READER_STATE_KEY));
      return state ? { kind: 'valid', state } : { kind: 'invalid' };
    } catch { return { kind: 'unavailable' }; }
  };
  return {
    inspect,
    /** Called only after the reader explicitly accepts discarding unreadable data. */
    reset(): boolean {
      try { getStorage().setItem(READER_STATE_KEY, JSON.stringify(emptyReaderState())); return true; }
      catch { return false; }
    },
    read,
    chooseEdition(edition: LessonEdition): boolean {
      if (!isEdition(edition)) return false;
      return mutate(state => ({ ...state, edition }));
    },
    toggleSaved(lessonId: string): boolean {
      if (!isLessonId(lessonId)) return false;
      return mutate(state => ({ ...state, saved: state.saved.includes(lessonId) ? state.saved.filter(value => value !== lessonId) : [...state.saved, lessonId] }));
    },
    setRead(lessonId: string, read: boolean, visitedAt = new Date().toISOString()): boolean {
      if (!isLessonId(lessonId) || !date(visitedAt)) return false;
      return mutate(state => {
        const next = { ...state.read };
        if (read) next[lessonId] = next[lessonId] ?? visitedAt;
        else delete next[lessonId];
        return { ...state, read: next };
      });
    },
    visitLesson(lessonId: string, edition: LessonEdition, visitedAt = new Date().toISOString()): boolean {
      if (!isLessonId(lessonId) || !isEdition(edition) || !date(visitedAt)) return false;
      return mutate(state => ({
        ...state,
        read: { ...state.read, [lessonId]: state.read[lessonId] ?? visitedAt },
        recent: [{ id: lessonId, edition, visitedAt }, ...state.recent.filter(entry => entry.id !== lessonId || entry.edition !== edition)].slice(0, RECENT_LIMIT),
      }));
    },
    setAppearance(appearance: ReaderAppearance): boolean {
      if (!isAppearance(appearance)) return false;
      return mutate(state => ({ ...state, appearance }));
    },
    exportJson(): string | null {
      const state = read();
      return state ? `${JSON.stringify(state, null, 2)}\n` : null;
    },
    replaceFromJson(raw: string): boolean {
      if (raw.length > MAX_READER_STATE_CHARS) return false;
      const state = parseReaderState(raw);
      if (!state) return false;
      try { getStorage().setItem(READER_STATE_KEY, JSON.stringify(state)); return true; }
      catch { return false; }
    },
  };
}
