import { useEffect, useState } from 'react';
import { FileText } from 'lucide-react';
import { useRouter } from '@/lib/router';
import { useI18n } from '@/lib/i18n';
import { supabase, type Article, type Specialty } from '@/lib/supabase';
import ArticleCard from '@/components/ArticleCard';
import { demoArticles, demoSpecialties } from '@/lib/demoData';

export default function ArticlesPage() {
  const { specialtyName, t, dir } = useI18n();
  const { navigate } = useRouter();
  const [articles, setArticles] = useState<Article[]>([]);
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSpecialty, setSelectedSpecialty] = useState('');

  useEffect(() => {
    (async () => {
      const { data: specs } = await supabase.from('specialties').select('*').order('name');
      setSpecialties((specs && specs.length ? specs : demoSpecialties) as Specialty[]);
    })();
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      let dbQuery = supabase.from('articles').select('*, specialty(*), doctor(*)');
      if (selectedSpecialty) {
        const { data: spec } = await supabase
          .from('specialties')
          .select('id')
          .eq('slug', selectedSpecialty)
          .maybeSingle();
        if (spec) dbQuery = dbQuery.eq('specialty_id', spec.id);
      }
      const { data } = await dbQuery.order('created_at', { ascending: false });
      setArticles((data && data.length ? data : demoArticles) as Article[]);
      setLoading(false);
    })().catch(() => { setArticles(demoArticles); setLoading(false); });
  }, [selectedSpecialty]);

  return (
    <div className="min-h-screen pt-24 pb-16" dir={dir}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 rounded-3xl border border-gray-100 bg-gradient-to-br from-teal-50 via-white to-white p-7 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-100">
            <FileText className="h-7 w-7 text-teal-600" />
          </div>
          <h1 className="mb-2 text-3xl font-bold text-gray-800">{t('articles.title')}</h1>
          <p className="text-gray-500">{t('articles.subtitle')}</p>
        </div>

        <div className="mb-8 flex flex-wrap justify-center gap-2">
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
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="card overflow-hidden animate-pulse">
                <div className="h-48 bg-gray-100" />
                <div className="p-5">
                  <div className="mb-3 h-5 w-3/4 rounded bg-gray-100" />
                  <div className="mb-2 h-4 w-full rounded bg-gray-100" />
                  <div className="h-4 w-1/2 rounded bg-gray-100" />
                </div>
              </div>
            ))}
          </div>
        ) : articles.length === 0 ? (
          <div className="card py-20 text-center">
            <FileText className="mx-auto mb-4 h-16 w-16 text-gray-200" />
            <p className="text-lg text-gray-400">{t('articles.no_articles')}</p>
            <button onClick={() => navigate('/ask')} className="btn-primary mt-4">{t('hero.ask_now')}</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => <ArticleCard key={article.id} article={article} />)}
          </div>
        )}
      </div>
    </div>
  );
}
