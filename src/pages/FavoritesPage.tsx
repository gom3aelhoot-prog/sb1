import { useState, useEffect } from 'react';
import { Heart, Stethoscope, FileText, Video, Pill, Calculator, BookOpen, Image as ImageIcon, CalendarDays, Gamepad2, Building2, HelpCircle, Bookmark, Mic } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { supabase, type Favorite } from '@/lib/supabase';
import { getWishlist } from '@/lib/commerce';
import { getSaved, type VaultItem } from '@/lib/socialVault';

const itemIcons: Record<string, typeof Heart> = {
  doctor: Stethoscope, article: FileText, video: Video, product: Pill, test: Calculator,
  course: BookOpen, image: ImageIcon, post: FileText, reel: Video, session: CalendarDays,
  book: BookOpen, game: Gamepad2, facility: Building2, question: HelpCircle, recording: Mic,
};

const labels: Record<string,string> = {
  doctor:'الأطباء والأخصائيون', article:'المقالات', video:'الفيديوهات', product:'المنتجات',
  test:'الاختبارات', course:'الدورات والكورسات', image:'الصور', post:'المنشورات',
  reel:'الريلز', session:'جلسات مفضلة', book:'الكتب', game:'الألعاب والتطبيقات',
  facility:'المرافق الطبية', question:'الأسئلة والأجوبة', recording:'التسجيلات',
};

export default function FavoritesPage() {
  const { t } = useI18n();
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  const load = async () => {
    const { data } = await supabase.from('favorites').select('*').order('created_at', { ascending: false });
    const localWishlist=getWishlist().map((x:any)=>({id:'local-'+x.item_type+'-'+x.item_id,item_type:x.item_type==='pharmacy'?'product':x.item_type,item_id:x.item_id,created_at:new Date().toISOString()}));
    const vault=getSaved().map((x:VaultItem)=>({
      id:'vault-'+x.id,item_type:x.kind,item_id:x.id,title:x.title,body:x.body,author:x.author,url:x.url,image_url:x.image_url,created_at:x.created_at
    }));
    setFavorites([...(data||[]),...localWishlist,...vault]);
    setLoading(false);
  };

  useEffect(()=>{load(); const fn=()=>load(); window.addEventListener('sb1-social-change',fn); return()=>window.removeEventListener('sb1-social-change',fn)},[]);

  const tabs = [
    {key:'all',label:t('common.all')},
    ...Object.entries(labels).map(([key,label])=>({key,label})),
  ];
  const filtered=activeTab==='all'?favorites:favorites.filter(f=>f.item_type===activeTab);

  return (
    <div dir="rtl" className="rounded-2xl border bg-slate-50 p-4">
      <div className="mb-4 flex items-center gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-xl bg-rose-50"><Heart className="h-5 w-5 text-rose-500"/></div>
        <div><h2 className="text-xl font-extrabold text-slate-800">مفضلتي</h2><p className="text-xs text-slate-500">كل ما تحفظه برمز الحفظ يصنف تلقائياً في القسم المناسب.</p></div>
      </div>
      <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
        {tabs.map(tab=><button key={tab.key} onClick={()=>setActiveTab(tab.key)} className={`shrink-0 rounded-full px-3 py-2 text-xs font-bold transition active:bg-slate-200 ${activeTab===tab.key?'bg-teal-700 text-white':'border bg-white text-slate-600 hover:bg-slate-50'}`}>{tab.label}</button>)}
      </div>
      {loading?<p className="py-10 text-center text-slate-500">{t('common.loading')}</p>:
      filtered.length===0?<div className="py-14 text-center"><Bookmark className="mx-auto mb-3 h-10 w-10 text-slate-200"/><p className="text-sm text-slate-400">لا توجد عناصر محفوظة في هذا القسم بعد.</p></div>:
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((fav:any)=>{
          const Icon=itemIcons[fav.item_type]||Heart;
          return <article key={fav.id} className="overflow-hidden rounded-xl border bg-white shadow-sm">
            {fav.image_url&&<img src={fav.image_url} alt="" className="h-36 w-full object-cover"/>}
            <div className="p-4">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-teal-50"><Icon className="h-5 w-5 text-teal-700"/></div>
                <div className="min-w-0"><b className="block truncate text-sm">{fav.title||labels[fav.item_type]||fav.item_type}</b><span className="text-[11px] text-slate-400">{labels[fav.item_type]||fav.item_type}</span></div>
              </div>
              {fav.body&&<p className="mt-3 line-clamp-3 text-xs leading-6 text-slate-600">{fav.body}</p>}
              {fav.author&&<p className="mt-2 text-[11px] text-slate-400">{fav.author}</p>}
            </div>
          </article>
        })}
      </div>}
    </div>
  );
}
