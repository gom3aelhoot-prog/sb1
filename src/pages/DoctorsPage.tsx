import { useEffect,useMemo,useState } from 'react';
import { Search } from 'lucide-react';
import { useRouter,parseQuery } from '@/lib/router';
import { useI18n } from '@/lib/i18n';
import { supabase,type Doctor } from '@/lib/supabase';
import DoctorCard from '@/components/DoctorCard';
import { comprehensiveSpecialties } from '@/lib/comprehensiveSpecialties';
import { specialtyCatalog,virtualDoctorsForSpecialty,languageCountry,countriesForLanguage } from '@/lib/catalog';
export default function DoctorsPage(){
 const {path,navigate}=useRouter();const {lang,dir}=useI18n();const q=parseQuery(path);const [specialty,setSpecialty]=useState(q.specialty||'');const [search,setSearch]=useState(q.q||'');const [city,setCity]=useState('');const [dbDoctors,setDbDoctors]=useState<Doctor[]>([]);
 const specs=useMemo(()=>specialtyCatalog(lang),[lang]);const profile=languageCountry(lang);const countries=countriesForLanguage(lang);const [country,setCountry]=useState(countries[0]?.key||'');
 useEffect(()=>{setSpecialty(q.specialty||'');setSearch(q.q||'')},[q.specialty,q.q]);
 useEffect(()=>{supabase.from('doctors').select('*, specialty(*)').eq('is_virtual',false).then(({data})=>setDbDoctors((data||[]) as Doctor[])).catch(()=>setDbDoctors([]))},[]);
 const doctors=useMemo(()=>{if(!specialty){const demo=comprehensiveSpecialties.slice(0,8).flatMap(s=>virtualDoctorsForSpecialty(s.slug,lang,3,country));return [...dbDoctors.filter(d=>d.native_language===lang),...demo].slice(0,24)}const real=dbDoctors.filter(d=>d.native_language===lang&&d.specialty?.slug===specialty);return (real.length?[...real,...virtualDoctorsForSpecialty(specialty,lang,10,country)]:virtualDoctorsForSpecialty(specialty,lang,10,country)).filter(d=>!search||d.name.toLowerCase().includes(search.toLowerCase())).filter(d=>!city||d.city===city)},[dbDoctors,specialty,lang,search,city,country]);
 return <div className="min-h-screen pt-24 pb-16 bg-gray-50" dir={dir}><div className="mx-auto max-w-7xl px-4">
  <div className="mb-6 rounded-3xl bg-gradient-to-br from-teal-700 to-cyan-600 p-7 text-white"><h1 className="text-3xl font-extrabold">الأخصائيون والأطباء</h1><p className="mt-2">اللغة الحالية: {profile.native}. تظهر الملفات الخاصة باللغة المختارة فقط.</p></div>
  <div className="rounded-2xl bg-white border p-5 mb-6 grid gap-3 md:grid-cols-3"><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="ابحث باسم الأخصائي" className="rounded-xl border px-4 py-3"/><select value={specialty} onChange={e=>{setSpecialty(e.target.value);navigate('/doctors?specialty='+encodeURIComponent(e.target.value))}} className="rounded-xl border px-4 py-3"><option value="">اختر التخصص</option>{specs.map(s=><option key={s.slug} value={s.slug}>{s.name}</option>)}</select><select value={country} onChange={e=>setCountry(e.target.value)} className="rounded-xl border px-4 py-3">{countries.map(c=><option key={c.key} value={c.key}>{c.name}</option>)}</select><input value={city} onChange={e=>setCity(e.target.value)} placeholder={profile.city} className="rounded-xl border px-4 py-3"/></div>
  <div className="mb-5 rounded-2xl bg-white border p-5"><p className="font-bold text-gray-800">{specialty?'أخصائيو التخصص المختار':'أخصائيون وأطباء باللغة المختارة'}</p><p className="text-sm text-gray-500 mt-1">{specialty?'يوجد 5 إلى 25 ملفاً افتراضياً تعليمياً لكل تخصص ولكل لغة.':'اختر التخصص من القائمة لعرض 10 ملفات افتراضية تعليمية في التخصص.'}</p></div>
  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">{doctors.map(d=><DoctorCard key={d.id} doctor={d}/>)}</div>
  {!doctors.length&&<div className="rounded-2xl bg-white border p-10 text-center text-gray-500"><Search className="mx-auto h-10 w-10 text-gray-300"/><p className="mt-3">لا توجد نتائج باللغة المختارة.</p></div>}
 </div></div>;
}