import { useMemo, useState } from 'react';
import { Activity, Brain, HeartPulse, Search, Stethoscope, Sparkles, Users } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { useRouter } from '@/lib/router';
import { comprehensiveSpecialties } from '@/lib/comprehensiveSpecialties';

const groups = [
  { key:'children', icon:Users, slugs:['pediatrics','child-psychology','child-adolescent-psychiatry','denver-model-children','developmental-psychology','speech-therapy','adolescent-medicine','adolescent-psychology'], labels:{ar:'الأطفال وصحة الطفل',en:'Children & Child Health',de:'Kinder & Kindergesundheit',ru:'Детское здоровье'} },
  { key:'mental', icon:Brain, slugs:comprehensiveSpecialties.filter(s=>['psych','therapy','behavior','mindfulness','emdr','addiction','eating','sleep','stress','grief','family','marriage','psychiatry','forensic-psychology','geriatric-psychology'].some(k=>s.slug.includes(k))).map(s=>s.slug), labels:{ar:'الصحة النفسية والسلوكية',en:'Mental & Behavioral Health',de:'Psychische & Verhaltensgesundheit',ru:'Психическое здоровье'} },
  { key:'immunity', icon:Activity, slugs:['allergy-immunology','infectious-diseases','infectious-disease-prevention','hematology'], labels:{ar:'المناعة والحساسية والأمراض المعدية',en:'Immunity, Allergy & Infection',de:'Immunologie, Allergologie & Infektionen',ru:'Иммунология, аллергология и инфекции'} },
  { key:'heart', icon:HeartPulse, slugs:['cardiology','cardiothoracic-surgery','vascular-surgery','internal-medicine','preventive-medicine'], labels:{ar:'القلب والدورة الدموية',en:'Heart & Circulation',de:'Herz & Kreislauf',ru:'Сердце и сосуды'} },
  { key:'elderly', icon:Users, slugs:['geriatrics','geriatric-psychology','geriatric-psychiatry','hospice-palliative-care','pain-medicine'], labels:{ar:'كبار السن والشيخوخة والرعاية',en:'Geriatrics & Palliative Care',de:'Geriatrie & Palliativmedizin',ru:'Гериатрия и паллиативная помощь'} },
  { key:'other', icon:Stethoscope, slugs:[], labels:{ar:'باقي التخصصات الطبية',en:'Other Medical Specialties',de:'Weitere medizinische Fachgebiete',ru:'Другие медицинские специальности'} },
];

const label=(s:any,lang:string)=>lang==='en'?s.en:lang==='de'?s.de:lang==='ru'?s.ru:s.ar;

export default function SpecialtiesPage(){
 const {lang,dir}=useI18n(); const {navigate}=useRouter(); const [q,setQ]=useState('');
 const filtered=useMemo(()=>comprehensiveSpecialties.filter(s=>label(s,lang).toLowerCase().includes(q.toLowerCase())||s.ar.toLowerCase().includes(q.toLowerCase())||s.en.toLowerCase().includes(q.toLowerCase())),[q,lang]);
 const getGroupItems=(g:any)=>g.key==='other'?filtered.filter(s=>!groups.slice(0,5).some(x=>x.slugs.includes(s.slug))):filtered.filter(s=>g.slugs.includes(s.slug));
 return <div className="min-h-screen bg-gray-50 pt-24 pb-16" dir={dir}>
  <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
   <div className="rounded-3xl bg-white p-7 shadow-sm border border-gray-100 text-center">
    <h1 className="text-3xl font-extrabold text-gray-900">{lang==='ar'?'التخصصات الطبية والنفسية':lang==='de'?'Medizinische und psychologische Fachgebiete':lang==='ru'?'Медицинские и психологические направления':'Medical & Psychological Specialties'}</h1>
    <p className="mt-2 text-gray-500">{filtered.length} {lang==='ar'?'تخصصاً منظماً حسب الفروع ويمكن فتح صفحة كاملة لكل تخصص':'specialties grouped by branch, each with its own full hub'}</p>
    <div className="relative mx-auto mt-6 max-w-2xl"><Search className="absolute end-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"/><input value={q} onChange={e=>setQ(e.target.value)} placeholder={lang==='ar'?'ابحث عن تخصص...':'Search specialty...'} className="w-full rounded-2xl border bg-gray-50 py-4 pe-12 ps-4 outline-none focus:border-teal-400"/></div>
   </div>
   <div className="mt-7 space-y-7">
    {groups.map(g=>{const Icon=g.icon; const items=getGroupItems(g); if(!items.length)return null; const title=g.labels[lang as keyof typeof g.labels]||g.labels.ar; return <section key={g.key} className="rounded-3xl bg-white p-6 shadow-sm border border-gray-100">
      <div className="mb-5 flex items-center gap-3"><div className="rounded-2xl bg-teal-50 p-3"><Icon className="h-6 w-6 text-teal-600"/></div><div><h2 className="text-xl font-bold text-gray-800">{title}</h2><p className="text-xs text-gray-400">{items.length} تخصص</p></div></div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">{items.map(s=><button key={s.slug} onClick={()=>navigate('/specialties/'+encodeURIComponent(s.slug))} className="rounded-2xl border border-gray-100 bg-gray-50 p-4 text-start transition hover:border-teal-200 hover:bg-teal-50"><Sparkles className="h-5 w-5 text-teal-600"/><span className="mt-2 block text-sm font-semibold text-gray-700">{label(s,lang)}</span></button>)}</div>
    </section>})}
   </div>
  </div>
 </div>
}