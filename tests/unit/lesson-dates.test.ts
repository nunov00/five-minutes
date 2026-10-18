import { describe, expect, it } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import LessonDates from '../../src/components/LessonDates.astro';

describe('reader date rendering',()=>{
 it('shows the original day and only the latest substantive revision without import labels',async()=>{
  const container=await AstroContainer.create();
  const html=await container.renderToString(LessonDates,{props:{publishedAt:'2026-10-16T02:00:00+02:00',originalDate:'2026-08-04',revisedAt:'2026-10-18T02:00:00+02:00'}});
  expect(html).toContain('4 August 2026');
  expect(html).toContain('Revised on');
  expect(html).toContain('18 October 2026');
  expect(html).not.toMatch(/Archive|Adapted|16 October/);
  expect(html.match(/<time /g)).toHaveLength(2);
 });
 it('does not invent a revision for an unrevised lesson',async()=>{
  const container=await AstroContainer.create();
  const html=await container.renderToString(LessonDates,{props:{publishedAt:'2026-10-03T00:30:00+02:00'}});
  expect(html).toContain('3 October 2026');
  expect(html).not.toContain('Revised');
  expect(html.match(/<time /g)).toHaveLength(1);
 });
});
