import { lstat, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { FIGURE_LIMITS, LOCAL_FIGURE_PATH, type LessonFigure } from '../content/presentation-extensions';
import { validateRasterBytes } from './raster.mjs';
export { rasterDimensions } from './raster.mjs';

/** Verify containers and dimensions without executing content or resolving remote assets. */
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
  validateRasterBytes(await readFile(file),figure.src,figure.width,figure.height);
}
