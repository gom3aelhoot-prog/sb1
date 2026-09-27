import { useState } from 'react';
import { AlertTriangle, Bot, CheckCircle2, Gift, ShieldCheck, Star } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useI18n } from '@/lib/i18n';

const reasons=[['no_show','لم يحضر الأخصائي الموعد'],['behavior','مخالفة سلوكية'],['service','مشكلة في الخدمة'],['billing','مشكلة مالية'],['quality','جودة الاستشارة'],['other','سبب آخر']];

export default function ComplaintsPage(){
 const {lang}=useI18n();
 const [step,setStep]=useState(1); const [busy,setBusy]=useState(false);
 const [form,setForm]=useState({name:'',email:'',providerId:'',sessionId:'',rating:1,reason:'service',description:'',severity:'medium',requested:'discount',});
 const [result,setResult]=useState<any>(null);
 const set=(k:string,v:any)=>setForm(x=>({...x,[k]:v}));
 async function submit(){
  if(!form.description.trim()) return;
  setBusy(true);
  const args={p_customer_name:form.name,p_customer_email:form.email,p_provider_id:form.providerId||null,p_session_id:form.sessionId||null,p_rating:Number(form.rating),p_reason_category:form.reason,p_description:form.description,p_severity:form.severity,p_language:lang,p_requested_resolution:form.requested};
  try{
   const rpc=await supabase.rpc('sb1_process_complaint',args);
   if(rpc.data){setResult(rpc.data);setStep(4);return;}
   const complaintId='demo-complaint-'+Date.now();
   await supabase.from('complaints').insert({...form,id:complaintId,rating:Number(form.rating),language_code:lang,provider_id:form.providerId||null,session_id:form.sessionId||null});
   let code:string|null=null;
   if(Number(form.rating)<=2 || form.severity==='high'){
    code='SB1-'+Math.random().toString(36).slice(2,10).toUpperCase();
    const discount=Math.min(30,form.severity==='high'?30:20);
    await supabase.from('compensation_codes').insert({id:'demo-code-'+Date.now(),complaint_id:complaintId,code,discount_percent:discount,free_questions:1,free_consultations:form.severity==='high'?1:0,expires_at:new Date(Date.now()+30*86400000).toISOString()});
    if(form.providerId){
      await supabase.from('provider_sanctions').insert({id:'demo-sanction-'+Date.now(),provider_id:form.providerId,sanction_type:Number(form.rating)<=2?'negative_review':'complaint_investigation',amount:0,freeze_account:form.severity==='high',reason:'تحقيق آلي بعد شكوى/تقييم منخفض',complaint_id:complaintId,session_id:form.sessionId||null});
      if(form.sessionId) await supabase.from('session_holds').insert({id:'demo-hold-'+Date.now(),provider_id:form.providerId,session_id:form.sessionId,complaint_id:complaintId,amount:0,percent:30,reason:'حجز مؤقت لحين التحقيق'});
    }
    await supabase.from('complaint_assistant_actions').insert({id:'demo-action-'+Date.now(),complaint_id:complaintId,action_type:'automatic_compensation',action_payload:{code,discount_percent:discount,free_questions:1,free_consultations:form.severity==='high'?1:0}});
    setResult({ok:true,complaint_id:complaintId,compensation_code:code,discount_percent:discount,free_questions:1,free_consultations:form.severity==='high'?1:0});
   } else setResult({ok:true,complaint_id:complaintId,compensation_code:null,discount_percent:0});
   setStep(4);
  }catch(e){setResult({ok:false,error:'تعذر تسجيل الشكوى الآن'});setStep(4)} finally{setBusy(false)}
 }
 return <div dir="rtl" className="min-h-screen bg-slate-50 pt-24 pb-16"><div className="mx-auto max-w-4xl px-4">
  <div className="rounded-3xl bg-gradient-to-br from-teal-700 to-cyan-600 p-8 text-white shadow-xl"><div className="flex items-center gap-3"><Bot className="h-10 w-10"/><div><h1 className="text-3xl font-black">مساعد الشكاوى الذكي</h1><p className="mt-1 text-white/85">نستمع للمشكلة، نسجلها، ونطبق قواعد التعويض والحماية المعتمدة من إدارة SB1.</p></div></div></div>
  {step<4&&<div className="mt-6 rounded-3xl bg-white border p-6 shadow-sm">
   {step===1&&<><div className="flex items-center gap-3 mb-5"><ShieldCheck className="text-teal-600"/><div><h2 className="text-xl font-bold">مرحباً بك</h2><p className="text-gray-500">نأسف لتجربتك. سأطرح عليك أسئلة قصيرة لتحديد المشكلة بدقة.</p></div></div><div className="grid md:grid-cols-2 gap-4"><input className="input-field" placeholder="الاسم" value={form.name} onChange={e=>set('name',e.target.value)}/><input className="input-field" placeholder="البريد الإلكتروني" value={form.email} onChange={e=>set('email',e.target.value)}/><input className="input-field" placeholder="معرّف الأخصائي (اختياري)" value={form.providerId} onChange={e=>set('providerId',e.target.value)}/><input className="input-field" placeholder="معرّف الجلسة (اختياري)" value={form.sessionId} onChange={e=>set('sessionId',e.target.value)}/></div><button className="btn-primary mt-5" onClick={()=>setStep(2)}>ابدأ المحادثة</button></>}
   {step===2&&<><h2 className="text-xl font-bold mb-4">ما المشكلة الأساسية؟</h2><div className="grid md:grid-cols-2 gap-3">{reasons.map(([v,l])=><button key={v} onClick={()=>set('reason',v)} className={'rounded-2xl border p-4 text-right '+(form.reason===v?'border-teal-500 bg-teal-50':'bg-white')}>{l}</button>)}</div><div className="mt-5"><label className="font-bold">تقييمك</label><div className="flex gap-1 mt-2">{[1,2,3,4,5].map(n=><button key={n} onClick={()=>set('rating',n)}><Star className={'h-8 w-8 '+(n<=form.rating?'fill-amber-400 text-amber-400':'text-gray-300')}/></button>)}</div></div><button className="btn-primary mt-5" onClick={()=>setStep(3)}>التالي</button></>}
   {step===3&&<><h2 className="text-xl font-bold mb-4">أخبرني بالتفاصيل</h2><textarea className="input-field min-h-40" value={form.description} onChange={e=>set('description',e.target.value)} placeholder="ماذا حدث؟ متى؟ وما الذي تتوقعه من SB1؟"/><div className="grid md:grid-cols-2 gap-4 mt-4"><select className="input-field" value={form.severity} onChange={e=>set('severity',e.target.value)}><option value="low">مشكلة بسيطة</option><option value="medium">مشكلة متوسطة</option><option value="high">مشكلة شديدة/عاجلة</option></select><select className="input-field" value={form.requested} onChange={e=>set('requested',e.target.value)}><option value="discount">كود خصم</option><option value="questions">أسئلة مجانية</option><option value="consultation">استشارة مجانية</option><option value="investigation">تحقيق فقط</option></select></div><button disabled={busy||!form.description.trim()} className="btn-primary mt-5 disabled:opacity-50">{busy?'جاري معالجة الشكوى...':'إرسال الشكوى وبدء المعالجة'}</button><button className="block mt-3 text-sm text-gray-500" onClick={()=>setStep(2)}>رجوع</button></>}
  </div>}
  {step===4&&<div className="mt-6 rounded-3xl bg-white border p-8 text-center shadow-sm">{result?.ok?<><CheckCircle2 className="mx-auto h-16 w-16 text-green-500"/><h2 className="text-2xl font-black mt-4">تم استلام الشكوى</h2><p className="text-gray-600 mt-2">تم فتح ملف للتحقيق وتطبيق القواعد الآلية المسموح بها.</p>{result.compensation_code&&<div className="mt-6 rounded-2xl bg-amber-50 border border-amber-200 p-5"><Gift className="mx-auto text-amber-600"/><p className="font-bold mt-2">تعويض فوري</p><p className="text-sm mt-1">كود الخصم</p><div className="text-2xl font-black tracking-widest mt-2">{result.compensation_code}</div><p className="text-sm text-amber-800 mt-2">خصم حتى {result.discount_percent}% · {result.free_questions||0} سؤال مجاني · {result.free_consultations||0} استشارة مجانية</p></div>}<p className="text-xs text-gray-400 mt-5">رقم الشكوى: {result.complaint_id}</p></>:<><AlertTriangle className="mx-auto h-14 w-14 text-red-500"/><h2 className="text-xl font-bold mt-4">تعذر تسجيل الشكوى</h2></>}</div>}
 </div></div>
}