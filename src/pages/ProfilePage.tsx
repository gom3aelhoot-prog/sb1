import {useEffect,useMemo,useRef,useState} from 'react';
import {Award,BookOpen,CalendarClock,Copy,ExternalLink,FileText,GraduationCap,Heart,Home,Library,MessageCircle,Phone,Settings,Share2,Smartphone,Video,Wallet,Bell} from 'lucide-react';
import PageProfileTools from '@/components/PageProfileTools';
import ProfessionalSocialHub from '@/components/ProfessionalSocialHub';
import FavoritesPage from '@/pages/FavoritesPage';
import {getRole} from '@/lib/access';

type TabKey='home'|'sessions'|'articles'|'questions'|'recordings'|'courses'|'certificates'|'posts';
type MainSection='home'|'wallet'|'clone'|'work'|'favorites'|'albums'|'social'|'phone'|'settings';

const read=(key:string,fallback='')=>typeof window==='undefined'?fallback:localStorage.getItem(key)||fallback;

const clientTabs:{key:TabKey;label:string;icon:any}[]=[
  {key:'home',label:'الرئيسية',icon:Home},
  {key:'sessions',label:'جلساتي',icon:Video},
  {key:'articles',label:'مقالتي',icon:BookOpen},
  {key:'questions',label:'الأسئلة',icon:MessageCircle},
  {key:'recordings',label:'تسجيلاتي',icon:Video},
  {key:'courses',label:'الدورات والكورسات',icon:GraduationCap},
  {key:'certificates',label:'شهاداتي',icon:Award},
  {key:'posts',label:'منشوراتي',icon:FileText},
];

function ClientContent({tab}:{tab:TabKey}){
  if(tab==='sessions') return <section className="card p-5"><div className="flex items-center justify-between"><div><h2 className="text-xl font-extrabold">جلساتي</h2><p className="mt-1 text-sm text-slate-500">الجلسات التي حجزها العميل ومواعيده القادمة.</p></div><CalendarClock className="text-teal-700"/></div><div className="mt-5 grid gap-3 md:grid-cols-2"><div className="rounded-xl border bg-slate-50 p-4"><b>جلسات قادمة</b><p className="mt-2 text-sm text-slate-500">ستظهر الحجوزات والمواعيد هنا.</p></div><div className="rounded-xl border bg-slate-50 p-4"><b>الجلسات السابقة</b><p className="mt-2 text-sm text-slate-500">سجل جلسات العميل محفوظ هنا.</p></div></div></section>;
  if(tab==='articles') return <section className="card p-5"><h2 className="text-xl font-extrabold">مقالتي</h2><p className="mt-2 text-sm text-slate-500">المقالات التي حفظها العميل أو يتابعها تظهر هنا.</p></section>;
  if(tab==='questions') return <section className="card p-5"><h2 className="text-xl font-extrabold">الأسئلة</h2><p className="mt-2 text-sm text-slate-500">أسئلة العميل وإجاباته ومتابعاته.</p></section>;
  if(tab==='recordings') return <section className="card p-5"><h2 className="text-xl font-extrabold">تسجيلاتي</h2><p className="mt-2 text-sm text-slate-500">التسجيلات التي حفظها العميل أو شاركها.</p></section>;
  if(tab==='courses') return <section className="card p-5"><h2 className="text-xl font-extrabold">الدورات والكورسات</h2><p className="mt-2 text-sm text-slate-500">الدورات المسجل بها العميل والدورات المكتملة.</p></section>;
  if(tab==='certificates') return <section className="card p-5"><h2 className="text-xl font-extrabold">شهاداتي</h2><p className="mt-2 text-sm text-slate-500">شهادات الدورات والإنجازات الخاصة بالعميل.</p></section>;
  return null;
}

export default function ProfilePage(){
  const role=getRole();
  const accountId=read('sb1_account_user_id','client-profile');
  const name=read('sb1_account_name',read('chat_name','صفحة العميل'));
  const avatar=read('sb1_account_avatar',read('chat_photo',''));
  // ProfilePage is the signed-in client's own profile route. Keep its private tools
  // visible here; public specialist/institution pages use their own role-aware page.
  const canManage=role!=='guest'||!!accountId;
  const [activeTab,setActiveTab]=useState<TabKey>('home');
  const [mainSection,setMainSection]=useState<MainSection>('home');
  const [navPinned,setNavPinned]=useState(false);
  const navRef=useRef<HTMLDivElement|null>(null);
  const navPinY=useRef<number|null>(null);

  useEffect(()=>{
    const measure=()=>{
      const el=navRef.current;if(!el)return;
      navPinY.current=el.getBoundingClientRect().top+window.scrollY;
      setNavPinned(window.scrollY>=navPinY.current);
    };
    const onScroll=()=>{if(navPinY.current===null)measure();else setNavPinned(window.scrollY>=navPinY.current)};
    const t=window.setTimeout(measure,50);
    window.addEventListener('scroll',onScroll,{passive:true});
    window.addEventListener('resize',measure);
    return()=>{window.clearTimeout(t);window.removeEventListener('scroll',onScroll);window.removeEventListener('resize',measure)};
  },[]);

  const selectMain=(section:MainSection)=>{
    setMainSection(section);
    if(section!=='home')setActiveTab('home');
    requestAnimationFrame(()=>document.getElementById('profile-content')?.scrollIntoView({behavior:'smooth',block:'start'}));
  };
  const selectTab=(tab:TabKey)=>{
    setMainSection('home');setActiveTab(tab);
    requestAnimationFrame(()=>document.getElementById('profile-content')?.scrollIntoView({behavior:'smooth',block:'start'}));
  };

  const toolButton=(section:MainSection,label:string,Icon:any,cls:string='')=>
    <button onClick={()=>selectMain(section)} className={'flex w-full items-center gap-2 rounded-xl px-4 py-3 text-sm font-extrabold shadow-sm active:brightness-95 '+cls}><Icon className="h-4 w-4"/>{label}</button>;

  return <div dir="rtl" className="min-h-screen pt-2 pb-16">
    <style>{'@keyframes sb1bell{0%,100%{transform:rotate(0)}25%{transform:rotate(10deg)}75%{transform:rotate(-10deg)}}'}</style>
    <div className="mx-auto max-w-6xl px-3 sm:px-5 lg:px-8">
      <div className="relative">
        <aside className={`${navPinned?'fixed top-0 start-4':'absolute top-0 start-4'} z-[60] hidden max-h-[calc(100vh-1rem)] w-[15rem] overflow-y-auto border-s border-slate-300 bg-white ps-4 pe-1 shadow-sm xl:block`} aria-label="قائمة SB1 الرئيسية">
          <div className="space-y-2">
            {toolButton('wallet','الحساب والمحفظة',Wallet,'bg-black text-white')}
            {toolButton('clone','الاستنساخ',Copy,'bg-emerald-100 text-emerald-800')}
            {toolButton('work','جدول أعمالي',CalendarClock,'border border-slate-200 bg-white text-slate-800')}
            <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
              {toolButton('home','الرئيسية',Home,'rounded-none border-b text-slate-700')}
              {toolButton('favorites','مفضلتي',Heart,'rounded-none border-b text-slate-700')}
              {toolButton('albums','الألبومات',Library,'rounded-none border-b text-slate-700')}
              {toolButton('social','منصات التواصل',ExternalLink,'rounded-none border-b text-slate-700')}
              {toolButton('phone','الهاتف وQR',Smartphone,'rounded-none border-b text-slate-700')}
              {toolButton('settings','الإعدادات',Settings,'rounded-none text-slate-700')}
            </div>
            <div className="rounded-xl border bg-white p-3 text-center shadow-sm">
              <p className="mb-2 text-xs font-extrabold text-slate-700">QR الصفحة</p>
              <img src={'https://api.qrserver.com/v1/create-qr-code/?size=180x180&data='+encodeURIComponent((import.meta.env.VITE_PUBLIC_SITE_URL||window.location.origin).replace(/\\/$/,'')+'/profile')} alt="QR" className="mx-auto h-36 w-36 rounded-lg"/>
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
                  <button onClick={()=>navigator.share?.({title:name,url:window.location.href}).catch?.(()=>{})} className="flex items-center justify-center gap-2 rounded-xl border border-teal-200 bg-teal-50 px-6 py-2.5 text-sm font-semibold text-teal-700"><Share2 className="h-4 w-4"/> مشاركة صفحة SB1</button>
                  <button onClick={()=>selectMain('settings')} title="الإشعارات" className="relative grid h-11 w-11 self-center place-items-center rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-600"><Bell className="h-5 w-5"/></button>
                </div>
              </div>
            </div>
          </section>

          <div className="my-3 border-b-2 border-black" aria-hidden="true"/>

          <div className="mb-5 min-h-[58px] w-full" ref={navRef}>
            <div className={`${navPinned?'fixed inset-x-0 top-0 z-50':'relative z-50'} w-full overflow-hidden border bg-white shadow-sm`}>
              <div className="mx-auto max-w-6xl px-3 sm:px-5 lg:px-8">
                <div className="xl:ps-[17rem]">
                  <div className="grid w-full grid-cols-8">
                    {clientTabs.map((tab,i)=>{const Icon=tab.icon;return <button key={tab.key} onClick={()=>selectTab(tab.key)} className={`min-w-0 border-e px-0 py-1 text-[9px] font-bold leading-3 transition active:bg-slate-200 ${activeTab===tab.key&&mainSection==='home'?'bg-teal-50 text-teal-800':'text-slate-600 hover:bg-slate-50'}`} title={tab.label}><span className="flex min-w-0 flex-col items-center justify-center gap-0.5 text-center"><Icon className="h-3 w-3 text-teal-600"/><span className="break-words">{tab.label}</span></span></button>})}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div id="profile-content" className="mb-5">
            {mainSection==='home'&&activeTab==='home'&&<PageProfileTools canManage={canManage} pageId={accountId} pageName={name} pageAvatar={avatar||undefined} focusSection="home"/>}
            {mainSection==='home'&&activeTab==='posts'&&<PageProfileTools canManage={canManage} pageId={accountId} pageName={name} pageAvatar={avatar||undefined} focusSection="home" onlyOwn/>}
            {mainSection==='home'&&activeTab!=='home'&&activeTab!=='posts'&&<ClientContent tab={activeTab}/>}
            {mainSection==='favorites'&&<FavoritesPage/>}
            {mainSection==='albums'&&<PageProfileTools canManage={canManage} pageId={accountId} pageName={name} pageAvatar={avatar||undefined} focusSection="albums"/>}
            {mainSection==='social'&&<ProfessionalSocialHub/>}
            {mainSection==='phone'&&<PageProfileTools canManage={canManage} pageId={accountId} pageName={name} pageAvatar={avatar||undefined} focusSection="phone"/>}
            {mainSection==='settings'&&<PageProfileTools canManage={canManage} pageId={accountId} pageName={name} pageAvatar={avatar||undefined} focusSection="settings"/>}
            {mainSection==='clone'&&<PageProfileTools canManage={canManage} pageId={accountId} pageName={name} pageAvatar={avatar||undefined} focusSection="clone"/>}
            {mainSection==='wallet'&&<section className="card p-5"><h2 className="text-xl font-extrabold">الحساب والمحفظة</h2><p className="mt-2 text-sm text-slate-500">الرصيد والنقاط والمدفوعات الخاصة بالحساب.</p></section>}
            {mainSection==='work'&&<section className="card p-5"><div className="flex items-center justify-between"><div><h2 className="text-xl font-extrabold">جدول أعمالي</h2><p className="mt-2 text-sm text-slate-500">الحجوزات والجلسات القادمة ومواعيد العميل.</p></div><CalendarClock className="text-teal-700"/></div></section>}
          </div>
        </div>
      </div>
    </div>
  </div>;
}
