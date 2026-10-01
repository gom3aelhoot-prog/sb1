import { useMemo, useState } from 'react';
import { CalendarClock, Copy, ExternalLink, Heart, Home, Library, Settings, Share2, Smartphone, Wallet, Bell } from 'lucide-react';
import PageProfileTools from '@/components/PageProfileTools';
import { getRole } from '@/lib/access';

export default function ProfilePage(){
  const role=getRole();
  const canManage=role==='client'||role==='owner'||role==='moderator'||role==='specialist';
  const accountId=localStorage.getItem('sb1_account_user_id')||'client-profile';
  const name=localStorage.getItem('sb1_account_name')||localStorage.getItem('chat_name')||'صفحة العميل';
  const avatar=localStorage.getItem('sb1_account_avatar')||localStorage.getItem('chat_photo')||'';
  const [section,setSection]=useState<'home'|'favorites'|'albums'|'social'|'phone'|'settings'|'clone'|'wallet'|'work'>('home');
  const [tab,setTab]=useState('الرئيسية');
  const tabs=useMemo(()=>['الرئيسية','منشوراتي','مفضلتي','ألبوماتي','منصات التواصل','الهاتف وQR'],[]);
  const focus:any=section==='home'?'home':section==='favorites'?'albums':section==='albums'?'albums':section==='social'?'social':section==='phone'?'phone':section==='settings'?'settings':section==='clone'?'clone':section==='wallet'?'wallet':'home';
  const select=(s:any,label?:string)=>{setSection(s);if(label)setTab(label);setTimeout(()=>document.getElementById('profile-content')?.scrollIntoView({behavior:'smooth',block:'start'}),0)};
  return <div dir="rtl" className="min-h-screen bg-slate-50 pt-2 pb-16">
    <div className="mx-auto max-w-7xl px-3 sm:px-5 lg:px-8">
      <div className="grid min-w-0 xl:grid-cols-[15rem_minmax(0,1fr)] gap-4">
        <aside className="hidden xl:block order-2">
          <div className="sticky top-20 space-y-2">
            <div className="rounded-xl border bg-white p-2 shadow-sm">
              <button onClick={()=>select('wallet')} className="mb-2 flex w-full items-center gap-2 rounded-xl bg-black px-4 py-3 text-sm font-extrabold text-white"><Wallet className="h-4 w-4 text-amber-300"/>الحساب والمحفظة</button>
              {(role==='owner'||role==='specialist')&&<button onClick={()=>select('clone')} className="mb-2 flex w-full items-center gap-2 rounded-xl bg-emerald-100 px-4 py-3 text-sm font-extrabold text-emerald-800"><Copy className="h-4 w-4"/>الاستنساخ</button>}
              {canManage&&<button onClick={()=>select('work')} className="mb-2 flex w-full items-center justify-between rounded-xl border px-4 py-3 text-sm font-extrabold"><span className="flex items-center gap-2"><CalendarClock className="h-4 w-4 text-indigo-600"/>جدول أعمالي</span></button>}
              <button onClick={()=>select('home','الرئيسية')} className="flex w-full items-center gap-2 border-b px-4 py-3 text-sm font-bold"><Home className="h-4 w-4 text-teal-600"/>الرئيسية</button>
              <button onClick={()=>select('favorites','مفضلتي')} className="flex w-full items-center gap-2 border-b px-4 py-3 text-sm font-bold"><Heart className="h-4 w-4 text-rose-500"/>مفضلتي</button>
              <button onClick={()=>select('albums','ألبوماتي')} className="flex w-full items-center gap-2 border-b px-4 py-3 text-sm font-bold"><Library className="h-4 w-4 text-indigo-500"/>الألبومات</button>
              <button onClick={()=>select('social','منصات التواصل')} className="flex w-full items-center gap-2 border-b px-4 py-3 text-sm font-bold"><ExternalLink className="h-4 w-4 text-sky-500"/>منصات التواصل</button>
              <button onClick={()=>select('phone','الهاتف وQR')} className="flex w-full items-center gap-2 border-b px-4 py-3 text-sm font-bold"><Smartphone className="h-4 w-4 text-violet-500"/>الهاتف وQR</button>
              {canManage&&<button onClick={()=>select('settings')} className="flex w-full items-center gap-2 px-4 py-3 text-sm font-bold"><Settings className="h-4 w-4"/>الإعدادات</button>}
            </div>
          </div>
        </aside>
        <main className="min-w-0 order-1">
          <section className="overflow-hidden rounded-2xl border bg-white shadow-sm">
            <div className="h-28 bg-gradient-to-r from-teal-700 via-cyan-700 to-sky-700"></div>
            <div className="px-5 pb-4">
              <div className="-mt-10 flex items-end gap-4">
                <div className="h-24 w-24 overflow-hidden rounded-2xl border-4 border-white bg-teal-100 shadow-lg">
                  {avatar?<img src={avatar} alt="" className="h-full w-full object-cover"/>:<div className="grid h-full place-items-center text-2xl font-black text-teal-700">{name.charAt(0)}</div>}
                </div>
                <div className="pb-1"><h1 className="text-xl font-black">{name}</h1><p className="text-sm text-slate-500">عميل SB1 · صفحتي الشخصية</p></div>
                <div className="ms-auto flex gap-2 pb-1"><button className="rounded-xl border p-2"><Share2 className="h-4 w-4"/></button><button className="rounded-xl bg-emerald-50 p-2 text-emerald-700"><Bell className="h-4 w-4"/></button></div>
              </div>
            </div>
          </section>
          <div ref={(el)=>{if(el) el.id='profile-tabs'}} className="sticky top-0 z-30 mt-2 rounded-xl border bg-white shadow-sm">
            <div className="flex gap-1 overflow-x-auto p-1">{tabs.map(t=><button key={t} onClick={()=>select(t==='الرئيسية'?'home':t==='مفضلتي'?'favorites':t==='ألبوماتي'?'albums':t==='منصات التواصل'?'social':t==='الهاتف وQR'?'phone':'home',t)} className={'whitespace-nowrap rounded-lg px-4 py-2 text-sm font-bold '+(tab===t?'bg-slate-100 text-teal-700':'text-slate-600')}>{t}</button>)}</div>
          </div>
          <div id="profile-content" className="mt-2">
            <PageProfileTools canManage={canManage} pageId={accountId} pageName={name} pageAvatar={avatar||undefined} focusSection={focus}/>
          </div>
        </main>
      </div>
    </div>
  </div>;
}
