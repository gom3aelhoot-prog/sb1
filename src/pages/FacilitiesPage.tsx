import {useMemo,useState} from 'react';
import {Building2,Pill,HeartPulse,Home,Stethoscope,MapPin,Scan,FlaskConical,Accessibility,Search,Star,ShoppingBag} from 'lucide-react';
import {useI18n} from '@/lib/i18n';
import {useRouter,parseQuery} from '@/lib/router';
import {virtualFacilities,countriesForLanguage} from '@/lib/catalog';

const icons:any={clinic:Stethoscope,lab:FlaskConical,radiology:Scan,elderly:Home,pharmacy:Pill,addiction:HeartPulse,rehab:Accessibility,'medical-supplies':ShoppingBag,property:Building2};
const labels:any={ar:{clinic:'العيادات',lab:'التحاليل',radiology:'الأشعة',elderly:'دور رعاية المسنين',pharmacy:'الصيدليات',addiction:'مراكز علاج الإدمان',rehab:'مراكز التأهيل والعلاج الطبيعي','medical-supplies':'الأدوات والأجهزة الطبية',property:'أماكن للبيع أو الإيجار'},en:{clinic:'Clinics',lab:'Laboratories',radiology:'Radiology',elderly:'Elderly Care',pharmacy:'Pharmacies',addiction:'Addiction Care',rehab:'Rehabilitation & Physiotherapy','medical-supplies':'Medical Equipment',property:'Places for Sale or Rent'},ru:{clinic:'Клиники',lab:'Лаборатории',radiology:'Радиология',elderly:'Уход за пожилыми',pharmacy:'Аптеки',addiction:'Лечение зависимостей',rehab:'Реабилитация и физиотерапия','medical-supplies':'Медицинское оборудование',property:'Объекты для продажи или аренды'},de:{clinic:'Kliniken',lab:'Labore',radiology:'Radiologie',elderly:'Seniorenpflege',pharmacy:'Apotheken',addiction:'Suchtbehandlung',rehab:'Rehabilitation & Physiotherapie','medical-supplies':'Medizinische Geräte',property:'Objekte zum Verkauf oder zur Miete'},uk:{clinic:'Клініки',lab:'Лабораторії',radiology:'Радіологія',elderly:'Догляд за літніми',pharmacy:'Аптеки',addiction:'Лікування залежностей',rehab:'Реабілітація та фізіотерапія','medical-supplies':'Медичне обладнання',property:'Об’єкти на продаж або оренду'},uz:{clinic:'Klinikalar',lab:'Laboratoriyalar',radiology:'Radiologiya',elderly:'Keksalar parvarishi',pharmacy:'Dorixonalar',addiction:'Giyohvandlik davolash',rehab:'Reabilitatsiya va fizioterapiya','medical-supplies':'Tibbiy uskunalar',property:'Sotish yoki ijaraga joylar'},hy:{clinic:'Կլինիկաներ',lab:'Լաբորատորիաներ',radiology:'Ռադիոլոգիա',elderly:'Տարեցների խնամք',pharmacy:'Դեղատներ',addiction:'Կախվածությունների բուժում',rehab:'Վերականգնում և ֆիզիոթերապիա','medical-supplies':'Բժշկական սարքավորումներ',property:'Վաճառքի կամ վարձակալության տարածքներ'},tg:{clinic:'Клиникаҳо',lab:'Озмоишгоҳҳо',radiology:'Радиология',elderly:'Нигоҳубини пиронсолон',pharmacy:'Дорухонаҳо',addiction:'Табобати вобастагӣ',rehab:'Барқарорсозӣ ва физиотерапия','medical-supplies':'Таҷҳизоти тиббӣ',property:'Объектҳо барои фурӯш ё иҷора'},az:{clinic:'Klinikalar',lab:'Laboratoriyalar',radiology:'Radiologiya',elderly:'Yaşlılara qayğı',pharmacy:'Apteklər',addiction:'Asılılıq müalicəsi',rehab:'Reabilitasiya və fizioterapiya','medical-supplies':'Tibbi avadanlıq',property:'Satış və ya icarə obyektləri'},am:{clinic:'ክሊኒኮች',lab:'ላቦራቶሪዎች',radiology:'ራዲዮሎጂ',elderly:'የአረጋውያን እንክብካቤ',pharmacy:'ፋርማሲዎች',addiction:'የሱስ ሕክምና',rehab:'ማገገሚያ እና ፊዚዮቴራፒ','medical-supplies':'የሕክምና መሣሪያዎች',property:'ለሽያጭ ወይም ለኪራይ የሕክምና ቦታዎች'},ka:{clinic:'კლინიკები',lab:'ლაბორატორიები',radiology:'რადიოლოგია',elderly:'ხანდაზმულთა მოვლა',pharmacy:'აფთიაქები',addiction:'დამოკიდებულების მკურნალობა',rehab:'რეაბილიტაცია და ფიზიოთერაპია','medical-supplies':'სამედიცინო მოწყობილობები',property:'გასაყიდი ან გასაქირავებელი ობიექტები'}};
const copy:any={ar:['المرافق الطبية','اختر القسم والبلد وابحث بالاسم أو الخدمة، ثم افتح المؤسسة لرؤية الصور والحجز.','اختر البلد','تفاصيل المؤسسة والحجز','بحث بالاسم أو الخدمة','الأعلى تقييماً','الاسم','الأقرب/المكان','بيع','إيجار'],en:['Medical Facilities','Choose a section and country, search by name or service, then open the facility for images and booking.','Choose country','Facility details & booking','Search by name or service','Highest rated','Name','Location','Sale','Rent'],ru:['Медицинские учреждения','Выберите раздел и страну, ищите по названию или услуге, затем откройте объект.','Выберите страну','Подробнее и запись','Поиск по названию или услуге','Высокий рейтинг','Название','Место','Продажа','Аренда']};

export default function FacilitiesPage({initialCategory}:{initialCategory?:string}={}){
 const {lang,dir}=useI18n();
 const {navigate,path}=useRouter();
 const q=parseQuery(path);
 const valid=['clinic','lab','radiology','elderly','pharmacy','addiction','rehab','medical-supplies','property'];
 const initial=initialCategory&&valid.includes(initialCategory)?initialCategory:(valid.includes(q.type||'')?q.type:'clinic');
 const [type,setType]=useState(initial);
 const countries=countriesForLanguage(lang);
 const [country,setCountry]=useState(countries[0]?.key||'');
 const [search,setSearch]=useState('');
 const [sort,setSort]=useState('rating');
 const [propertyMode,setPropertyMode]=useState<'all'|'sale'|'rent'>('all');
 const data=useMemo(()=>virtualFacilities(lang,country).filter((f:any)=>f.facility_type===type&&(!search||[f.name,f.description,f.services,f.address].join(' ').toLowerCase().includes(search.toLowerCase()))&&(type!=='property'||propertyMode==='all'||f.property_mode===propertyMode)).sort((a:any,b:any)=>sort==='name'?a.name.localeCompare(b.name):sort==='location'?String(a.city).localeCompare(String(b.city)):Number(b.rating||0)-Number(a.rating||0)),[lang,country,type,search,sort,propertyMode]);
 const labelsFor={...(labels.en),...(labels[lang]||{})};
 const c=copy[lang]||copy.en;
 return <div className="min-h-screen bg-gray-50 pt-24 pb-16" dir={dir}>
  <div className="mx-auto max-w-7xl px-4">
   <div className="rounded-3xl bg-gradient-to-br from-teal-700 to-cyan-600 p-8 text-white"><h1 className="text-3xl font-extrabold">{c[0]}</h1><p className="mt-2">{c[1]}</p></div>
   <div className="sticky top-20 z-20 mt-4 rounded-2xl bg-white border p-3 shadow-sm overflow-x-auto"><div className="flex min-w-max gap-2">
    {valid.map(k=>{const I=icons[k];return <button key={k} onClick={()=>{setType(k);setPropertyMode('all');navigate('/facilities?type='+k)}} className={'flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-bold '+(type===k?'bg-teal-600 text-white':'bg-gray-50 text-gray-700')}><I className="h-4 w-4"/><span>{labelsFor[k]}</span></button>})}
   </div></div>
   <div className="my-5 flex flex-wrap items-center gap-3"><span className="font-semibold">{c[2]}</span><select value={country} onChange={e=>setCountry(e.target.value)} className="rounded-xl border px-4 py-2.5 bg-white">{countries.map(x=><option key={x.key} value={x.key}>{x.name} · {x.city}</option>)}</select><div className="relative min-w-[240px] flex-1"><Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder={c[4]} className="w-full rounded-xl border bg-white py-2.5 ps-10 pe-3"/></div><select value={sort} onChange={e=>setSort(e.target.value)} className="rounded-xl border bg-white px-4 py-2.5"><option value="rating">{c[5]}</option><option value="name">{c[6]}</option><option value="location">{c[7]}</option></select></div>
   {type==='property'&&<div className="mb-5 flex gap-2"><button onClick={()=>setPropertyMode('all')} className={'rounded-xl px-4 py-2 '+(propertyMode==='all'?'bg-teal-600 text-white':'bg-white border')}>الكل</button><button onClick={()=>setPropertyMode('sale')} className={'rounded-xl px-4 py-2 '+(propertyMode==='sale'?'bg-teal-600 text-white':'bg-white border')}>{c[8]}</button><button onClick={()=>setPropertyMode('rent')} className={'rounded-xl px-4 py-2 '+(propertyMode==='rent'?'bg-teal-600 text-white':'bg-white border')}>{c[9]}</button></div>}
   <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
    {data.map((f:any)=><div key={f.id} className="overflow-hidden rounded-2xl bg-white border shadow-sm">
      <div className="h-44 bg-gray-100">
       {f.gallery_urls && f.gallery_urls.length > 0 ? <img src={f.gallery_urls[0]} alt={f.name} className="h-full w-full object-cover" /> : <div className="h-full grid place-items-center text-gray-300"><Building2 className="h-10 w-10"/></div>}
      </div>
      <div className="p-5">
       <div className="flex items-start gap-3"><div className="h-11 w-11 shrink-0 rounded-xl bg-teal-50 flex items-center justify-center"><Building2 className="h-5 w-5 text-teal-600"/></div><div className="min-w-0"><h3 className="font-bold truncate">{f.name}</h3><p className="text-sm text-gray-500 mt-1">{f.description}</p></div></div>
       <div className="mt-3 flex items-center gap-1 text-amber-500"><Star className="h-4 w-4 fill-current"/><span>{Number(f.rating||4.6).toFixed(1)}</span></div>
       <div className="mt-2 flex items-center gap-2 text-sm text-gray-500"><MapPin className="h-4 w-4"/><span>{f.address}</span></div>
       <div className="mt-4 grid grid-cols-1 gap-2"><button onClick={()=>navigate('/facilities/'+f.id)} className="w-full rounded-xl bg-teal-50 py-3 font-bold text-teal-700">{c[3]}</button>{type==='pharmacy'&&<button onClick={()=>{window.location.hash='pharmacy-store?id='+encodeURIComponent(f.id)}} className="w-full rounded-xl bg-green-600 py-3 font-bold text-white">تسوق الأدوية والسلة</button>}{type==='medical-supplies'&&<button onClick={()=>navigate('/medical-supplies')} className="w-full rounded-xl bg-indigo-600 py-3 font-bold text-white">فتح متجر الأدوات الطبية</button>}</div>
      </div>
     </div>)}
   </div>
  </div>
 </div>;
}
