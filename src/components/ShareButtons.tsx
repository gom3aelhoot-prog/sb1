import { Mail, MessageCircle, Send, Share2, Smartphone, Instagram, Facebook } from 'lucide-react';
import { useI18n } from '@/lib/i18n';

export default function ShareButtons({ title, url, compact=false }: { title:string; url?:string; compact?:boolean }) {
  const { lang } = useI18n();
  const href = url || (typeof window !== 'undefined' ? window.location.href : '');
  const text = title || 'SB1';
  const native = async () => {
    try { if (navigator.share) { await navigator.share({title:text,text,url:href}); return true; } } catch {}
    return false;
  };
  const copy = async () => { try { await navigator.clipboard.writeText(href); alert(lang==='ar'?'تم نسخ الرابط':'Link copied'); } catch {} };
  const items=[
    {label:'واتساب',icon:MessageCircle,action:()=>{window.open('https://wa.me/?text='+encodeURIComponent(text+'\n'+href),'_blank','noopener,noreferrer')}},
    {label:'فيسبوك',icon:Facebook,action:()=>{window.open('https://www.facebook.com/sharer/sharer.php?u='+encodeURIComponent(href),'_blank','noopener,noreferrer')}},
    {label:'تليجرام',icon:Send,action:()=>{window.open('https://t.me/share/url?url='+encodeURIComponent(href)+'&text='+encodeURIComponent(text),'_blank','noopener,noreferrer')}},
    {label:'SMS',icon:Smartphone,action:()=>{window.location.href='sms:?body='+encodeURIComponent(text+' '+href)}},
    {label:'بريد',icon:Mail,action:()=>{window.location.href='mailto:?subject='+encodeURIComponent(text)+'&body='+encodeURIComponent(href)}},
    {label:'Instagram',icon:Instagram,action:async()=>{if(!(await native()))await copy()}},
  ];
  return <div className={compact?'flex flex-wrap gap-1.5':'flex flex-wrap gap-2'} onClick={e=>e.stopPropagation()}>
    {items.map(({label,icon:Icon,action})=><button type="button" key={label} onClick={action} title={label} className={compact?'inline-flex items-center gap-1 rounded-lg border bg-white px-2 py-1 text-[11px] font-bold text-gray-600 hover:border-teal-400':'inline-flex items-center gap-2 rounded-xl border bg-white px-3 py-2 text-xs font-bold text-gray-700 hover:border-teal-400'}><Icon className={compact?'h-3.5 w-3.5':'h-4 w-4'}/>{label}</button>)}
    <button type="button" onClick={()=>native().then(ok=>!ok&&copy())} className={compact?'inline-flex items-center gap-1 rounded-lg bg-teal-50 px-2 py-1 text-[11px] font-bold text-teal-700':'inline-flex items-center gap-2 rounded-xl bg-teal-50 px-3 py-2 text-xs font-bold text-teal-700'}><Share2 className="h-4 w-4"/>مشاركة</button>
  </div>;
}