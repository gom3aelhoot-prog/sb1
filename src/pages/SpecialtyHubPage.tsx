import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, BookOpen, MessageCircle, Stethoscope, Users, Video } from 'lucide-react';
import { useRouter, getPathOnly } from '@/lib/router';
import { useI18n } from '@/lib/i18n';
import { comprehensiveSpecialties } from '@/lib/comprehensiveSpecialties';
import { demoDoctors, demoQuestions } from '@/lib/demoData';
import { virtualDoctorsForSpecialty, virtualQuestionsForSpecialty } from '@/lib/catalog';
import { supabase } from '@/lib/supabase';
import DoctorCard from '@/components/DoctorCard';
import QuestionCard from '@/components/QuestionCard';

const groups = [
  { key: 'children', title: 'الأطفال وصحة الطفل', match: ['child','pediatric','denver','speech','developmental','adolescent'] },
  { key: 'mental', title: 'الصحة النفسية والسلوكية', match: ['psych','therapy','behavior','mindfulness','emdr','addiction','eating','sleep','stress','grief','family','marriage'] },
  { key: 'heart', title: 'القلب والدورة الدموية', match: ['heart','cardio','vascular'] },
  { key: 'immunity', title: 'المناعة والحساسية والأمراض المعدية', match: ['immun','allergy','infectious'] },
  { key: 'elderly', title: 'كبار السن والشيخوخة', match: ['geriatric','geriatrics','geront'] },
  { key: 'other', title: 'التخصصات الطبية الأخرى', match: [] },
];

export default function SpecialtyHubPage() {
  const { path, navigate } = useRouter();
  const { lang, dir, specialtyName } = useI18n();
  const slug = getPathOnly(path).split('/')[2] || '';
  const specialty = comprehensiveSpecialties.find(s => s.slug === slug);
  const [activeTab, setActiveTab] = useState<'doctors'|'questions'|'library'>('doctors');
  const [loadedDoctors, setLoadedDoctors] = useState<any[]>([]);
  const [loadedQuestions, setLoadedQuestions] = useState<any[]>([]);
  useEffect(() => {
    if (!slug) return;
    (async () => {
      const [{ data: doctors }, { data: questions }] = await Promise.all([
        supabase.from('doctors').select('*, specialty(*)').eq('is_virtual', false),
        supabase.from('questions').select('*, specialty(*), answers(*)').order('created_at', { ascending: false }),
      ]);
      setLoadedDoctors((doctors || []).filter((d:any) => d.specialty?.slug === slug));
      setLoadedQuestions((questions || []).filter((q:any) => q.specialty?.slug === slug));
    })().catch(() => {});
  }, [slug]);

  const title = specialty ? (lang === 'en' ? specialty.en : lang === 'de' ? specialty.de : lang === 'ru' ? specialty.ru : specialty.ar) : 'التخصص';
  const relatedDoctors = useMemo(() => loadedDoctors.length ? loadedDoctors : virtualDoctorsForSpecialty(slug, lang, 8), [loadedDoctors, slug, lang]);
  const relatedQuestions = useMemo(() => loadedQuestions.length ? loadedQuestions : virtualQuestionsForSpecialty(slug, lang, 50), [loadedQuestions, slug, lang]);

  if (!specialty) {
    return <div className="min-h-screen pt-28 pb-16 text-center" dir={dir}><h1 className="text-2xl font-bold">التخصص غير موجود</h1><button onClick={() => navigate('/specialties')} className="btn-primary mt-5">العودة للتخصصات</button></div>;
  }

  return <div className="min-h-screen bg-gray-50 pt-24 pb-16" dir={dir}>
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <button onClick={() => navigate('/specialties')} className="mb-5 flex items-center gap-2 text-sm text-gray-500 hover:text-teal-600"><ArrowLeft className="h-4 w-4" /> العودة للتخصصات</button>
      <section className="rounded-3xl bg-gradient-to-br from-teal-700 to-cyan-600 p-7 text-white shadow-lg">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="mb-2 text-sm text-teal-100">SB1 · {lang === 'ar' ? 'مكتب التخصص' : 'Specialty Hub'}</p>
            <h1 className="text-3xl font-extrabold">{title}</h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-teal-50">صفحة موحدة لهذا التخصص: أطباء وأخصائيون، أسئلة وأجوبة، جلسات فيديو شخصية، مكتبة، ومجتمع متخصص.</p>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <div className="rounded-2xl bg-white/10 p-3 text-center"><Stethoscope className="mx-auto mb-1 h-5 w-5"/><b>{relatedDoctors.length || 0}</b><small className="block text-xs">أطباء</small></div>
            <div className="rounded-2xl bg-white/10 p-3 text-center"><MessageCircle className="mx-auto mb-1 h-5 w-5"/><b>{relatedQuestions.length}</b><small className="block text-xs">أسئلة</small></div>
            <div className="rounded-2xl bg-white/10 p-3 text-center"><Video className="mx-auto mb-1 h-5 w-5"/><b>جلسات</b><small className="block text-xs">فيديو شخصية</small></div>
            <div className="rounded-2xl bg-white/10 p-3 text-center"><Users className="mx-auto mb-1 h-5 w-5"/><b>دردشة</b><small className="block text-xs">للمختصين</small></div>
          </div>
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <button onClick={() => navigate('/ask?specialty='+encodeURIComponent(slug))} className="rounded-xl bg-white px-5 py-3 text-sm font-bold text-teal-700">اسأل عن حالتك</button>
          <button onClick={() => navigate('/sessions?specialty='+encodeURIComponent(slug))} className="rounded-xl bg-white/15 px-5 py-3 text-sm font-bold text-white ring-1 ring-white/30">اطلب جلسة فيديو شخصية</button>
          <button onClick={() => navigate('/questions?specialty='+encodeURIComponent(slug))} className="rounded-xl bg-white/15 px-5 py-3 text-sm font-bold text-white ring-1 ring-white/30">شاهد الأسئلة والأجوبة</button>
        </div>
      </section>

      <div className="mt-6 flex flex-wrap gap-2">
        {[
          ['doctors','الأطباء والأخصائيون'],['questions','الأسئلة والأجوبة'],['library','المكتبة والخدمات']
        ].map(([key,label]) => <button key={key} onClick={() => setActiveTab(key as typeof activeTab)} className={`rounded-xl px-4 py-2 text-sm font-semibold ${activeTab===key?'bg-teal-600 text-white':'bg-white text-gray-600 border border-gray-200'}`}>{label}</button>)}
      </div>

      {activeTab==='doctors' && <section className="mt-6">
        <div className="mb-4 flex items-center justify-between"><h2 className="text-xl font-bold text-gray-800">أطباء هذا التخصص</h2><button onClick={() => navigate('/doctors?specialty='+encodeURIComponent(slug))} className="text-sm font-semibold text-teal-600">عرض الكل</button></div>
        {relatedDoctors.length ? <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">{relatedDoctors.map(d => <DoctorCard key={d.id} doctor={d}/>)}</div> : <div className="rounded-2xl bg-white p-8 text-center text-gray-500">لا توجد ملفات حقيقية محملة حالياً لهذا التخصص. يمكن للمستخدم إرسال سؤال ليصل إلى المختصين الحقيقيين عند توفرهم.</div>}
      </section>}

      {activeTab==='questions' && <section className="mt-6">
        <div className="mb-4 flex items-center justify-between"><h2 className="text-xl font-bold text-gray-800">أسئلة وأجوبة {title}</h2><button onClick={() => navigate('/ask?specialty='+encodeURIComponent(slug))} className="btn-primary">اكتب سؤالك</button></div>
        {relatedQuestions.length ? <div className="grid grid-cols-1 gap-5 md:grid-cols-2">{relatedQuestions.map(q => <QuestionCard key={q.id} question={q}/>)}</div> : <div className="rounded-2xl bg-white p-8 text-center text-gray-500">لا توجد أسئلة منشورة في هذه النسخة التجريبية بعد. ابدأ أول سؤال.</div>}
      </section>}

      {activeTab==='library' && <section className="mt-6 grid gap-5 md:grid-cols-3">
        {['الأخبار الطبية الموثوقة','كتب ودورات مرتبطة بالتخصص','خدمات ومواعيد المختصين'].map((x,i) => <div key={x} className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100"><BookOpen className="mb-3 h-7 w-7 text-teal-600"/><h3 className="font-bold text-gray-800">{x}</h3><p className="mt-2 text-sm text-gray-500">قسم قابل للتحديث من لوحة المالك وربطه بمصادر ومحتوى التخصص.</p><button onClick={() => navigate('/library')} className="mt-4 text-sm font-semibold text-teal-600">فتح المكتبة</button></div>)}
      </section>}
    </div>
  </div>;
}
