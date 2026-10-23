import {readFile,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {resolve} from 'node:path';
import {configuredOrigin} from '../../src/lib/site-origin.mjs';
export function deploymentConfig(template,value,{requireOrigin=false}={}){
 const origin=configuredOrigin(value);
 if(requireOrigin&&!origin)throw Error('Production deployment requires SITE_URL; no origin is inferred.');
 const result=structuredClone(template);
 delete result.vars.ANALYTICS_ALLOWED_HOSTNAME;delete result.vars.FEEDBACK_ALLOWED_HOSTNAME;
 if(origin){const hostname=new URL(origin).hostname;result.vars.ANALYTICS_ALLOWED_HOSTNAME=hostname;result.vars.FEEDBACK_ALLOWED_HOSTNAME=hostname;}
 // Preview settings never inherit the production hostname guards.
 if(Object.keys(result.previews??{}).length)throw Error('Preview overrides require separate review.');
 return result;
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 // Trusted repository JSONC currently uses full-line comments only; preserve URL strings.
 const source=await readFile(new URL('wrangler.jsonc',import.meta.url),'utf8');
 const template=JSON.parse(source.split('\n').filter(line=>!line.trimStart().startsWith('//')).join('\n'));
 const config=deploymentConfig(template,process.env.SITE_URL,{requireOrigin:process.argv.includes('--require-origin')});
 await writeFile(new URL('.wrangler.generated.json',import.meta.url),JSON.stringify(config,null,2)+'\n');
 console.log(process.env.SITE_URL?'Prepared deployment hostname guards from SITE_URL.':'Prepared origin-absent preview configuration; production deployment remains blocked.');
}
