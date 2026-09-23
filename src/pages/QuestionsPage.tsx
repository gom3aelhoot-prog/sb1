import { useMemo,useState } from 'react';
import { MessageCircle,ChevronLeft } from 'lucide-react';
import { useRouter,parseQuery } from '@/lib/router';
import { useI18n } from '@/lib/i18n';
import { comprehensiveSpecialties } from '@/lib/comprehensiveSpecialties';
import QuestionCard from '@/components/QuestionCard';
import { specialtyCatalog,virtualQuestionsForSpecialty } from '@/lib/catalog';
export default function QuestionsPage(){
 const {path,navigate}=useRouter();const {lang,dir}=useI18n();const q=parseQuery(path);const [selected,setSelected]=useState(q.specialty||'');const [page,setPage]=useState(0);const specs=specialtyCatalog(lang);
 const questions=useMemo(()=>{const generated=selected?virtualQuestionsForSpecialty(selected,lang,50):comprehensiveSpecialties.flatMap(s=>virtualQuestionsForSpecialty(s.slug,lang,50));const local=(JSON.parse(localStorage.getItem('sb1_demo_questions')||'[]') as any[]).filter(q=>(q.language||'ar')===lang&&(!selected||q.specialty?.slug===selected||q.specialty_id===selected));return [...local,...generated];},[selected,lang]);
 const shown=questions.slice(page*30,page*30+30);
 return <div className="min-h-screen pt-24 pb-16 bg-gray-50" dir={dir}><div className="mx-auto max-w-6xl px-4">
  <div className="rounded-3xl bg-gradient-to-br from-teal-700 to-cyan-600 p-7 text-white text-center"><MessageCircle className="mx-auto mb-3 h-9 w-9"/><h1 className="text-3xl font-extrabold">الأسئلة والأجوبة</h1><p className="mt-2">50 سؤالاً تجريبياً لكل تخصص، مع 5 إلى 20 إجابة افتراضية داخل صفحة السؤال.</p></div>
  <div className="mt-5 rounded-2xl bg-white border p-5"><div className="flex flex-wrap gap-3 items-center"><select value={selected} onChange={e=>{setSelected(e.target.value);setPage(0)}} className="flex-1 min-w-[260px] rounded-xl border px-4 py-3"><option value="">كل التخصصات</option>{specs.map(s=><option key={s.slug} value={s.slug}>{s.name}</option>)}</select><button onClick={()=>navigate('/ask'+(selected?'?specialty='+selected:''))} className="rounded-xl bg-teal-600 text-white px-5 py-3 font-bold">اكتب سؤالك</button></div></div>
  <div className="mt-6 grid gap-5 md:grid-cols-2">{shown.map(q=><QuestionCard key={q.id} question={q}/>)}</div>
  <div className="mt-8 flex items-center justify-center gap-3"><button disabled={page===0} onClick={()=>setPage(p=>p-1)} className="rounded-xl bg-white border px-4 py-2 disabled:opacity-40">السابق</button><span className="text-sm text-gray-500">صفحة {page+1}</span><button disabled={(page+1)*30>=questions.length} onClick={()=>setPage(p=>p+1)} className="rounded-xl bg-white border px-4 py-2 disabled:opacity-40">التالي</button></div>
  <div className="mt-8 rounded-2xl bg-white border p-5 text-sm text-gray-500 flex gap-2"><ChevronLeft className="h-4 w-4 text-teal-600"/> افتح أي سؤال لقراءة جميع الإجابات التجريبية والتفاعل معها.</div>
 </div></div>;
}