import { describe, expect, it } from 'vitest';
import { emptyReaderState, MAX_READER_IMPORT_BYTES, MAX_READER_STATE_CHARS, parseReaderState, READER_STATE_KEY, RECENT_LIMIT, readerStorage } from '../../src/lib/reader/state';
import { validatedOrigin, forwardDestination } from '../../src/lib/reader/navigation';
import { discoveryPath, editionDiscoveryPath } from '../../src/lib/urls';
const id='0199a5b7-6e21-7a42-9c3d-8f1b2e4a6c70';
describe('reader v2 storage and discovery contracts',()=>{
 it('the first preference write uses the full final envelope and preserves reader data',()=>{
  let raw:string|null=null;const port={getItem:()=>raw,setItem:(key:string,value:string)=>{expect(key).toBe(READER_STATE_KEY);raw=value;}};
  const storage=readerStorage(()=>port);expect(storage.chooseEdition('teen')).toBe(true);
  expect(JSON.parse(raw!)).toEqual({...emptyReaderState(),edition:'teen'});
  raw=JSON.stringify({...emptyReaderState(),saved:[{id,edition:'teen'}],read:{[id]:'2026-10-04T08:00:00Z'},recent:[{id,edition:'teen',visitedAt:'2026-10-04T08:00:00Z'}],appearance:'dark',extension:{future:true}});
  expect(storage.chooseEdition('adult')).toBe(true);expect(JSON.parse(raw!)).toMatchObject({saved:[{id,edition:'teen'}],appearance:'dark',extension:{future:true}});
 });
 it('does not overwrite corrupt or unknown-version state and catches blocked reads/writes',()=>{
  for(const raw of ['{','null',JSON.stringify({version:3}),JSON.stringify({...emptyReaderState(),saved:['bad-id']})]){
   let writes=0;const storage=readerStorage(()=>({getItem:()=>raw,setItem:()=>{writes++;}}));expect(storage.read()).toBeNull();expect(storage.chooseEdition('adult')).toBe(false);expect(writes).toBe(0);
  }
  expect(readerStorage(()=>{throw Error('blocked');}).chooseEdition('teen')).toBe(false);
  expect(readerStorage(()=>({getItem:()=>null,setItem:()=>{throw Error('quota');}})).chooseEdition('teen')).toBe(false);
  expect(parseReaderState(JSON.stringify({...emptyReaderState(),read:{[id]:'invalid'}}))).toBeNull();
 });
 it('distinguishes unreadable data from storage failure and resets only explicitly',()=>{
  let raw = '{';
  const storage = readerStorage(()=>({getItem:()=>raw,setItem:(_key:string,value:string)=>{raw=value;}}));
  expect(storage.inspect()).toEqual({kind:'invalid'});
  expect(storage.chooseEdition('teen')).toBe(false); expect(raw).toBe('{');
  expect(storage.reset()).toBe(true);
  expect(storage.inspect()).toEqual({kind:'valid',state:emptyReaderState()});
  expect(storage.chooseEdition('teen')).toBe(true);
  expect(readerStorage(()=>{throw Error('blocked');}).inspect()).toEqual({kind:'unavailable'});
  expect(readerStorage(()=>{throw Error('blocked');}).reset()).toBe(false);
 });
 it('migrates identity-only v1 saves to the preference or Adult without discarding extensions',()=>{
  const legacy=(edition:'adult'|'teen'|null)=>JSON.stringify({version:1,edition,saved:[id],read:{},recent:[],appearance:'system',extension:{kept:true}});
  expect(parseReaderState(legacy('teen'))).toMatchObject({version:2,saved:[{id,edition:'teen'}],extension:{kept:true}});
  expect(parseReaderState(legacy(null))).toMatchObject({version:2,saved:[{id,edition:'adult'}]});
  let raw=legacy('teen');const storage=readerStorage(()=>({getItem:()=>raw,setItem:(_key:string,value:string)=>{raw=value;}}));
  expect(storage.read()).toMatchObject({version:2,saved:[{id,edition:'teen'}],extension:{kept:true}});
  expect(JSON.parse(raw)).toMatchObject({version:2,saved:[{id,edition:'teen'}],extension:{kept:true}});
  expect(storage.chooseEdition('adult')).toBe(true);expect(JSON.parse(raw)).toMatchObject({version:2,saved:[{id,edition:'teen'}],extension:{kept:true}});
 });
 it('leaves a size-valid v1 envelope untouched when its v2 migration would exceed the limit',()=>{
  const base={version:1,edition:'teen',saved:[id],read:{},recent:[],appearance:'system',extension:''};
  const baseRaw=JSON.stringify(base);
  const raw=JSON.stringify({...base,extension:'x'.repeat(MAX_READER_STATE_CHARS-baseRaw.length)});
  expect(raw).toHaveLength(MAX_READER_STATE_CHARS);
  expect(parseReaderState(raw)).toBeNull();
  let stored=raw,writes=0;
  const storage=readerStorage(()=>({getItem:()=>stored,setItem:(_key:string,value:string)=>{writes++;stored=value;}}));
  expect(storage.read()).toBeNull();expect(storage.inspect()).toEqual({kind:'invalid'});
  expect(writes).toBe(0);expect(stored).toBe(raw);
 });
 it('rejects duplicate saved identities and presentations',()=>{
  const v1={version:1,edition:'adult',saved:[id,id],read:{},recent:[],appearance:'system'};
  const presentation={id,edition:'adult'};
  const v2={...emptyReaderState(),saved:[presentation,presentation]};
  expect(parseReaderState(JSON.stringify(v1))).toBeNull();
  expect(parseReaderState(JSON.stringify(v2))).toBeNull();
 });
 it('saves Adult and Teen presentations independently without losing extensions',()=>{
  let raw=JSON.stringify({...emptyReaderState(),extension:{kept:true}});
  const storage=readerStorage(()=>({getItem:()=>raw,setItem:(_key:string,value:string)=>{raw=value;}}));
  expect(storage.toggleSaved(id,'teen')).toBe(true);expect(storage.read()?.saved).toEqual([{id,edition:'teen'}]);
  expect(storage.toggleSaved(id,'adult')).toBe(true);expect(storage.read()?.saved).toEqual([{id,edition:'teen'},{id,edition:'adult'}]);
  expect(storage.toggleSaved(id,'teen')).toBe(true);expect(storage.read()?.saved).toEqual([{id,edition:'adult'}]);
  expect(JSON.parse(raw).extension).toEqual({kept:true});
 });
 it('marks visits read, deduplicates recents by lesson and edition, and caps the list',()=>{
  let raw:string|null=null;const storage=readerStorage(()=>({getItem:()=>raw,setItem:(_key:string,value:string)=>{raw=value;}}));
  const ids=Array.from({length:RECENT_LIMIT+1},(_,i)=>`0199a5b7-6e21-7a42-9c3d-${i.toString(16).padStart(12,'0')}`);
  ids.forEach((lessonId,i)=>expect(storage.visitLesson(lessonId,'adult',`2026-10-04T08:${String(i%60).padStart(2,'0')}:00Z`)).toBe(true));
  expect(storage.read()?.recent).toHaveLength(RECENT_LIMIT);expect(storage.read()?.recent[0].id).toBe(ids.at(-1));expect(storage.read()?.recent.some(r=>r.id===ids[0])).toBe(false);
  expect(storage.visitLesson(ids.at(-1)!,'teen','2026-10-04T10:00:00Z')).toBe(true);
  expect(storage.read()?.recent.filter(r=>r.id===ids.at(-1))).toHaveLength(2);
  expect(storage.setRead(ids.at(-1)!,false)).toBe(true);expect(storage.read()?.read[ids.at(-1)!]).toBeUndefined();
 });
 it('applies appearance and exports and imports bounded v2 or migratable v1 data',()=>{
  let raw:string|null=null;const storage=readerStorage(()=>({getItem:()=>raw,setItem:(_key:string,value:string)=>{raw=value;}}));
  expect(storage.setAppearance('dark')).toBe(true);expect(storage.exportJson()).toContain('"appearance": "dark"');
  const replacement=JSON.stringify({...emptyReaderState(),edition:'teen',saved:[{id,edition:'teen'}]});
  expect(storage.replaceFromJson(replacement)).toBe(true);expect(storage.read()?.saved).toEqual([{id,edition:'teen'}]);
  expect(storage.replaceFromJson(JSON.stringify({version:1,edition:null,saved:[id],read:{},recent:[],appearance:'light'}))).toBe(true);
  expect(JSON.parse(raw!)).toMatchObject({version:2,saved:[{id,edition:'adult'}],appearance:'light'});
  const before=raw;
  for(const invalid of ['{',JSON.stringify({...emptyReaderState(),version:3}),JSON.stringify({...emptyReaderState(),appearance:'sepia'}),'x'.repeat(MAX_READER_STATE_CHARS+1)]){
   expect(storage.replaceFromJson(invalid)).toBe(false);expect(raw).toBe(before);
  }
 });
 it('round-trips a state at the character limit without export formatting overflow',()=>{
  const base={...emptyReaderState(),saved:[{id,edition:'teen'}],extension:''};
  const raw=JSON.stringify({...base,extension:'x'.repeat(MAX_READER_STATE_CHARS-JSON.stringify(base).length)});
  const source=readerStorage(()=>({getItem:()=>raw,setItem:()=>{}}));
  const exported=source.exportJson()!;
  expect(exported.length).toBe(MAX_READER_STATE_CHARS);
  let restored:string|null=null;
  const target=readerStorage(()=>({getItem:()=>restored,setItem:(_key:string,value:string)=>{restored=value;}}));
  expect(target.replaceFromJson(exported)).toBe(true);
  expect(restored).toBe(raw);
 });
 it('allows UTF-8 backups within the character bound and keeps the byte preflight bounded',()=>{
  const raw=JSON.stringify({...emptyReaderState(),extension:'漢'.repeat(500_000)});
  const source=readerStorage(()=>({getItem:()=>raw,setItem:()=>{}}));
  const exported=source.exportJson()!;
  expect(new TextEncoder().encode(exported).length).toBeGreaterThan(MAX_READER_STATE_CHARS);
  expect(new TextEncoder().encode(exported).length).toBeLessThanOrEqual(MAX_READER_IMPORT_BYTES);
  let restored:string|null=null;
  const target=readerStorage(()=>({getItem:()=>restored,setItem:(_key:string,value:string)=>{restored=value;}}));
  expect(target.replaceFromJson(exported)).toBe(true);
  expect(JSON.parse(restored!)).toEqual(JSON.parse(raw));
 });
 it('generates collision-free edition routes and preserves path meaning while forwarding',()=>{
  expect(discoveryPath('teen','library',2)).toBe('/editions/teen/library/page/2');
  expect(discoveryPath('adult','topics','science')).toBe('/editions/adult/topics/science');
  expect(editionDiscoveryPath('/editions/teen/library/page/12','adult')).toBe('/editions/adult/library/page/12');
  expect(forwardDestination('/topics/science','teen','?q=x','#section')).toBe('/editions/teen/topics/science?q=x#section');
  expect(editionDiscoveryPath('/teen/library','adult')).toBeNull();
  expect(()=>discoveryPath('adult','library',0)).toThrow();
 });
 it('Return rejects external, lesson, malformed and nonexistent destinations',()=>{
  const bounds={topics:['science'],libraryPages:3};
  for(const value of ['https://evil.invalid/library','//evil.invalid/search','/adult/example','/library/page/4','/library/page/01','/topics/missing','/editions/kids/library','/search/','/library/../search','/search\\evil','/search%2f','javascript:alert(1)'])expect(validatedOrigin(value,bounds),value).toBeNull();
  expect(validatedOrigin('/editions/teen/library/page/2?sort=date#main',bounds)).toBe('/editions/teen/library/page/2?sort=date#main');
  expect(validatedOrigin('/search?q=clock&edition=teen#main',bounds)).toBe('/search?q=clock&edition=teen#main');
 });
});
