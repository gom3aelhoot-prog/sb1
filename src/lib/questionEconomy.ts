import { supabase } from '@/lib/supabase';

export const PAID_QUESTION_DURATIONS = [
  { id:'q3', days:3, price_usd:3, label_ar:'3 أيام', label_en:'3 days' },
  { id:'q5', days:5, price_usd:5, label_ar:'5 أيام', label_en:'5 days' },
  { id:'q10', days:10, price_usd:9, label_ar:'10 أيام', label_en:'10 days' },
  { id:'q15', days:15, price_usd:12, label_ar:'15 يوماً', label_en:'15 days' },
] as const;

export const CREDITS = {
  bundle: 100,
  bundleUsd: 5,
  question: 1,
  image: 5,
};

export const SUBSCRIPTION_PLANS = [
  { id:'free', name:'Free', price:0, questions:10, images:0, unlimited:false },
  { id:'pro', name:'Pro', price:10, questions:500, images:50, unlimited:false },
  { id:'business', name:'Business', price:30, questions:Infinity, images:Infinity, unlimited:true },
] as const;

export function ratingToSpecialistShare(stars:number){
  const n=Math.max(1,Math.min(5,Math.round(stars)));
  return n/5;
}
export function calculateAnswerEarnings(totalPaid:number, ratings:number[]){
  const siteShare=totalPaid*0.5;
  const specialistPool=totalPaid*0.5;
  const weights=ratings.map(r=>ratingToSpecialistShare(r));
  const sum=weights.reduce((a,b)=>a+b,0)||1;
  return ratings.map((r,i)=>({stars:r,siteAmount:siteShare,specialistPool,weight:weights[i],specialistAmount:Number((specialistPool*weights[i]/sum).toFixed(2))}));
}

const key=()=>typeof window==='undefined'?'guest':(localStorage.getItem('sb1_account_key')||localStorage.getItem('chat_email')||'guest');
export function creditsBalance(){try{return Number(localStorage.getItem('sb1_credits_balance')||'0')}catch{return 0}}
export function addCredits(n:number){const next=creditsBalance()+Math.max(0,n);localStorage.setItem('sb1_credits_balance',String(next));return next}
export function spendCredits(n:number){if(creditsBalance()<n)return false;localStorage.setItem('sb1_credits_balance',String(creditsBalance()-n));return true}
export async function recordUsage(type:'question'|'image',units=1){
 const cost=type==='question'?CREDITS.question:CREDITS.image;
 if(!spendCredits(cost*units)) return {ok:false,reason:'insufficient_credits'};
 try{await supabase.from('sb1_credit_transactions').insert({account_key:key(),transaction_type:'usage',units:cost*units,amount_usd:cost*units*CREDITS.bundleUsd/CREDITS.bundle});}catch{}
 return {ok:true,credits:creditsBalance()};
}

const blocked=[
 {type:'politics',re:/\b(president|election|politics|party|government|حزب|انتخابات|سياسة|سياسي|حكومة)\b/i},
 {type:'religion',re:/\b(religion|religious|god|allah|church|mosque|christian|muslim|ديني|دين|عقيدة|الله|كنيسة|مسجد|مسيحي|مسلم)\b/i},
 {type:'pornography',re:/\b(porn|pornographic|xxx|sex video|nude|naked|اباحي|إباحي|عري|جنس)\b/i},
 {type:'phone_or_account',re:/(\+?\d[\d\s().-]{7,}\d|\b(?:iban|swift|bank account|رقم حساب|حساب بنكي|هاتف|جوال|واتساب|تليجرام)\b)/i},
 {type:'external_link',re:/(https?:\/\/|www\.|t\.me\/|instagram\.com|facebook\.com|x\.com|youtube\.com)/i},
];
export function moderateText(text:string){
 const hits=blocked.filter(x=>x.re.test(text)).map(x=>x.type);
 return {allowed:hits.length===0,violations:hits,severity:hits.length?hits.includes('pornography')?'high':'medium':'none'};
}
export async function moderateAndLog(sourceType:string,sourceId:string,text:string,userName=''){
 const result=moderateText(text);
 try{await supabase.from('sb1_moderation_events').insert({source_type:sourceType,source_id:sourceId,user_name:userName,content_snippet:text.slice(0,240),violations:result.violations,severity:result.severity,status:result.allowed?'allowed':'blocked',created_at:new Date().toISOString()});}catch{}
 return result;
}
