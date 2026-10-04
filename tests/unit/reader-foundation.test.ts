import { describe, expect, it } from 'vitest';
import { emptyReaderState, parseReaderState, READER_STATE_KEY, readerStorage } from '../../src/lib/reader/state';
import { validatedOrigin, forwardDestination } from '../../src/lib/reader/navigation';
import { discoveryPath, editionDiscoveryPath } from '../../src/lib/urls';
const id='0199a5b7-6e21-7a42-9c3d-8f1b2e4a6c70';
describe('reader v1 storage and discovery contracts',()=>{
 it('the first preference write uses the full final envelope and preserves reader data',()=>{
  let raw:string|null=null;const port={getItem:()=>raw,setItem:(key:string,value:string)=>{expect(key).toBe(READER_STATE_KEY);raw=value;}};
  const storage=readerStorage(()=>port);expect(storage.chooseEdition('teen')).toBe(true);
  expect(JSON.parse(raw!)).toEqual({...emptyReaderState(),edition:'teen'});
  raw=JSON.stringify({...emptyReaderState(),saved:[id],read:{[id]:'2026-10-04T08:00:00Z'},recent:[{id,edition:'teen',visitedAt:'2026-10-04T08:00:00Z'}],appearance:'dark',extension:{future:true}});
  expect(storage.chooseEdition('adult')).toBe(true);expect(JSON.parse(raw!)).toMatchObject({saved:[id],appearance:'dark',extension:{future:true}});
 });
 it('does not overwrite corrupt or unknown-version state and catches blocked reads/writes',()=>{
  for(const raw of ['{','null',JSON.stringify({version:2}),JSON.stringify({...emptyReaderState(),saved:['bad-id']})]){
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
