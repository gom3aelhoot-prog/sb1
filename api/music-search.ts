import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req:VercelRequest,res:VercelResponse){
  const q=String(req.query.q||'').trim();
  if(!q)return res.status(400).json({items:[],error:'Missing q'});
  const key=process.env.PIXABAY_API_KEY;
  if(!key)return res.status(200).json({items:[
    {id:'demo-audio-1',name:'موسيقى هادئة',url:'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73467.mp3?filename=relaxing-ambient-11327.mp3',source:'Pixabay',tags:'هادئ، استرخاء'},
    {id:'demo-audio-2',name:'Positive Vibes',url:'https://cdn.pixabay.com/download/audio/2022/10/25/audio_946e9f9e1b.mp3?filename=positive-vibes-121744.mp3',source:'Pixabay',tags:'فرح، إيجابي'}
  ].filter(x=>(x.name+' '+x.tags).toLowerCase().includes(q.toLowerCase())||q.length>0)});
  try{
    const pages=await Promise.all([1,2,3].map(async(page)=>{const u='https://pixabay.com/api/audio/?key='+encodeURIComponent(key)+'&q='+encodeURIComponent(q)+'&per_page=100&page='+page;const r=await fetch(u);const x:any=await r.json();return {ok:r.ok,x}}));
    const bad=pages.find(p=>!p.ok);if(bad)return res.status(502).json({items:[],error:bad.x?.message||'Music provider error'});
    const items=pages.flatMap(p=>p.x.hits||[]).slice(0,300).map((m:any)=>({id:String(m.id),name:m.tags||'Audio',url:m.audio||m.preview_url||'',thumbnail:m.thumbnail||'',source:'Pixabay',tags:m.tags||'',duration:m.duration||0}));
    return res.status(200).json({items:items.filter((x:any)=>x.url)});
  }catch(e:any){return res.status(500).json({items:[],error:e?.message||'Music search failed'});}
}