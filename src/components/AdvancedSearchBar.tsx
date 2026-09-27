import {useMemo,useState} from 'react';
import {Search,ChevronDown} from 'lucide-react';
import {useI18n} from '@/lib/i18n';
import {useRouter} from '@/lib/router';
import {countriesForLanguage,serviceCitiesForCountry,specialtyCatalog} from '@/lib/catalog';

type Props={compact?:boolean};
const typeMap=[['doctor','أخصائي'],['clinic','عيادة'],['pharmacy','صيدلية'],['lab','مختبر'],['radiology','أشعة'],['rehab','تأهيل'],['physio','علاج طبيعي'],['addiction','علاج إدمان'],['elderly','رعاية مسنين'],['medical-supplies','أدوات طبية'],['property','مكان طبي للإيجار'],['article','مقالة'],['video','فيديو'],['audio','تسجيل صوتي'],['library','مكتبة']] as const;

export default function AdvancedSearchBar({compact=true}:Props){
 const {lang,dir}=useI18n(); const {navigate}=useRouter(); const countries=countriesForLanguage(lang);
 const [q,setQ]=useState(''); const [kind,setKind]=useState('doctor'); const [country,setCountry]=useState(''); const [city,setCity]=useState(''); const [age,setAge]=useState('all'); const [specialty,setSpecialty]=useState('');
 const facilityMode=['clinic','pharmacy','lab','radiology','rehab','physio','addiction','elderly','medical-supplies','property'].includes(kind);
 const cities=useMemo(()=>country?serviceCitiesForCountry(country):[],[country]);
 const labels:any={
 ar:{placeholder:'ابحث عن طبيب أو متخصص أو خدمة أو دواء أو مؤسسة...',country:'الدولة',city:'المدينة',age:'العمر',specialty:'التخصص',choose:'اختيار نوع البحث',search:'بحث',all:'الكل',doctor:'الأخصائيون',facility:'المرافق',article:'المقالات',video:'الفيديو',audio:'التسجيل الصوتي',library:'المكتبة',clinic:'عيادة',pharmacy:'صيدلية',lab:'مختبر',radiology:'الأشعة',rehab:'تأهيل',physio:'علاج طبيعي',addiction:'علاج إدمان',elderly:'رعاية مسنين','medical-supplies':'أدوات طبية',property:'مكان طبي للإيجار'},
 en:{placeholder:'Search for a doctor, specialist, service, medicine or facility...',country:'Country',city:'City',age:'Age',specialty:'Specialty',choose:'Search type',search:'Search',all:'All',doctor:'Specialists',facility:'Facilities',article:'Articles',video:'Videos',audio:'Audio',library:'Library',clinic:'Clinic',pharmacy:'Pharmacy',lab:'Lab',radiology:'Radiology',rehab:'Rehabilitation',physio:'Physiotherapy',addiction:'Addiction Care',elderly:'Elderly Care','medical-supplies':'Medical Supplies',property:'Medical Property'}
 }[lang]||{};
 const go=(e:any)=>{e.preventDefault();const p=new URLSearchParams();if(q.trim())p.set('q',q.trim());p.set('kind',kind);if(country)p.set('country',country);if(facilityMode&&city)p.set('city',city);if(kind==='doctor'){if(age!=='all')p.set('age',age);if(specialty)p.set('specialty',specialty);}if(facilityMode)p.set('service',kind);navigate('/search?'+p.toString());};
 const choose=(k:string)=>{setKind(k as any);setCity('');if(k!=='doctor'){setAge('all');setSpecialty('');}};
 return <form onSubmit={go} dir={dir} className={compact?'w-full':''}>
  <div className="relative">
   <Search className="pointer-events-none absolute start-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"/>
   <input value={q} onChange={e=>setQ(e.target.value)} placeholder={labels.placeholder} className="w-full rounded-2xl border border-gray-200 bg-white py-4 ps-12 pe-24 text-sm shadow-lg shadow-gray-900/5 outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-100"/>
   <button type="submit" className="absolute end-2 top-1/2 -translate-y-1/2 rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-700">{labels.search}</button>
  </div>
  <div className="mt-3 flex flex-wrap gap-2">
   <label className="flex min-w-[150px] flex-1 items-center rounded-xl border border-gray-200 bg-white px-3 shadow-sm"><select value={country} onChange={e=>{setCountry(e.target.value);setCity('')}} className="w-full bg-transparent py-2.5 text-sm outline-none"><option value="">{labels.country}</option>{countries.map(c=><option key={c.key} value={c.key}>{c.name}</option>)}</select><ChevronDown className="h-4 w-4 text-gray-400"/></label>
   {facilityMode&&<label className="flex min-w-[150px] flex-1 items-center rounded-xl border border-gray-200 bg-white px-3 shadow-sm"><select value={city} onChange={e=>setCity(e.target.value)} disabled={!country} className="w-full bg-transparent py-2.5 text-sm outline-none disabled:text-gray-400"><option value="">{labels.city}</option>{cities.map(c=><option key={c} value={c}>{c}</option>)}</select><ChevronDown className="h-4 w-4 text-gray-400"/></label>}
   {kind==='doctor'&&<label className="flex min-w-[120px] flex-1 items-center rounded-xl border border-gray-200 bg-white px-3 shadow-sm"><select value={age} onChange={e=>setAge(e.target.value)} className="w-full bg-transparent py-2.5 text-sm outline-none"><option value="all">{labels.age}</option><option value="young">أقل من 35</option><option value="mid">35–49</option><option value="senior">50+</option></select></label>}
   {kind==='doctor'&&<label className="flex min-w-[190px] flex-[1.4] items-center rounded-xl border border-gray-200 bg-white px-3 shadow-sm"><select value={specialty} onChange={e=>setSpecialty(e.target.value)} className="w-full bg-transparent py-2.5 text-sm outline-none"><option value="">{labels.specialty}</option>{specialtyCatalog(lang).map(s=><option key={s.slug} value={s.slug}>{s.name}</option>)}</select></label>}
  </div>
  <div className="mt-3 flex flex-wrap gap-2">
   <span className="flex items-center text-xs font-bold text-gray-500">{labels.choose}:</span>
   {typeMap.map(([k,ar])=><button type="button" key={k} onClick={()=>choose(k)} className={'rounded-full border px-3 py-2 text-xs font-bold transition '+(kind===k?'border-primary-600 bg-primary-600 text-white':'border-gray-200 bg-white text-gray-700 hover:border-primary-300')}>{labels[k]||ar}</button>)}
  </div>
 </form>;
}