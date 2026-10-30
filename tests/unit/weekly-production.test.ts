import { describe, expect, it } from 'vitest';
import { weeklyCycle, weeklyLessonBranch } from '../../scripts/weekly-cycle.mjs';
import { evaluateLessonPullRequest } from '../../scripts/lesson-guard-core.mjs';
import { assessWeeklyPublication, parseWeeklySnapshot } from '../../scripts/weekly-publication.mjs';
import { weeklyCandidate } from '../fixtures/weekly-candidate';

function publication() {
  const guardInput = weeklyCandidate(), head = guardInput.pr.headSha;
  const names = ['baseline','e2e','lesson-guard','privacy'];
  const checks = names.map((name,i)=>({name,id:i+1,head_sha:head,status:'completed',conclusion:'success',app:{slug:'github-actions'},
    details_url:`https://github.com/nunov00/five-minutes/actions/runs/${i+1}/job/100`, started_at:'2026-10-08T08:00:00Z',completed_at:'2026-10-08T08:30:00Z'}));
  const workflowRuns = names.map((name,i)=>({id:i+1,repository:{full_name:'nunov00/five-minutes'},head_repository:{full_name:'nunov00/five-minutes'},head_sha:head,
    path:`.github/workflows/${name==='lesson-guard'?'lesson-guard':name==='privacy'?'privacy':'ci'}.yml`,event:name==='lesson-guard'?'pull_request_target':'pull_request'}));
  const record = (id:number,provider:string,kind:string)=>({id,authorLogin:'nunov00',issueNumber:211,createdAt:id===10?'2026-10-08T09:00:00Z':'2026-10-08T10:00:00Z',updatedAt:id===10?'2026-10-08T09:00:00Z':'2026-10-08T10:00:00Z',receipt:{kind,provider,head,lessonQuality:9,topicAppeal:7,outcome:'Ready',unresolvedBlockerImportant:0,sources:'pass',phoneAndWideRender:'pass'}});
  return {prNumber:211,guardInput,checks,workflowRuns,author:record(10,'openai','author-quality'),reviewer:record(11,'anthropic','editorial-review'),rounds:[{round:1,head}],published:false,paused:false,enabled:true,now:guardInput.now};
}

describe('Swiss weekly calendar',()=>{
  it.each([
    ['2026-10-25T00:30:00Z','2026-10-25','selection'], // clock-change Sunday
    ['2026-10-25T23:30:00Z','2026-10-25','writing'],
    ['2026-10-30T23:30:00Z','2026-10-25','idle'],
    ['2026-12-31T23:30:00Z','2026-12-27','publication'],
    ['2027-03-28T01:30:00Z','2027-03-28','selection'],
  ])('resolves %s without a fixed offset',(now,sunday,stage)=>expect(weeklyCycle(now)).toMatchObject({sunday,stage}));
  it('rejects impossible dates and non-Sunday branch cycles',()=>{
    expect(()=>weeklyLessonBranch('2026-02-30','shadows')).toThrow();
    expect(()=>weeklyLessonBranch('2026-10-05','shadows')).toThrow();
  });
});

describe('bounded weekly candidate guard',()=>{
  it.each(['2026-10-05T08:00:00Z','2026-10-08T08:00:00Z','2026-10-09T08:00:00Z'])('accepts the frozen Sunday queue and Friday release on %s',now=>{
    const input=weeklyCandidate(); input.now=now;
    expect(evaluateLessonPullRequest(input)).toMatchObject({applicable:true,slug:'why-shadows-change'});
  });
  it.each(['2026-10-04T08:00:00Z','2026-10-10T08:00:00Z','2026-10-12T08:00:00Z'])('rejects Sunday, Saturday and stale cycles: %s',now=>{
    const input=weeklyCandidate(); input.now=now; expect(()=>evaluateLessonPullRequest(input)).toThrow(/Weekly candidate/);
  });
  it('keeps daily same-day and pipeline assessment rules',()=>{
    const input=weeklyCandidate(); input.pr.headRef='lesson/why-shadows-change';
    expect(()=>evaluateLessonPullRequest(input)).toThrow(/Pipeline assessment/);
  });
  it('cannot fall through as not applicable when its review label is removed',()=>{
    const input=weeklyCandidate(); input.pr.labels=['review:mandatory']; expect(()=>evaluateLessonPullRequest(input)).toThrow(/missing label/);
  });
  it.each(['2026-09-27T08:00:00Z','2026-10-05T08:00:00Z'])('rejects a queue assessed outside selection Sunday: %s',assessedAt=>{
    const input=weeklyCandidate(), base=JSON.parse(input.baseBacklogText); base.pipeline.assessedAt=assessedAt; input.baseBacklogText=JSON.stringify(base);
    expect(()=>evaluateLessonPullRequest(input)).toThrow(/Sunday/);
  });
  it('rejects a changed selection brief in a lesson PR',()=>{
    const input=weeklyCandidate(), blob=input.blobs['editorial/backlog.json']; const head=JSON.parse(blob.text); head.pipeline.summary='Different queue'; blob.text=JSON.stringify(head);blob.size=Buffer.byteLength(blob.text);
    expect(()=>evaluateLessonPullRequest(input)).toThrow(/may only complete/);
  });
  it('rejects extra code and stale main as daily candidates do',()=>{
    const input=weeklyCandidate();input.behindBy=1;expect(()=>evaluateLessonPullRequest(input)).toThrow(/current main/);
    input.behindBy=0;input.files.push({filename:'scripts/evil.mjs',status:'added',additions:1,deletions:0,changes:1});expect(()=>evaluateLessonPullRequest(input)).toThrow(/may change only/);
  });
});

describe('Friday publication decision',()=>{
  it('requires both lesson ratings ≥9 but allows advisory topic appeal below 9',()=>expect(assessWeeklyPublication(publication())).toMatchObject({eligible:true,expectedHeadSha:'c'.repeat(40)}));
  it.each(['author','reviewer'] as const)('rejects low or stale %s lesson evidence',key=>{
    const input=publication();input[key].receipt.lessonQuality=8;expect(()=>assessWeeklyPublication(input)).toThrow(/at least 9/);
    input[key].receipt.lessonQuality=9;input[key].receipt.head='d'.repeat(40);expect(()=>assessWeeklyPublication(input)).toThrow(/exact-head/);
  });
  it.each(['paused','published','enabled'] as const)('fails closed on unsafe %s state',key=>{const input=publication();input[key]=key!=='enabled';expect(()=>assessWeeklyPublication(input)).toThrow(/unsafe/);});
  it('rejects publishing before the intended Friday release time', () => {
    const input=publication();input.now='2026-10-09T02:00:00Z';input.guardInput.now=input.now;
    expect(()=>assessWeeklyPublication(input)).toThrow(/has not arrived/);
  });
  it('rejects Thursday publication, wrong provider, missing renders, unresolved findings and missing evidence',()=>{
    for(const mutate of [
      (v:any)=>v.now='2026-10-08T08:00:00Z', (v:any)=>v.reviewer.receipt.provider='openai',
      (v:any)=>v.reviewer.receipt.phoneAndWideRender='missing',(v:any)=>v.reviewer.receipt.unresolvedBlockerImportant=1,
      (v:any)=>delete v.reviewer,
    ]) {const v=publication();mutate(v);expect(()=>assessWeeklyPublication(v)).toThrow();}
  });
  it('rejects five review rounds and an earlier head masquerading as the latest',()=>{
    const input=publication();input.rounds=Array.from({length:5},(_,i)=>({round:i+1,head:String(i).repeat(40)}));expect(()=>assessWeeklyPublication(input)).toThrow(/ledger/);
    input.rounds=[{round:1,head:'c'.repeat(40)},{round:2,head:'d'.repeat(40)}];expect(()=>assessWeeklyPublication(input)).toThrow(/ledger/);
  });
  it.each(['missing review','uncertain dispatch','declined finding'])('allows another consumed round on identical content after %s',()=>{
    const input=publication();input.rounds.push({round:2,head:input.guardInput.pr.headSha});
    expect(assessWeeklyPublication(input)).toMatchObject({eligible:true});
  });
  it('accepts a later successful guard rerun while still requiring the newest run to succeed',()=>{
    const input=publication();const earlier=input.checks.find(c=>c.name==='lesson-guard')!;
    const rerun={...earlier,id:20,completed_at:'2026-10-09T07:00:00Z'};input.checks.push(rerun);
    expect(assessWeeklyPublication(input)).toMatchObject({eligible:true});
    rerun.conclusion='failure';expect(()=>assessWeeklyPublication(input)).toThrow(/current-head checks/);
    rerun.conclusion='success';rerun.status='queued';expect(()=>assessWeeklyPublication(input)).toThrow(/current-head checks/);
  });
  it('does not count an earlier spoofed success as review prerequisites',()=>{
    const input=publication();const check=input.checks[2];
    input.checks.push({...check,id:20,completed_at:'2026-10-09T07:00:00Z'});
    check.app={slug:'spoof'};
    expect(()=>assessWeeklyPublication(input)).toThrow(/after verified successful/);
  });
  it.each(['author','reviewer'] as const)('rejects edited or foreign-PR %s receipts',key=>{
    const input=publication();input[key].issueNumber=210;expect(()=>assessWeeklyPublication(input)).toThrow(/exact-head/);
    input[key].issueNumber=211;input[key].updatedAt='2026-10-09T07:00:00Z';expect(()=>assessWeeklyPublication(input)).toThrow(/exact-head/);
  });
  it('rejects author assessments posted after Claude or before the checks',()=>{
    const input=publication();input.author.createdAt=input.author.updatedAt='2026-10-08T11:00:00Z';
    expect(()=>assessWeeklyPublication(input)).toThrow(/precede/);
    input.author.createdAt=input.author.updatedAt='2026-10-08T08:00:00Z';
    expect(()=>assessWeeklyPublication(input)).toThrow(/after verified successful/);
  });
  it('rejects skipped or spoofed checks and reviews predating check completion',()=>{
    for(const mutate of [(v:any)=>v.checks[0].conclusion='skipped',(v:any)=>v.workflowRuns[0].event='push',
      (v:any)=>v.reviewer.createdAt='2026-10-08T08:00:00Z']) {const v=publication();mutate(v);expect(()=>assessWeeklyPublication(v)).toThrow();}
  });
});


describe('weekly snapshot image transport',()=>{
  it('restores exactly the API-fetched binary bytes across JSON transport',()=>{
    const input:any=publication();input.guardInput.blobs['public/lesson-media/shadows.png']={size:4,bytes:Buffer.from([0,127,128,255])};
    const loaded=parseWeeklySnapshot(JSON.stringify(input));
    expect(Buffer.isBuffer(loaded.guardInput.blobs['public/lesson-media/shadows.png'].bytes)).toBe(true);
    expect(loaded.guardInput.blobs['public/lesson-media/shadows.png'].bytes).toEqual(Buffer.from([0,127,128,255]));
    // This parser grants no exception to the structural guard for extra files.
    expect(assessWeeklyPublication(parseWeeklySnapshot(JSON.stringify(publication())))).toMatchObject({eligible:true});
  });
  it.each([{size:1,bytes:{type:'Buffer',data:[256]}},{size:2,bytes:{type:'Buffer',data:[1]}},
    {size:1,bytes:{type:'Buffer',data:[-1]}},{size:1,bytes:{type:'Buffer',data:[null]}},
    {size:2_000_000,bytes:{type:'Buffer',data:[]}}])('rejects corrupt or oversized bytes: %j',blob=>{
    const input:any=publication();input.guardInput.blobs.image=blob;
    expect(()=>parseWeeklySnapshot(JSON.stringify(input))).toThrow(/snapshot image bytes/);
  });
});
