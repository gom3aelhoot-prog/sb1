import { MessageCircle, Send, Smartphone, ShieldCheck, Globe2, Share2 } from 'lucide-react';
import { useI18n } from '@/lib/i18n';

const apps=[
 {name:'WhatsApp',url:'https://wa.me/?text=',icon:'🟢',desc:'فتح واتساب ومشاركة رابط SB1'},
 {name:'Telegram',url:'https://t.me/share/url?url=',icon:'🔵',desc:'فتح تيليجرام ومشاركة الرابط'},
 {name:'BiP',url:'https://web.bip.com/',icon:'💬',desc:'فتح BiP Web'},
 {name:'MAX',url:'https://web.max.ru/',icon:'🔷',desc:'فتح MAX Web'},
 {name:'Viber',url:'https://www.viber.com/',icon:'🟣',desc:'فتح Viber'},
 {name:'Signal',url:'https://signal.org/',icon:'🔒',desc:'فتح Signal'},
 {name:'Messenger',url:'https://www.messenger.com/',icon:'💙',desc:'فتح Messenger'},
 {name:'Instagram',url:'https://www.instagram.com/',icon:'📷',desc:'فتح Instagram'},
 {name:'Facebook',url:'https://www.facebook.com/',icon:'f',desc:'فتح Facebook'},
 {name:'YouTube',url:'https://www.youtube.com/',icon:'▶️',desc:'فتح YouTube'},
 {name:'TikTok',url:'https://www.tiktok.com/',icon:'♪',desc:'فتح TikTok'},
 {name:'LinkedIn',url:'https://www.linkedin.com/',icon:'in',desc:'فتح LinkedIn'},
];

export default function SocialAppsPage(){
 const {lang,dir}=useI18n();
 const title=lang==='ar'?'التواصل والتطبيقات المرتبطة':lang==='ru'?'Связь и приложения':lang==='de'?'Kommunikation und Apps':'Communication & apps';
 const share=async()=>{const data={title:'SB1',text:'SB1 — منصة طبية',url:location.origin};try{if(navigator.share&&navigator.canShare?.(data))await navigator.share(data);else await navigator.clipboard?.writeText(location.origin)}catch{}};
 return <div dir={dir} className="min-h-screen bg-gray-50 pt-24 pb-16"><div className="mx-auto max-w-6xl px-4">
  <div className="rounded-3xl bg-white border p-6 md:p-8 shadow-sm"><div className="flex items-center gap-4"><div className="h-14 w-14 rounded-2xl bg-teal-600 text-white grid place-items-center"><Share2/></div><div><h1 className="text-2xl font-black">{title}</h1><p className="text-sm text-gray-500 mt-1">تطبيقات خارجية تفتح من SB1. تسجيل الدخول والرسائل تبقى داخل التطبيق نفسه.</p></div></div>
  <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">{apps.map(a=><div key={a.name} className="rounded-2xl border bg-white p-5 hover:shadow-md transition"><div className="flex items-center gap-3"><span className="text-3xl">{a.icon}</span><div className="font-extrabold">{a.name}</div></div><p className="text-xs text-gray-500 mt-3 min-h-8">{a.desc}</p><button onClick={()=>{const u=a.name==='WhatsApp'?a.url+encodeURIComponent(location.href):a.name==='Telegram'?a.url+encodeURIComponent(location.href)+'&text='+encodeURIComponent('SB1'):a.url;window.open(u,'_blank','noopener,noreferrer')}} className="mt-4 w-full rounded-xl bg-teal-600 text-white py-2.5 font-bold">فتح</button></div>)}</div>
  <div className="mt-6 rounded-2xl bg-teal-50 border border-teal-100 p-5"><div className="flex gap-3"><ShieldCheck className="text-teal-700 shrink-0"/><div><h2 className="font-extrabold">مشاركة آمنة</h2><p className="text-sm text-gray-600 mt-1">زر المشاركة العام يستخدم واجهة المشاركة التي يوفرها الجهاز، لذلك لا نعطي SB1 صلاحية قراءة حسابات التطبيقات الأخرى.</p><button onClick={share} className="mt-3 rounded-xl bg-white border px-4 py-2 font-bold">مشاركة SB1 من الهاتف</button></div></div></div>
 </div></div></div>
}