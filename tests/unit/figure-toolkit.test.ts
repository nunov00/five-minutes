import {describe,it,expect} from 'vitest';
import {readFileSync} from 'node:fs';
import {parse,stringify} from 'yaml';
import {validatePresentationExtensions} from '../../src/lib/content/presentation-extensions';
import {validateToolkitData} from '../../src/lib/figures/toolkit-contract.mjs';
import {evaluateLessonPullRequest} from '../../scripts/lesson-guard-core.mjs';
import {strictBase64Bytes,collectGuardInput} from '../../scripts/verify-lesson-pr.mjs';
import {validateRasterBytes,rasterDimensions} from '../../src/lib/figures/raster.mjs';
import {validateLessonBundle} from '../../src/lib/content/schema';

const slug='toolkit-check',root=`src/content/lessons/2026/${slug}`,base='a'.repeat(40),head='b'.repeat(40),id='12345678-1234-4234-9234-123456789abc';
const words={alt:'A meaningful diagram.',caption:'An explanation.',description:'An equivalent explanation in plain text.'};
const nodes=[{label:'Source',symbol:'source'},{label:'Filter',symbol:'filter'},{label:'Output',symbol:'output'}];
const orbit={type:'orbital-motion',data:{style:'shared-free-fall'},...words};
const concept={type:'concept-flow',data:{pattern:'sequence',nodes},...words};
const bars={type:'comparison-bars',data:{style:'proportional',items:[{label:'A',value:0,display:'0'},{label:'B',value:.5,display:'0.5'}]},...words};
const png=readFileSync('public/icons/icon-192.png');
const image={type:'image',src:`/lesson-media/${slug}.png`,width:192,height:192,...words};
function textBlob(text:string){return {mode:'100644',type:'blob',size:Buffer.byteLength(text),text};}
function candidate(figure:unknown=orbit){
 const yaml=stringify({schemaVersion:2,id,slug,aliases:[],publishedAt:'2026-10-17T03:00:00+02:00',topic:'science',subtopic:'physics',concepts:['test'],related:{manual:[],exclude:[]},sources:[],provenance:{createdAt:'2026-10-17T02:15:00+02:00',createdBy:{type:'ai',provider:'openai',model:'test',promptVersion:'test'},reviews:[]}});
 const body=`---\n${stringify({title:'Test',description:'Description',takeaway:'Insight',question:'Why?',answer:'Because',searchTerms:['test'],figure})}---\nBody.\n`;
 const paths=[`${root}/adult.md`,`${root}/lesson.yaml`];
 return {baseBacklogText:JSON.stringify({version:1,entries:[]}),pr:{headRef:`lesson/${slug}`,headSha:head,labels:['editorial-review-requested','review:mandatory']},triggerHeadSha:head,currentBaseSha:base,mergeBaseSha:base,behindBy:0,
  files:[...paths.map(filename=>({filename,status:'added',additions:20,deletions:0,changes:20})),{filename:'src/content/route-ownership.json',status:'modified',additions:1,deletions:0,changes:1}],
  blobs:Object.fromEntries(paths.map(path=>[path,textBlob(path.endsWith('.yaml')?yaml:body)])) as Record<string,any>,baseRegistryText:'{}',headRegistryBlob:textBlob(JSON.stringify({[slug]:id})),now:'2026-10-17T05:00:00+02:00'};
}
const rights=(src=image.src)=>({src,origin:'original-code',creator:'Publication illustrator',licence:'Original artwork owned by the publication',evidence:'Drawn from the factual sources recorded in this lesson; no third-party artwork.'});
function setRights(v:ReturnType<typeof candidate>,records:unknown){const path=`${root}/lesson.yaml`,m=parse(v.blobs[path].text);if(records===undefined)delete m.imageRights;else m.imageRights=records;v.blobs[path]=textBlob(stringify(m));}
function rasterCandidate(){const v=candidate(image),path=`public${image.src}`;v.files.push({filename:path,status:'added',additions:0,deletions:0,changes:0});v.blobs[path]={mode:'100644',type:'blob',size:png.length,bytes:png};setRights(v,[rights()]);return v;}
function setFigure(v:ReturnType<typeof candidate>,figure:unknown){for(const path of [`${root}/adult.md`]){const parts=v.blobs[path].text.split('---\n'),front=parse(parts[1]);front.figure=figure;v.blobs[path]=textBlob(`---\n${stringify(front)}---\nBody.\n`);}}

describe('reusable figure contracts and trusted-base parity',()=>{
 it.each([orbit,concept,{...concept,data:{pattern:'cycle',nodes}},{...concept,data:{pattern:'branch',nodes}},bars])('accepts reviewed toolkit data in both loaders %#',figure=>{
  expect(validatePresentationExtensions({figure},'adult','adult')).toEqual([]);
  expect(evaluateLessonPullRequest(candidate(figure))).toMatchObject({applicable:true});
 });
 it.each([
  {...orbit,data:{style:'custom'}},{...orbit,data:{style:'shared-free-fall',path:'M0 0'}},
  {...concept,data:{pattern:'grid',nodes}},{...concept,data:{pattern:'sequence',nodes:[nodes[0]]}},
  {...concept,data:{pattern:'sequence',nodes:[...nodes,nodes[0],nodes[1]]}},
  {...concept,data:{pattern:'branch',nodes:[...nodes,{label:'Other',symbol:'object'}]}},
  {...concept,data:{pattern:'cycle',nodes:nodes.slice(0,2)}},
  {...concept,data:{pattern:'sequence',nodes:[nodes[0],{label:' source ',symbol:'output'}]}},
  {...concept,data:{pattern:'sequence',nodes:[nodes[0],{label:'Unknown',symbol:'__proto__'}]}},
  {...concept,data:{pattern:'sequence',nodes:[nodes[0],{label:'Unknown',symbol:'javascript:alert(1)'}]}},
  {...concept,data:{pattern:'sequence',nodes:[nodes[0],{label:'X',symbol:'object',x:20}]}},
  {...concept,data:{pattern:'sequence',nodes:[nodes[0],{label:'<svg>',symbol:'object'}]}},
  {...concept,data:{pattern:'sequence',nodes:[nodes[0],{label:'x'.repeat(29),symbol:'object'}]}},
  {...bars,data:{style:'proportional',items:[{label:'A',value:0,display:'0'},{label:'B',value:0,display:'0'}]}},
  {...bars,data:{style:'proportional',items:[{label:'A',value:-1,display:'-1'},{label:'B',value:2,display:'2'}]}},
  {...bars,data:{style:'proportional',items:[{label:'A',value:Infinity,display:'inf'},{label:'B',value:2,display:'2'}]}},
  {...bars,data:{...bars.data,unit:'<script>'}},
 ])('rejects unsafe data in both boundaries %#',figure=>{
  expect(validatePresentationExtensions({figure},'adult','adult').length).toBeGreaterThan(0);
  expect(()=>evaluateLessonPullRequest(candidate(figure))).toThrow();
 });
 it('never accepts raw layout instructions',()=>expect(validateToolkitData('concept-flow',{pattern:'sequence',nodes,css:'color:red'}).length).toBeGreaterThan(0));
 it('accepts one new PNG referenced by the single source',()=>expect(evaluateLessonPullRequest(rasterCandidate())).toMatchObject({applicable:true}));
 it('rejects an asset referenced only by a retired edition',()=>{
  const v=rasterCandidate(),adult={...image,src:`/lesson-media/${slug}-adult.png`},teen={...image,src:`/lesson-media/${slug}-teen.png`};
  setFigure(v,adult);
  const original=v.files.pop()!;delete v.blobs[original.filename];
  for(const f of [adult,teen]){v.files.push({...original,filename:`public${f.src}`});v.blobs[`public${f.src}`]={mode:'100644',type:'blob',size:png.length,bytes:png};}
  setRights(v,[rights(adult.src),rights(teen.src)]);
  expect(()=>evaluateLessonPullRequest(v)).toThrow(/imageRights|referenced/);
 });
 it.each([
  ['missing image',v=>{v.files.pop();}],['unreferenced image',v=>{setFigure(v,orbit);}],
  ['modified existing image',v=>{v.files[3].status='modified';}],
  ['wrong slug',v=>{setFigure(v,{...image,src:'/lesson-media/other.png'});v.files[3].filename='public/lesson-media/other.png';v.blobs[v.files[3].filename]=v.blobs[`public${image.src}`];}],
  ['symlink image',v=>{v.blobs[`public${image.src}`].mode='120000';}],
  ['executable image',v=>{v.blobs[`public${image.src}`].mode='100755';}],
  ['oversized image',v=>{v.blobs[`public${image.src}`].size=512001;}],
  ['false size',v=>{v.blobs[`public${image.src}`].size++;}],
  ['disguised SVG',v=>{const bytes=Buffer.from('<svg/>');v.blobs[`public${image.src}`]={mode:'100644',type:'blob',bytes,size:bytes.length};}],
  ['wrong dimensions',v=>{setFigure(v,{...image,width:193});}],
  ['remote path',v=>{setFigure(v,{...image,src:'https://example.test/a.png'});}],
  ['extra code',v=>{v.files.push({filename:'src/evil.ts',status:'added',additions:1,deletions:0,changes:1});}],
  ['too many files',v=>{v.files.push(v.files[3],v.files[3]);}],
 ] as Array<[string,(v:ReturnType<typeof rasterCandidate>)=>void]>)('rejects %s',(_name,change)=>{const v=rasterCandidate();change(v);expect(()=>evaluateLessonPullRequest(v)).toThrow();});
 it('rejects oversized/noncanonical binary API responses before use',()=>{
  expect(()=>strictBase64Bytes({type:'file',encoding:'base64',size:999999,content:''},'x',512000)).toThrow(/limit/);
  expect(()=>strictBase64Bytes({type:'file',encoding:'base64',size:1,content:'Zh=='},'x',512000)).toThrow(/base64/);
  expect(strictBase64Bytes({type:'file',encoding:'base64',size:png.length,content:png.toString('base64')},'x',512000).bytes).toEqual(png);
 });
 it('collects pinned raster bytes through the read-only adapter without executing candidate content',async()=>{
  const v=rasterCandidate(),requests:string[]=[];
  const fetchImpl=async(url:string)=>{
   requests.push(url);let data:unknown;
   if(url.endsWith('/pulls/7'))data={head:{sha:head,ref:`lesson/${slug}`},base:{sha:base,ref:'main'},labels:v.pr.labels.map(name=>({name}))};
   else if(url.includes('/git/ref/heads/main'))data={object:{sha:base}};
   else if(url.includes('/compare/'))data={merge_base_commit:{sha:base},behind_by:0,files:v.files};
   else if(url.includes('/git/trees/'))data={truncated:false,tree:[...Object.keys(v.blobs),'src/content/route-ownership.json'].map(path=>({path,mode:'100644',type:'blob'}))};
   else{
    const u=new URL(url),path=decodeURIComponent(u.pathname.split('/contents/')[1]),ref=u.searchParams.get('ref');
    expect([base,head]).toContain(ref);
    const text=path==='editorial/backlog.json'?JSON.stringify({version:1,entries:[]}):path==='src/content/route-ownership.json'?(ref===base?v.baseRegistryText:v.headRegistryBlob.text):v.blobs[path]?.text;
    const bytes=text===undefined?v.blobs[path]?.bytes:Buffer.from(text);
    if(!bytes)throw Error(`Unexpected path ${path}`);
    data={type:'file',encoding:'base64',content:bytes.toString('base64'),size:bytes.length};
   }
   return {ok:true,status:200,json:async()=>data};
  };
  const input=await collectGuardInput({env:{GITHUB_TOKEN:'test-only',GITHUB_REPOSITORY:'owner/repo',PR_NUMBER:'7',TRIGGER_HEAD_SHA:head,TRIGGER_HEAD_REF:`lesson/${slug}`,TRIGGER_HAS_REVIEW_LABEL:'true'},fetchImpl:fetchImpl as any,now:v.now});
  expect(evaluateLessonPullRequest(input)).toMatchObject({applicable:true});
  expect(requests.filter(u=>u.includes('/contents/public/lesson-media/'))).toHaveLength(1);
 });
});

describe('persistent image rights and stripped raster containers',()=>{
 function canonicalRightsIssues(v:ReturnType<typeof candidate>){return validateLessonBundle({metadata:parse(v.blobs[`${root}/lesson.yaml`].text),adult:parse(v.blobs[`${root}/adult.md`].text.split('---\n')[1])}).issues.filter(i=>i.code==='image-rights');}
 it.each([
  [rights()], [{...rights(),origin:'generated',creator:'Named image model',evidence:'Original generated artwork; checked against the lesson sources.'}],
  [{...rights(),origin:'licensed',licence:'CC BY 4.0',sourceUrl:'https://example.org/original-artwork'}],
 ])('accepts a complete rights record in canonical loading and the daily guard %#',record=>{
  const v=rasterCandidate();setRights(v,[record]);expect(canonicalRightsIssues(v)).toEqual([]);expect(evaluateLessonPullRequest(v)).toMatchObject({applicable:true});
 });
 it.each([
  undefined, [], [rights(),rights()], [{...rights(),src:'/lesson-media/other.png'}],
  [{...rights(),origin:'unknown'}], [{...rights(),creator:''}], [{...rights(),licence:''}],
  [{...rights(),evidence:'x'.repeat(601)}], [{...rights(),extra:'hidden'}], [{...rights(),creator:'<script>'}],
  [{...rights(),origin:'licensed'}], [{...rights(),origin:'licensed',sourceUrl:'http://example.org/image'}],
  [{...rights(),sourceUrl:'https://user:secret@example.org/image'}], [{...rights(),sourceUrl:'javascript:alert(1)'}],
 ].map(records=>[records]))('rejects missing, mismatched or unsafe rights in both boundaries %#',records=>{
  const v=rasterCandidate();setRights(v,records);expect(canonicalRightsIssues(v).length).toBeGreaterThan(0);expect(()=>evaluateLessonPullRequest(v)).toThrow(/imageRights/);
 });
 it('rejects rights for an unreferenced asset even on a structured-only lesson',()=>{const v=candidate();setRights(v,[rights()]);expect(canonicalRightsIssues(v).length).toBeGreaterThan(0);expect(()=>evaluateLessonPullRequest(v)).toThrow(/imageRights/);});
 function pngChunk(type:string,data:Buffer){
  const b=Buffer.alloc(data.length+12);b.writeUInt32BE(data.length);b.write(type,4,'latin1');data.copy(b,8);
  let crc=0xffffffff;for(const octet of b.subarray(4,-4)){crc^=octet;for(let i=0;i<8;i++)crc=(crc>>>1)^((crc&1)?0xedb88320:0);}b.writeUInt32BE((crc^0xffffffff)>>>0,b.length-4);return b;
 }
 function webpChunk(type:string,data:Buffer){const b=Buffer.alloc(8+data.length+(data.length%2));b.write(type);b.writeUInt32LE(data.length,4);data.copy(b,8);return b;}
 function webp(...chunks:Buffer[]){const b=Buffer.concat([Buffer.from('RIFF0000WEBP'),...chunks]);b.writeUInt32LE(b.length-8,4);return b;}
 const frame=Buffer.from([47,0,0,0,0]);
 it.each(['tEXt','zTXt','iTXt','eXIf','zzZz','iCCP'])('rejects PNG %s payloads in shared parser and guard',type=>{
  const bytes=Buffer.concat([png.subarray(0,-12),pngChunk(type,Buffer.alloc(type==='tEXt'?420000:32,65)),png.subarray(-12)]);
  expect(()=>validateRasterBytes(bytes,image.src,192,192)).toThrow(/chunk/);
  const v=rasterCandidate();v.blobs[`public${image.src}`]={mode:'100644',type:'blob',size:bytes.length,bytes};expect(()=>evaluateLessonPullRequest(v)).toThrow(/chunk/);
 });
 it.each(['EXIF','XMP ','ZZZZ','ICCP'])('rejects WebP %s payloads',type=>expect(()=>rasterDimensions(webp(webpChunk('VP8L',frame),webpChunk(type,Buffer.from('private metadata'))),'webp')).toThrow(/chunk/));
 it.each([0x08,0x04,0x20,0x02,0x80])('rejects WebP metadata/animation/reserved flag %# without a payload chunk',flag=>{const header=Buffer.alloc(10);header[0]=flag;expect(()=>rasterDimensions(webp(webpChunk('VP8X',header),webpChunk('VP8L',frame)),'webp')).toThrow(/header/);});
 it('retains PNG parsing and accepts alpha-only WebP container headers',()=>{
  expect(()=>validateRasterBytes(png,image.src,192,192)).not.toThrow();
  const header=Buffer.alloc(10);header[0]=0x10;expect(rasterDimensions(webp(webpChunk('VP8X',header),webpChunk('VP8L',frame)),'webp')).toEqual({width:1,height:1});
  const lossy=Buffer.from([0,0,0,157,1,42,1,0,1,0]);expect(rasterDimensions(webp(webpChunk('VP8X',header),webpChunk('ALPH',Buffer.from([0,0])),webpChunk('VP8 ',lossy)),'webp')).toEqual({width:1,height:1});
 });
 it('rejects unused, misplaced and oversized alpha payloads that a decoder might ignore',()=>{
  const header=Buffer.alloc(10);header[0]=0x10;const alpha=webpChunk('ALPH',Buffer.from([0,0]));
  for(const bytes of [webp(alpha,webpChunk('VP8L',frame)),webp(webpChunk('VP8X',header),alpha,webpChunk('VP8L',frame)),webp(webpChunk('VP8X',header),webpChunk('VP8L',frame),alpha),webp(webpChunk('VP8X',header),webpChunk('ALPH',Buffer.alloc(420000)),webpChunk('VP8L',frame))])expect(()=>rasterDimensions(bytes,'webp')).toThrow(/alpha/);
 });
});
