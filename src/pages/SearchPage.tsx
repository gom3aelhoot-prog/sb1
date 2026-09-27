import {useMemo} from 'react';
import {MapPin,Star,Clock,CalendarDays,Stethoscope,Building2,Pill,BookOpen,PlayCircle,Headphones} from 'lucide-react';
import {useI18n} from '@/lib/i18n';
import {virtualDoctorsForSpecialty,virtualFacilities,virtualArticlesForSpecialty,virtualVideosForSpecialty,virtualAudioForSpecialty,virtualLibraryForSpecialty,specialtyCatalog} from '@/lib/catalog';
import {useRouter,parseQuery} from '@/lib/router';
import AdvancedSearchBar from '@/components/AdvancedSearchBar';

export default function SearchPage(){
 const {lang,dir}=useI18n(); const {navigate,path}=useRouter(); const query=parseQuery(path);
 const q=(query.q||'').trim().toLowerCase(); const kind=query.kind||'doctor'; const country=query.country||''; const city=query.city||''; const specialty=query.specialty||''; const age=query.age||'all';
 const specialties=specialtyCatalog(lang);
 const results=useMemo(()=>{
  const out:any[]=[];
  const doctorKinds=kind==='doctor'||kind==='all';
  if(doctorKinds) specialties.forEach(s=>virtualDoctorsForSpecialty(s.slug,lang,8,country).forEach((d:any)=>out.push({id:d.id,kind:'doctor',title:d.name,subtitle:d.specialty?.name||s.name,age:d.age||0,specialty:s.slug,location:d.city||'',rating:d.rating||4.7,fastest:d.experience_years||10,available:true,href:'/doctors/'+d.id})));
  const facilityKinds=['clinic','pharmacy','lab','radiology','rehab','addiction','elderly','medical-supplies','property'];
  if(kind==='all'||facilityKinds.includes(kind)||kind==='physio'){const fk=facilityKinds.includes(kind)?kind:(kind==='physio'?'rehab':undefined);virtualFacilities(lang,country||undefined,city||undefined,fk).forEach((f:any)=>out.push({id:f.id,kind:f.facility_type,title:f.name,subtitle:f.services,location:[f.country,f.city].filter(Boolean).join(' · '),rating:f.rating||4.6,fastest:15,available:true,href:'/facilities/'+f.id}));}
  if(kind==='all'||kind==='article') specialties.forEach(s=>virtualArticlesForSpecialty(s.slug,lang,2).forEach((a:any)=>out.push({id:a.id,kind:'article',title:a.title,subtitle:a.description,location:'',rating:4.8,fastest:0,available:true,href:'/articles/'+a.id})));
  if(kind==='all'||kind==='video') specialties.slice(0,20).forEach(s=>virtualVideosForSpecialty(s.slug,lang,1).forEach((v:any)=>out.push({id:v.id,kind:'video',title:v.title,subtitle:v.description,location:'',rating:4.8,fastest:0,available:true,href:'/videos'})));
  if(kind==='all'||kind==='audio') specialties.slice(0,15).forEach(s=>virtualAudioForSpecialty(s.slug,lang,1).forEach((a:any)=>out.push({id:a.id,kind:'audio',title:a.title,subtitle:a.description,location:'',rating:4.8,fastest:0,available:true,href:'/audio'})));
  if(kind==='all'||kind==='library') specialties.slice(0,15).forEach(s=>virtualLibraryForSpecialty(s.slug,lang,1).forEach((b:any)=>out.push({id:b.id,kind:'library',title:b.title,subtitle:b.description,location:'',rating:4.8,fastest:0,available:true,href:'/library'})));
  return out.filter(x=>(!q||[x.title,x.subtitle,x.location].join(' ').toLowerCase().includes(q))&&(!specialty||x.specialty===specialty)&&(kind!=='doctor'||age==='all'||(age==='young'&&x.age<35)||(age==='mid'&&x.age>=35&&x.age<50)||(age==='senior'&&x.age>=50))).slice(0,120);
 },[q,kind,country,city,specialty,age,lang]);
 const icon=(k:string)=>k==='doctor'?Stethoscope:k==='pharmacy'?Pill:k==='article'?BookOpen:k==='video'?PlayCircle:k==='audio'?Headphones:Building2;
 const empty=lang==='ar'?'لا توجد نتائج مطابقة. جرّب تغيير الدولة أو النوع أو المدينة.':'No matching results. Try changing the country, type or city.';
 return <div dir={dir} className="min-h-screen bg-gray-50 pt-24 pb-16"><div className="mx-auto max-w-7xl px-4">
  <div className="rounded-3xl bg-gradient-to-br from-slate-900 to-teal-700 p-6 sm:p-8 text-white"><h1 className="text-3xl font-extrabold">{lang==='ar'?'البحث المتطور':'Advanced Search'}</h1><p className="mt-2 text-white/80">{lang==='ar'?'ابحث ثم اختر نوع الخدمة والدولة، وتظهر المدينة فقط عند البحث عن المرافق.':'Search, choose a service type and country; city appears only for facilities.'}</p><div className="mt-5 rounded-2xl bg-white p-3"><AdvancedSearchBar compact/></div></div>
  <div className="mt-6 flex items-center justify-between"><h2 className="text-xl font-extrabold text-gray-800">{lang==='ar'?'النتائج':'Results'} <span className="text-sm font-normal text-gray-500">({results.length})</span></h2>{country&&<span className="rounded-full bg-white border px-3 py-2 text-sm text-gray-600">{country}{city?' · '+city:''}</span>}</div>
  {results.length===0?<div className="mt-6 rounded-2xl bg-white border p-10 text-center text-gray-500">{empty}</div>:<div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">{results.map(x=>{const I=icon(x.kind);return <button key={x.id} onClick={()=>navigate(x.href)} className="text-start rounded-2xl bg-white border p-5 hover:shadow-md"><div className="flex items-start gap-3"><div className="rounded-xl bg-teal-50 p-3 text-teal-700"><I className="h-5 w-5"/></div><div className="min-w-0 flex-1"><h3 className="font-extrabold truncate">{x.title}</h3><p className="mt-1 text-sm text-gray-500 line-clamp-2">{x.subtitle}</p>{x.location&&<p className="mt-2 text-xs text-gray-500"><MapPin className="inline h-3 w-3"/> {x.location}</p>}<div className="mt-3 flex gap-3 text-xs"><span className="text-amber-600"><Star className="inline h-3 w-3 fill-current"/> {Number(x.rating).toFixed(1)}</span>{x.kind==='doctor'&&<span className="text-teal-700"><CalendarDays className="inline h-3 w-3"/> {x.available?'مواعيد متاحة':'لا توجد مواعيد'}</span>}{x.fastest>0&&<span><Clock className="inline h-3 w-3"/> {x.fastest} دقيقة</span>}</div></div></div></button>})}</div>}
 </div></div>;
}