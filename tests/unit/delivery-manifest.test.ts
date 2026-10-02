import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import routeOwnership from '../../src/content/route-ownership.json';
import { loadPublishedLessons } from '../../src/lib/content/loader';
import type { LessonBundle } from '../../src/lib/content/schema';
import { buildDeliveryManifest } from '../../src/lib/delivery-manifest';
import { lessonPath } from '../../src/lib/urls';

function lesson(id: string, slug: string, aliases = ['old-' + slug]): LessonBundle {
 return { metadata:{schemaVersion:1,id,slug,aliases,publishedAt:'2026-10-02T20:00:00+02:00',topic:'science',subtopic:'physics',concepts:['test'],related:{manual:[],exclude:[]},sources:[],provenance:{createdAt:'2026-10-02T17:00:00Z',createdBy:{type:'human'},reviews:[]}},
 adult:{title:'Adult '+slug,description:'d',takeaway:'t',question:'q',answer:'a',searchTerms:[]},
 teen:{title:'Teen '+slug,description:'d',takeaway:'t',question:'q',answer:'a',searchTerms:[]} };
}
const A='0199a5b7-6e21-7a42-9c3d-8f1b2e4a6c70', B='0199a5b7-6e21-7a42-9c3d-8f1b2e4a6c71';

describe('delivery manifest',()=>{
 it('is deterministic and creates exactly two canonical routes plus redirect inputs',()=>{
  const first=buildDeliveryManifest([lesson(B,'beta'),lesson(A,'alpha')]), second=buildDeliveryManifest([lesson(A,'alpha'),lesson(B,'beta')]);
  expect(first).toEqual(second); expect(first.catalogue).toHaveLength(2); expect(first.routes).toHaveLength(4); expect(first.redirects).toHaveLength(4);
  expect(first.routes.map(x=>x.path)).toEqual([lessonPath('adult','alpha'),lessonPath('adult','beta'),lessonPath('teen','alpha'),lessonPath('teen','beta')]);
 });
 it('normalises publication timestamps to UTC',()=>{ expect(buildDeliveryManifest([lesson(A,'alpha')]).catalogue[0].publishedAt).toBe('2026-10-02T18:00:00.000Z'); });
 it('fails closed for empty or incomplete input',()=>{ expect(()=>buildDeliveryManifest([])).toThrow(/without published/); const x=lesson(A,'alpha'); x.teen=undefined; expect(()=>buildDeliveryManifest([x])).toThrow(/incomplete/); });
 it('rejects duplicate identities and canonical paths',()=>{ expect(()=>buildDeliveryManifest([lesson(A,'alpha'),lesson(A,'beta')])).toThrow(/Duplicate lesson identity/); expect(()=>buildDeliveryManifest([lesson(A,'same'),lesson(B,'same')])).toThrow(/Duplicate canonical route/); });
 it('rejects alias conflicts with canonical routes, duplicate aliases and self redirects',()=>{
  expect(()=>buildDeliveryManifest([lesson(A,'alpha',['beta']),lesson(B,'beta')])).toThrow(/conflicts with canonical route/);
  expect(()=>buildDeliveryManifest([lesson(A,'alpha',['old']),lesson(B,'beta',['old'])])).toThrow(/Duplicate redirect source/);
  expect(()=>buildDeliveryManifest([lesson(A,'alpha',['alpha'])])).toThrow(/conflicts with canonical route|point to itself/);
 });
 it('contains metadata rather than rendered bodies or provider data',()=>{ const json=JSON.stringify(buildDeliveryManifest([lesson(A,'alpha')]).catalogue); expect(json).not.toContain('Html'); expect(json).not.toContain('cloudflare'); expect(json).not.toContain('sourceDirectory'); });
 it('builds from the real validated canonical lesson set',async()=>{ const loaded=await loadPublishedLessons(join(process.cwd(),'src/content/lessons'),routeOwnership); const bundles:LessonBundle[]=loaded.map(({metadata,adult,teen})=>({metadata,adult,teen})); const m=buildDeliveryManifest(bundles); expect(m.catalogue).toHaveLength(loaded.length); expect(m.routes).toHaveLength(loaded.length*2); });
});
