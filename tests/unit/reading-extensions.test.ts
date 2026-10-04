import {describe,it,expect} from 'vitest';
import {mkdtemp,mkdir,readFile,writeFile,symlink,cp} from 'node:fs/promises';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {validLesson} from '../fixtures/lesson-fixtures';
import {validateLessonBundle} from '../../src/lib/content/schema';
import {FIGURE_LIMITS,type LessonFigure} from '../../src/lib/content/presentation-extensions';
import {rasterDimensions,validateFigureAsset} from '../../src/lib/figures/assets';
import {figurePosition} from '../../src/lib/figures/placement';
import {loadPublishedLessons} from '../../src/lib/content/loader';
import routeOwnership from '../../src/content/route-ownership.json';
import {renderSafeMarkdown} from '../../src/lib/content/safe-content';
const diagram:LessonFigure={type:'seasons-orbit',data:{tiltDegrees:23.4},alt:'Opposite hemispheres tilt towards the Sun.',caption:'The axis keeps its direction.',description:'In June the north tilts towards the Sun; in December the south does.'};
const activity={prompt:'Which hemisphere has summer in January?',options:['North','South'],answer:1,explanation:'The south tilts towards the Sun.'};
function issues(figure:unknown,teenActivity:unknown=undefined){const b=validLesson();return validateLessonBundle({...b,adult:{...b.adult,figure},teen:{...b.teen,...(teenActivity===undefined?{}:{activity:teenActivity})}}).issues;}
async function assetRoot(){const root=await mkdtemp(join(tmpdir(),'five-minutes-media-'));await mkdir(join(root,'lesson-media'));return root;}
const image:LessonFigure={type:'image',src:'/lesson-media/test.png',width:192,height:192,alt:'Local raster explanation.',caption:'A local image.',description:'The explanation in words.'};
describe('safe v2 presentation extensions',()=>{
 it('allows optional per-edition diagrams and a Teen-only activity',()=>{
  expect(issues(diagram,activity)).toEqual([]);
  const b=validLesson();expect(validateLessonBundle({...b,adult:{...b.adult,activity}}).issues).toContainEqual(expect.objectContaining({path:'adult.activity'}));
 });
 it.each([
  {...diagram,type:'custom-component'}, {...diagram,component:'svg'}, {...diagram,data:{tiltDegrees:90}}, {...diagram,data:{tiltDegrees:23.4,script:'alert(1)'}},
  {...diagram,alt:''},{...diagram,caption:'<svg onload="alert(1)"/>'},{...diagram,description:'![x](https://example.test/x.png)'},{...diagram,afterParagraph:0},
  {...image,src:'https://example.test/x.png'},{...image,src:'/lesson-media/../x.png'}, {...image,src:'/lesson-media/x.svg'}, {...image,src:'/lesson-media/%2e%2e.png'},
  {...image,width:2401},{...image,width:2200,height:2200},
 ])('rejects hostile or invalid figure data %#',figure=>expect(issues(figure).length).toBeGreaterThan(0));
 it.each([
  {...activity,options:['one']},{...activity,options:['north',' North ']},{...activity,options:['a','b','c','d','e']},{...activity,answer:-1},{...activity,answer:2},{...activity,answer:0.5},
  {...activity,prompt:'<script>x</script>'},{...activity,explanation:'`execute`'},{...activity,options:['a','b'.repeat(81)]},{...activity,score:true},
 ])('rejects invalid activities %#',a=>expect(issues(diagram,a).length).toBeGreaterThan(0));
 it('does not accept the retrieval question as the activity prompt',()=>{
  const b=validLesson();expect(issues(diagram,{...activity,prompt:b.teen!.question}).length).toBeGreaterThan(0);
 });
 it('places figures only after actual prose paragraphs, leaving sanitized HTML unchanged',()=>{
  const html=renderSafeMarkdown('## Start\nFirst.\n\n- list item\n\n> quoted text\n\nSecond.');
  const split=figurePosition(html,1);expect(split.opening+split.rest).toBe(html);expect(split.opening).toContain('<p>First.</p>');expect(split.rest).toContain('<ul>');
  expect(()=>figurePosition(html,3)).toThrow(/existing prose/);expect(()=>figurePosition(html,0)).toThrow();
 });
 it('does not count paragraphs nested inside quotes or lists as top-level prose',()=>{
  const html='<blockquote><p>Quoted one.</p><p>Quoted two.</p></blockquote>\n<p>First.</p>\n<ul><li><p>Nested list paragraph.</p></li></ul>\n<p>Second.</p>';
  const first=figurePosition(html,1),second=figurePosition(html,2);
  expect(first.opening).toContain('<blockquote><p>Quoted one.</p><p>Quoted two.</p></blockquote>');
  expect(first.opening).toMatch(/<p>First\.<\/p>$/);expect(first.rest).toContain('Nested list paragraph');
  expect(second.opening).toMatch(/<p>Second\.<\/p>$/);expect(second.opening+second.rest).toBe(html);
 });
 it('checks genuine PNG dimensions, regular files, byte limits and safe paths',async()=>{
  const root=await assetRoot();const bytes=await readFile('public/icons/icon-192.png');await writeFile(join(root,'lesson-media/test.png'),bytes);
  expect(rasterDimensions(bytes,'png')).toEqual({width:192,height:192});await expect(validateFigureAsset(image,root)).resolves.toBeUndefined();
  await expect(validateFigureAsset({...image,width:193},root)).rejects.toThrow(/disagree/);
  await expect(validateFigureAsset({...image,src:'/lesson-media/missing.png'},root)).rejects.toThrow();
  await writeFile(join(root,'lesson-media/test.png'),'<svg onload="x"/>');await expect(validateFigureAsset(image,root)).rejects.toThrow(/signature/);
  await writeFile(join(root,'lesson-media/test.png'),Buffer.alloc(FIGURE_LIMITS.maxBytes+1));await expect(validateFigureAsset(image,root)).rejects.toThrow(/byte limit/);
  await expect(validateFigureAsset({...image,src:'/lesson-media/../test.png'},root)).rejects.toThrow(/Unsafe/);
 });
 it('rejects symlinked raster files and directories',async()=>{
  const root=await assetRoot();await symlink(join(process.cwd(),'public/icons/icon-192.png'),join(root,'lesson-media/test.png'));await expect(validateFigureAsset(image,root)).rejects.toThrow(/non-symlink/);
  const root2=await mkdtemp(join(tmpdir(),'five-minutes-media-link-'));await symlink(join(root,'lesson-media'),join(root2,'lesson-media'));await expect(validateFigureAsset(image,root2)).rejects.toThrow(/directories/);
 });
 it('validates WebP container dimensions and rejects malformed/truncated/animated headers',()=>{
  // A container/header fixture exercises parsing, not a codec or a user-facing image.
  const bytes=Buffer.alloc(26);bytes.write('RIFF');bytes.writeUInt32LE(18,4);bytes.write('WEBP',8);bytes.write('VP8L',12);bytes.writeUInt32LE(5,16);bytes[20]=47;bytes.writeUInt32LE((15<<14)|31,21);
  expect(rasterDimensions(bytes,'webp')).toEqual({width:32,height:16});
  expect(()=>rasterDimensions(bytes.subarray(0,24),'webp')).toThrow();
  const animation=Buffer.from(bytes);animation.write('ANIM',12);expect(()=>rasterDimensions(animation,'webp')).toThrow(/Animated/);
  expect(()=>rasterDimensions(Buffer.from('<html>'),'webp')).toThrow();
 });
 it('the real loader rejects missing raster assets and nonexistent figure placement',async()=>{
  const root=await mkdtemp(join(tmpdir(),'five-minutes-figure-loader-'));await cp('src/content/lessons',root,{recursive:true});
  const path=join(root,'2026/why-earth-has-seasons/adult.md');const original=await readFile(path,'utf8');
  await writeFile(path,original.replace('afterParagraph: 1','afterParagraph: 49'));await expect(loadPublishedLessons(root,routeOwnership)).rejects.toThrow(/adult.md figure.*existing prose/);
  await writeFile(path,original.replace('type: seasons-orbit\n  data: { tiltDegrees: 23.4 }','type: image\n  src: /lesson-media/missing.png\n  width: 192\n  height: 192'));
  await expect(loadPublishedLessons(root,routeOwnership,await assetRoot())).rejects.toThrow(/adult.md figure/);
 });
});
