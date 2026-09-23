import { useMemo } from 'react';
import { ArrowRight,MessageCircle,Eye,User,ThumbsUp } from 'lucide-react';
import { useRouter } from '@/lib/router';
import { useI18n } from '@/lib/i18n';
import { comprehensiveSpecialties } from '@/lib/comprehensiveSpecialties';
import { virtualQuestionsForSpecialty,virtualAnswersForQuestion } from '@/lib/catalog';
import { supabase } from '@/lib/supabase';
import { useEffect,useState } from 'react';
export default function QuestionDetailPage({id}:{id:string}){
 const {navigate}=useRouter();const {lang,dir}=useI18n(); const labels:any={ar:{back:'{labels.back}',answers:'{labels.answers}',notfound:'{labels.notfound}'},en:{back:'Back to questions',answers:'demo answers',notfound:'Question not found in this language.'},ru:{back:'Назад к вопросам',answers:'демонстрационных ответов',notfound:'Вопрос не найден на этом языке.'},de:{back:'Zurück zu den Fragen',answers:'Demo-Antworten',notfound:'Frage in dieser Sprache nicht gefunden.'}}[lang]||{back:'Back to questions',answers:'demo answers',notfound:'Question not found.'};
 const match=id.match(/^catalog-q-([^-]+)-(.+)-(\d+)$/);const slug=match?.[2]||comprehensiveSpecialties[0].slug;
 const questions=virtualQuestionsForSpecialty(slug,lang,50);const [dbQuestion,setDbQuestion]=useState<any>(null);const [dbAnswers,setDbAnswers]=useState<any[]>([]);useEffect(()=>{supabase.from('questions').select('*, specialty(*), answers(*, doctor(*))').eq('id',id).maybeSingle().then(({data})=>{if(data){const tr=data.translations?.[lang]||{};setDbQuestion({...data,title:tr.title||data.title,body:tr.body||data.body});setDbAnswers(data.answers||[])}}).catch(()=>{})},[id,lang]);const localQuestions=(JSON.parse(localStorage.getItem('sb1_demo_questions')||'[]') as any[]);const question=questions.find(q=>q.id===id)||localQuestions.find(q=>q.id===id&&(!q.language||q.language===lang))||null;
 const answers=useMemo(()=>dbAnswers.length?dbAnswers:(question?virtualAnswersForQuestion(question,lang,20):[]),[question,lang,dbAnswers]);
 if(!question)return <div className="min-h-screen pt-28 text-center" dir={dir}><p className="text-gray-500">السؤال غير موجود في هذه اللغة.</p><button onClick={()=>navigate('/questions')} className="mt-4 rounded-xl bg-teal-600 text-white px-5 py-3">العودة للأسئلة</button></div>;
 return <div className="min-h-screen bg-gray-50 pt-24 pb-16" dir={dir}><div className="mx-auto max-w-3xl px-4">
  <button onClick={()=>navigate('/questions')} className="mb-5 flex items-center gap-2 text-sm text-gray-500"><ArrowRight className="h-4 w-4"/>العودة للأسئلة</button>
  <div className="rounded-2xl bg-white border p-7"><span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-bold text-teal-700">{question.specialty?.name}</span><h1 className="mt-4 text-2xl font-extrabold text-gray-900">{question.title}</h1><p className="mt-4 leading-8 text-gray-600">{question.body}</p><div className="mt-5 flex gap-4 text-xs text-gray-400"><span>{question.author_name}</span><span><Eye className="inline h-4 w-4"/> {question.views}</span></div></div>
  <h2 className="mt-8 mb-4 text-xl font-extrabold flex items-center gap-2"><MessageCircle className="text-teal-600"/> {answers.length} إجابات تجريبية</h2>
  <div className="space-y-4">{answers.map(a=><div key={a.id} className="rounded-2xl bg-white border p-6"><div className="flex items-start gap-3"><div className="h-11 w-11 rounded-xl bg-teal-50 flex items-center justify-center"><User className="text-teal-600"/></div><div><b>{a.doctor?.name}</b><p className="mt-3 leading-7 text-gray-600">{a.body}</p><span className="mt-3 inline-flex items-center gap-1 text-xs text-gray-400"><ThumbsUp className="h-3.5 w-3.5"/>{a.helpful_count}</span></div></div></div>)}</div>
 </div></div>;
}