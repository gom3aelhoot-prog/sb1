import { useEffect, useMemo, useState } from 'react';
import { MessageSquare, Send, Clock3, CheckCircle2, XCircle, UserRound, ShieldCheck, Star, RefreshCw, Search, SlidersHorizontal } from 'lucide-react';
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
 const [name,setName]=useState(''); const [age,setAge]=useState(''); const [specialty,setSpecialty]=useState(q.specialty||''); const [doctorId,setDoctorId]=useState('all'); const [agree,setAgree]=useState(false); const [tab,setTab]=useState<'mine'|'others'>('mine'); const [publicSearch,setPublicSearch]=useState(''); const [publicSpecialty,setPublicSpecialty]=useState(''); const [publicDoctor,setPublicDoctor]=useState(''); const [publicStatus,setPublicStatus]=useState('all'); const [publicDate,setPublicDate]=useState('all'); const [publicSelected,setPublicSelected]=useState<any>(null);
 const [sessions,setSessions]=useState<Session[]>([]); const [active,setActive]=useState<Session|null>(null); const [message,setMessage]=useState(''); const [reason,setReason]=useState(''); const [reviewOpen,setReviewOpen]=useState(false); const [rating,setRating]=useState(5); const [review,setReview]=useState('');
 const specs=useMemo(()=>specialtyCatalog(lang),[lang]); const doctors=useMemo(()=>specialty?virtualDoctorsForSpecialty(specialty,lang,25):[],[specialty,lang]);
 const reviewRequired=storageGet<boolean>('sb1_free_review_required',false);
 const demoPublicSessions=useMemo(()=>{
   const rows:any[]=[];
   const templates:any=({
     ar:[['صداع متكرر في المساء','أعاني من صداع متكرر منذ أسبوعين، هل يمكن أن يكون مرتبطاً بالنوم؟'],['ألم الركبة بعد المشي','أشعر بألم في الركبة بعد المشي وصعود الدرج، ما الخطوات الأولى؟'],['قلق وصعوبة في النوم','أشعر بقلق متكرر وصعوبة في النوم وأحتاج توجيهاً عاماً.']],
     en:[['Recurring evening headaches','I have recurring headaches for two weeks. Could sleep be related?'],['Knee pain after walking','I have knee pain after walking and stairs. What are the first steps?'],['Anxiety and poor sleep','I have recurring anxiety and trouble sleeping and need general guidance.']],
     ru:[['Повторяющаяся головная боль','У меня повторяются головные боли уже две недели. Может ли это быть связано со сном?'],['Боль в колене после ходьбы','У меня болит колено после ходьбы и лестницы. Что делать в первую очередь?'],['Тревога и плохой сон','У меня тревога и проблемы со сном. Нужны общие рекомендации.']]
   }[lang]||[['Medical question','I have a health question and need general guidance.'],['Follow-up','I would like general follow-up guidance about my symptoms.'],['Sleep and stress','I have sleep and stress concerns and need general guidance.']]);
   specs.forEach((sp:any,si:number)=>{
     for(let i=0;i<4;i++){
       const d=virtualDoctorsForSpecialty(sp.slug,lang,8)[i%8];
       const t=templates[(si+i)%templates.length];
       rows.push({
         id:`public-session-${lang}-${si}-${i}`,title:t[0],body:t[1],specialty:sp.name,specialtySlug:sp.slug,doctor:d,
         patient:['أحمد','سارة','محمد','ليلى'][i],status:i%4===0?'active':i%4===1?'closed':'ended',
         created_at:new Date(Date.now()-(si*2+i)*86400000).toISOString(),
         messages:[
           {sender:'patient',body:t[1],time:'10:05'},
           {sender:'doctor',body:lang==='ar'?'شكراً لوصف الأعراض. هذه إجابة تجريبية تعليمية وليست تشخيصاً.':lang==='ru'?'Спасибо за описание симптомов. Это демонстрационный ответ, а не диагноз.':'Thank you for describing the symptoms. This is a demo educational response, not a diagnosis.',time:'10:22'},
           {sender:'patient',body:lang==='ar'?'هل توجد خطوات بسيطة يمكنني اتباعها؟':lang==='ru'?'Есть ли простые шаги, которые я могу предпринять?':'Are there simple steps I can take?',time:'10:30'},
           {sender:'doctor',body:lang==='ar'?'راقب الأعراض وسجّل توقيتها، واطلب تقييماً مباشراً إذا استمرت أو ساءت.':lang==='ru'?'Наблюдайте симптомы и их время; обратитесь на очную оценку, если они сохраняются или усиливаются.':'Track the symptoms and timing, and seek an in-person assessment if they persist or worsen.',time:'10:41'}
         ]
       });
     }
   });
   return rows;
 },[lang,specs]);
}