import { useEffect, useRef, useState } from 'react';
import { Award, BookOpen, CalendarClock, CalendarDays, Copy, ExternalLink, FileText, GraduationCap, Heart, Home, Library, MessageCircle, Phone, Settings, Share2, Smartphone, Video, Wallet, Bell, Bookmark, X, Coins, Wand2 } from 'lucide-react';
import PageProfileTools from '@/components/PageProfileTools';
import FavoritesPage from '@/pages/FavoritesPage';
import { getFollowing, isFollowing, toggleFollowing } from '@/lib/socialVault';
import { loadGlobalNotifications, loadPrivateNotifications, markPrivateRead, type NotificationItem } from '@/lib/notifications';

type TabKey='home'|'sessions'|'articles'|'questions'|'videos'|'recordings'|'courses'|'certificates'|'posts';
type MainSection='home'|'favorites'|'albums'|'social'|'phone'|'settings'|'clone'|'wallet'|'work';

const read=(key:string,fallback='')=>typeof window==='undefined'?fallback:localStorage.getItem(key)||fallback;
const readJson=<T,>(key:string,fallback:T):T=>{try{const v=localStorage.getItem(key);return v?JSON.parse(v):fallback}catch{return fallback}};

const clientTabs:{key:TabKey;icon:any}[]=[
  {key:'home',icon:Home},{key:'sessions',icon:Video},{key:'articles',icon:BookOpen},{key:'questions',icon:MessageCircle},{key:'videos',icon:Video},{key:'recordings',icon:Video},{key:'courses',icon:GraduationCap},{key:'certificates',icon:Award},{key:'posts',icon:FileText},
];

const demoFollowers=[
  ['د. ليان','https://randomuser.me/api/portraits/women/44.jpg'],
  ['د. أحمد','https://randomuser.me/api/portraits/men/32.jpg'],
  ['سارة','https://randomuser.me/api/portraits/women/68.jpg'],
  ['محمد','https://randomuser.me/api/portraits/men/75.jpg'],
  ['مركز الحياة','https://randomuser.me/api/portraits/women/65.jpg'],
];

function ClientTabContent({tab}:{tab:TabKey}){
  if(tab==='sessions') return <section className="card p-5"><div className="flex items-center justify-between gap-3"><div><h2 className="text-xl font-extrabold">جلساتي</h2><p className="mt-1 text-xs text-slate-500">جلسات العميل ومواعيده المحجوزة والسابقة.</p></div><CalendarDays className="text-teal-700"/></div><div className="mt-5 grid gap-3 md:grid-cols-2"><div className="rounded-xl border bg-slate-50 p-4"><b>الجلسات القادمة</b><p className="mt-2 text-sm text-slate-500">ستظهر هنا المواعيد التي حجزتها.</p></div><div className="rounded-xl border bg-slate-50 p-4"><b>الجلسات السابقة</b><p className="mt-2 text-sm text-slate-500">سجل الجلسات الخاصة بالحساب.</p></div></div></section>;
  if(tab==='articles') return <section className="card p-5"><h2 className="text-xl font-extrabold">مقالتي</h2><p className="mt-2 text-sm text-slate-500">المقالات التي يتابعها أو يحفظها العميل.</p></section>;
  if(tab==='questions') return <section className="card p-5"><h2 className="text-xl font-extrabold">الأسئلة</h2><p className="mt-2 text-sm text-slate-500">أسئلة العميل وإجاباته ومتابعاته.</p></section>;
  if(tab==='videos') return <section className="card p-5"><h2 className="text-xl font-extrabold">فيديوهاتي</h2><p className="mt-2 text-sm text-slate-500">الفيديوهات التي اشتراها هذا الحساب فقط. المحتوى المدفوع لا يُفتح للعامة.</p></section>;
  if(tab==='recordings') return <section className="card p-5"><h2 className="text-xl font-extrabold">تسجيلاتي</h2><p className="mt-2 text-sm text-slate-500">التسجيلات التي حفظها العميل أو شاركها.</p></section>;
  if(tab==='courses') return <section className="card p-5"><h2 className="text-xl font-extrabold">الدورات والكورسات</h2><p className="mt-2 text-sm text-slate-500">الدورات التي التحق بها العميل.</p></section>;
  if(tab==='certificates') return <section className="card p-5"><h2 className="text-xl font-extrabold">شهاداتي</h2><p className="mt-2 text-sm text-slate-500">الشهادات والإنجازات الخاصة بالعميل.</p></section>;
  return null;
}

export default function ProfilePage(){
  const accountId=read('sb1_account_user_id','');
  const profileUser=typeof window!=='undefined'?new URLSearchParams(window.location.search).get('user')||'':'';
  const name=profileUser||read('sb1_account_name',read('chat_name','صفحة العميل'));
  const followerDirectory:Record<string,string>={'د. ليان':'https://randomuser.me/api/portraits/women/44.jpg','د. أحمد':'https://randomuser.me/api/portraits/men/32.jpg','سارة':'https://randomuser.me/api/portraits/women/68.jpg','محمد':'https://randomuser.me/api/portraits/men/75.jpg','مركز الحياة':'https://randomuser.me/api/portraits/women/65.jpg'};
  const avatar=profileUser?followerDirectory[profileUser]||'':read('sb1_account_avatar',read('chat_photo',''));
  const effectiveProfileId=profileUser?'profile-user-'+encodeURIComponent(profileUser):(accountId||'profile');
  const accountRole=read('sb1_account_role','');
  const isPageOwner=read('sb1_is_page_owner','')==='true' || accountRole==='owner';
  const canManage=isPageOwner;
  const canClone=isPageOwner || (accountRole==='specialist' && name.includes('جمال'));
  const [activeTab,setActiveTab]=useState<TabKey>('home');
  const [mainSection,setMainSection]=useState<MainSection>('home');
  const [navPinned,setNavPinned]=useState(false);
  const [unread,setUnread]=useState(()=>Number(localStorage.getItem('sb1_unread_notifications')||'0'));
  const [language,setLanguage]=useState(()=>readJson('sb1_page_settings_profile',{language:'ar'}).language||'ar');
  const [notificationsOpen,setNotificationsOpen]=useState(false);
  const [notifications,setNotifications]=useState<NotificationItem[]>([]);
  const [followersOpen,setFollowersOpen]=useState(false);
  const [followingIds,setFollowingIds]=useState<string[]>(()=>getFollowing());
  const navRef=useRef<HTMLDivElement|null>(null);
  const pinY=useRef<number|null>(null);

  useEffect(()=>{document.querySelectorAll<HTMLButtonElement>('button').forEach((b)=>{if(!b.title){const label=(b.getAttribute('aria-label')||b.textContent||'').replace(/\\s+/g,' ').trim();if(label)b.title=label.slice(0,120)}})},[mainSection,activeTab,language]);

  useEffect(()=>{
    const measure=()=>{
      const el=navRef.current;if(!el)return;
      pinY.current=el.getBoundingClientRect().top+window.scrollY;
      setNavPinned(window.scrollY>=pinY.current);
    };
    const onScroll=()=>{if(pinY.current===null)measure();else setNavPinned(window.scrollY>=pinY.current)};
    const timer=window.setTimeout(measure,80);
    window.addEventListener('scroll',onScroll,{passive:true});
    window.addEventListener('resize',measure);
    return()=>{window.clearTimeout(timer);window.removeEventListener('scroll',onScroll);window.removeEventListener('resize',measure)};
  },[]);

  useEffect(()=>{
    const sync=()=>setUnread(Number(localStorage.getItem('sb1_unread_notifications')||'0'));

    const syncLang=()=>setLanguage(readJson('sb1_page_settings_profile',{language:'ar'}).language||'ar');
    const loadNotes=async()=>{const uid=accountId||'profile';const [g,p]=await Promise.all([loadGlobalNotifications(language),loadPrivateNotifications(language,uid)]);setNotifications([...p,...g].sort((a,b)=>new Date(b.created_at).getTime()-new Date(a.created_at).getTime()).slice(0,30));};
    loadNotes();
    window.addEventListener('storage',sync);
    window.addEventListener('sb1-settings-change',syncLang as EventListener);
    window.addEventListener('sb1:new-notification',sync as EventListener);
    const onSocial=()=>setFollowingIds(getFollowing());
    window.addEventListener('sb1-social-change',onSocial);
    return()=>{window.removeEventListener('storage',sync);window.removeEventListener('sb1-settings-change',syncLang as EventListener);window.removeEventListener('sb1:new-notification',sync as EventListener);window.removeEventListener('sb1-social-change',onSocial)};
  },[accountId,language]);

  const labels=language==='en'?{home:'Home',favorites:'Favorites',albums:'Albums',social:'Social platforms',phone:'Phone & QR',settings:'Settings',followers:'Followers',wallet:'Account & Wallet',work:'My schedule'}:language==='de'?{home:'Startseite',favorites:'Favoriten',albums:'Alben',social:'Soziale Plattformen',phone:'Telefon & QR',settings:'Einstellungen',followers:'Follower',wallet:'Konto & Wallet',work:'Mein Zeitplan'}:language==='ru'?{home:'Главная',favorites:'Избранное',albums:'Альбомы',social:'Соцсети',phone:'Телефон и QR',settings:'Настройки',followers:'Подписчики',wallet:'Аккаунт и кошелёк',work:'Мой график'}:{home:'الرئيسية',favorites:'مفضلتي',albums:'الألبومات',social:'منصات التواصل',phone:'الهاتف وQR',settings:'الإعدادات',followers:'المتابعون',wallet:'الحساب والمحفظة',work:'جدول أعمالي'};
  const goContent=()=>{
    requestAnimationFrame(()=>document.getElementById('profile-content')?.scrollIntoView({behavior:'smooth',block:'start'}));
  };
  const selectTab=(tab:TabKey)=>{
    setMainSection('home');setActiveTab(tab);goContent();
  };
  const selectMain=(section:MainSection)=>{
    setMainSection(section);setActiveTab('home');goContent();
  };

  const button=(section:MainSection,label:string,Icon:any,cls='')=>
    <button onClick={()=>selectMain(section)} className={'flex w-full items-center gap-2 rounded-xl px-4 py-3 text-sm font-extrabold shadow-sm active:brightness-95 '+cls}><Icon className="h-4 w-4"/>{label}</button>;

  const qrBase=(typeof window!=='undefined'?(import.meta.env.VITE_PUBLIC_SITE_URL||window.location.origin):'');
  const qrUrl=qrBase.replace(/\/$/,'')+'/profile';

  return <div lang={language} dir={language==='ar'?'rtl':'ltr'} className="min-h-screen pt-2 pb-16">
    <style>{'@keyframes sb1bell{0%,100%{transform:rotate(0)}25%{transform:rotate(10deg)}75%{transform:rotate(-10deg)}}'}</style>
    <div className="mx-auto max-w-6xl px-3 sm:px-5 lg:px-8">
      <div className="relative">
        <aside className={`${navPinned?'fixed top-0 start-4':'absolute top-0 start-4'} z-[60] hidden max-h-[calc(100vh-1rem)] w-[15rem] overflow-y-auto border-s border-slate-300 bg-white ps-4 pe-1 shadow-sm xl:block`} aria-label="قائمة SB1 الرئيسية">
          <div className="space-y-2">
            {button('wallet',labels.wallet,Wallet,'bg-black text-white')}
            {canClone&&button('clone','Clone',Wand2,'bg-lime-100 text-slate-800 border border-lime-200')}
            {button('work',labels.work,CalendarClock,'border border-slate-200 bg-white text-slate-800')}
            <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
              {button('home',labels.home,Home,'rounded-none border-b text-slate-700')}
              {button('favorites',labels.favorites,Heart,'rounded-none border-b text-slate-700')}
              {button('albums',labels.albums,Library,'rounded-none border-b text-slate-700')}
              {button('social',labels.social,ExternalLink,'rounded-none border-b text-slate-700')}
              {button('phone',labels.phone,Smartphone,'rounded-none border-b text-slate-700')}
              {button('settings',labels.settings,Settings,'rounded-none text-slate-700')}
            </div>
            <button type="button" onClick={()=>setFollowersOpen(true)} className="w-full rounded-xl border bg-white p-3 text-right shadow-sm hover:bg-slate-50 active:bg-slate-100">
              <div className="mb-2 flex items-center justify-between"><b className="text-sm"> {labels.followers} </b><span className="text-xs text-teal-700">{demoFollowers.length} · عرض الكل</span></div>
              <div className="flex flex-wrap gap-2">
                {demoFollowers.map(([n,p])=><a key={n} href={'/profile?user='+encodeURIComponent(n)} title={'فتح صفحة '+n} className="h-9 w-9 overflow-hidden rounded-full ring-2 ring-white shadow transition hover:scale-110"><img src={p} alt={n} className="h-full w-full object-cover"/></a>)}
              </div>
            </button>
            <div className="rounded-xl border bg-white p-3 text-center shadow-sm">
              <p className="mb-2 text-xs font-extrabold text-slate-700">QR الصفحة</p>
              <img src={'https://api.qrserver.com/v1/create-qr-code/?size=180x180&data='+encodeURIComponent(qrUrl)} alt="QR" className="mx-auto h-36 w-36 rounded-lg"/>
            </div>
          </div>
        </aside>

        <div className="min-w-0 xl:ps-[17rem]">
          <section className="card mb-2 border-teal-900 bg-teal-700 text-white">
            <div className="px-6 py-5">
              <div className="flex flex-col gap-4 md:flex-row">
                <div className="mx-auto flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-teal-100 ring-4 ring-white md:mx-0">
                  {avatar?<img src={avatar} alt={name} className="h-full w-full object-cover"/>:<span className="text-4xl font-bold text-teal-700">{name.charAt(0)}</span>}
                </div>
                <div className="flex-1 pt-2 text-center md:text-right">
                  <div className="mb-1 text-[10px] font-bold text-slate-300">الصورة الرسمية للحساب</div>
                  <h1 className="text-xl font-bold text-white">{name}</h1>
                  <p className="mt-1 text-sm font-medium text-emerald-300">عميل SB1 · صفحتي الشخصية</p>
                  <div className="mt-3 flex flex-wrap justify-center gap-3 text-xs text-slate-300 md:justify-start">
                    <span className="flex items-center gap-1"><Heart className="h-3.5 w-3.5 text-rose-300"/>مفضلتي</span>
                    <span className="flex items-center gap-1"><CalendarClock className="h-3.5 w-3.5 text-teal-300"/>جلساتي</span>
                    <span className="flex items-center gap-1"><GraduationCap className="h-3.5 w-3.5 text-teal-300"/>دوراتي</span>
                  </div>
                </div>
                <div className="flex flex-col justify-center gap-2">
                  <button onClick={()=>{try{navigator.share?.({title:name,url:window.location.href})}catch{}}} className="flex items-center justify-center gap-2 rounded-xl border border-teal-200 bg-teal-50 px-6 py-2.5 text-sm font-semibold text-teal-700"><Share2 className="h-4 w-4"/> مشاركة صفحة SB1</button>
                  <button onClick={()=>{setUnread(0);localStorage.setItem('sb1_unread_notifications','0');setNotificationsOpen(v=>!v)}} title="الإشعارات" className={`relative grid h-11 w-11 self-center place-items-center rounded-xl border ${unread?'border-red-200 bg-red-50 text-red-600 animate-[sb1bell_.5s_ease-in-out_infinite]':'border-emerald-200 bg-emerald-50 text-emerald-600'}`}><Bell className="h-5 w-5"/>{unread>0&&<span className="absolute -right-1 -top-1 grid min-h-5 min-w-5 place-items-center rounded-full bg-red-600 px-1 text-[10px] font-extrabold text-white">{unread}</span>}</button>
                </div>
              </div>
            </div>
          </section>

          <div className="my-3 border-b-2 border-black" aria-hidden="true"/>

          <div className="mb-5 min-h-[58px] w-full" ref={navRef}>
            <div className={`${navPinned?'fixed inset-x-0 top-0 z-50':'relative z-50'} w-full overflow-hidden border bg-white shadow-sm`}>
              <div className="mx-auto max-w-6xl px-3 sm:px-5 lg:px-8">
                <div className="xl:ms-[17rem]">
                  <div className="grid w-full grid-cols-9">
                    {clientTabs.map(tab=>{const Icon=tab.icon;const tabLabel=tab.key==='home'?labels.home:tab.key==='sessions'?'جلساتي':tab.key==='articles'?'مقالتي':tab.key==='questions'?'الأسئلة':tab.key==='videos'?'فيديوهاتي':tab.key==='recordings'?'تسجيلاتي':tab.key==='courses'?'الدورات والكورسات':tab.key==='certificates'?'شهاداتي':'منشوراتي';return <button key={tab.key} onClick={()=>selectTab(tab.key)} className={`min-w-0 border-e px-0 py-1 text-[9px] font-bold leading-3 transition active:bg-slate-200 ${activeTab===tab.key&&mainSection==='home'?'bg-teal-50 text-teal-800':'text-slate-600 hover:bg-slate-50'}`} title={tabLabel}><span className="flex min-w-0 flex-col items-center justify-center gap-0.5 text-center"><Icon className={["text-teal-600","text-blue-600","text-amber-600","text-violet-600","text-red-500","text-pink-600","text-indigo-600","text-yellow-500","text-emerald-600"][clientTabs.findIndex(x=>x.key===tab.key)]+" h-4 w-4"} strokeWidth={2.4}/><span className="break-words">{tabLabel}</span></span></button>})}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div id="profile-content" className="mb-5">
            {mainSection==='home'&&activeTab==='home'&&<PageProfileTools canManage={canManage} pageId={effectiveProfileId} pageName={name} pageAvatar={avatar||undefined} focusSection="home"/>}
            {mainSection==='home'&&activeTab!=='home'&&activeTab!=='posts'&&<ClientTabContent tab={activeTab}/>}
            {mainSection==='favorites'&&<FavoritesPage/>}
            {mainSection==='albums'&&<PageProfileTools canManage={canManage} pageId={effectiveProfileId} pageName={name} pageAvatar={avatar||undefined} focusSection="albums"/>}
            {mainSection==='social'&&<PageProfileTools canManage={canManage} pageId={effectiveProfileId} pageName={name} pageAvatar={avatar||undefined} focusSection="social"/>}
            {mainSection==='phone'&&<PageProfileTools canManage={true} pageId={effectiveProfileId} pageName={name} pageAvatar={avatar||undefined} focusSection="phone"/>}
            {mainSection==='settings'&&<PageProfileTools canManage={true} pageId={effectiveProfileId} pageName={name} pageAvatar={avatar||undefined} focusSection="settings"/>}
            {mainSection==='clone'&&canClone&&<PageProfileTools canManage={true} pageId={effectiveProfileId} pageName={name} pageAvatar={avatar||undefined} focusSection="clone"/>}
            {mainSection==='wallet'&&<section className="card p-5"><div className="flex items-center justify-between"><div><h2 className="text-xl font-extrabold">الحساب والمحفظة</h2><p className="mt-1 text-sm text-slate-500">الرصيد والنقاط وحركة الحساب.</p></div><Coins className="text-amber-500"/></div></section>}
            {mainSection==='work'&&<section className="card p-5"><div className="flex items-center justify-between"><div><h2 className="text-xl font-extrabold">جدول أعمالي</h2><p className="mt-1 text-sm text-slate-500">الجلسات والمواعيد والحجوزات الخاصة بالعميل.</p></div><CalendarClock className="text-indigo-600"/></div></section>}
          </div>
        </div>
      </div>
      {followersOpen&&<div className="fixed inset-0 z-[180] grid place-items-center bg-black/60 p-4" onClick={()=>setFollowersOpen(false)}>
        <div className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-2xl" onClick={e=>e.stopPropagation()} dir="rtl">
          <div className="flex items-center justify-between border-b pb-3"><div><h2 className="text-lg font-extrabold">المتابعون</h2><p className="mt-1 text-xs text-slate-500">يمكنك متابعة أو إلغاء متابعة الحسابات من هنا.</p></div><button onClick={()=>setFollowersOpen(false)} aria-label="إغلاق"><X className="h-5 w-5"/></button></div>
          <div className="mt-4 max-h-[60vh] space-y-2 overflow-y-auto">
            {demoFollowers.map(([n,p])=>{const followerId='demo-follower-'+n;const followed=followingIds.includes(followerId)||isFollowing(followerId);return <div key={followerId} className="flex items-center gap-3 rounded-xl border p-3"><a href={'/profile?user='+encodeURIComponent(n)} title={'فتح صفحة '+n} className="shrink-0"><img src={p} alt={n} className="h-11 w-11 rounded-full object-cover"/></a><div className="min-w-0 flex-1"><a href={'/profile?user='+encodeURIComponent(n)} className="block truncate font-bold hover:text-teal-700">{n}</a><span className="text-[11px] text-slate-500">متابع على SB1</span></div><button onClick={()=>{const next=toggleFollowing(followerId);setFollowingIds(next)}} className={'rounded-xl px-4 py-2 text-xs font-extrabold '+(followed?'border bg-white text-slate-700':'bg-teal-700 text-white')}>{followed?'متابَع':'متابعة'}</button></div>})}
          </div>
        </div>
      </div>}
      {notificationsOpen&&<div className="fixed end-4 top-16 z-[190] w-[min(92vw,30rem)]" onClick={()=>setNotificationsOpen(false)}><div className="w-full max-h-[70vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-3 shadow-2xl" onClick={e=>e.stopPropagation()}><div className="flex items-center justify-between border-b pb-3"><div><h2 className="text-lg font-extrabold">الإشعارات</h2><p className="mt-1 text-xs text-slate-500">إشعارات الحساب والحجوزات والأسئلة والتفاعلات.</p></div><button onClick={()=>setNotificationsOpen(false)} title="إغلاق"><X className="h-5 w-5"/></button></div><div className="mt-4 space-y-2">{notifications.map(n=><button key={n.id} onClick={async()=>{if(n.user_id)await markPrivateRead(n.id,n.user_id);if(n.href)window.location.href=n.href}} className={'w-full rounded-xl border p-3 text-right hover:bg-slate-50 '+(!n.read?'bg-teal-50':'')}><span className="me-2 inline-flex rounded-full bg-slate-100 p-2 align-middle"><Bell className={n.kind==='booking'?'h-4 w-4 text-indigo-600':n.kind==='wallet'?'h-4 w-4 text-amber-500':n.kind==='message'?'h-4 w-4 text-blue-600':n.kind==='question'?'h-4 w-4 text-violet-600':n.kind==='news'?'h-4 w-4 text-red-500':n.kind==='facility'?'h-4 w-4 text-emerald-600':'h-4 w-4 text-pink-600'}/></span><b>{n.title}</b><span className="mt-1 block text-xs text-slate-500">{n.body}</span><span className="mt-1 block text-[10px] text-slate-400">{new Date(n.created_at).toLocaleString()}</span></button>)}{!notifications.length&&<div className="py-8 text-center text-sm text-slate-400">لا توجد إشعارات.</div>}</div></div></div>}
    </div>
  </div>;
}