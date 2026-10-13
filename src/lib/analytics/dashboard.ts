import type { AnalyticsSummary } from './contracts';
import type { BrowserCatalogueEntry } from '../discovery/types';

const dashboard = document.querySelector<HTMLElement>('[data-analytics-dashboard]');
const number = new Intl.NumberFormat('en-GB');
const date = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' });

function setText(selector: string, value: string) {
  const element = dashboard?.querySelector<HTMLElement>(selector);
  if (element) element.textContent = value;
}

async function render() {
  if (!dashboard?.dataset.catalogue) return;
  const status = dashboard.querySelector<HTMLElement>('[data-analytics-status]');
  try {
    const [summaryResponse, catalogueResponse] = await Promise.all([
      fetch('/api/analytics?days=30', { headers: { Accept: 'application/json' } }),
      fetch(dashboard.dataset.catalogue, { headers: { Accept: 'application/json' } }),
    ]);
    if (!summaryResponse.ok || !catalogueResponse.ok) throw new Error('Analytics unavailable');
    const summary = await summaryResponse.json() as AnalyticsSummary;
    const catalogue = await catalogueResponse.json() as BrowserCatalogueEntry[];
    if (summary.schemaVersion !== 1) throw new Error('Unknown analytics version');

    for (const key of ['views', 'lessonViews', 'pageViews', 'interactions'] as const) {
      setText(`[data-metric="${key}"]`, number.format(summary.totals[key]));
    }
    setText('[data-edition-metric="adult"]', number.format(summary.editions.adult));
    setText('[data-edition-metric="teen"]', number.format(summary.editions.teen));

    const byId = new Map(catalogue.map((entry) => [entry.id, entry]));
    const top = dashboard.querySelector<HTMLOListElement>('[data-top-lessons]');
    top?.replaceChildren();
    for (const item of summary.lessons.slice(0, 10)) {
      const lesson = byId.get(item.id)?.[item.edition];
      if (!lesson || !top) continue;
      const row = document.createElement('li');
      const link = document.createElement('a'); link.href = lesson.path; link.textContent = lesson.title;
      const meta = document.createElement('span'); meta.textContent = `${item.edition === 'adult' ? 'Adult' : 'Teen'} · ${number.format(item.count)}`;
      row.append(link, meta); top.append(row);
    }
    if (top && top.children.length === 0) top.append(Object.assign(document.createElement('li'), { textContent: 'No lesson views recorded yet.' }));

    const interactions = dashboard.querySelector<HTMLElement>('[data-interactions]');
    interactions?.replaceChildren();
    const labels = { edition_switch: 'Edition switches', save: 'Save actions', surprise: 'Surprise Me', related: 'Related lessons', outbound: 'Outbound links' } as const;
    for (const [key, label] of Object.entries(labels)) {
      const group = document.createElement('div');
      const term = document.createElement('dt'); term.textContent = label;
      const value = document.createElement('dd'); value.textContent = number.format(summary.events[key as keyof typeof labels]);
      group.append(term, value); interactions?.append(group);
    }

    const series = dashboard.querySelector<HTMLTableSectionElement>('[data-daily-series]');
    series?.replaceChildren();
    for (const item of [...summary.series].reverse()) {
      const row = document.createElement('tr');
      const day = document.createElement('th'); day.scope = 'row'; day.textContent = date.format(new Date(`${item.day}T00:00:00Z`));
      const views = document.createElement('td'); views.textContent = number.format(item.views);
      const events = document.createElement('td'); events.textContent = number.format(item.interactions);
      row.append(day, views, events); series?.append(row);
    }
    if (series && series.children.length === 0) {
      const row = document.createElement('tr'); const empty = document.createElement('td'); empty.colSpan = 3; empty.textContent = 'No activity recorded yet.'; row.append(empty); series.append(row);
    }
    if (status) status.textContent = `Showing ${summary.range.from} to ${summary.range.to}. Updated ${new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(summary.generatedAt))}.`;
  } catch {
    if (status) status.textContent = 'Analytics totals are temporarily unavailable. Reading the site is unaffected.';
    for (const key of ['views', 'lessonViews', 'pageViews', 'interactions'] as const) {
      setText(`[data-metric="${key}"]`, 'Unavailable');
    }
    setText('[data-edition-metric="adult"]', 'Unavailable');
    setText('[data-edition-metric="teen"]', 'Unavailable');

    const top = dashboard.querySelector<HTMLOListElement>('[data-top-lessons]');
    top?.replaceChildren(Object.assign(document.createElement('li'), { textContent: 'Analytics totals are temporarily unavailable.' }));

    const interactions = dashboard.querySelector<HTMLElement>('[data-interactions]');
    interactions?.replaceChildren();
    const group = document.createElement('div');
    const term = document.createElement('dt'); term.textContent = 'Interaction totals';
    const value = document.createElement('dd'); value.textContent = 'Unavailable';
    group.append(term, value); interactions?.append(group);

    const series = dashboard.querySelector<HTMLTableSectionElement>('[data-daily-series]');
    const row = document.createElement('tr');
    const empty = document.createElement('td'); empty.colSpan = 3; empty.textContent = 'Analytics totals are temporarily unavailable.';
    row.append(empty); series?.replaceChildren(row);
  }
}

void render();
