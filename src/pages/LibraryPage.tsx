import { useEffect, useMemo, useState } from 'react';
import { BookOpen, Newspaper, Wrench, Heart, MessageCircle, ExternalLink, Search, Users } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { specialtyCatalog, virtualLibraryForSpecialty, virtualDoctorsForSpecialty } from '@/lib/catalog';
import { supabase } from '@/lib/supabase';

const labels:any={
 ar:{title:'مكتبة التخصصات',sub:'أخبار وأبحاث وخدمات وكتب وتفاعلات الأخصائيين في صفحة واحدة.',news:'الأخبار والأبحاث',services:'الخدمات',books:'الكتب',interactions:'تفاعلات الأخصائيين',choose:'اختر التخصص',all:'كل التخصصات',open:'فتح المصدر',empty:'لا يوجد محتوى بعد لهذا التخصص.'},
 en:{title:'Specialty Library',sub:'News, research, services, books and specialist activity in one feed.',news:'News & Research',services:'Services',books:'Books',interactions:'Specialist Activity',choose:'Choose specialty',all:'All specialties',open:'Open source',empty:'No content yet for this specialty.'},
 ru:{title:'Библиотека специальностей',sub:'Новости, исследования, услуги, книги и активность специалистов.',news:'Новости и исследования',services:'Услуги',books:'Книги',interactions:'Активность специалистов',choose:'Выберите специальность',all:'Все специальности',open:'Открыть источник',empty:'Пока нет контента для этого направления.'},
 de:{title:'Fachbibliothek',sub:'Nachrichten, Forschung, Leistungen, Bücher und Spezialisten-Aktivität.',news:'News & Forschung',services:'Leistungen',books:'Bücher',interactions:'Aktivität der Spezialisten',choose:'Fachgebiet wählen',all:'Alle Fachgebiete',open:'Quelle öffnen',empty:'Noch kein Inhalt für dieses Fachgebiet.'}
};
export default function LibraryPage(){
 const {lang,dir}=useI18n(); const t=labels[lang]||labels.en;
 const [slug,setSlug]=useState(''); const [tab,setTab]=useState('news'); const [feed,setFeed]=useState<any[]>([]); const [posts,setPosts]=useState<any[]>([]);
 const specs=useMemo(()=>specialtyCatalog(lang),[lang]); const selected=specs.find((s:any)=>s.slug===slug);
 useEffect(()=>{fetch('/library-feed.json',{cache:'no-store'}).then(r=>r.json()).then(x=>setFeed(Array.isArray(x.items)?x.items:[])).catch(()=>setFeed([]));},[]);
 useEffect(()=>{supabase.from('specialist_posts').select('*, doctor(*)').order('created_at',{ascending:false}).limit(40).then(({data})=>{if(data?.length)setPosts(data);}).catch(()=>{});},[]);
 const news=feed.filter(x=>!slug||x.specialty_slug===slug).slice(0,80);
 const books=slug?virtualLibraryForSpecialty(slug,lang,24):specs.slice(0,30).flatMap((s:any)=>virtualLibraryForSpecialty(s.slug,lang,2));
 const services=slug?Array.from({length:8},(_,i)=>({id:i,name:(selected as any)?.name||'Medical service',price:15+i*5})):specs.slice(0,20).map((s:any,i)=>({id:s.slug,name:s.name,price:20+i*3}));
 const fallbackPosts=slug?virtualDoctorsForSpecialty(slug,lang,8):specs.slice(0,8).flatMap((s:any)=>virtualDoctorsForSpecialty(s.slug,lang,1));
 const interactions=(posts.length?posts:fallbackPosts).filter((p:any)=>!slug||p.doctor?.specialty?.slug===slug||p.specialty?.slug===slug).slice(0,40);
 return <div dir={dir} className="min-h-screen bg-gray-50 pt-24 pb-16"><div className="mx-auto max-w-7xl px-4">
  <div className="rounded-3xl bg-gradient-to-br from-teal-700 to-cyan-600 p-7 text-white"><h1 className="text-3xl font-extrabold">{t.title}</h1><p className="mt-2">{t.sub}</p></div>
  <div className="mt-5 rounded-2xl border bg-white p-4"><div className="mb-2 flex items-center gap-2 font-bold"><Search className="h-4 w-4 text-teal-600"/>{t.choose}</div><select value={slug} onChange={e=>setSlug(e.target.value)} className="w-full rounded-xl border px-4 py-3"><option value="">{t.all}</option>{specs.map((s:any)=><option key={s.slug} value={s.slug}>{s.name}</option>)}</select></div>
  <div className="my-5 grid grid-cols-2 gap-2 md:grid-cols-4">{[['news',Newspaper,t.news],['services',Wrench,t.services],['books',BookOpen,t.books],['interactions',Users,t.interactions]].map((x:any)=><button key={x[0]} onClick={()=>setTab(x[0])} className={`rounded-xl px-4 py-3 font-bold ${tab===x[0]?'bg-teal-600 text-white':'border bg-white text-gray-700'}`}><x[1] className="mx-auto mb-1 h-5 w-5"/>{x[2]}</button>)}</div>
  {tab==='news'&&<div className="space-y-4">{news.map((n:any)=><article key={n.id} className="rounded-2xl border bg-white p-5"><div className="flex items-start justify-between"><div><span className="text-xs font-bold text-teal-600">{n.source||'Medical source'}</span><h2 className="mt-1 text-lg font-bold">{n.title}</h2></div><Newspaper className="h-6 w-6 text-teal-600"/></div><p className="mt-2 text-sm leading-7 text-gray-600">{n.summary||''}</p>{n.source_url&&<a href={n.source_url} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-teal-700">{t.open}<ExternalLink className="h-4 w-4"/></a>}</article>)}{!news.length&&<Empty text={t.empty}/>}</div>}
  {tab==='services'&&<div className="grid gap-4 md:grid-cols-3">{services.map((s:any)=><div key={s.id} className="rounded-2xl border bg-white p-5"><Wrench className="h-7 w-7 text-amber-600"/><h3 className="mt-3 font-bold">{s.name}</h3><p className="mt-2 text-sm text-gray-500">خدمات وحجز ومواعيد مرتبطة بالتخصص.</p><b className="mt-4 block">{s.price} USD</b></div>)}</div>}
  {tab==='books'&&<div className="grid gap-4 md:grid-cols-3">{books.map((b:any)=><div key={b.id} className="rounded-2xl border bg-white p-5"><BookOpen className="h-7 w-7 text-indigo-600"/><h3 className="mt-3 font-bold">{b.title}</h3><p className="mt-2 text-sm text-gray-500">{b.description||''}</p></div>)}</div>}
  {tab==='interactions'&&<div className="mx-auto max-w-3xl space-y-4">{interactions.map((p:any)=><article key={p.id} className="rounded-2xl border bg-white p-5"><div className="flex items-center gap-3"><div className="grid h-11 w-11 place-items-center rounded-full bg-teal-100 text-teal-700"><Heart className="h-5 w-5"/></div><div><b>{p.name||p.doctor?.name||'SB1 Specialist'}</b><p className="text-xs text-gray-400">{p.specialty?.name||selected?.name||''}</p></div></div><p className="mt-4 leading-7">{p.body||p.content||'مشاركة تعليمية جديدة من الأخصائي.'}</p><div className="mt-4 flex gap-5 border-t pt-3 text-sm text-gray-500"><span><Heart className="inline h-4 w-4"/> {p.likes_count||p.likes||20}</span><span><MessageCircle className="inline h-4 w-4"/> {p.comments_count||p.comments||3}</span></div></article>)}</div>}
 </div></div>
}
function Empty({text}:{text:string}){return <div className="rounded-2xl border bg-white p-12 text-center text-gray-400">{text}</div>}
