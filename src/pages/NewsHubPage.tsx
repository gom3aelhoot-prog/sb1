import { useEffect,useMemo,useState } from 'react';
import { ArrowLeft, Bell, Camera, Heart, Image as ImageIcon, MessageCircle, Play, Share2, Newspaper, Send, Settings, UserRound, Video } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { useRouter } from '@/lib/router';

type NewsItem={id:string,title:string,body:string,image:string,kind:'news'|'article'|'video'|'reel',authorId:string,author:string,createdAt:string,likes:number};
type Profile={id:string,name:string,role:string,image:string,bio:string};

const profiles:Profile[]=[
 {id:'owner',name:'SB1 · المالك',role:'مالك الموقع',image:'/jamal-james.jpg',bio:'صفحة مالك SB1 لنشر الأخبار والمقالات والمحتوى الطبي وإدارة أخبار الموقع.'},
 {id:'admin-medical',name:'SB1 Medical Desk',role:'مشرف طبي',image:'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=500&q=80',bio:'فريق التحرير الطبي ومراجعة الأخبار والمحتوى التعليمي.'},
 {id:'admin-media',name:'SB1 Media Desk',role:'مشرف المحتوى',image:'https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=500&q=80',bio:'إدارة الفيديوهات والريلز والصور والنشرات المرئية.'},
];

const base:Record<string,NewsItem[]>={
ar:[
{id:'n1',title:'تحديث طبي يومي: النوم والصحة النفسية',body:'موجز تعليمي عن النوم وعلاقته بالصحة النفسية، مع نقاط عملية للنقاش مع المختص.',image:'https://images.unsplash.com/photo-1511295742362-92c96b1cf484?auto=format&fit=crop&w=1200&q=80',kind:'news',authorId:'admin-medical',author:'SB1 Medical Desk',createdAt:'2026-09-27',likes:41},
{id:'n2',title:'كيف نقرأ نتيجة فحص بصورة مبسطة؟',body:'شرح تثقيفي عام للأسئلة التي يمكن للمستخدم مناقشتها مع الطبيب عند استلام نتيجة فحص.',image:'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1200&q=80',kind:'article',authorId:'owner',author:'SB1 · المالك',createdAt:'2026-09-26',likes:35},
{id:'n3',title:'ريلز: معلومة طبية في دقيقة',body:'فيديو تعليمي قصير من قسم المحتوى في SB1.',image:'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&q=80',kind:'reel',authorId:'admin-media',author:'SB1 Media Desk',createdAt:'2026-09-25',likes:62},
],
en:[
{id:'n1',title:'Daily medical update: sleep and mental health',body:'Educational briefing on sleep and mental wellbeing with questions to discuss with a specialist.',image:'https://images.unsplash.com/photo-1511295742362-92c96b1cf484?auto=format&fit=crop&w=1200&q=80',kind:'news',authorId:'admin-medical',author:'SB1 Medical Desk',createdAt:'2026-09-27',likes:41},
{id:'n2',title:'How to understand a test result',body:'General educational guidance on questions to discuss with a clinician after receiving a report.',image:'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1200&q=80',kind:'article',authorId:'owner',author:'SB1 Owner',createdAt:'2026-09-26',likes:35},
{id:'n3',title:'Reel: one-minute medical fact',body:'A short educational video from SB1 media.',image:'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&q=80',kind:'reel',authorId:'admin-media',author:'SB1 Media Desk',createdAt:'2026-09-25',likes:62},
],
ru:[
{id:'n1',title:'Ежедневное медицинское обновление: сон и психическое здоровье',body:'Образовательный материал о сне и психическом благополучии.',image:'https://images.unsplash.com/photo-1511295742362-92c96b1cf484?auto=format&fit=crop&w=1200&q=80',kind:'news',authorId:'admin-medical',author:'SB1 Medical Desk',createdAt:'2026-09-27',likes:41},
{id:'n2',title:'Как понимать результат анализа',body:'Общие образовательные рекомендации и вопросы для обсуждения с врачом.',image:'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1200&q=80',kind:'article',authorId:'owner',author:'SB1 Owner',createdAt:'2026-09-26',likes:35},
{id:'n3',title:'Reels: медицинский факт за минуту',body:'Короткое образовательное видео SB1.',image:'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&q=80',kind:'reel',authorId:'admin-media',author:'SB1 Media Desk',createdAt:'2026-09-25',likes:62},
]
};
const fallback=base.en;

function localizedItems(lang:string){return base[lang]||fallback}
function label(lang:string,key:string){const d:any={ar:{news:'الأخبار',article:'مقال',video:'فيديو',reel:'ريلز',latest:'أحدث الأخبار',profiles:'حسابات الإدارة والمالك',site:'أخبار الموقع',open:'فتح الخبر',share:'نشر في أخبار الموقع',ticker:'شريط الأخبار',follow:'متابعة'},en:{news:'News',article:'Article',video:'Video',reel:'Reel',latest:'Latest news',profiles:'Owner & admin accounts',site:'Site News',open:'Open',share:'Publish to site news',ticker:'News ticker',follow:'Follow'},ru:{news:'Новости',article:'Статья',video:'Видео',reel:'Reels',latest:'Последние новости',profiles:'Владелец и администраторы',site:'Новости сайта',open:'Открыть',share:'Опубликовать в новостях',ticker:'Бегущая строка',follow:'Подписаться'}};return d[lang]?.[key]||d.en[key]}

export default function NewsHubPage(){
 const {lang,dir}=useI18n(); const {navigate}=useRouter(); const [ticker,setTicker]=useState(()=>localStorage.getItem('sb1_news_ticker')||'SB1 · آخر الأخبار الطبية والتعليمية'); const [items,setItems]=useState<NewsItem[]>(()=>{try{return JSON.parse(localStorage.getItem('sb1_site_news')||'null')||localizedItems(lang)}catch{return localizedItems(lang)}});
 useEffect(()=>{setItems(localizedItems(lang).concat(JSON.parse(localStorage.getItem('sb1_site_news_extra')||'[]')))},[lang]);
 const featured=items.slice(0,3);
 const saveTicker=()=>{localStorage.setItem('sb1_news_ticker',ticker)};
 return <div dir={dir} className="min-h-screen bg-[#f6f7f8] pt-24 pb-16">
  <div className="mx-auto max-w-6xl px-4">
   <div className="mb-4 overflow-hidden rounded-xl bg-slate-950 text-white"><div className="flex items-center gap-3 whitespace-nowrap py-3 px-4 animate-[pulse_2.5s_ease-in-out_infinite]"><Bell className="h-5 w-5 shrink-0 text-amber-300"/><span className="font-bold">{ticker}</span><span className="opacity-50">•</span><span>{new Date().toLocaleDateString(lang==='ar'?'ar-EG':lang)}</span></div></div>
   <div className="rounded-[28px] bg-white border shadow-sm overflow-hidden">
    <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-teal-800 p-7 text-white">
      <div className="flex flex-wrap items-center justify-between gap-4"><div><div className="flex items-center gap-2 text-teal-300"><Newspaper className="h-5 w-5"/><span className="font-bold">SB1</span></div><h1 className="mt-2 text-3xl font-black">{label(lang,'site')}</h1><p className="mt-2 text-white/75">أخبار ومقالات وصور وفيديوهات وريلز في واجهة اجتماعية واحدة.</p></div><button onClick={()=>navigate('/news/control')} className="rounded-xl bg-white/10 px-4 py-2 text-sm font-bold hover:bg-white/20"><Settings className="inline h-4 w-4 me-2"/>{label(lang,'ticker')}</button></div>
    </div>
    <div className="p-5">
      <div className="flex gap-3 overflow-x-auto pb-3">{profiles.map(p=><button key={p.id} onClick={()=>navigate('/news/profile/'+p.id)} className="min-w-[150px] rounded-2xl border bg-white p-3 text-center hover:border-teal-400"><img src={p.image} className="mx-auto h-16 w-16 rounded-full object-cover ring-2 ring-teal-500 p-0.5"/><div className="mt-2 font-bold text-sm">{p.name}</div><div className="text-xs text-gray-500">{p.role}</div></button>)}</div>
      <h2 className="mt-6 mb-4 text-xl font-black">{label(lang,'latest')}</h2>
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{featured.map(item=><article key={item.id} className="overflow-hidden rounded-3xl border bg-white shadow-sm"><div className="relative h-48"><img src={item.image} className="h-full w-full object-cover"/><span className="absolute top-3 start-3 rounded-full bg-black/70 px-3 py-1 text-xs font-bold text-white">{label(lang,item.kind)}</span>{item.kind!=='article'&&<div className="absolute inset-0 grid place-items-center"><div className="rounded-full bg-white/90 p-4">{item.kind==='reel'?<Play className="h-6 w-6 text-teal-700"/>:<Video className="h-6 w-6 text-teal-700"/>}</div></div>}</div><div className="p-5"><div className="flex items-center gap-2"><img src={profiles.find(p=>p.id===item.authorId)?.image} className="h-8 w-8 rounded-full object-cover"/><span className="text-xs font-bold">{item.author}</span></div><h3 className="mt-3 text-lg font-black">{item.title}</h3><p className="mt-2 text-sm leading-7 text-gray-600 line-clamp-3">{item.body}</p><div className="mt-4 flex items-center justify-between text-xs text-gray-500"><span>♥ {item.likes}</span><button onClick={()=>navigate('/news/'+item.id)} className="font-bold text-teal-700">{label(lang,'open')} <ArrowLeft className="inline h-4 w-4"/></button></div></div></article>)}</div>
    </div>
   </div>
  </div>
 </div>
}
