import { useEffect, useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { useRouter } from '@/lib/router';
import { useI18n } from '@/lib/i18n';
import { supabase, type Question, type Specialty } from '@/lib/supabase';
import QuestionCard from '@/components/QuestionCard';

export default function QuestionsPage() {
  const { navigate } = useRouter();
  const { t, specialtyName, dir } = useI18n();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSpecialty, setSelectedSpecialty] = useState('');

  useEffect(() => {
    (async () => {
      const { data: specs } = await supabase.from('specialties').select('*').order('name');
      setSpecialties(specs || []);
    })();
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      let dbQuery = supabase.from('questions').select('*, specialty(*), answers(*)');
      if (selectedSpecialty) {
        const { data: spec } = await supabase
          .from('specialties')
          .select('id')
          .eq('slug', selectedSpecialty)
          .maybeSingle();
        if (spec) dbQuery = dbQuery.eq('specialty_id', spec.id);
      }
      const { data } = await dbQuery.order('created_at', { ascending: false });
      setQuestions(data || []);
      setLoading(false);
    })();
  }, [selectedSpecialty]);

  return (
    <div className="min-h-screen pt-24 pb-16" dir={dir}>
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 rounded-3xl border border-gray-100 bg-gradient-to-br from-teal-50 via-white to-white p-7 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-100">
            <MessageCircle className="h-7 w-7 text-teal-600" />
          </div>
          <h1 className="mb-2 text-3xl font-bold text-gray-800">{t('questions.title')}</h1>
          <p className="text-gray-500">{t('questions.subtitle')}</p>
        </div>

        <div className="card mb-8 p-6 bg-gradient-to-l from-teal-50 to-white">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="mb-1 font-bold text-gray-800">{t('questions.have_question')}</h3>
              <p className="text-sm text-gray-500">{t('questions.ask_doctor')}</p>
            </div>
            <button onClick={() => navigate('/ask')} className="btn-primary flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              {t('hero.ask_now')}
            </button>
          </div>
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedSpecialty('')}
            className={`badge transition-all ${
              !selectedSpecialty ? 'bg-teal-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {t('common.all')}
          </button>
          {specialties.map((spec) => (
            <button
              key={spec.id}
              onClick={() => setSelectedSpecialty(spec.slug)}
              className={`badge transition-all ${
                selectedSpecialty === spec.slug ? 'bg-teal-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {specialtyName(spec)}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="card p-5 animate-pulse">
                <div className="mb-3 h-5 w-3/4 rounded bg-gray-100" />
                <div className="mb-2 h-4 w-full rounded bg-gray-100" />
                <div className="h-4 w-1/2 rounded bg-gray-100" />
              </div>
            ))}
          </div>
        ) : questions.length === 0 ? (
          <div className="card py-20 text-center">
            <MessageCircle className="mx-auto mb-4 h-16 w-16 text-gray-200" />
            <p className="text-lg text-gray-400">{t('questions.no_questions')}</p>
            <button onClick={() => navigate('/ask')} className="btn-primary mt-4">
              {t('questions.be_first')}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {questions.map((q) => <QuestionCard key={q.id} question={q} />)}
          </div>
        )}
      </div>
    </div>
  );
}
