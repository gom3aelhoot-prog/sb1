type Body={message?:string;lang?:string;history?:Array<{role:string;text:string}>};
const model=process.env.GEMINI_MODEL||'gemini-3.6-flash';
export default async function handler(req:any,res:any){
 if(req.method!=='POST') return res.status(405).json({error:'Method not allowed'});
 const key=process.env.GEMINI_API_KEY||process.env.GOOGLE_GEMINI_API_KEY;
 if(!key) return res.status(503).json({error:'AI provider key is not configured'});
 const body=req.body as Body; const message=String(body?.message||'').trim(); const lang=String(body?.lang||'en');
 if(!message) return res.status(400).json({error:'Message is required'});
 const history=(body?.history||[]).slice(-10).map((m)=>({role:m.role==='ai'?'model':'user',parts:[{text:String(m.text).slice(0,4000)}]}));
 const languageNames:any={ar:'Arabic',en:'English',de:'German',ru:'Russian',uk:'Ukrainian',uz:'Uzbek',hy:'Armenian',tg:'Tajik',az:'Azerbaijani',am:'Amharic',ka:'Georgian'};
 const system=`You are SB1's multilingual medical platform assistant. Reply in ${languageNames[lang]||'English'}. Give general educational information and help users navigate SB1. Do not diagnose, prescribe, or replace a clinician. For emergencies advise local emergency services. Never request or expose passwords, payment secrets, phone numbers, or private account credentials. Keep answers concise and clear.`;
 try{
  const r=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(key)}`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({systemInstruction:{parts:[{text:system}]},contents:[...history,{role:'user',parts:[{text:message}]}],generationConfig:{temperature:0.3,maxOutputTokens:700}})});
  const data=await r.json();
  if(!r.ok) return res.status(502).json({error:'AI provider request failed',detail:data?.error?.message||'Unknown provider error'});
  const text=data?.candidates?.[0]?.content?.parts?.map((p:any)=>p.text||'').join('').trim();
  if(!text) return res.status(502).json({error:'AI provider returned no text'});
  return res.status(200).json({text,model});
 }catch(e:any){return res.status(500).json({error:'AI provider connection failed'});}
}