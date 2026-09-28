import { useEffect,useMemo,useState } from 'react';
import { Search,MapPin } from 'lucide-react';
import { useRouter,parseQuery } from '@/lib/router';
import { useI18n } from '@/lib/i18n';
import { supabase,type Doctor } from '@/lib/supabase';
import DoctorCard from '@/components/DoctorCard';
import { comprehensiveSpecialties } from '@/lib/comprehensiveSpecialties';
import { demoDoctors } from '@/lib/demoData';
import { specialtyCatalog,virtualDoctorsForSpecialty,languageCountry } from '@/lib/catalog';
import { useApp } from '@/i18n/AppContext';
import { citiesForCountry } from '@/lib/cities';
export default function DoctorsPage(){
 const {path}=useRouter();const {navigate}=useRouter();const {t,lang,dir}=useI18n(); const {country}=useApp(); const cities=citiesForCountry(country.code);const q=parseQuery(path);const [specialty,setSpecialty]=useState(q.specialty||'');const [search,setSearch]=useState(q.q||'');const [city,setCity]=useState('');const [dbDoctors,setDbDoctors]=useState<Doctor[]>([]);
 const specs=useMemo(()=>specialtyCatalog(lang),[lang]);const profile=languageCountry(lang);
 useEffect(()=>{setSpecialty(q.specialty||'');setSearch(q.q||'')},[q.specialty,q.q]);
 useEffect(()=>{(async()=>{const {data}=await supabase.from('doctors').select('*, specialty(*)').eq('is_virtual',false);setDbDoctors((data||[]) as Doctor[])})().catch(()=>setDbDoctors([]))},[]);
 const doctors=useMemo(()=>{
   if(!specialty) {
     const real=dbDoctors.filter(d=>d.native_language===lang);
     const generated=comprehensiveSpecialties.flatMap(s=>virtualDoctorsForSpecialty(s.slug,lang,5));
     return [...real,...generated].filter((d,i,a)=>a.findIndex(x=>x.id===d.id)===i).filter(d=>!search||d.name.toLowerCase().includes(search.toLowerCase())).filter(d=>!city||d.city===city).slice(0,40);
   }
   const real=dbDoctors.filter(d=>d.native_language===lang && d.specialty?.slug===specialty);
   return (real.length?real:virtualDoctorsForSpecialty(specialty,lang,25)).filter(d=>!search||d.name.toLowerCase().includes(search.toLowerCase())).filter(d=>!city||d.city===city);
 },[dbDoctors,specialty,lang,search,city]);
 return <div className="min-h-screen pt-24 pb-16 bg-gray-50" dir={dir}><div className="mx-auto max-w-7xl px-4">
  <div className="mb-6 rounded-3xl bg-gradient-to-br from-teal-700 to-cyan-600 p-7 text-white"><h1 className="text-3xl font-extrabold">الأخصائيون والأطباء</h1><p className="mt-2">اللغة الحالية: {profile.native}. تظهر الملفات الخاصة باللغة المختارة فقط.</p></div>
  <div className="rounded-2xl bg-white border p-5 mb-6 grid gap-3 md:grid-cols-3">
   <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="ابحث باسم الأخصائي" className="rounded-xl border px-4 py-3"/>
   <select value={specialty} onChange={e=>{setSpecialty(e.target.value);navigate('/doctors?specialty='+e.target.value)}} className="rounded-xl border px-4 py-3"><option value="">اختر التخصص</option>{specs.map(s=><option key={s.slug} value={s.slug}>{s.name}</option>)}</select>
   <select value={city} onChange={e=>setCity(e.target.value)} className="rounded-xl border px-4 py-3"><option value="">اختر المدينة</option>{cities.map(x=><option key={x} value={x}>{x}</option>)}</select>
  </div>
  {specialty&&<div className="mb-5 rounded-2xl bg-teal-50 border border-teal-100 p-4 text-sm text-teal-800">يوجد 5 إلى 25 ملفاً افتراضياً لكل تخصص في كل لغة. الملفات الافتراضية تعليمية وليست أشخاصاً حقيقيين.</div>}
  {!specialty?<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">{doctors.map(d=><DoctorCard key={d.id} doctor={d}/>)}</div>:<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">{doctors.map(d=><DoctorCard key={d.id} doctor={d}/>)}</div>}
 </div></div>;
}