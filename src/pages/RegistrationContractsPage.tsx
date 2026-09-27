import { useMemo,useState } from 'react';
import { CheckCircle2,FileSignature,ShieldCheck,ArrowRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useRouter } from '@/lib/router';
import { useI18n } from '@/lib/i18n';

export default function RegistrationContractsPage(){
 const {lang}=useI18n(); const {navigate}=useRouter();
 const params=useMemo(()=>new URLSearchParams(window.location.search),[]);
 const accountType=params.get('type')||'client';
 const pending=JSON.parse(localStorage.getItem('sb1_pending_registration')||'{}');
 const [checks,setChecks]=useState({terms:false,privacy:false,medical:false,data:false});
 const [signature,setSignature]=useState(pending.name||'');
 const [saving,setSaving]=useState(false);
 const all=Object.values(checks).every(Boolean)&&signature.trim().length>=2;
 const tr=(ar:string,en:string)=>lang==='ar'?ar:en;
 const save=async()=>{if(!all)return;setSaving(true);const payload={registration_id:'reg-'+Date.now(),account_type:accountType,full_name:pending.name||null,email:pending.email||null,phone:pending.phone||null,country_code:pending.country_code||null,city:pending.city||null,language_code:lang,terms_accepted:true,privacy_accepted:true,medical_disclaimer_accepted:true,data_processing_accepted:true,signature_name:signature.trim(),signature_text:signature.trim(),signed_at:new Date().toISOString()};localStorage.setItem('sb1_registration_contract',JSON.stringify(payload));try{await supabase.from('sb1_registration_contracts').insert(payload)}catch{}setSaving(false);navigate('/register?step=identity&type='+encodeURIComponent(accountType));};
 return <div className="min-h-screen pt-24 pb-16 bg-slate-50"><div className="mx-auto max-w-3xl px-4"><div className="rounded-3xl bg-white shadow-sm border p-6 md:p-8">
 <div className="flex items-center gap-3"><div className="h-12 w-12 rounded-2xl bg-teal-100 grid place-items-center"><FileSignature className="h-6 w-6 text-teal-700"/></div><div><h1 className="text-2xl font-extrabold">{tr('العقود والتعهدات الإلكترونية','Electronic contracts & declarations')}</h1><p className="text-sm text-slate-500">{tr('يجب إتمام هذه الصفحة قبل إنشاء الحساب.','This step is required before account creation.')}</p></div></div>
 <div className="mt-6 space-y-4 rounded-2xl bg-slate-50 p-5 text-sm leading-7"><h2 className="font-extrabold">{tr('إقرار استخدام SB1','SB1 use declaration')}</h2><p>{tr('أقر بأن البيانات التي أقدمها صحيحة، وأوافق على شروط الاستخدام والخصوصية ومعالجة البيانات وفق القوانين المعمول بها. أفهم أن المحتوى الطبي تثقيفي ولا يغني عن التشخيص أو الطوارئ الطبية.','I confirm that the information I provide is accurate and agree to the terms, privacy policy and lawful data processing. I understand that educational medical content does not replace diagnosis or emergency care.')}</p></div>
 {([['terms','أوافق على شروط الاستخدام','I accept the Terms of Use'],['privacy','أوافق على سياسة الخصوصية ومعالجة البيانات','I accept the Privacy Policy and data processing'],['medical','أوافق على التنبيه الطبي وحدود المسؤولية','I accept the medical disclaimer and scope limitations'],['data','أوافق على حفظ بيانات التسجيل والسجل الإداري للامتثال والأمان','I agree to registration and audit data retention for compliance and security']] as const).map(([k,ar,en])=><label key={k} className="flex items-start gap-3 rounded-xl border p-4 cursor-pointer"><input type="checkbox" className="mt-1 h-5 w-5" checked={checks[k as keyof typeof checks]} onChange={e=>setChecks({...checks,[k]:e.target.checked})}/><span>{tr(ar,en)}</span></label>)}
 <div className="mt-5"><label className="block font-bold mb-2">{tr('التوقيع الإلكتروني — اكتب اسمك كاملاً','Electronic signature — enter your full name')}</label><input className="input-field" value={signature} onChange={e=>setSignature(e.target.value)} placeholder={tr('الاسم الكامل','Full legal name')}/></div>
 <div className="mt-6 flex items-center justify-between gap-3"><button className="text-slate-600 flex items-center gap-2" onClick={()=>navigate('/register')}><ArrowRight className="h-4 w-4"/>{tr('رجوع','Back')}</button><button disabled={!all||saving} onClick={save} className="btn-primary disabled:opacity-40 flex items-center gap-2"><ShieldCheck className="h-5 w-5"/>{saving?tr('جار الحفظ...','Saving...'):tr('حفظ التوقيع والموافقة والمتابعة','Save signature & consent')}</button></div>
 {!all&&<p className="mt-3 text-xs text-amber-700">{tr('يجب تحديد جميع الخانات وكتابة التوقيع.','Select every checkbox and enter the signature.')}</p>}</div></div></div>
}