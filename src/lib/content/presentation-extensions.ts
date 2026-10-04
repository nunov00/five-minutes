import type { ValidationIssue } from './schema';

export interface FigureText {
  alt: string;
  caption: string;
  description: string;
  /** Insert after this top-level prose paragraph; omitted means the opening. */
  afterParagraph?: number;
}
export type LessonFigure = FigureText & (
  | { type: 'seasons-orbit'; data: { tiltDegrees: 23.4 | 23.5 } }
  | { type: 'image'; src: string; width: number; height: number }
);
export interface TeenActivity { prompt: string; options: string[]; answer: number; explanation: string; }
export const FIGURE_LIMITS = Object.freeze({ maxBytes: 500 * 1024, maxDimension: 2400, maxPixels: 4_000_000 });
export const LOCAL_FIGURE_PATH = /^\/lesson-media\/[a-z0-9]+(?:-[a-z0-9]+)*\.(?:png|webp)$/;
const object = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v);
const plain = (v: unknown, max: number): v is string => typeof v === 'string' && v.trim().length > 0 && v.length <= max
  && !/[<>`]|!\[|\[[^\]]*\]\(|\*\*|(?:^|\n)\s*(?:#|[-*]\s)/.test(v) && !/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(v);
const normalise = (v: string) => v.trim().toLocaleLowerCase('en').replace(/\s+/g,' ');
function keys(v: Record<string,unknown>, allowed: string[], path: string, issues: ValidationIssue[]) {
  for(const key of Object.keys(v)) if(!allowed.includes(key)) issues.push({path:`${path}.${key}`,code:'unknown-field',message:'Unknown structured presentation field.'});
}
export function validatePresentationExtensions(value: Record<string,unknown>, path: string, edition: 'adult'|'teen'): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const fail = (name:string,message:string) => issues.push({path:`${path}.${name}`,code:'presentation-extension',message});
  if ('figure' in value) {
    const f = value.figure;
    if (!object(f)) fail('figure','Expected one structured figure.');
    else {
      const common = ['type','alt','caption','description','afterParagraph'];
      keys(f,[...common,...(f.type==='seasons-orbit'?['data']:f.type==='image'?['src','width','height']:[])],`${path}.figure`,issues);
      for(const [key,max] of [['alt',200],['caption',240],['description',900]] as const) if(!plain(f[key],max)) fail(`figure.${key}`,`Expected non-empty plain text (maximum ${max} characters).`);
      if(f.afterParagraph!==undefined && (!Number.isInteger(f.afterParagraph) || Number(f.afterParagraph)<1 || Number(f.afterParagraph)>50)) fail('figure.afterParagraph','Expected a prose paragraph position from 1 to 50.');
      if(f.type==='seasons-orbit') {
        if(!object(f.data)) fail('figure.data','Expected seasons diagram data.');
        else {
          keys(f.data,['tiltDegrees'],`${path}.figure.data`,issues);
          if(f.data.tiltDegrees!==23.4 && f.data.tiltDegrees!==23.5) fail('figure.data.tiltDegrees','Earth diagram tilt must be 23.4 or 23.5 degrees.');
        }
      } else if(f.type==='image') {
        if(typeof f.src!=='string' || !LOCAL_FIGURE_PATH.test(f.src)) fail('figure.src','Expected a local /lesson-media/<name>.png or .webp path.');
        if(!Number.isInteger(f.width)||!Number.isInteger(f.height)||Number(f.width)<1||Number(f.height)<1||Number(f.width)>FIGURE_LIMITS.maxDimension||Number(f.height)>FIGURE_LIMITS.maxDimension||Number(f.width)*Number(f.height)>FIGURE_LIMITS.maxPixels) fail('figure','Image dimensions exceed the configured limits.');
      } else fail('figure.type','Unknown app-owned figure type.');
    }
  }
  if('activity' in value) {
    const a = value.activity;
    if(edition!=='teen') fail('activity','Activities are Teen-only.');
    if(!object(a)) fail('activity','Expected a structured Teen activity.');
    else {
      keys(a,['prompt','options','answer','explanation'],`${path}.activity`,issues);
      if(!plain(a.prompt,140)) fail('activity.prompt','Expected a plain-text prompt of at most 140 characters.');
      if(!Array.isArray(a.options)||a.options.length<2||a.options.length>4||!a.options.every(o=>plain(o,80))) fail('activity.options','Expected 2–4 plain-text choices of at most 80 characters each.');
      else if(new Set(a.options.map(normalise)).size!==a.options.length) fail('activity.options','Choices must be unique.');
      if(!Number.isInteger(a.answer)||!Array.isArray(a.options)||Number(a.answer)<0||Number(a.answer)>=a.options.length) fail('activity.answer','Expected a zero-based answer index within the choices.');
      if(!plain(a.explanation,400)) fail('activity.explanation','Expected a plain-text explanation of at most 400 characters.');
      if(typeof a.prompt==='string' && typeof value.question==='string' && normalise(a.prompt)===normalise(value.question)) fail('activity.prompt','The activity must not repeat the retrieval question.');
    }
  }
  return issues;
}
