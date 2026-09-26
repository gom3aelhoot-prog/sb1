import { useEffect, useMemo, useState } from 'react';
import { MessageSquare, Send, Clock3, CheckCircle2, XCircle, UserRound, ShieldCheck, Star, RefreshCw } from 'lucide-react';
import { useRouter, parseQuery } from '@/lib/router';
import { useI18n } from '@/lib/i18n';
import { supabase } from '@/lib/supabase';
import { specialtyCatalog, virtualDoctorsForSpecialty } from '@/lib/catalog';

type Msg={sender:'patient'|'doctor';body:string;time:string};
type Status='pending'|'active'|'ended'|'rejected'|'closed';
type Session={id:string;title:string;specialty:string;specialtySlug:string;doctor:any|null;doctorId:string|null;patient:string;created_at:string;status:Status;messages:Msg[];messageCount:number;maxMessages:number;closeReason?:string;changeReason?:string;review?:{rating:number;body:string};};

const labels:any={
 ar:{title:'الجلسة المجانية',sub:'استشارة نصية مجانية مع أخصائي. لا تبدأ الجلسة إلا بعد قبول الأخصائي للطلب.',name:'اسم المريض',age:'العمر',specialty:'التخصص',choose:'اختر التخصص',doctor:'الأخصائي',all:'كل الأخصائيين',specific:'أخصائي محدد',sendRequest:'إرسال طلب الجلسة',pending:'بانتظار قبول الأخصائي',accepted:'تم قبول الجلسة',messages:'رسائل',message:'اكتب رسالتك...',send:'إرسال',rules:'شروط الجلسة المجانية',close:'إغلاق الجلسة',closeReason:'سبب إغلاق الجلسة',change:'طلب تغيير الأخصائي',changeReason:'سبب تغيير الأخصائي',review:'تقييم الأخصائي',reviewText:'اكتب مراجعتك',submitReview:'إرسال المراجعة',requiredReview:'يجب كتابة مراجعة الجلسة السابقة قبل طلب جلسة مجانية جديدة.',ageRule:'يجب أن يكون العمر 18 سنة أو أكثر.',textOnly:'الجلسة المجانية 20 رسالة نصية فقط، ولا تتضمن فيديو أو صوتاً.',noPolitics:'يمنع الحديث في السياسة أو الدين داخل الجلسة.',noContacts:'يمنع نشر أرقام الهاتف أو البريد أو الروابط الخارجية.',noSex:'يمنع الكلام أو المحتوى الجنسي.',respect:'يجب احترام الأخصائي وعدم الإساءة أو التهديد.',medical:'الجلسة لا تغني عن الطوارئ أو الفحص الطبي المباشر.',acceptRules:'أقر أنني قرأت الشروط وأوافق عليها',previous:'جلساتي',open:'فتح',waiting:'انتظار قبول الأخصائي',closed:'مغلقة',reasonRequired:'اكتب السبب أولاً.',reviewRequired:'أرسل المراجعة أولاً.',chooseDoctor:'يمكنك اختيار أخصائي محدد أو كل الأخصائيين.',changeSent:'تم إرسال طلب تغيير الأخصائي.',closeSent:'تم إغلاق الجلسة.',demo:'بيانات تجريبية للتوضيح فقط'}, 
 en:{title:'Free Text Session',sub:'Free text consultation. The session opens only after the specialist accepts the request.',name:'Patient name',age:'Age',specialty:'Specialty',choose:'Choose specialty',doctor:'Specialist',all:'All specialists',specific:'Specific specialist',sendRequest:'Send session request',pending:'Waiting for specialist acceptance',accepted:'Session accepted',messages:'messages',message:'Write your message...',send:'Send',rules:'Free session rules',close:'Close session',closeReason:'Reason for closing',change:'Request specialist change',changeReason:'Reason for change',review:'Rate specialist',reviewText:'Write your review',submitReview:'Submit review',requiredReview:'You must review the previous free session before requesting another.',ageRule:'You must be 18 or older.',textOnly:'The free session is 20 text messages only. No video or audio.',noPolitics:'Politics and religious discussion are not allowed.',noContacts:'Phone numbers, email addresses and external links are not allowed.',noSex:'Sexual content or sexual discussion is not allowed.',respect:'Respect the specialist. Abuse and threats are prohibited.',medical:'This session does not replace emergency or in-person medical care.',acceptRules:'I confirm that I read and accept the rules',previous:'My sessions',open:'Open',waiting:'Waiting for acceptance',closed:'Closed',reasonRequired:'Enter a reason first.',reviewRequired:'Submit the review first.',chooseDoctor:'Choose one specialist or all specialists.',changeSent:'Specialist change request sent.',closeSent:'Session closed.',demo:'Demo data only'}, 
 ru:{title:'Бесплатная текстовая сессия',sub:'Бесплатная текстовая консультация. Сессия открывается только после принятия заявки специалистом.',name:'Имя пациента',age:'Возраст',specialty:'Специальность',choose:'Выберите специальность',doctor:'Специалист',all:'Все специалисты',specific:'Конкретный специалист',sendRequest:'Отправить заявку',pending:'Ожидание принятия специалистом',accepted:'Сессия принята',messages:'сообщений',message:'Введите сообщение...',send:'Отправить',rules:'Правила бесплатной сессии',close:'Закрыть сессию',closeReason:'Причина закрытия',change:'Запросить смену специалиста',changeReason:'Причина смены',review:'Оценить специалиста',reviewText:'Напишите отзыв',submitReview:'Отправить отзыв',requiredReview:'Сначала оставьте отзыв о предыдущей бесплатной сессии.',ageRule:'Возраст должен быть 18 лет или старше.',textOnly:'Бесплатная сессия — только 20 текстовых сообщений. Видео и аудио недоступны.',noPolitics:'Политика и религиозные дискуссии запрещены.',noContacts:'Телефоны, email и внешние ссылки запрещены.',noSex:'Сексуальный контент и разговоры запрещены.',respect:'Уважайте специалиста. Оскорбления и угрозы запрещены.',medical:'Сессия не заменяет экстренную или очную медицинскую помощь.',acceptRules:'Я прочитал и принимаю правила',previous:'Мои сессии',open:'Открыть',waiting:'Ожидание принятия',closed:'Закрыта',reasonRequired:'Сначала укажите причину.',reviewRequired:'Сначала отправьте отзыв.',chooseDoctor:'Выберите конкретного специалиста или всех.',changeSent:'Запрос на смену специалиста отправлен.',closeSent:'Сессия закрыта.',demo:'Только демонстрационные данные'}
};
function storageGet<T>(key:string,fallback:T):T{try{return JSON.parse(localStorage.getItem(key)||'null')??fallback}catch{return fallback}}
function storageSet(key:string,value:any){localStorage.setItem(key,JSON.stringify(value));window.dispatchEvent(new Event('sb1-session-change'))}

export default function SessionsPage(){
 const {path}=useRouter(); const {lang,dir}=useI18n(); const q=parseQuery(path); const c=labels[lang]||labels.en;
 const [name,setName]=useState(''); const [age,setAge]=useState(''); const [specialty,setSpecialty]=useState(q.specialty||''); const [doctorId,setDoctorId]=useState('all'); const [agree,setAgree]=useState(false);
 const [sessions,setSessions]=useState<Session[]>([]); const [active,setActive]=useState<Session|null>(null); const [message,setMessage]=useState(''); const [reason,setReason]=useState(''); const [reviewOpen,setReviewOpen]=useState(false); const [rating,setRating]=useState(5); const [review,setReview]=useState('');
 const specs=useMemo(()=>specialtyCatalog(lang),[lang]); const doctors=useMemo(()=>specialty?virtualDoctorsForSpecialty(specialty,lang,25):[],[specialty,lang]);
 const reviewRequired=storageGet<boolean>('sb1_free_review_required',false);
 useEffect(()=>{const load=()=>setSessions(storageGet<Session[]>('sb1_free_sessions',[]));load();window.addEventListener('sb1-session-change',load);return()=>window.removeEventListener('sb1-session-change',load)},[]);
 useEffect(()=>{if(q.specialty)setSpecialty(q.specialty)},[q.specialty]);

 const rules=[c.ageRule,c.textOnly,c.noPolitics,c.noContacts,c.noSex,c.respect,c.medical];
 const persist=(all:Session[])=>{setSessions(all);storageSet('sb1_free_sessions',all)};
 const start=async(e:React.FormEvent)=>{
   e.preventDefault();
   if(reviewRequired){alert(c.requiredReview);return}
   if(!name.trim()||Number(age)<18||!specialty||!agree)return;
   const sp=specs.find(x=>x.slug===specialty); const d=doctorId!=='all'?doctors.find(x=>x.id===doctorId):null;
   const s:Session={id:'free-'+Date.now(),title:'SB1 Free Text Session',specialty:sp?.name||specialty,specialtySlug:specialty,doctor:d||null,doctorId:d?.id||null,patient:name.trim(),created_at:new Date().toISOString(),status:'pending',messages:[],messageCount:0,maxMessages:20};
   persist([s,...sessions]); setActive(s); setReason('');
   try{await supabase.from('free_text_sessions').insert({id:s.id,patient_name:s.patient,patient_age:Number(age),specialty_id:sp?.id||null,requested_doctor_id:d?.id||null,status:'pending',max_messages:20})}catch{}
 };
 const update=(next:Session)=>{const all=sessions.map(x=>x.id===next.id?next:x);persist(all);setActive(next)};
 const send=async()=>{
   if(!active||active.status!=='active'||!message.trim()||active.messageCount>=20)return;
   const m:Msg={sender:'patient',body:message.trim(),time:new Date().toLocaleTimeString()};
   const next={...active,messages:[...active.messages,m],messageCount:active.messageCount+1}; update(next);setMessage('');
   try{await supabase.from('free_text_session_messages').insert({session_id:active.id,sender_type:'patient',body:m.body,message_number:next.messageCount})}catch{}
 };
 const close=async()=>{
   if(!active||!reason.trim()){alert(c.reasonRequired);return}
   const next={...active,status:'closed' as Status,closeReason:reason.trim()};update(next);storageSet('sb1_free_review_required',true);setReason('');
   try{await supabase.from('free_text_sessions').update({status:'closed',close_reason:next.closeReason}).eq('id',active.id)}catch{}
 };
 const changeDoctor=async()=>{
   if(!active||!reason.trim()){alert(c.reasonRequired);return}
   const next={...active,changeReason:reason.trim()};update(next);setReason('');
   try{await supabase.from('free_text_session_change_requests').insert({session_id:active.id,reason:next.changeReason,status:'pending'})}catch{}
   alert(c.changeSent);
 };
 const submitReview=async()=>{
   if(!active||!review.trim()){alert(c.reviewRequired);return}
   const next={...active,review:{rating,body:review.trim()}};update(next);storageSet('sb1_free_review_required',false);setReviewOpen(false);setReview('');
   try{await supabase.from('free_text_session_reviews').insert({session_id:active.id,rating,body:review.trim()})}catch{}
 };
 if(active)return <div dir={dir} className="min-h-screen bg-gray-50 pt-24 pb-16"><div className="mx-auto max-w-4xl px-4">
  <button onClick={()=>setActive(null)} className="mb-4 text-gray-500">← {c.previous}</button>
  <div className="rounded-3xl bg-white border overflow-hidden">
   <div className="bg-teal-700 text-white p-5 flex items-center justify-between gap-4"><div><h1 className="text-xl font-extrabold">{active.doctor?.name||c.all}</h1><p className="text-sm text-teal-100">{active.specialty}</p></div><span className="rounded-full bg-white/15 px-3 py-1 text-sm">{active.messageCount}/20</span></div>
   {active.status==='pending'&&<div className="p-8 text-center"><Clock3 className="mx-auto h-12 w-12 text-amber-500"/><h2 className="mt-3 text-xl font-bold">{c.pending}</h2><p className="mt-2 text-gray-500">{c.chooseDoctor}</p></div>}
   {active.status==='active'&&<><div className="p-5 space-y-3 min-h-[420px] bg-gray-50">{active.messages.map((m,i)=><div key={i} className={'flex '+(m.sender==='patient'?'justify-start':'justify-end')}><div className={'max-w-[82%] rounded-2xl px-4 py-3 '+(m.sender==='patient'?'bg-white border':'bg-teal-600 text-white')}><p>{m.body}</p><small className="opacity-60">{m.time}</small></div></div>)}{active.messageCount>=20&&<div className="rounded-xl bg-amber-50 p-3 text-center text-amber-800">20/20</div>}</div><div className="border-t p-3 flex gap-2"><input disabled={active.messageCount>=20} value={message} onChange={e=>setMessage(e.target.value)} placeholder={c.message} className="input-field flex-1"/><button disabled={active.messageCount>=20} onClick={send} className="btn-primary"><Send className="h-4 w-4"/></button></div></>}
   {active.status==='closed'&&<div className="p-8 text-center"><CheckCircle2 className="mx-auto h-12 w-12 text-teal-600"/><h2 className="mt-3 text-xl font-bold">{c.closed}</h2><p className="mt-2 text-gray-500">{active.closeReason}</p>{!active.review&&<button onClick={()=>setReviewOpen(true)} className="mt-5 btn-primary">{c.review}</button>}</div>}
   {active.status==='rejected'&&<div className="p-8 text-center"><XCircle className="mx-auto h-12 w-12 text-red-500"/><h2 className="mt-3 text-xl font-bold">تم رفض الطلب</h2></div>}
   {active.status==='active'&&<div className="border-t p-4 grid sm:grid-cols-2 gap-3"><div><textarea value={reason} onChange={e=>setReason(e.target.value)} placeholder={c.closeReason} className="input-field w-full min-h-24"/></div><div className="space-y-2"><button onClick={close} className="w-full rounded-xl bg-red-50 text-red-700 px-4 py-3 font-bold">{c.close}</button><button onClick={changeDoctor} className="w-full rounded-xl bg-indigo-50 text-indigo-700 px-4 py-3 font-bold">{c.change}</button></div></div>}
  </div>
  {reviewOpen&&<div className="mt-4 rounded-2xl bg-white border p-5"><h3 className="font-extrabold">{c.review}</h3><div className="flex gap-2 my-3">{[1,2,3,4,5].map(n=><button key={n} onClick={()=>setRating(n)} className={n<=rating?'text-yellow-500':'text-gray-300'}><Star fill="currentColor"/></button>)}</div><textarea value={review} onChange={e=>setReview(e.target.value)} placeholder={c.reviewText} className="input-field w-full min-h-28"/><button onClick={submitReview} className="mt-3 btn-primary">{c.submitReview}</button></div>}
 </div></div>;
 return <div dir={dir} className="min-h-screen bg-gray-50 pt-24 pb-16"><div className="mx-auto max-w-6xl px-4">
  <div className="rounded-3xl bg-gradient-to-br from-teal-700 to-cyan-600 p-8 text-white"><div className="flex items-center gap-3"><MessageSquare className="h-9 w-9"/><div><h1 className="text-3xl font-extrabold">{c.title}</h1><p className="mt-2">{c.sub}</p></div></div></div>
  {reviewRequired&&<div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-900 font-semibold">{c.requiredReview}</div>}
  <div className="mt-6 grid lg:grid-cols-[390px_1fr] gap-6">
   <form onSubmit={start} className="rounded-2xl bg-white border p-5 space-y-3 h-fit">
    <input required value={name} onChange={e=>setName(e.target.value)} placeholder={c.name} className="input-field w-full"/>
    <input required min="18" type="number" value={age} onChange={e=>setAge(e.target.value)} placeholder={c.age} className="input-field w-full"/>
    <select required value={specialty} onChange={e=>{setSpecialty(e.target.value);setDoctorId('all')}} className="input-field w-full"><option value="">{c.choose}</option>{specs.map(s=><option key={s.slug} value={s.slug}>{s.name}</option>)}</select>
    <select value={doctorId} onChange={e=>setDoctorId(e.target.value)} disabled={!specialty} className="input-field w-full"><option value="all">{c.all}</option>{doctors.map(d=><option key={d.id} value={d.id}>{d.name}</option>)}</select>
    <div className="rounded-2xl bg-gray-50 p-4"><div className="font-bold mb-2 flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-teal-600"/>{c.rules}</div><ul className="space-y-1 text-sm text-gray-600">{rules.map((x:string)=><li key={x}>• {x}</li>)}</ul></div>
    <label className="flex gap-2 items-start text-sm"><input type="checkbox" checked={agree} onChange={e=>setAgree(e.target.checked)} className="mt-1"/><span>{c.acceptRules}</span></label>
    <button disabled={reviewRequired} className="btn-primary w-full">{c.sendRequest}</button>
    <p className="text-xs text-gray-400">{c.demo}</p>
   </form>
   <div><h2 className="text-xl font-extrabold mb-3">{c.previous}</h2>{sessions.length===0?<div className="rounded-2xl bg-white border p-8 text-center text-gray-500">لا توجد جلسات بعد</div>:<div className="space-y-3">{sessions.map(s=><div key={s.id} className="rounded-2xl bg-white border p-4 flex items-center gap-4"><div className="h-11 w-11 rounded-full bg-teal-50 grid place-items-center"><UserRound className="text-teal-700"/></div><div className="flex-1 min-w-0"><b className="block truncate">{s.doctor?.name||c.all}</b><span className="text-xs text-gray-500">{s.specialty} · {s.messageCount}/20</span></div><span className="text-xs rounded-full bg-gray-100 px-3 py-1">{s.status==='pending'?c.waiting:s.status}</span><button onClick={()=>setActive(s)} className="rounded-xl bg-gray-50 px-3 py-2 text-sm font-bold">{c.open}</button></div>)}</div>}</div>
  </div>
 </div></div>;
}