import { describe, expect, it } from 'vitest';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { nextBacklogEntry, parseBacklog } from '../../scripts/editorial-backlog.mjs';

const script=resolve('scripts/editorial-backlog.mjs');
const id='12345678-1234-4234-9234-123456789abc';
describe('Owner returning a lesson',()=>{
 it.each(['completed-transfer','accepted','new-published'])('returns %s to priority 0 without creating another identity',kind=>{
  const directory=mkdtempSync(join(tmpdir(),'five-minutes-return-'));
  try {
   mkdirSync(join(directory,'editorial'));
   const entry={key:'legacy-original',kind:kind==='completed-transfer'?'import':'revision',slug:kind==='completed-transfer'?'original':'published',lessonId:id,state:kind==='completed-transfer'?'complete':'accepted',priority:20,queuedAt:'2026-10-17T00:00:00Z',reason:'Earlier assessment',criteria:['Earlier criterion'],...(kind==='completed-transfer'?{sourceUrl:'https://five-minutes.vitoria-nuno.chatgpt.site/lesson/original',originalDate:'2026-08-04',destinationId:id,destinationSlug:'published',completedAt:'2026-10-17T02:00:00Z'}:{})};
   writeFileSync(join(directory,'editorial/backlog.json'),JSON.stringify({version:1,entries:kind==='new-published'?[]:[entry]}));
   if(kind==='new-published') {
    mkdirSync(join(directory,'src/content/lessons/2026/published'),{recursive:true});
    writeFileSync(join(directory,'src/content/lessons/2026/published/lesson.yaml'),`id: ${id}\nslug: published\naliases: []\n`);
   }
   execFileSync(process.execPath,[script,'return','published','The example is not clear enough.'],{cwd:directory});
   const queue=parseBacklog(readFileSync(join(directory,'editorial/backlog.json'),'utf8'));
   expect(queue.entries).toHaveLength(1);
   expect(nextBacklogEntry(queue)).toMatchObject({kind:'revision',lessonId:id,slug:'published',state:'queued',priority:0,reason:'The example is not clear enough.'});
   expect(queue.entries[0].destinationId).toBeUndefined();
   if(kind==='completed-transfer') {
    execFileSync(process.execPath,[script,'return','original','The old name should keep working.'],{cwd:directory});
    const returned=parseBacklog(readFileSync(join(directory,'editorial/backlog.json'),'utf8'));
    expect(returned.entries).toHaveLength(1);
    expect(returned.entries[0]).toMatchObject({kind:'revision',lessonId:id,slug:'published',legacySlugs:['original'],reason:'The old name should keep working.'});
   }

  } finally { rmSync(directory,{recursive:true,force:true}); }
 });
 it('preserves arbitrary Owner reason text without injecting it into the bounded pipeline summary',()=>{
  const directory=mkdtempSync(join(tmpdir(),'five-minutes-return-ranked-'));
  try {
   mkdirSync(join(directory,'editorial'));
   const entry={key:'published',kind:'revision',lessonId:id,slug:'published',state:'accepted',priority:20,queuedAt:'2026-10-17T00:00:00Z',reason:'Earlier assessment',criteria:['Earlier criterion']};
   const next={...entry,key:'next',slug:'next',state:'queued'};
   const pipeline={assessedAt:'2026-10-18T00:30:00Z',summary:'Initial ranking.',shortfall:'Only one test candidate.',ranking:[{key:'next',headline:'A puzzle',description:'A useful explanation.',hook:'Reader curiosity.',rankReason:'Broad appeal.',relevance:'Evergreen.',evidenceUrls:[]}]};
   writeFileSync(join(directory,'editorial/backlog.json'),JSON.stringify({version:1,entries:[entry,next],pipeline}));
   const reason=('The `example` has <gaps> and needs more depth. '+ 'More detail. '.repeat(150)).trim();
   execFileSync(process.execPath,[script,'return','published',reason],{cwd:directory});
   const queue=parseBacklog(readFileSync(join(directory,'editorial/backlog.json'),'utf8'));
   expect(queue.entries[0]).toMatchObject({kind:'revision',lessonId:id,state:'queued',reason});
   expect(queue.pipeline.summary).not.toContain(reason);
   expect(queue.pipeline.ranking).toEqual(pipeline.ranking);
  } finally {rmSync(directory,{recursive:true,force:true});}
 });

});
