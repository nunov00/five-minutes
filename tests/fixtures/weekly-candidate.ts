import { weeklyRemainingPipeline } from '../../scripts/weekly-cycle.mjs';

export function weeklyCandidate() {
  const slug = 'why-shadows-change', id = '12345678-1234-4234-9234-123456789abc';
  const root = `src/content/lessons/2026/${slug}`;
  const base: any = { version: 1, entries: [{key: 'shadow', kind: 'new', slug, title: 'Shadows', state: 'queued', priority: 1,
    queuedAt: '2026-10-01T08:00:00Z', reason: 'Explain an everyday puzzle.', criteria: ['Explain the cause.']}],
    pipeline: {assessedAt: '2026-10-04T08:00:00Z', summary: 'Reviewed Sunday selection.', shortfall: 'Only one eligible idea in this fixture.', ranking: [{key:'shadow', headline:'Shadows', description:'Why shadows change.', hook:'An everyday puzzle.', rankReason:'Clear payoff.', relevance:'Evergreen.', evidenceUrls:[]}]} };
  const head = structuredClone(base);
  Object.assign(head.entries[0], {state:'complete', completedAt:'2026-10-09T05:00:00+02:00', destinationId:id, destinationSlug:slug});
  head.pipeline = weeklyRemainingPipeline(base.pipeline);
  const texts: Record<string,string> = {
    [`${root}/lesson.yaml`]: `schemaVersion: 2\nid: ${id}\nslug: ${slug}\naliases: []\npublishedAt: 2026-10-09T05:00:00+02:00\ntopic: science\nsubtopic: astronomy\nconcepts: [shadows]\nrelated: { manual: [], exclude: [] }\nsources: []\nprovenance:\n  createdAt: 2026-10-05T04:30:00+02:00\n  createdBy: { type: ai, provider: openai, model: test, promptVersion: test }\n  reviews: []\n`,
    [`${root}/adult.md`]: '---\ntitle: Why Shadows Change\ndescription: A description.\ntakeaway: A takeaway.\nquestion: A question?\nanswer: An answer.\nsearchTerms: [shadows]\n---\nBody.\n',
    'editorial/backlog.json': JSON.stringify(head),
  };
  const registry = JSON.stringify({[slug]:id});
  return {pr:{headRef:`weekly-lesson/2026-10-04/${slug}`,headSha:'c'.repeat(40),labels:['editorial-review-requested','review:mandatory']},
    triggerHeadSha:'c'.repeat(40), currentBaseSha:'b'.repeat(40), mergeBaseSha:'b'.repeat(40), behindBy:0,
    files:[...Object.keys(texts).map(filename=>({filename,status:filename==='editorial/backlog.json'?'modified':'added',additions:10,deletions:0,changes:10})),
      {filename:'src/content/route-ownership.json',status:'modified',additions:1,deletions:0,changes:1}],
    blobs:Object.fromEntries(Object.entries(texts).map(([path,text])=>[path,{text,size:Buffer.byteLength(text),mode:'100644',type:'blob'}])),
    baseBacklogText:JSON.stringify(base), baseRegistryText:'{}', headRegistryBlob:{text:registry,size:Buffer.byteLength(registry),mode:'100644',type:'blob'}, now:'2026-10-09T08:00:00Z'};
}
