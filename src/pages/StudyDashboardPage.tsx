import { useI18n } from '@/lib/i18n';
import { useRouter } from '@/lib/router';
import { BookOpen, CheckCircle2, Clock3, FileQuestion, GraduationCap, MessageCircle, PlayCircle, Trophy } from 'lucide-react';
import { pt } from '@/lib/portalText';

export default function StudyDashboardPage() {
  const { lang } = useI18n();
  const { navigate } = useRouter();
  const title = pt(lang, { ar: 'لوحة تعلم SB1', ru: 'Учебная панель SB1', en: 'SB1 Study Dashboard', de: 'SB1 Lernbereich' });
  const subtitle = pt(lang, { ar: 'كل دراستك ومتابعتك في مكان واحد', ru: 'Всё обучение и прогресс в одном месте', en: 'All your learning and progress in one place', de: 'Lernen und Fortschritt an einem Ort' });
  const cards = [
    { icon: BookOpen, title: pt(lang, { ar: 'كورساتي', ru: 'Мои курсы', en: 'My Courses', de: 'Meine Kurse' }), value: '6', action: '/academy' },
    { icon: PlayCircle, title: pt(lang, { ar: 'دروس مكتملة', ru: 'Завершённые уроки', en: 'Lessons Completed', de: 'Abgeschlossene Lektionen' }), value: '42', action: '/courses' },
    { icon: FileQuestion, title: pt(lang, { ar: 'الاختبارات', ru: 'Экзамены', en: 'Practice Exams', de: 'Übungsprüfungen' }), value: '8', action: '/exams' },
    { icon: Trophy, title: pt(lang, { ar: 'النقاط', ru: 'Баллы', en: 'Points', de: 'Punkte' }), value: '1,280', action: '/profile' },
  ];
  const courses = [
    { name: pt(lang, { ar: 'أساسيات تحليل السلوك التطبيقي', ru: 'Основы прикладного анализа поведения', en: 'ABA Foundations', de: 'ABA Grundlagen' }), progress: 72, meta: '18/25' },
    { name: pt(lang, { ar: 'علم النفس العصبي التطبيقي', ru: 'Прикладная нейропсихология', en: 'Applied Neuropsychology', de: 'Angewandte Neuropsychologie' }), progress: 48, meta: '12/25' },
    { name: pt(lang, { ar: 'مبادئ العلاج السلوكي المعرفي', ru: 'Основы когнитивно-поведенческой терапии', en: 'CBT Foundations', de: 'CBT Grundlagen' }), progress: 24, meta: '6/25' },
  ];
  return (
    <section className="min-h-screen bg-gray-50 py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div><div className="mb-2 inline-flex items-center gap-2 rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-700"><GraduationCap className="h-4 w-4" /> SB1 ACADEMY</div><h1 className="text-4xl font-extrabold text-gray-900">{title}</h1><p className="mt-2 text-gray-500">{subtitle}</p></div>
          <button onClick={() => navigate('/chat')} className="btn-primary inline-flex items-center gap-2"><MessageCircle className="h-4 w-4" />{pt(lang, { ar: 'مجتمع الطلاب', ru: 'Сообщество студентов', en: 'Student Community', de: 'Studenten-Community' })}</button>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map(({ icon: Icon, title: label, value, action }) => <button key={label} onClick={() => navigate(action)} className="card card-hover p-6 text-start"><Icon className="mb-4 h-6 w-6 text-primary-600" /><div className="text-3xl font-extrabold text-gray-900">{value}</div><div className="mt-1 text-sm text-gray-500">{label}</div></button>)}
        </div>
        <div className="mt-10 grid gap-6 lg:grid-cols-[1.3fr_.7fr]">
          <div className="card p-6"><div className="mb-6 flex items-center justify-between"><h2 className="text-xl font-bold">{pt(lang, { ar: 'متابعة التعلم', ru: 'Прогресс обучения', en: 'Learning Progress', de: 'Lernfortschritt' })}</h2><Clock3 className="h-5 w-5 text-primary-500" /></div><div className="space-y-6">{courses.map(c => <div key={c.name}><div className="mb-2 flex justify-between gap-3 text-sm"><span className="font-semibold text-gray-800">{c.name}</span><span className="text-gray-400">{c.meta}</span></div><div className="h-3 overflow-hidden rounded-full bg-gray-100"><div className="h-full rounded-full bg-primary-600" style={{ width: `${c.progress}%` }} /></div><div className="mt-1 text-xs text-gray-400">{c.progress}%</div></div>)}</div></div>
          <div className="card p-6"><h2 className="text-xl font-bold">{pt(lang, { ar: 'الإنجازات', ru: 'Достижения', en: 'Achievements', de: 'Erfolge' })}</h2><div className="mt-5 space-y-3">{['7 days streak', 'First exam passed', '10 lessons watched', 'Community helper'].map(x => <div key={x} className="flex items-center gap-3 rounded-xl bg-gray-50 p-3"><CheckCircle2 className="h-5 w-5 text-green-600" /><span className="text-sm font-medium text-gray-700">{x}</span></div>)}</div></div>
        </div>
      </div>
    </section>
  );
}
