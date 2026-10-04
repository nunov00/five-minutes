import { lstat, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { FIGURE_LIMITS, LOCAL_FIGURE_PATH, type LessonFigure } from '../content/presentation-extensions';

/** Verify the raster container and intrinsic dimensions; never execute content or resolve remote assets. */
export function rasterDimensions(bytes: Buffer, extension: 'png'|'webp'): {width:number;height:number} {
  if(extension==='png') {
    if(bytes.length<33 || !bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]))) throw Error('Invalid PNG signature.');
    let offset=8, dimensions: {width:number;height:number}|undefined, image=false, ended=false;
    while(offset+12<=bytes.length) {
      const size=bytes.readUInt32BE(offset),type=bytes.toString('ascii',offset+4,offset+8);
      if(size>bytes.length-offset-12) throw Error('Truncated PNG chunk.');
      if(offset===8 && (type!=='IHDR'||size!==13)) throw Error('PNG must start with IHDR.');
      if(type==='IHDR') { if(dimensions)throw Error('Duplicate PNG header.'); dimensions={width:bytes.readUInt32BE(offset+8),height:bytes.readUInt32BE(offset+12)}; }
      if(type==='IDAT'&&size>0) image=true;
      if(type==='acTL') throw Error('Animated figures are not supported.');
      offset+=size+12;
      if(type==='IEND') {if(size!==0||offset!==bytes.length)throw Error('Invalid PNG end.');ended=true;break;}
    }
    if(!dimensions||!image||!ended) throw Error('Incomplete PNG.');
    return dimensions;
  }
  if(bytes.length<20||bytes.toString('ascii',0,4)!=='RIFF'||bytes.toString('ascii',8,12)!=='WEBP'||bytes.readUInt32LE(4)+8!==bytes.length) throw Error('Invalid WebP container.');
  let offset=12,dimensions: {width:number;height:number}|undefined,canvas:typeof dimensions;
  while(offset+8<=bytes.length) {
    const type=bytes.toString('ascii',offset,offset+4),size=bytes.readUInt32LE(offset+4),data=offset+8;
    if(size>bytes.length-data)throw Error('Truncated WebP chunk.');
    if(type==='ANIM'||type==='ANMF')throw Error('Animated figures are not supported.');
    if(type==='VP8X') {
      if(size!==10||canvas||bytes[data]&2)throw Error('Invalid/animated WebP header.');
      canvas={width:1+bytes.readUIntLE(data+4,3),height:1+bytes.readUIntLE(data+7,3)};
    }
    if(type==='VP8 '||type==='VP8L') {
      if(dimensions)throw Error('Duplicate WebP frame.');
      if(type==='VP8 ') {
        if(size<10||!bytes.subarray(data+3,data+6).equals(Buffer.from([157,1,42])))throw Error('Invalid WebP frame.');
        dimensions={width:bytes.readUInt16LE(data+6)&0x3fff,height:bytes.readUInt16LE(data+8)&0x3fff};
      } else {
        if(size<5||bytes[data]!==47)throw Error('Invalid lossless WebP frame.');
        const bits=bytes.readUInt32LE(data+1);dimensions={width:(bits&0x3fff)+1,height:((bits>>>14)&0x3fff)+1};
      }
    }
    offset=data+size+(size%2);
  }
  if(offset!==bytes.length||!dimensions||(canvas&&(canvas.width!==dimensions.width||canvas.height!==dimensions.height)))throw Error('Incomplete/inconsistent WebP.');
  return dimensions;
}
export async function validateFigureAsset(figure: LessonFigure|undefined, publicRoot: string): Promise<void> {
  if(!figure||figure.type!=='image') return;
  if(!LOCAL_FIGURE_PATH.test(figure.src)) throw Error('Unsafe figure asset path.');
  for(const directory of [publicRoot,join(publicRoot,'lesson-media')]) {
    const stat=await lstat(directory);
    if(!stat.isDirectory()||stat.isSymbolicLink())throw Error('Figure asset directories must not be symlinks.');
  }
  const file=join(publicRoot,figure.src.slice(1)),stat=await lstat(file);
  if(!stat.isFile()||stat.isSymbolicLink())throw Error('Figure assets must be regular non-symlink files.');
  if(stat.size>FIGURE_LIMITS.maxBytes)throw Error('Figure asset exceeds byte limit.');
  const bytes=await readFile(file);
  if(bytes.length>FIGURE_LIMITS.maxBytes)throw Error('Figure asset exceeds byte limit.');
  const actual=rasterDimensions(bytes,figure.src.endsWith('.png')?'png':'webp');
  if(actual.width!==figure.width||actual.height!==figure.height)throw Error('Figure dimensions disagree with the image.');
  if(actual.width<1||actual.height<1||actual.width>FIGURE_LIMITS.maxDimension||actual.height>FIGURE_LIMITS.maxDimension||actual.width*actual.height>FIGURE_LIMITS.maxPixels)throw Error('Figure asset exceeds dimension limits.');
}
