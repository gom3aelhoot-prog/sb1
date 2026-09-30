import { providerConfig, probeProviders } from '../src/lib/resilience.js';
export default async function handler(req:any,res:any){
 if(req.method!=='GET')return res.status(405).json({ok:false,error:'Method not allowed'});
 const cfg=providerConfig(process.env as any);const results:any[]=[];
 for(const [name,list] of Object.entries(cfg))results.push({name,checks:await probeProviders(list as any)});
 const configured=results.flatMap(x=>x.checks).filter(x=>x.url&&x.error!=='disabled');const failed=configured.filter(x=>!x.ok);
 return res.status(failed.length?503:200).json({ok:failed.length===0,service:'SB1',timestamp:new Date().toISOString(),groups:results});
}
