import {describe,it,expect} from 'vitest';
import {readFileSync,readdirSync,existsSync} from 'node:fs';
import {join} from 'node:path';
import {configuredOrigin} from '../../src/lib/site-origin.mjs';
import {deploymentConfig} from '../../deploy/cloudflare/prepare-origin.mjs';
const template={vars:{FEEDBACK_GITHUB_REPOSITORY:'owner/feedback'},previews:{},assets:{directory:'../../dist'}};
describe('portable publication origin',()=>{
 it('preserves an explicitly absent origin and normalises a configured HTTPS origin',()=>{
  expect(configuredOrigin(undefined)).toBeUndefined();expect(configuredOrigin('')).toBeUndefined();
  expect(configuredOrigin('https://example.test/')).toBe('https://example.test');
 });
 it.each(['http://example.test','https://example.test/path','https://user@example.test','https://example.test?x=1','https://example.test/#x'])('rejects ambiguous or unsafe deployment identities: %s',value=>expect(()=>configuredOrigin(value)).toThrow());
 it('derives both runtime hostname guards and keeps previews isolated',()=>{
  const config=deploymentConfig(template,'https://new.example.test');
  expect(config.vars).toMatchObject({ANALYTICS_ALLOWED_HOSTNAME:'new.example.test',FEEDBACK_ALLOWED_HOSTNAME:'new.example.test'});
  expect(config.previews).toEqual({});expect(template.vars).not.toHaveProperty('ANALYTICS_ALLOWED_HOSTNAME');
  expect(deploymentConfig(template,'').vars).not.toHaveProperty('FEEDBACK_ALLOWED_HOSTNAME');
  expect(()=>deploymentConfig(template,'',{requireOrigin:true})).toThrow(/requires SITE_URL/);
  expect(()=>deploymentConfig({...template,previews:{vars:{unsafe:true}}},'https://example.test')).toThrow(/Preview/);
 });
 it('keeps the deployed hostname out of application/configuration/deployment sources',()=>{
  const forbidden='five-minutes-v2.vitoria-nuno.workers.dev';
  const walk=(dir:string):string[]=>!existsSync(dir)?[]:readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.name==='.wrangler.generated.json'?[]:e.isDirectory()?walk(join(dir,e.name)):e.isFile()?[join(dir,e.name)]:[]);
  const offenders=['src','config','deploy'].flatMap(walk).filter(file=>readFileSync(file).includes(Buffer.from(forbidden)));
  expect(offenders).toEqual([]);
 });
});
