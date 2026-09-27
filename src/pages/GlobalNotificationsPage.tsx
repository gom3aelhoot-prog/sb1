import { useEffect,useState } from 'react';
import { Bell,Globe,MessageCircle,Building2,Newspaper,ChevronLeft,RefreshCw } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { loadGlobalNotifications,NotificationItem } from '@/lib/notifications';

const icons:any={question:MessageCircle,community:Bell,facility:Building2,news:Newspaper,content:Newspaper};
export default function GlobalNotificationsPage(){
 const {lang,dir}=useI18n();const [items,setItems]=useState<NotificationItem[]>([]);const [loading,setLoading]=useState(true);
 const load=async()=>{setLoading(true);setItems(await loadGlobalNotifications(lang));setLoading(false)};useEffect(()=>{load();const id=setInterval(load,20000);return()=>clearInterval(id)},[lang]);
 const title=lang==='ar'?'الإشعارات العامة للموقع':lang==='ru'?'Общие уведомления сообщества':lang==='de'?'Globale Community-Benachrichtigungen':'Global Community Notifications';
 return <section dir={dir} className="min-h-screen bg-slate-50 py-10"><div className="mx-auto max-w-4xl px-4">
  <div className="rounded-3xl bg-gradient-to-br from-sky-600 to-cyan-500 p-7 text-white shadow-lg"><div className="flex items-center gap-4"><div className="rounded-2xl bg-white/15 p-3"><Globe className="h-8 w-8"/></div><div><h1 className="text-2xl font-extrabold">{title}</h1><p className="mt-1 text-sm text-white/85">{lang==='ar'?'أخبار وتفاعلات عامة لا تحتوي على معلومات خاصة بالحساب.':lang==='ru'?'Общие новости и активность без личных данных аккаунта.':'Public news and activity without private account data.'}</p></div><button onClick={load} className="ms-auto rounded-xl bg-white/15 p-3 hover:bg-white/25" title="تحديث"><RefreshCw className={loading?'animate-spin':''}/></button></div></div>
  <div className="mt-5 space-y-3">{items.map(n=>{const Icon=icons[n.kind]||Bell;return <a href={n.href||'#'} key={n.id} className="flex gap-4 rounded-2xl border bg-white p-5 shadow-sm hover:shadow-md"><div className="h-11 w-11 shrink-0 rounded-xl bg-sky-50 text-sky-700 grid place-items-center"><Icon/></div><div className="min-w-0 flex-1"><h2 className="font-bold text-slate-900">{n.title}</h2><p className="mt-1 text-sm leading-7 text-slate-600">{n.body}</p><time className="mt-2 block text-xs text-slate-400">{new Date(n.created_at).toLocaleString()}</time></div><ChevronLeft className="mt-3 h-5 w-5 text-slate-300"/></a>})}</div>
 </div></section>
}