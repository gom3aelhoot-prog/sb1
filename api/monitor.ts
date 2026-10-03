import { providerConfig, probeProviders } from '../src/lib/resilience.js';

function safe(v:any){return String(v??'').slice(0,4000)}

export default async function handler(req:any,res:any){
 if(req.method==='GET'){
  const cfg=providerConfig(process.env as any);const results:any[]=[];
  for(const [name,list] of Object.entries(cfg))results.push({name,checks:await probeProviders(list as any)});
  const configured=results.flatMap(x=>x.checks).filter(x=>x.url&&x.error!=='disabled');
  const failed=configured.filter(x=>!x.ok);
  return res.status(failed.length?503:200).json({ok:failed.length===0,service:'SB1',timestamp:new Date().toISOString(),groups:results});
 }
 if(req.method!=='POST')return res.status(405).json({ok:false});
 try{
  const b=typeof req.body==='string'?JSON.parse(req.body):(req.body||{});
  const event={service:'SB1',type:safe(b.type||'runtime_error'),message:safe(b.message),stack:safe(b.stack),url:safe(b.url),timestamp:new Date().toISOString()};
  console.error('[SB1_MONITOR]',JSON.stringify(event));
  return res.status(202).json({ok:true,accepted:true});
 }catch{return res.status(400).json({ok:false,error:'invalid monitor payload'});}
}
