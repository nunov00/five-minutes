import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { parse } from 'yaml';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import LessonDates from '../../src/components/LessonDates.astro';
import { legacyPublicationDate, lessonEditorialTimestamp } from '../../src/lib/editorial-order';
import { formatEditorialDate } from '../../src/lib/today';
import { buildDeliveryManifest } from '../../src/lib/delivery-manifest';
import { buildDiscoveryArtifacts } from '../../src/lib/discovery/artifacts';
import { newestLessons } from '../../src/lib/discovery/catalogue';
import { validLesson } from '../fixtures/lesson-fixtures';

describe('truthful dates for recovered unpublished drafts',()=>{
 it.each(['why-a-day-is-longer-than-earths-spin','why-every-rainbow-is-a-circle','why-lakes-freeze-from-the-top-down'])('shows first publication rather than draft-PR date for %s',async slug=>{
  const metadata=parse(readFileSync(`src/content/lessons/2026/${slug}/lesson.yaml`,'utf8'));
  expect(metadata.archive.sourceUrl).toMatch(/^https:\/\/github.com\/nunov00\/five-minutes\/pull\//);
  expect(legacyPublicationDate(metadata)).toBeUndefined();
  const container=await AstroContainer.create();
  const html=await container.renderToString(LessonDates,{props:{publishedAt:metadata.publishedAt,originalDate:legacyPublicationDate(metadata)}});
  expect(html).toContain(formatEditorialDate(metadata.publishedAt));expect(html).not.toContain('12 October 2026');expect(html).not.toMatch(/Archive|Adapted/);
  expect(lessonEditorialTimestamp(metadata)).toBe(metadata.publishedAt);
 });
 it('retains the recorded original-Site day when its provenance is an actual original lesson',()=>{
  const metadata=validLesson().metadata;metadata.archive={sourceUrl:'https://five-minutes.vitoria-nuno.chatgpt.site/lesson/example',catalogueDate:'2026-08-04'};
  expect(legacyPublicationDate(metadata)).toBe('2026-08-04');
 });
 it('uses the same truthful date on cards/catalogue and discovery ordering without changing Today eligibility',()=>{
  const recovered=validLesson();recovered.metadata.archive={sourceUrl:'https://github.com/nunov00/five-minutes/pull/97',catalogueDate:'2026-10-01'};recovered.metadata.publishedAt='2026-10-18T02:00:00+02:00';
  const other=structuredClone(recovered);other.metadata.id='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';other.metadata.slug='other';other.metadata.aliases=[];delete other.metadata.archive;other.metadata.publishedAt='2026-10-17T02:00:00+02:00';
  const catalogue=buildDeliveryManifest([recovered,other]).catalogue;
  expect(catalogue.find(e=>e.id===recovered.metadata.id)).toMatchObject({archiveDate:'2026-10-01'});
  expect(catalogue.find(e=>e.id===recovered.metadata.id)?.originalDate).toBeUndefined();
  expect(newestLessons([other,recovered])[0].metadata.id).toBe(recovered.metadata.id);
  expect(buildDiscoveryArtifacts([other,recovered]).catalogue.payload[0].id).toBe(recovered.metadata.id);
 });
});
