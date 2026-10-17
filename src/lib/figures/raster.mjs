/** Container checks are shared by the loader and trusted-base guard; browsers verify decoding. */
export const RASTER_LIMITS = Object.freeze({ maxBytes: 500 * 1024, maxDimension: 2400, maxPixels: 4_000_000 });
export const LOCAL_RASTER_PATH = /^\/lesson-media\/[a-z0-9]+(?:-[a-z0-9]+)*\.(?:png|webp)$/;
const PNG_CHUNKS = new Set(['IHDR','PLTE','IDAT','IEND','tRNS','gAMA','cHRM','sRGB','pHYs','sBIT']);
const WEBP_CHUNKS = new Set(['VP8 ','VP8L','VP8X','ALPH']);
/** @param {Buffer} bytes @param {'png'|'webp'} extension @returns {{width:number,height:number}} */
export function rasterDimensions(bytes, extension) {
  if(bytes.length>RASTER_LIMITS.maxBytes)throw Error('Figure asset exceeds byte limit.');
  if(extension==='png') {
    if(bytes.length<33||!bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])))throw Error('Invalid PNG signature.');
    let offset=8,dimensions,image=false,ended=false;const seen=new Set();
    while(offset+12<=bytes.length) {
      const size=bytes.readUInt32BE(offset),type=bytes.toString('latin1',offset+4,offset+8);
      if(size>bytes.length-offset-12)throw Error('Truncated PNG chunk.');
      if(type==='acTL')throw Error('Animated figures are not supported.');
      if(!PNG_CHUNKS.has(type))throw Error(`Unsupported PNG chunk: ${type}. Strip image metadata before publication.`);
      if(type!=='IDAT'&&seen.has(type))throw Error('Duplicate PNG rendering chunk.');seen.add(type);
      const fixed={IHDR:13,IEND:0,gAMA:4,cHRM:32,sRGB:1,pHYs:9};
      if((Object.hasOwn(fixed,type)&&size!==fixed[type])||(type==='PLTE'&&(size<3||size>768||size%3!==0))||(type==='tRNS'&&(size<1||size>256))||(type==='sBIT'&&(size<1||size>4)))throw Error('Invalid PNG rendering chunk size.');
      if(offset===8&&(type!=='IHDR'||size!==13))throw Error('PNG must start with IHDR.');
      if(type==='IHDR'){if(dimensions)throw Error('Duplicate PNG header.');dimensions={width:bytes.readUInt32BE(offset+8),height:bytes.readUInt32BE(offset+12)};}
      if(type==='IDAT'&&size>0)image=true;
      offset+=size+12;
      if(type==='IEND'){if(size!==0||offset!==bytes.length)throw Error('Invalid PNG end.');ended=true;break;}
    }
    if(!dimensions||!image||!ended)throw Error('Incomplete PNG.');
    return dimensions;
  }
  if(extension!=='webp'||bytes.length<20||bytes.toString('ascii',0,4)!=='RIFF'||bytes.toString('ascii',8,12)!=='WEBP'||bytes.readUInt32LE(4)+8!==bytes.length)throw Error('Invalid WebP container.');
  let offset=12,dimensions,canvas;const seen=new Set();
  while(offset+8<=bytes.length){
    const type=bytes.toString('latin1',offset,offset+4),size=bytes.readUInt32LE(offset+4),data=offset+8;
    if(size>bytes.length-data)throw Error('Truncated WebP chunk.');
    if(type==='ANIM'||type==='ANMF')throw Error('Animated figures are not supported.');
    if(!WEBP_CHUNKS.has(type))throw Error(`Unsupported WebP chunk: ${type}. Strip image metadata before publication.`);
    if(seen.has(type))throw Error('Duplicate WebP rendering chunk.');seen.add(type);
    if(type==='VP8X'){if(size!==10||canvas||(bytes[data]&~0x10)||bytes[data+1]||bytes[data+2]||bytes[data+3])throw Error('Invalid/animated/metadata-bearing WebP header.');canvas={width:1+bytes.readUIntLE(data+4,3),height:1+bytes.readUIntLE(data+7,3)};}
    if(type==='VP8 '||type==='VP8L'){
      if(dimensions)throw Error('Duplicate WebP frame.');
      if(type==='VP8 '){
        if(size<10||!bytes.subarray(data+3,data+6).equals(Buffer.from([157,1,42])))throw Error('Invalid WebP frame.');
        dimensions={width:bytes.readUInt16LE(data+6)&0x3fff,height:bytes.readUInt16LE(data+8)&0x3fff};
      }else{
        if(size<5||bytes[data]!==47)throw Error('Invalid lossless WebP frame.');
        const bits=bytes.readUInt32LE(data+1);dimensions={width:(bits&0x3fff)+1,height:((bits>>>14)&0x3fff)+1};
      }
    }
    offset=data+size+(size%2);
  }
  if(offset!==bytes.length||!dimensions||(canvas&&(canvas.width!==dimensions.width||canvas.height!==dimensions.height)))throw Error('Incomplete/inconsistent WebP.');
  return dimensions;
}
/** @param {Buffer} bytes @param {string} path @param {number} width @param {number} height */
export function validateRasterBytes(bytes,path,width,height){
  if(!LOCAL_RASTER_PATH.test(path))throw Error('Unsafe figure asset path.');
  if(!Number.isInteger(width)||!Number.isInteger(height)||width<1||height<1||width>RASTER_LIMITS.maxDimension||height>RASTER_LIMITS.maxDimension||width*height>RASTER_LIMITS.maxPixels)throw Error('Figure asset exceeds dimension limits.');
  const actual=rasterDimensions(bytes,path.endsWith('.png')?'png':'webp');
  if(actual.width!==width||actual.height!==height)throw Error('Figure dimensions disagree with the image.');
}
