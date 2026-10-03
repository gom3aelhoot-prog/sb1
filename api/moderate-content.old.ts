type V={type:string,re:RegExp};const RULES:V[]=[
{type:'politics',re:/\b(president|election|politics|party|government|حزب|انتخابات|سياسة|سياسي|حكومة)\b/i},
{type:'religion',re:/\b(religion|religious|god|allah|church|mosque|christian|muslim|ديني|دين|عقيدة|الله|كنيسة|مسجد|مسيحي|مسلم)\b/i},
{type:'pornography',re:/\b(porn|pornographic|xxx|sex video|nude|naked|اباحي|إباحي|عري|جنس)\b/i},
{type:'contact_or_account',re:/(\+?\d[\d\s().-]{7,}\d|\b(?:iban|swift|bank account|رقم حساب|حساب بنكي|هاتف|جوال|واتساب|تليجرام)\b)/i},
{type:'external_or_social_link',re:/(https?:\/\/|www\.|t\.me\/|instagram\.com|facebook\.com|x\.com|youtube\.com)/i}
];
export default function handler(req:any,res:any){if(req.method!=='POST')return res.status(405).json({ok:false,error:'Method not allowed'});const body=String(req.body?.text||'');const hits=RULES.filter(x=>x.re.test(body)).map(x=>x.type);return res.status(200).json({ok:true,allowed:hits.length===0,violations:hits,severity:hits.includes('pornography')?'high':hits.length?'medium':'none'});}
