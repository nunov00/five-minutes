import type {APIRoute} from 'astro';
import {readFile} from 'node:fs/promises';
export function getStaticPaths(){return process.env.FIVE_MINUTES_TEST_LIBRARY_PAGE_SIZE?[{params:{fixture:'visual-style-butterfly.webp'}}]:[];}
export const GET:APIRoute=async()=>new Response(new Uint8Array(await readFile('docs/visuals/references/butterfly.webp')),{headers:{'Content-Type':'image/webp'}});
