import sharp from 'sharp';
import {readFile,lstat} from 'node:fs/promises';
import {join} from 'node:path';
import {createHash} from 'node:crypto';
import {validateRasterBytes} from './raster.mjs';
import {lessonVisuals} from './collection.mjs';

// Application-owned publication fallback; never accepts lesson SVG or drawing instructions.
const fallback=Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630"><rect width="1200" height="630" fill="#fbf6ea"/><circle cx="600" cy="240" r="96" fill="#175f9c"/><path d="M600 172v68l44 26" fill="none" stroke="#fbf6ea" stroke-width="12" stroke-linecap="round"/><text x="600" y="450" font-family="sans-serif" font-size="76" fill="#202830" text-anchor="middle">Five Minutes</text></svg>');
export const DERIVATIVE_LIMITS=Object.freeze({thumbnail:120*1024,share:500*1024});
const cache=new Map();
export async function validateDerivative(bytes,kind,extension){
 if(!({thumbnail:['webp'],share:['png','jpg']})[kind]?.includes(extension))throw Error('Invalid derivative kind or format.');
 const m=await sharp(bytes,{limitInputPixels:4_000_000}).metadata();
 const expected=kind==='thumbnail'?{width:480,height:320}:{width:1200,height:630};
 const format=extension==='jpg'?'jpeg':extension;
 if(!['thumbnail','share'].includes(kind)||bytes.length>DERIVATIVE_LIMITS[kind]||m.width!==expected.width||m.height!==expected.height||m.format!==format
   ||(m.pages??1)!==1||m.exif||m.xmp||m.icc||m.iptc)throw Error('Invalid trusted visual derivative.');
 // Metadata checks do not establish that pixels decode.
 await sharp(bytes,{limitInputPixels:4_000_000}).raw().toBuffer();
 return expected;
}
export async function buildArtwork(bytes,key,isFallback=false){
 if(!/^[a-z0-9-]+$/.test(key))throw Error('Unsafe artwork key.');
 const source=sharp(bytes,{limitInputPixels:4_000_000}).toColourspace('srgb').flatten({background:'#fbf6ea'});
 const thumbnail=await source.clone().resize(480,320,{fit:'cover',position:'centre'}).webp({quality:80}).toBuffer();
 const shareSource=source.clone().resize(1200,630,{fit:'contain',background:'#fbf6ea'});
 let share=await shareSource.clone().png({compressionLevel:9}).toBuffer(),extension='png';
 if(share.length>DERIVATIVE_LIMITS.share){extension='jpg';share=await shareSource.clone().jpeg({quality:88,mozjpeg:true}).toBuffer();}
 await validateDerivative(thumbnail,'thumbnail','webp');await validateDerivative(share,'share',extension);
 const hash=createHash('sha256').update(thumbnail).update(share).digest('hex').slice(0,16);
 const stem=`${key}-${hash}`;
 const outputs=[{path:`${stem}/thumbnail.webp`,bytes:thumbnail,type:'image/webp',width:480,height:320},
  {path:`${stem}/share.${extension}`,bytes:share,type:extension==='png'?'image/png':'image/jpeg',width:1200,height:630}];
 return {isFallback,thumbnail:`/visuals/${outputs[0].path}`,share:`/visuals/${outputs[1].path}`,shareType:outputs[1].type,outputs};
}
/** Called only with canonical validated lessons. The source is still checked at the I/O boundary. */
export async function lessonArtwork(lesson,publicRoot=join(process.cwd(),'public')){
 const lead=lessonVisuals(lesson?.adult).find(v=>v.role==='lead')?.figure;
 let bytes=fallback,key='publication',isFallback=true;
 if(lead){
  if(lead.type!=='image')throw Error('A lead must be an image.');
  // Validate path before joining, then disallow symlink directories/files and oversized reads.
  validateRasterBytesPath(lead);
  for(const p of [publicRoot,join(publicRoot,'lesson-media')]){const s=await lstat(p);if(!s.isDirectory()||s.isSymbolicLink())throw Error('Unsafe artwork directory.');}
  const file=join(publicRoot,lead.src.slice(1)),stat=await lstat(file);
  if(!stat.isFile()||stat.isSymbolicLink()||stat.size>500*1024)throw Error('Unsafe artwork file.');
  bytes=await readFile(file);validateRasterBytes(bytes,lead.src,lead.width,lead.height);
  key=`lesson-${lesson.metadata.slug}`;isFallback=false;
 }
 const digest=createHash('sha256').update(bytes).digest('hex');const cacheKey=`${key}:${digest}`;
 if(!cache.has(cacheKey))cache.set(cacheKey,buildArtwork(bytes,key,isFallback).catch(error=>{cache.delete(cacheKey);throw error;}));
 return cache.get(cacheKey);
}
function validateRasterBytesPath(lead){if(!/^\/lesson-media\/[a-z0-9]+(?:-[a-z0-9]+)*\.(png|webp)$/.test(lead.src))throw Error('Unsafe artwork path.');}
