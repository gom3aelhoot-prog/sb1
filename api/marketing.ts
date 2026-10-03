import publish from '../src/server/marketing-publish.js';
import newsletter from '../src/server/marketing-weekly-newsletter.js';
export default async function handler(req:any,res:any){
 const route=String(req.query?.route||'publish');
 if(route==='newsletter')return newsletter(req,res);
 return publish(req,res);
}