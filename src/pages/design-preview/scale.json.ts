import { synthetic } from '../../prototype/model';
export function GET() { return new Response(JSON.stringify(synthetic(10000)),{headers:{'content-type':'application/json'}}); }
