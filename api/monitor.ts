function safe(v:any){return String(v??'').slice(0,4000)}
export default async function handler(req:any,res:any){
 if(req.method!=='POST')return res.status(405).json({ok:false});
 try{const b=typeof req.body==='string'?JSON.parse(req.body):(req.body||{});const event={service:'SB1',type:safe(b.type||'runtime_error'),message:safe(b.message),stack:safe(b.stack),url:safe(b.url),timestamp:new Date().toISOString()};console.error('[SB1_MONITOR]',JSON.stringify(event));return res.status(202).json({ok:true,accepted:true});}
 catch{return res.status(400).json({ok:false,error:'invalid monitor payload'});}
}
