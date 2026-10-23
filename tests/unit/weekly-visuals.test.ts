import {describe,it,expect} from 'vitest';
import {readFileSync} from 'node:fs';
import {parse,stringify} from 'yaml';
import sharp from 'sharp';
import {createHash} from 'node:crypto';
import {validatePresentationExtensions} from '../../src/lib/content/presentation-extensions';
import {positionVisuals} from '../../src/lib/figures/placement';
import {validateVisualCollection,lessonVisuals} from '../../src/lib/figures/collection.mjs';
import {buildArtwork,validateDerivative,lessonArtwork} from '../../src/lib/figures/artwork.mjs';
import {evaluateLessonPullRequest} from '../../scripts/lesson-guard-core.mjs';
import {validatePresentation} from '../../src/lib/content/schema';

const slug='weekly-visual-test',root=`src/content/lessons/2026/${slug}`,id='12345678-1234-4234-9234-123456789abc';
const words={alt:'Illustrative material.',caption:'Test fixture, not measured evidence.',description:'The same relationship is explained in this text alternative.'};
const image=(n:number)=>({id:`image-${n}`,role:n===1?'lead':'explanation',figure:{type:'image',src:`/lesson-media/${slug}-vimage-${n}.png`,width:192,height:192,afterParagraph:n,...words}});
const visuals=[1,2,3].map(image);
const blob=(text:string)=>({mode:'100644',type:'blob',size:Buffer.byteLength(text),text});
function candidate(){
 const metadata={schemaVersion:2,id,slug,aliases:[],publishedAt:'2026-10-23T05:00:00+02:00',topic:'science',subtopic:'physics',concepts:['test'],related:{manual:[],exclude:[]},sources:[],imageRights:visuals.map(v=>({src:v.figure.src,origin:'original-code',creator:'Test illustrator',licence:'Original test asset',evidence:'Application-owned fixture.'})),provenance:{createdAt:'2026-10-23T04:00:00+02:00',createdBy:{type:'ai',provider:'openai',model:'test',promptVersion:'test'},reviews:[]}};
 const presentation={title:'Test',description:'A test.',takeaway:'An insight.',question:'Why?',answer:'Because.',searchTerms:['test'],figures:structuredClone(visuals)};
 const text=`---\n${stringify(presentation)}---\nOne.\n\nTwo.\n\nThree.\n`;
 const png=readFileSync('public/icons/icon-192.png');
 const files=[`${root}/lesson.yaml`,`${root}/adult.md`,'src/content/route-ownership.json',...visuals.map(v=>`public${v.figure.src}`)].map(filename=>({filename,status:filename.endsWith('.json')?'modified':'added',additions:10,deletions:0,changes:10}));
 const blobs:Record<string,any>={[`${root}/lesson.yaml`]:blob(stringify(metadata)),[`${root}/adult.md`]:blob(text)};
 for(const v of visuals)blobs[`public${v.figure.src}`]={mode:'100644',type:'blob',bytes:png,size:png.length};
 const head='b'.repeat(40),base='a'.repeat(40);
 return {pr:{headRef:`lesson/${slug}`,headSha:head,labels:['editorial-review-requested','review:mandatory']},triggerHeadSha:head,currentBaseSha:base,mergeBaseSha:base,behindBy:0,baseRegistryText:'{}',headRegistryBlob:blob(JSON.stringify({[slug]:id})),baseBacklogText:JSON.stringify({version:1,entries:[]}),files,blobs,now:'2026-10-23T06:00:00+02:00'};
}
function setFigures(c:ReturnType<typeof candidate>,change:(p:any)=>void){const p=`${root}/adult.md`,s=c.blobs[p].text;const fm=parse(s.split('---\n')[1]);change(fm);c.blobs[p]=blob(`---\n${stringify(fm)}---\nOne.\n\nTwo.\n\nThree.\n`);return fm;}
describe('weekly visual input boundary',()=>{
 it('accepts an answer-first presentation at loader and submission-guard boundaries',()=>{
  const c=candidate(),p=setFigures(c,p=>p.opening='answer-first');
  expect(validatePresentation(p).issues).toEqual([]);
  expect(evaluateLessonPullRequest(c)).toMatchObject({applicable:true});
 });
 it.each([
  (p:any)=>p.opening='default',
  (p:any)=>p.opening=true,
  (p:any)=>p.opening=null,
  (p:any)=>p.opening={mode:'answer-first'},
  (p:any)=>p.figures[0].figure.afterParagraph=2,
  (p:any)=>p.figures[0].role='explanation',
  (p:any)=>p.figures[0].figure.type='process-flow',
  (p:any)=>{p.figure=p.figures[0].figure;delete p.figures;},
  (p:any)=>{p.figures[1].figure.afterParagraph=1;p.figures.reverse();},
  (p:any)=>p.headline='An unapproved headline',
 ])('rejects invalid opt-in and contradictory lead placement at both boundaries %#',change=>{
  const c=candidate(),p=setFigures(c,p=>{p.opening='answer-first';change(p);});
  expect(validatePresentation(p).valid).toBe(false);
  expect(()=>evaluateLessonPullRequest(c)).toThrow();
 });
 it('accepts three independently positioned, rights-matched rasters through the trusted guard',()=>{expect(validatePresentationExtensions({figures:visuals},'adult','adult')).toEqual([]);expect(evaluateLessonPullRequest(candidate())).toMatchObject({applicable:true});});
 it.each([
  (p:any)=>p.figure=visuals[0].figure,
  (p:any)=>p.figures.push(image(4)),
  (p:any)=>p.figures=[],
  (p:any)=>p.figures[1].id=p.figures[0].id,
  (p:any)=>p.figures[1].role='lead',
  (p:any)=>p.figures[0].href='https://example.test',
  (p:any)=>p.figures[0].figure.src='https://example.test/picture.png',
  (p:any)=>p.figures[0].figure.type='svg',
  (p:any)=>p.figures[0].figure.width=2401,
  (p:any)=>delete p.figures[0].figure.afterParagraph,
  (p:any)=>p.figures[0].figure.afterParagraph=0,
  (p:any)=>p.figures[0].figure.afterParagraph=51,
  (p:any)=>p.figures[0]=null,
 ])('rejects malformed collection at both boundaries %#',change=>{const c=candidate(),p=setFigures(c,change);expect(validatePresentationExtensions(p,'adult','adult').length).toBeGreaterThan(0);expect(()=>evaluateLessonPullRequest(c)).toThrow();});
 it('rejects source overwrites, unrelated filenames, missing rights and binary corruption',()=>{
  for(const mutate of [(c:any)=>c.files[3].status='modified',(c:any)=>c.blobs[`public${visuals[0].figure.src}`].mode='120000',(c:any)=>c.blobs[`public${visuals[0].figure.src}`].bytes=Buffer.from('<svg/>'),(c:any)=>{const p=`${root}/lesson.yaml`,m=parse(c.blobs[p].text);m.imageRights.pop();c.blobs[p]=blob(stringify(m));}]){const c=candidate();mutate(c);expect(()=>evaluateLessonPullRequest(c)).toThrow();}
 });
 it('does not throw while reporting malformed schema data',()=>{expect(validateVisualCollection({figures:[null]}).length).toBeGreaterThan(0);expect(lessonVisuals({figures:[null]})).toEqual([]);});
 it('places against original prose and preserves array order for shared positions',()=>{
  const html='<p>One <strong>step</strong>.</p><ul><li><p>Nested.</p></li></ul><p>Two.</p><p>Three.</p>';
  const list=structuredClone(visuals);list[0].figure.afterParagraph=2;list[1].figure.afterParagraph=1;list[2].figure.afterParagraph=2;
  const parts=positionVisuals(html,list as any);expect(parts.map(p=>p.visuals.map(v=>v.id))).toEqual([['image-2'],['image-1','image-3'],[]]);expect(parts.map(p=>p.html).join('')).toBe(html);
  expect(()=>positionVisuals('<p>Only one.</p>',visuals as any)).toThrow(/existing prose paragraph/);
 });
});
describe('trusted build derivatives',()=>{
 it('produces exactly two hashed local derivatives; keeps textured artwork within bounds',async()=>{
  const bytes=readFileSync('docs/visuals/references/butterfly.webp');const a=await buildArtwork(bytes,'test');
  expect(a.outputs).toHaveLength(2);expect(a.share).toMatch(/^\/visuals\/test-[a-f0-9]{16}\/share\.jpg$/);
  for(const [i,item] of a.outputs.entries()){const ext=item.path.split('.').at(-1)!;await expect(validateDerivative(item.bytes,i===0?'thumbnail':'share',ext)).resolves.toBeDefined();}
  const again=await buildArtwork(bytes,'test');expect(again.share).toBe(a.share);
 },15000);
 it('prefers PNG for simple graphics and has a legacy fallback',async()=>{
  const bytes=await sharp({create:{width:100,height:100,channels:3,background:'#336699'}}).png().toBuffer();expect((await buildArtwork(bytes,'simple')).share).toMatch(/\.png$/);
  const art=await lessonArtwork({metadata:{slug:'old'},adult:{}});expect(art.isFallback).toBe(true);expect(art.outputs).toHaveLength(1);expect(art.thumbnail).toBeUndefined();
 });
 it('preserves portrait artwork inside a thumbnail instead of cropping it',async()=>{
  const bytes=await sharp({create:{width:80,height:200,channels:3,background:'#ff0000'}}).png().toBuffer();
  const art=await buildArtwork(bytes,'portrait');const {data,info}=await sharp(art.outputs[0].bytes).raw().toBuffer({resolveWithObject:true});
  const pixel=(x:number,y:number)=>[...data.subarray((y*info.width+x)*info.channels,(y*info.width+x)*info.channels+3)];
  expect(pixel(0,0)[0]).toBeGreaterThan(230);expect(pixel(0,0)[1]).toBeGreaterThan(220);expect(pixel(240,160)[1]).toBeLessThan(20);
 });
 it('pins the font-free fallback sharing image',async()=>{
  const art=await lessonArtwork({metadata:{slug:'old'},adult:{}});
  expect(createHash('sha256').update(art.outputs[0].bytes).digest('hex')).toBe('e3afccc45c9db996ec9f6c22bd300527c722f8ec92d7341f3d65d9411419e6f2');
 });
 it('rejects false extension, invalid decoding, dimensions, traversal and remote sources',async()=>{
  await expect(validateDerivative(Buffer.from('<svg/>'),'share','png')).rejects.toThrow();
  const b=await sharp({create:{width:1200,height:630,channels:3,background:'#fff'}}).png().toBuffer();
  await expect(validateDerivative(b,'share','jpg')).rejects.toThrow();await expect(validateDerivative(b,'thumbnail','png')).rejects.toThrow();
  await expect(buildArtwork(b,'../outside')).rejects.toThrow(/Unsafe/);
  await expect(lessonArtwork({metadata:{slug:'x'},adult:{figures:[{role:'lead',figure:{type:'image',src:'https://example.test/a.png'}}]}})).rejects.toThrow(/Unsafe/);
 });
});
