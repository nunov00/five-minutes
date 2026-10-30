// Calendar arithmetic uses local dates, never a fixed UTC offset or 24-hour Swiss days.
export function weeklyCycle(now) {
  const instant = new Date(now);
  if (!Number.isFinite(instant.valueOf())) throw new Error('Invalid weekly run time.');
  const day = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Zurich' }).format(instant);
  const calendar = new Date(`${day}T12:00:00Z`);
  const weekday = calendar.getUTCDay();
  calendar.setUTCDate(calendar.getUTCDate() - weekday);
  const sunday = calendar.toISOString().slice(0, 10);
  calendar.setUTCDate(calendar.getUTCDate() + 5);
  return { day, sunday, friday: calendar.toISOString().slice(0, 10), weekday,
    stage: weekday === 0 ? 'selection' : weekday < 5 ? 'writing' : weekday === 5 ? 'publication' : 'idle' };
}

export function weeklyLessonBranch(cycle, slug) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(cycle ?? '') || weeklyCycle(`${cycle}T12:00:00Z`).sunday !== cycle
    || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug ?? '')) throw new Error('Invalid weekly cycle or slug.');
  return `weekly-lesson/${cycle}/${slug}`;
}

export const WEEKLY_SHORTFALL = 'Weekly completion removed the selected idea; Sunday will reassess the shortlist.';
export function weeklyRemainingPipeline(pipeline) {
  const next = structuredClone(pipeline);
  next.ranking.shift();
  if (next.ranking.length < 10 && next.shortfall === undefined) next.shortfall = WEEKLY_SHORTFALL;
  return next;
}
