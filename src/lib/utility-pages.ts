/** Public utility routes stay indexable; this PR makes no new noindex policy decision. */
export const UTILITY_PAGES = [
  {path:'/analytics', label:'Analytics', indexable:true},
  {path:'/feedback', label:'Send anonymous feedback', indexable:true},
] as const;
