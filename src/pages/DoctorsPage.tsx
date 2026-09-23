import { useEffect, useState } from 'react';
import { Search, MapPin, X } from 'lucide-react';
import { useRouter, parseQuery } from '@/lib/router';
import { useI18n } from '@/lib/i18n';
import { supabase, type Doctor, type Specialty } from '@/lib/supabase';
import DoctorCard from '@/components/DoctorCard';
import { demoDoctors, demoSpecialties } from '@/lib/demoData';
import { comprehensiveSpecialties } from '@/lib/comprehensiveSpecialties';

const cityNames: Record<string, Record<string, string>> = {
  دمشق: { ar: 'دمشق', en: 'Damascus', de: 'Damaskus', ru: 'Дамаск' },
  حلب: { ar: 'حلب', en: 'Aleppo', de: 'Aleppo', ru: 'Алеппо' },
  حمص: { ar: 'حمص', en: 'Homs', de: 'Homs', ru: 'Хомс' },
  اللاذقية: { ar: 'اللاذقية', en: 'Latakia', de: 'Latakia', ru: 'Латакия' },
};

export default function DoctorsPage() {
  const { path, navigate } = useRouter();
  const { t, specialtyName, lang, dir } = useI18n();
  const query = parseQuery(path);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(query.q || '');
  const [selectedSpecialty, setSelectedSpecialty] = useState(query.specialty || '');
  const [selectedCity, setSelectedCity] = useState('');

  useEffect(() => {
    (async () => {
      const { data: specs } = await supabase.from('specialties').select('*').order('name');
      const comprehensive = comprehensiveSpecialties.map((s) => ({ id: `comp-${s.slug}`, slug: s.slug, name: s.ar, name_en: s.en, name_de: s.de, name_ru: s.ru, icon: 'Stethoscope', description: '', description_en: '', description_de: '', description_ru: '', created_at: new Date().toISOString() }));
      setSpecialties((specs && specs.length ? specs : comprehensive) as Specialty[]);
    })();
  }, []);

  useEffect(() => {
    setSearch(query.q || '');
    setSelectedSpecialty(query.specialty || '');
  }, [query.q, query.specialty]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      let dbQuery = supabase.from('doctors').select('*, specialty(*)');
      if (search.trim()) dbQuery = dbQuery.ilike('name', `%${search.trim()}%`);
      if (selectedSpecialty) {
        const { data: spec } = await supabase.from('specialties').select('id').eq('slug', selectedSpecialty).maybeSingle();
        if (spec) dbQuery = dbQuery.eq('specialty_id', spec.id);
      }
      if (selectedCity) dbQuery = dbQuery.eq('city', selectedCity);
      const { data } = await dbQuery.order('rating', { ascending: false });
      const fallback = selectedSpecialty ? demoDoctors.filter((doctor) => doctor.specialty?.slug === selectedSpecialty) : demoDoctors;
      setDoctors((data && data.length ? data : fallback) as Doctor[]);
      setLoading(false);
    })().catch(() => { setDoctors(selectedSpecialty ? demoDoctors.filter((doctor) => doctor.specialty?.slug === selectedSpecialty) : demoDoctors); setLoading(false); });
  }, [search, selectedSpecialty, selectedCity]);

  const cities = ['دمشق', 'حلب', 'حمص', 'اللاذقية'];
  const cityLabel = (city: string) => cityNames[city]?.[lang] || cityNames[city]?.en || city;

  const clearFilters = () => {
    setSearch('');
    setSelectedSpecialty('');
    setSelectedCity('');
    navigate('/doctors');
  };

  const hasFilters = Boolean(search || selectedSpecialty || selectedCity);

  return (
    <div className="min-h-screen pt-24 pb-16" dir={dir}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 rounded-3xl border border-gray-100 bg-gradient-to-br from-teal-50 via-white to-white p-7 shadow-sm">
          <h1 className="mb-2 text-3xl font-bold text-gray-800">{t('doctors.title')}</h1>
          <p className="text-gray-500">{t('doctors.subtitle')}</p>
        </div>

        <div className="card mb-8 p-5">
          <div className="flex flex-col gap-4">
            <div className="relative">
              <Search className="absolute end-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t('doctors.search_placeholder')}
                className="w-full rounded-xl border border-gray-200 py-3 pe-12 ps-4 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <button onClick={() => setSelectedSpecialty('')} className={`badge ${!selectedSpecialty ? 'bg-teal-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                {t('doctors.all_specialties')}
              </button>
              {specialties.map((spec) => (
                <button key={spec.id} onClick={() => setSelectedSpecialty(spec.slug)} className={`badge ${selectedSpecialty === spec.slug ? 'bg-teal-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                  {specialtyName(spec)}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="flex items-center gap-1 text-sm text-gray-500">
                <MapPin className="h-4 w-4" />
                {t('doctors.city')}
              </span>
              <button onClick={() => setSelectedCity('')} className={`badge ${!selectedCity ? 'bg-teal-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                {t('common.all')}
              </button>
              {cities.map((city) => (
                <button key={city} onClick={() => setSelectedCity(city)} className={`badge ${selectedCity === city ? 'bg-teal-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                  {cityLabel(city)}
                </button>
              ))}
            </div>

            {hasFilters && (
              <button onClick={clearFilters} className="flex items-center gap-1 text-sm text-red-500 hover:text-red-600">
                <X className="h-4 w-4" />
                {t('doctors.clear_filters')}
              </button>
            )}
          </div>
        </div>

        <div className="mb-6 flex items-center justify-between">
          <p className="text-sm text-gray-500">
            {loading ? t('doctors.searching') : `${doctors.length} ${t('doctors.results')}`}
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="card p-5 animate-pulse">
                <div className="mx-auto mb-4 h-24 w-24 rounded-2xl bg-gray-100" />
                <div className="mx-auto mb-2 h-5 w-32 rounded bg-gray-100" />
                <div className="mx-auto h-4 w-24 rounded bg-gray-100" />
              </div>
            ))}
          </div>
        ) : doctors.length === 0 ? (
          <div className="card py-20 text-center">
            <Search className="mx-auto mb-4 h-12 w-12 text-gray-200" />
            <p className="text-lg text-gray-400">{t('doctors.no_results')}</p>
            <button onClick={clearFilters} className="btn-secondary mt-4">{t('doctors.clear_filters')}</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {doctors.map((doc) => <DoctorCard key={doc.id} doctor={doc} />)}
          </div>
        )}
      </div>
    </div>
  );
}
