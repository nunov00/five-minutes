/** Optional deployment origin; never infer an identity from the build machine or a preview URL. */
export function configuredOrigin(value) {
  if(value === undefined || value === '') return undefined;
  const url=new URL(value);
  if(url.protocol!=='https:' || url.username || url.password || url.pathname!=='/' || url.search || url.hash)throw Error('SITE_URL must be a credential-free HTTPS origin without a path, query or fragment.');
  return url.origin;
}
