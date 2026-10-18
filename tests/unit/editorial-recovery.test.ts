import { describe, expect, it } from 'vitest';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { parseBacklog, nextBacklogEntry } from '../../scripts/editorial-backlog.mjs';
const entry={key:'first',kind:'revision',lessonId:'12345678-1234-4234-9234-123456789abc',slug:'first',state:'queued',priority:10,queuedAt:'2026-10-17T23:00:00Z',reason:'A missing mechanism',criteria:['Explain it.']};
const blocker={reason:'Source unavailable',issueUrl:'https://github.com/nunov00/five-minutes/issues/161',failedDays:['2026-10-16','2026-10-17']};
describe('bounded stuck-entry recovery',()=>{
 it('orders offset timestamps by instant rather than their spelling',()=>{
  expect(nextBacklogEntry({entries:[entry,{...entry,key:'earlier',queuedAt:'2026-10-18T00:30:00+02:00'}]})?.key).toBe('earlier');
 });
 it('skips an evidenced parked item while retaining it in the backlog',()=>{
  const q=parseBacklog(JSON.stringify({version:1,entries:[{...entry,state:'parked',blocker},{...entry,key:'second',slug:'second',priority:11}]}));
  expect(nextBacklogEntry(q)?.key).toBe('second');expect(q.entries).toHaveLength(2);
 });
 it.each([
  {reason:'',issueUrl:blocker.issueUrl,failedDays:blocker.failedDays},
  {...blocker,issueUrl:'https://example.org/issues/161'},
  {...blocker,failedDays:['2026-10-17','2026-10-17']},
  {...blocker,failedDays:['2026-10-17']},
  {...blocker,failedDays:['2026-02-30','2026-10-17']},
 ])('rejects incomplete parking evidence %#',bad=>expect(()=>parseBacklog(JSON.stringify({version:1,entries:[{...entry,state:'parked',blocker:bad}]}))).toThrow());
 it('requires a destination for covered entries but uses lessonId for accepted revisions',()=>{
  expect(()=>parseBacklog(JSON.stringify({version:1,entries:[{...entry,state:'covered'}]}))).toThrow(/destination/);
  expect(parseBacklog(JSON.stringify({version:1,entries:[{...entry,state:'accepted'}]})).entries[0].lessonId).toBe(entry.lessonId);
 });
 it('prepares parking in isolation, then an Owner return clears the blocker',()=>{
  const dir=mkdtempSync(join(tmpdir(),'five-minutes-park-'));const script=resolve('scripts/editorial-backlog.mjs');
  try{
   mkdirSync(join(dir,'editorial'));writeFileSync(join(dir,'editorial/backlog.json'),JSON.stringify({version:1,entries:[{...entry,legacySlugs:['old-name']},{...entry,key:'second',slug:'second',priority:11}]}));
   execFileSync(process.execPath,[script,'park','first',blocker.issueUrl,blocker.failedDays.join(','),blocker.reason],{cwd:dir});
   let q=parseBacklog(readFileSync(join(dir,'editorial/backlog.json'),'utf8'));expect(nextBacklogEntry(q)?.key).toBe('second');
   expect(q.entries[0]).toMatchObject({...entry,state:'parked',blocker});
   execFileSync(process.execPath,[script,'return','old-name','The source is available again.'],{cwd:dir});
   q=parseBacklog(readFileSync(join(dir,'editorial/backlog.json'),'utf8'));expect(nextBacklogEntry(q)).toMatchObject({key:'first',state:'queued',priority:0});expect(q.entries[0].blocker).toBeUndefined();
  }finally{rmSync(dir,{recursive:true,force:true});}
 });
});
