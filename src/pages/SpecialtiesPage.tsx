import { useMemo, useState } from 'react';
import { Brain, Search, HeartPulse, Stethoscope, Activity, Sparkles } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { useRouter } from '@/lib/router';
import { comprehensiveSpecialties } from '@/lib/comprehensiveSpecialties';

const iconFor = (slug: string) => slug.includes('psych') || slug.includes('therapy') ? Brain : slug.includes('surgery') || slug.includes('medicine') ? Stethoscope : slug.includes('heart') || slug.includes('cardio') ? HeartPulse : slug.includes('behavior') ? Activity : Sparkles;
const label = (s: typeof comprehensiveSpecialties[number], lang: string) => lang === 'en' ? s.en : lang === 'de' ? s.de : lang === 'ru' ? s.ru : s.ar;

export default function SpecialtiesPage() {
 const { lang, dir } = useI18n();
 const { navigate } = useRouter();
 const [q,setQ]=useState('');
 const list=useMemo(()=>comprehensiveSpecialties.filter(s=>label(s,lang).toLowerCase().includes(q.toLowerCase()) || s.ar.toLowerCase().includes(q.toLowerCase())),[lang,q]);
 return <div className="min-h-screen pt-24 pb-16 bg-gray-50" dir={dir}>
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
   <div className="text-center">
    <h1 className="text-3xl font-extrabold text-gray-800">{lang==='ar'?'التخصصات الطبية والنفسية في SB1':lang==='ru'?'Медицинские и психологические направления SB1':lang==='de'?'Medizinische und psychologische Fachgebiete von SB1':'SB1 Medical & Psychological Specialties'}</h1>
    <p className="mt-2 text-gray-500">{list.length} {lang==='ar'?'تخصصاً متاحاً للتصفح والبحث':'specialties available for browsing and search'}</p>
   </div>
   <div className="mt-7 relative max-w-2xl mx-auto">
    <Search className="absolute end-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"/>
    <input value={q} onChange={e=>setQ(e.target.value)} className="w-full rounded-2xl border bg-white py-4 pe-12 ps-4 outline-none focus:border-teal-400" placeholder={lang==='ar'?'ابحث عن تخصص طبي أو نفسي...':'Search medical or psychological specialty...'} />
   </div>
   <div className="mt-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
    {list.map(s=>{const Icon=iconFor(s.slug); return <button key={s.slug} onClick={()=>navigate('/specialties/'+encodeURIComponent(s.slug))} className="card p-5 text-center hover:shadow-lg transition">
      <Icon className="mx-auto w-8 h-8 text-teal-600"/><div className="mt-3 text-sm font-semibold text-gray-700">{label(s,lang)}</div>
     </button>})}
   </div>
  </div>
 </div>;
}
