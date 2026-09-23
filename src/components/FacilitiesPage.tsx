import { useMemo,useState } from 'react';
import { Search,MapPin,Star,Stethoscope,FlaskConical,Scan,HeartPulse,Accessibility,Pill,Building2,ShoppingBag,ArrowRight,Calendar,Clock } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { useRouter } from '@/lib/router';
import { virtualFacilities,countriesForLanguage } from '@/lib/catalog';

type Kind='clinic'|'lab'|'radiology'|'elderly'|'pharmacy'|'addiction'|'rehab'|'medical-supplies';
const kinds:{key:Kind;icon:any}[]=[
 {key:'clinic',icon:Stethoscope},{key:'lab',icon:FlaskConical},{key:'radiology',icon:Scan},{key:'elderly',icon:Accessibility},
 {key:'pharmacy',icon:Pill},{key:'addiction',icon:HeartPulse},{key:'rehab',icon:HeartPulse},{key:'medical-supplies',icon:ShoppingBag}
];
const labels:any={
 ar:{title:'المرافق الطبية',sub:'اختر نوع المرفق والبلد لرؤية المؤسسات المسجلة باللغة المختارة.',choose:'اختر نوع المرفق',country:'اختر البلد',search:'ابحث عن اسم أو مدينة',book:'حجز / تفاصيل',clinic:'العيادات والمستشفيات',lab:'التحاليل والمختبرات',radiology:'الأشعة والتصوير',elderly:'دور رعاية المسنين',pharmacy:'الصيدليات',addiction:'مراكز علاج الإدمان',rehab:'مراكز التأهيل والعلاج الطبيعي', 'medical-supplies':'الأدوات الطبية',empty:'لا توجد نتائج في هذا البلد واللغة.'},
 en:{title:'Medical Facilities',sub:'Choose a facility type and country to see institutions registered in the selected language.',choose:'Facility type',country:'Country',search:'Search name or city',book:'Details / Booking',clinic:'Clinics & Hospitals',lab:'Laboratories',radiology:'Radiology & Imaging',elderly:'Elderly Care',pharmacy:'Pharmacies',addiction:'Addiction Treatment',rehab:'Rehabilitation & Physiotherapy','medical-supplies':'Medical Supplies',empty:'No results for this language and country.'},
 ru:{title:'Медицинские учреждения',sub:'Выберите тип учреждения и страну, чтобы увидеть организации на выбранном языке.',choose:'Тип учреждения',country:'Страна',search:'Поиск по названию или городу',book:'Подробнее / Запись',clinic:'Клиники и больницы',lab:'Лаборатории',radiology:'Радиология и визуализация',elderly:'Уход за пожилыми',pharmacy:'Аптеки',addiction:'Лечение зависимостей',rehab:'Реабилитация и физиотерапия','medical-supplies':'Медицинские товары',empty:'Нет результатов для выбранного языка и страны.'},
 de:{title:'Medizinische Einrichtungen',sub:'Wählen Sie Einrichtungstyp und Land.',choose:'Einrichtungstyp',country:'Land',search:'Name oder Stadt suchen',book:'Details / Termin',clinic:'Kliniken & Krankenhäuser',lab:'Labore',radiology:'Radiologie',elderly:'Seniorenpflege',pharmacy:'Apotheken',addiction:'Suchtbehandlung',rehab:'Rehabilitation & Physiotherapie','medical-supplies':'Medizinbedarf',empty:'Keine Ergebnisse.'}
};
const iconFor=(k:Kind)=>kinds.find(x=>x.key===k)?.icon||Building2;
export function FacilitiesPage({onNavigate,initialCategory}:{onNavigate?:(v:string)=>void;initialCategory?:Kind}) {
 const {lang,dir}=useI18n();const {navigate}=useRouter();const t=labels[lang]||labels.en;const countries=countriesForLanguage(lang);
 const [kind,setKind]=useState<Kind>(initialCategory||'clinic');const [country,setCountry]=useState(countries[0]?.key||'');const [search,setSearch]=useState('');
 const list=useMemo(()=>virtualFacilities(lang,country).filter((x:any)=>x.facility_type===kind&&(!search||x.name.toLowerCase().includes(search.toLowerCase())||x.city.toLowerCase().includes(search.toLowerCase()))),[lang,country,kind,search]);
 return <div className="min-h-screen bg-slate-50 pt-20 pb-16" dir={dir}>
  <div className="bg-gradient-to-br from-teal-800 via-teal-700 to-cyan-600 text-white"><div className="mx-auto max-w-7xl px-4 py-10"><h1 className="text-3xl font-extrabold">{t.title}</h1><p className="mt-2 text-teal-50">{t.sub}</p></div></div>
  <div className="sticky top-16 z-30 border-b bg-white/95 backdrop-blur"><div className="mx-auto max-w-7xl px-4 py-3 overflow-x-auto"><div className="flex gap-2 min-w-max">{kinds.map(({key,icon:Icon})=><button key={key} onClick={()=>setKind(key)} className={'flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-bold '+(kind===key?'bg-teal-600 text-white':'bg-slate-100 text-slate-700 hover:bg-teal-50')}><Icon className="h-4 w-4"/>{t[key]}</button>)}</div></div></div>
  <div className="mx-auto max-w-7xl px-4 py-6">
   <div className="grid gap-3 md:grid-cols-3 rounded-2xl bg-white border p-4">
    <select value={kind} onChange={e=>setKind(e.target.value as Kind)} className="rounded-xl border px-4 py-3 font-semibold"><option value="clinic">{t.clinic}</option>{kinds.slice(1).map(({key})=><option key={key} value={key}>{t[key]}</option>)}</select>
    <select value={country} onChange={e=>setCountry(e.target.value)} className="rounded-xl border px-4 py-3"><option value="">{t.country}</option>{countries.map(c=><option key={c.key} value={c.key}>{c.name}</option>)}</select>
    <div className="relative"><Search className="absolute start-3 top-3.5 h-5 w-5 text-slate-400"/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder={t.search} className="w-full rounded-xl border px-10 py-3"/></div>
   </div>
   <div className="mt-6 flex items-center justify-between"><div><h2 className="text-xl font-extrabold">{t[kind]}</h2><p className="text-sm text-slate-500 mt-1">{list.length} {lang==='ar'?'مرفق تجريبي':'demo facilities'}</p></div></div>
   {list.length?<div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{list.map((f:any)=>{const Icon=iconFor(kind);return <article key={f.id} className="overflow-hidden rounded-2xl bg-white border shadow-sm hover:shadow-md transition"><div className="h-36 bg-gradient-to-br from-teal-50 to-cyan-50 flex items-center justify-center"><Icon className="h-14 w-14 text-teal-600"/></div><div className="p-5"><div className="flex items-start justify-between gap-3"><h3 className="font-extrabold text-slate-900">{f.name}</h3><span className="flex items-center gap-1 text-amber-600 text-sm"><Star className="h-4 w-4 fill-current"/>{f.rating.toFixed(1)}</span></div><p className="mt-3 text-sm text-slate-500 flex items-center gap-2"><MapPin className="h-4 w-4"/>{f.city} · {f.country}</p><p className="mt-2 text-sm text-slate-500">{f.services}</p><div className="mt-4 flex items-center gap-2 text-xs text-slate-500"><Clock className="h-4 w-4"/>{lang==='ar'?'09:00 - 18:00':'09:00 - 18:00'}<Calendar className="ms-2 h-4 w-4"/></div><button onClick={()=>navigate('/facilities/'+f.id)} className="mt-5 w-full rounded-xl bg-teal-600 px-4 py-3 text-white font-bold flex items-center justify-center gap-2">{t.book}<ArrowRight className="h-4 w-4"/></button></div></article>})}</div>:<div className="mt-8 rounded-2xl bg-white border p-12 text-center text-slate-500">{t.empty}</div>}
  </div>
 </div>;
}