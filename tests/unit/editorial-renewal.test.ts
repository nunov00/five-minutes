import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { parse, stringify } from 'yaml';
import { parseBacklog, nextBacklogEntry } from '../../scripts/editorial-backlog.mjs';
import { evaluateLessonPullRequest } from '../../scripts/lesson-guard-core.mjs';
import { collectGuardInput } from '../../scripts/verify-lesson-pr.mjs';
import { validateLessonMetadata } from '../../src/lib/content/schema';
import { buildDeliveryManifest } from '../../src/lib/delivery-manifest';
import { selectEarlierLessons, selectTodayLesson, releaseTimestamp } from '../../src/lib/today';
import { validLesson } from '../fixtures/lesson-fixtures';

const slug='renew-this-lesson', id='12345678-1234-4234-9234-123456789abc';
const root=`src/content/lessons/2026/${slug}`, queuePath='editorial/backlog.json';
const release='2026-10-18T02:00:00+02:00';
function queued(kind='revision') { return {key:'selected',kind,slug,lessonId:id,state:'queued',priority:10,queuedAt:'2026-10-18T00:00:00Z',reason:'Adult needs explanatory depth.',criteria:['Explain the mechanism.'],...(kind==='import'?{sourceUrl:`https://five-minutes.vitoria-nuno.chatgpt.site/lesson/${slug}`,originalDate:'2026-08-04'}:{})}; }
function textBlob(text:string) { return {mode:'100644',type:'blob',size:Buffer.byteLength(text),text}; }
function revision(kind='revision') {
  const entry=queued(kind), baseQueue={version:1,entries:[entry]}, completed={...entry,state:'complete',completedAt:release,destinationId:id,destinationSlug:slug};
  const metadata={...validLesson().metadata,id,slug,aliases:[],publishedAt:'2026-10-03T02:00:00+02:00',provenance:{createdAt:'2026-10-03T00:00:00+02:00',createdBy:{type:'ai',provider:'test'},reviews:[]}};
  const baseLessonText=stringify(metadata);
  const head={...metadata,revisedAt:release};
  if(kind==='import') { head.publishedAt=release; head.provenance.createdAt='2026-10-18T00:00:00+02:00'; (head as any).archive={sourceUrl:entry.sourceUrl,catalogueDate:entry.originalDate}; }
  const body='---\ntitle: A concrete puzzle\ndescription: A useful description.\ntakeaway: A causal insight.\nquestion: Why?\nanswer: The mechanism.\nsearchTerms: [mechanism]\n---\nA concrete example explains the mechanism.\n';
  const blobs:Record<string,any>={ [`${root}/lesson.yaml`]:textBlob(stringify(head)),[`${root}/adult.md`]:textBlob(body),[`${root}/teen.md`]:textBlob(body),[queuePath]:textBlob(JSON.stringify({version:1,entries:[completed]})) };
  const registry=JSON.stringify({[slug]:id});
  return {pr:{headRef:`lesson/${slug}`,headSha:'c'.repeat(40),labels:['editorial-review-requested','review:mandatory']},triggerHeadSha:'c'.repeat(40),currentBaseSha:'b'.repeat(40),mergeBaseSha:'b'.repeat(40),behindBy:0,
    baseBacklogText:JSON.stringify(baseQueue),baseLessonText,baseAdultText:body,baseTeenText:body,baseRegistryText:kind==='import'?'{}':registry,headRegistryBlob:textBlob(registry),blobs,
    files:[...Object.keys(blobs).filter(filename=>!filename.endsWith('/teen.md')).map(filename=>({filename,status:filename===queuePath||kind==='revision'?'modified':'added',additions:10,deletions:1,changes:11})),...(kind==='import'?[{filename:'src/content/route-ownership.json',status:'modified',additions:1,deletions:0,changes:1}]:[])],
    now:'2026-10-18T03:00:00+02:00'};
}
function changeMetadata(v:ReturnType<typeof revision>, mutate:(m:any)=>void) { const m=parse(v.blobs[`${root}/lesson.yaml`].text); mutate(m); v.blobs[`${root}/lesson.yaml`]=textBlob(stringify(m)); }

describe('editorial queue and bounded daily publication',()=>{
 it('preserves the remaining original inventory as entries progress or are returned',()=>{
   const backlog=parseBacklog(readFileSync(queuePath,'utf8'));
   expect(backlog.entries.filter((e:any)=>e.key.startsWith('legacy-'))).toHaveLength(43);
   const owners=JSON.parse(readFileSync('src/content/route-ownership.json','utf8'));
   for(const entry of backlog.entries.filter((e:any)=>e.kind==='revision')) expect(owners[entry.slug]).toBe(entry.lessonId);
 });
 it('gives an Owner return priority over ordinary revisions and transfers',()=>{
  const backlog={entries:[{...queued(),key:'old',priority:10},{...queued('import'),key:'transfer',priority:20},{...queued(),key:'owner',priority:0,queuedAt:'2026-10-19T00:00:00Z'}]};
  expect(nextBacklogEntry(backlog)?.key).toBe('owner');
 });
 it('rejects duplicate keys, ambiguous JSON and invalid original records',()=>{
  expect(()=>parseBacklog(JSON.stringify({version:1,entries:[queued(),queued()]}))).toThrow();
  expect(()=>parseBacklog('{"version":1,"version":1,"entries":[]}')).toThrow();
  expect(()=>parseBacklog(JSON.stringify({version:1,entries:[{...queued('import'),originalDate:'2026-02-30'}]}))).toThrow();
 });
 it.each(['revision','import'])('accepts one complete selected %s candidate', kind=>expect(evaluateLessonPullRequest(revision(kind))).toMatchObject({applicable:true,lessonId:id}));
 it('permits a later-day branch suffix for retrying a still queued lesson',()=>{
  const v=revision(); v.pr.headRef+= '-2026-10-18'; expect(evaluateLessonPullRequest(v)).toMatchObject({applicable:true});
  v.pr.headRef=`lesson/${slug}-2026-10-17`; expect(()=>evaluateLessonPullRequest(v)).toThrow();
 });
 it.each(['id','slug','aliases','publishedAt','topic','subtopic','archive','createdAt','createdBy'])('preserves original %s during a published-lesson revision',key=>{
  const v=revision(); changeMetadata(v,m=>{if(key==='createdAt')m.provenance.createdAt=release;else if(key==='createdBy')m.provenance.createdBy={type:'human'};else if(key==='aliases')m.aliases=['new-alias'];else if(key==='archive')m.archive={sourceUrl:'https://example.org',catalogueDate:'2026-08-01'};else m[key]=key==='id'?'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa':'changed';});
  expect(()=>evaluateLessonPullRequest(v)).toThrow();
 });
 it.each(['main ancestry','event head','stale date','unchanged revision date','unrelated code','route mutation','borrowed asset','missing base backlog','uncompleted queue','changed criteria','second completion'])('fails closed for %s',problem=>{
  const v=revision();
  if(problem==='main ancestry')v.behindBy=1;
  if(problem==='event head')v.triggerHeadSha='d'.repeat(40);
  if(problem==='stale date')v.now='2026-10-19T03:00:00+02:00';
  if(problem==='unchanged revision date')changeMetadata(v,m=>m.revisedAt=m.publishedAt);
  if(problem==='unrelated code')v.files.push({filename:'src/evil.js',status:'added',additions:1,deletions:0,changes:1});
  if(problem==='route mutation')v.headRegistryBlob=textBlob('{}');
  if(problem==='borrowed asset') { const figure={type:'image',src:'/lesson-media/unrelated.png',width:192,height:192,alt:'An image.',caption:'Caption.',description:'Description.'}; for(const e of ['adult','teen'])v.blobs[`${root}/${e}.md`]=textBlob(v.blobs[`${root}/${e}.md`].text.replace('searchTerms:',stringify({figure})+'searchTerms:'));changeMetadata(v,m=>m.imageRights=[{src:figure.src,origin:'original-code',creator:'Test',licence:'Original',evidence:'Test evidence.'}]); }
  if(problem==='missing base backlog')delete (v as any).baseBacklogText;
  if(problem==='uncompleted queue')v.blobs[queuePath]=textBlob(v.baseBacklogText);
  if(problem==='changed criteria'||problem==='second completion') { const q=JSON.parse(v.blobs[queuePath].text); if(problem==='changed criteria')q.entries[0].criteria=['Trust me.'];else q.entries.push({...q.entries[0],key:'another'});v.blobs[queuePath]=textBlob(JSON.stringify(q)); }
  expect(()=>evaluateLessonPullRequest(v)).toThrow();
 });
 it('does not permit a fresh topic while a queued lesson remains',()=>{
  const v=revision('import'); v.files=v.files.filter(f=>f.filename!==queuePath);delete v.blobs[queuePath];changeMetadata(v,m=>{delete m.revisedAt;delete m.archive;});
  expect(()=>evaluateLessonPullRequest(v)).toThrow(/Queued lessons/);
 });
 it('cannot replace a parked-only backlog with a fresh topic',()=>{
  const v=revision('import'); const q=JSON.parse(v.baseBacklogText);
  q.entries[0].state='parked';q.entries[0].blocker={reason:'Source unavailable',issueUrl:'https://github.com/nunov00/five-minutes/issues/161',failedDays:['2026-10-16','2026-10-17']};v.baseBacklogText=JSON.stringify(q);
  v.files=v.files.filter(f=>f.filename!==queuePath);delete v.blobs[queuePath];changeMetadata(v,m=>{delete m.revisedAt;delete m.archive;});
  expect(()=>evaluateLessonPullRequest(v)).toThrow(/Queued lessons/);
 });
 it('cannot park a lesson through the ordinary completion candidate',()=>{
  const v=revision();const q=JSON.parse(v.blobs[queuePath].text);q.entries[0].state='parked';q.entries[0].blocker={reason:'No source',issueUrl:'https://github.com/nunov00/five-minutes/issues/161',failedDays:['2026-10-16','2026-10-17']};v.blobs[queuePath]=textBlob(JSON.stringify(q));
  expect(()=>evaluateLessonPullRequest(v)).toThrow(/Only the selected/);
 });
 it('requires original transfer provenance to match the queue',()=>{
  const v=revision('import');changeMetadata(v,m=>m.archive.catalogueDate='2026-08-05');expect(()=>evaluateLessonPullRequest(v)).toThrow(/provenance/);
 });
 it('collects a revision from pinned base/head blobs without executing candidate content',async()=>{
  const v=revision(), requests:string[]=[];
  const fetchImpl=async(url:string)=>{
   requests.push(url);let data:any;
   if(url.endsWith('/pulls/7'))data={head:{sha:v.pr.headSha,ref:v.pr.headRef},base:{sha:v.currentBaseSha,ref:'main'},labels:v.pr.labels.map(name=>({name}))};
   else if(url.includes('/git/ref/heads/main'))data={object:{sha:v.currentBaseSha}};
   else if(url.includes('/compare/'))data={merge_base_commit:{sha:v.currentBaseSha},behind_by:0,files:v.files};
   else if(url.includes('/git/trees/'))data={truncated:false,tree:[...Object.keys(v.blobs),'src/content/route-ownership.json'].map(path=>({path,mode:'100644',type:'blob'}))};
   else {const u=new URL(url),path=decodeURIComponent(u.pathname.split('/contents/')[1]),base=u.searchParams.get('ref')===v.currentBaseSha;
    const text=path==='src/content/route-ownership.json'?v.headRegistryBlob.text:base?(path===queuePath?v.baseBacklogText:path.endsWith('lesson.yaml')?v.baseLessonText:path.endsWith('adult.md')?v.baseAdultText:v.baseTeenText):v.blobs[path].text;
    data={type:'file',encoding:'base64',size:Buffer.byteLength(text),content:Buffer.from(text).toString('base64')};}
   return {ok:true,status:200,json:async()=>data};
  };
  const collected=await collectGuardInput({env:{GITHUB_TOKEN:'test',GITHUB_REPOSITORY:'owner/repo',PR_NUMBER:'7',TRIGGER_HEAD_SHA:v.pr.headSha,TRIGGER_HEAD_REF:v.pr.headRef,TRIGGER_HAS_REVIEW_LABEL:'true'},fetchImpl:fetchImpl as any,now:v.now});
  expect(evaluateLessonPullRequest(collected)).toMatchObject({applicable:true});
  expect(requests.some(u=>u.includes('editorial/backlog.json')&&u.includes(v.currentBaseSha))).toBe(true);
 });
});

describe('revision date and resurfacing',()=>{
 it('rejects invalid/backdated revision dates without changing the original publication rule',()=>{
  for(const revisedAt of ['2026-02-30T00:00:00Z','2026-01-01T00:00:00Z','tomorrow'])expect(validateLessonMetadata({...validLesson().metadata,revisedAt}).valid).toBe(false);
 });
 it('promotes a revised lesson while preserving the original date and avoiding duplicate Earlier entries',()=>{
  const old=validLesson();old.metadata.revisedAt=release;old.metadata.archive={sourceUrl:'https://example.org/old',catalogueDate:'2026-08-04'};
  const other=structuredClone(old);other.metadata.id='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';other.metadata.slug='other';other.metadata.aliases=[];delete other.metadata.archive;delete other.metadata.revisedAt;other.metadata.publishedAt='2026-10-17T02:00:00+02:00';
  const catalogue=buildDeliveryManifest([old,other]).catalogue;
  expect(selectTodayLesson(catalogue).id).toBe(old.metadata.id);
  expect(selectEarlierLessons(catalogue,old.metadata.id).map(e=>e.id)).toEqual([other.metadata.id]);
  expect(selectTodayLesson(catalogue).publishedAt).toBe(new Date(old.metadata.publishedAt).toISOString());
  expect(releaseTimestamp(selectTodayLesson(catalogue))).toBe(release);
 });
});

describe('ranked pipeline refresh boundary',()=>{
 const idea=(key:string)=>({key,kind:'new',slug:key,state:'queued',priority:200,queuedAt:'2026-10-18T00:00:00Z',reason:'A useful everyday puzzle.',criteria:['Explain the mechanism.']});
 const brief=(key:string)=>({key,headline:'Why does this happen?',description:'Explain a concrete mechanism.',hook:'An everyday surprise.',rankReason:'Strong curiosity and clear learning value.',relevance:'Evergreen editorial judgement; no measured trend claimed.',evidenceUrls:[]});
 const pipeline=(keys:string[])=>({assessedAt:'2026-10-18T00:30:00Z',summary:'Reassessed against the full pool.',ranking:keys.map(brief),...(keys.length<10?{shortfall:'A small test pool has fewer than ten viable ideas.'}:{})});
 function rankedCandidate(kind='revision') {
  const v=revision(kind==='new'?'import':'revision');
  const base=JSON.parse(v.baseBacklogText),head=JSON.parse(v.blobs[queuePath].text);
  if(kind==='new') {
   for(const e of [base.entries[0],head.entries[0]]) {e.kind='new';delete e.lessonId;delete e.sourceUrl;delete e.originalDate;}
   changeMetadata(v,m=>{delete m.archive;delete m.revisedAt;});
  }
  base.entries.push(idea('another-idea'));base.pipeline=pipeline(['selected','another-idea']);
  head.entries.push(idea('another-idea'));head.pipeline=pipeline(['another-idea']);
  v.baseBacklogText=JSON.stringify(base);v.blobs[queuePath]=textBlob(JSON.stringify(head));return v;
 }
 it('uses reviewed rank instead of the legacy priority and keeps the full pool',()=>{
  const q={version:1,entries:[{...idea('old-idea'),priority:0},idea('new-idea')],pipeline:pipeline(['new-idea','old-idea'])};
  expect(nextBacklogEntry(parseBacklog(JSON.stringify(q)))?.key).toBe('new-idea');
 });
 it.each(['revision','new'])('accepts a ranked %s selection and next shortlist in the same guarded candidate',kind=>{
  expect(evaluateLessonPullRequest(rankedCandidate(kind))).toMatchObject({applicable:true,lessonId:id});
 });
 it('permits bounded appended new ideas while retaining the prior records',()=>{
  const v=rankedCandidate(),q=JSON.parse(v.blobs[queuePath].text);
  q.entries.push(idea('fresh-puzzle'));q.pipeline=pipeline(['fresh-puzzle','another-idea']);v.blobs[queuePath]=textBlob(JSON.stringify(q));
  expect(evaluateLessonPullRequest(v)).toMatchObject({applicable:true});
 });
 it.each(['delete entry','alter criteria','extra completion','change selected record','remove pipeline','duplicate rank','completed rank','unknown rank','unexplained shortfall','future assessment','stale assessment','six additions','new revision','duplicate slug','new provenance','choose candidate ranking'])('rejects %s',problem=>{
  const v=rankedCandidate(),q=JSON.parse(v.blobs[queuePath].text);
  if(problem==='delete entry')q.entries.pop();
  if(problem==='alter criteria')q.entries[1].criteria=['No review needed.'];
  if(problem==='extra completion')Object.assign(q.entries[1],{state:'complete',completedAt:release,destinationId:id,destinationSlug:slug});
  if(problem==='change selected record')q.entries[0].reason='Different requirements.';
  if(problem==='remove pipeline')delete q.pipeline;
  if(problem==='duplicate rank')q.pipeline.ranking.push(brief('another-idea'));
  if(problem==='completed rank')q.pipeline.ranking.push(brief('selected'));
  if(problem==='unknown rank')q.pipeline.ranking.push(brief('invented'));
  if(problem==='unexplained shortfall')delete q.pipeline.shortfall;
  if(problem==='future assessment')q.pipeline.assessedAt='2026-10-18T12:00:00Z';
  if(problem==='stale assessment')q.pipeline.assessedAt='2026-10-17T00:30:00Z';
  if(problem==='six additions')for(let n=0;n<6;n++)q.entries.push(idea(`extra-${n}`));
  if(problem==='new revision')q.entries.push({...idea('extra-idea'),kind:'revision',lessonId:id});
  if(problem==='duplicate slug')q.entries.push({...idea('extra-idea'),slug:'another-idea'});
  if(problem==='new provenance')q.entries.push({...idea('extra-idea'),sourceUrl:'https://example.org'});
  if(problem==='choose candidate ranking') {const b=JSON.parse(v.baseBacklogText);b.pipeline=pipeline(['another-idea','selected']);v.baseBacklogText=JSON.stringify(b);}
  v.blobs[queuePath]=textBlob(JSON.stringify(q));expect(()=>evaluateLessonPullRequest(v)).toThrow();
 });
 it('rejects forged import/revision provenance on a selected new idea',()=>{
  const v=rankedCandidate('new');changeMetadata(v,m=>m.revisedAt=m.publishedAt);
  expect(()=>evaluateLessonPullRequest(v)).toThrow(/provenance/);
 });
 it('rejects a fabricated pre-publication identity on a new idea',()=>{
  // CLI end-to-end return cases are exercised in backlog-owner-return.test.ts;
  // the pool itself rejects a fabricated pre-publication identity on new ideas.
  expect(()=>parseBacklog(JSON.stringify({version:1,entries:[{...idea('fresh-idea'),lessonId:id}],pipeline:pipeline(['fresh-idea'])}))).toThrow();
 });
 it.each(['registry alias','original import slug','legacy pool alias'])('rejects a new idea colliding with %s',collision=>{
  const v=rankedCandidate(),base=JSON.parse(v.baseBacklogText),head=JSON.parse(v.blobs[queuePath].text);
  const reserved='gps-and-relativity';
  if(collision==='registry alias') {
   const owners=JSON.parse(v.baseRegistryText);owners[reserved]=id;v.baseRegistryText=JSON.stringify(owners);v.headRegistryBlob=textBlob(JSON.stringify(owners));
  } else if(collision==='original import slug') {
   const e={...idea('old-import'),kind:'import',slug:reserved,sourceUrl:`https://five-minutes.vitoria-nuno.chatgpt.site/lesson/${reserved}`,originalDate:'2026-08-04',state:'complete',completedAt:release,destinationId:id,destinationSlug:slug};
   base.entries.push(e);head.entries.push({...e});
  } else {
   base.entries[1].legacySlugs=[reserved];head.entries[1].legacySlugs=[reserved];
  }
  head.entries.push({...idea('fresh-puzzle'),slug:reserved});head.pipeline=pipeline(['fresh-puzzle','another-idea']);
  v.baseBacklogText=JSON.stringify(base);v.blobs[queuePath]=textBlob(JSON.stringify(head));
  expect(()=>evaluateLessonPullRequest(v)).toThrow(/reserved route/);
 });
 it.each(['2026-10-18T00:30:00','2026-02-30T00:30:00Z'])('rejects ambiguous or invalid assessment %s',assessedAt=>{
  const v=rankedCandidate(),q=JSON.parse(v.blobs[queuePath].text);q.pipeline.assessedAt=assessedAt;v.blobs[queuePath]=textBlob(JSON.stringify(q));
  expect(()=>evaluateLessonPullRequest(v)).toThrow(/pipeline/);
 });
 it.each([['priority',0],['queuedAt','2026-10-17T00:00:00Z'],['queuedAt','2026-10-18T12:00:00Z'],['queuedAt','2026-10-18T00:00:00']])('rejects dishonest addition %s=%s',(field,value)=>{
  const v=rankedCandidate(),q=JSON.parse(v.blobs[queuePath].text);q.entries.push({...idea('fresh-puzzle'),[field as string]:value});v.blobs[queuePath]=textBlob(JSON.stringify(q));
  expect(()=>evaluateLessonPullRequest(v)).toThrow(/current-run-day/);
 });
 it('accepts explicit offsets just after Zurich midnight even when the UTC date differs',()=>{
  const v=rankedCandidate(),q=JSON.parse(v.blobs[queuePath].text);q.pipeline.assessedAt='2026-10-18T00:00:01+02:00';q.entries.push({...idea('fresh-puzzle'),queuedAt:'2026-10-17T22:00:01Z'});v.blobs[queuePath]=textBlob(JSON.stringify(q));
  expect(evaluateLessonPullRequest(v)).toMatchObject({applicable:true});
 });

});
