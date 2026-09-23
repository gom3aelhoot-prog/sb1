import { useEffect, useState } from 'react';
import { BookOpen, Newspaper, Wrench, ExternalLink } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { useRouter, parseQuery } from '@/lib/router';
import { supabase, type SpecialtyLibraryItem, type Specialty } from '@/lib/supabase';
import { localizedField } from '@/lib/localizedContent';

export default function LibraryPage() {
  const { t, specialtyName, lang, dir } = useI18n();
  const { path, navigate } = useRouter();
  const query = parseQuery(path);
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [selectedSpec, setSelectedSpec] = useState<string>(query.specialty || '');
  const [items, setItems] = useState<SpecialtyLibraryItem[]>([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('specialties').select('*').order('name').then(({ data }) => setSpecialties(data || []));
  }, []);
  useEffect(() => {
    setLoading(true);
    let q = supabase.from('specialty_library_items').select('*, specialty(*)').order('created_at', { ascending: false }).limit(50);
    if (selectedSpec) q = q.eq('specialty_id', selectedSpec);
    if (filter !== 'all') q = q.eq('item_type', filter);
    q.then(({ data }) => { setItems(data || []); setLoading(false); });
  }, [selectedSpec, filter]);

  const typeIcons: Record<string, typeof BookOpen> = { news: Newspaper, book: BookOpen, service: Wrench, article: BookOpen };
  const typeColors: Record<string, string> = { news: 'blue', book: 'teal', service: 'amber', article: 'gray' };

  return (
    <div className="min-h-screen pt-24 pb-16" dir={dir}>
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-6 rounded-3xl border border-gray-100 bg-gradient-to-br from-teal-50 via-white to-white p-7 shadow-sm">
          <h1 className="mb-2 text-3xl font-bold text-gray-800">{t('library.title')}</h1>
          <p className="text-gray-500">{t('library.subtitle')}</p>
        </div>

        <div className="mb-6 flex flex-wrap gap-3">
          <select value={selectedSpec} onChange={(e) => { setSelectedSpec(e.target.value); navigate(`/library?specialty=${e.target.value}`); }} className="input-field max-w-xs">
            <option value="">{t('doctors.all_specialties')}</option>
            {specialties.map((s) => <option key={s.id} value={s.id}>{specialtyName(s)}</option>)}
          </select>
          <div className="flex gap-2">
            {['all', 'news', 'book', 'service'].map((f) => (
              <button key={f} onClick={() => setFilter(f)} className={`rounded-xl px-4 py-2.5 text-sm font-medium transition ${filter === f ? 'bg-teal-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                {f === 'all' ? t('common.all') : f === 'news' ? t('library.news') : f === 'book' ? t('library.books') : t('library.services')}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1,2,3,4,5,6].map((i) => <div key={i} className="card animate-pulse p-5"><div className="mb-2 h-4 w-3/4 rounded bg-gray-100" /><div className="h-3 w-full rounded bg-gray-100" /></div>)}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => {
              const Icon = typeIcons[item.item_type] || BookOpen;
              const color = typeColors[item.item_type] || 'gray';
              const title = localizedField(item as unknown as Record<string, unknown>, 'title', lang, item.title);
              const description = localizedField(item as unknown as Record<string, unknown>, 'description', lang, item.description || '');
              const source = localizedField(item as unknown as Record<string, unknown>, 'source', lang, item.source || '');
              return (
                <div key={item.id} className="card p-5 transition hover:shadow-lg">
                  <div className="mb-3 flex items-start gap-3">
                    <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-${color}-100`}><Icon className={`h-5 w-5 text-${color}-600`} /></div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-semibold leading-snug text-gray-800">{title}</h3>
                      {source && <p className="mt-0.5 text-xs text-gray-400">{source}</p>}
                    </div>
                  </div>
                  {description && <p className="mb-3 line-clamp-2 text-sm text-gray-600">{description}</p>}
                  {item.url && <a href={item.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-teal-600 hover:text-teal-700">{t('library.read')} <ExternalLink className="h-3 w-3" /></a>}
                  {item.specialty && <p className="mt-2 text-xs text-gray-300">{specialtyName(item.specialty)}</p>}
                </div>
              );
            })}
            {items.length === 0 && <p className="col-span-full py-8 text-center text-gray-400">{t('library.subtitle')}</p>}
          </div>
        )}
      </div>
    </div>
  );
}
