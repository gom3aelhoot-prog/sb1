import {useEffect,useMemo,useRef,useState} from 'react';
import {Album,CalendarClock,Copy,ExternalLink,FileText,Heart,Home,MessageCircle,QrCode,Settings,Share2,Smartphone,Wallet,Video,GraduationCap} from 'lucide-react';
import PageProfileTools from '@/components/PageProfileTools';
import ProfessionalSocialHub from '@/components/ProfessionalSocialHub';
import {getRole,type SB1Role} from '@/lib/access';

type Tab={id:string;label:string;icon:any;ownerOnly?:boolean};
const read=(k:string,f='')=>typeof window==='undefined'?f:localStorage.getItem(k)||f;

function makeClientTabs(manage:boolean):Tab[]{
  return [
    {id:'home',label:'الرئيسية',icon:Home},
    {id:'courses',label:'دوراتي',icon:GraduationCap},
    {id:'posts',label:'منشوراتي',icon:FileText,ownerOnly:true},
    {id:'favorites',label:'مفضلتي',icon:Heart,ownerOnly:true},
    {id:'albums',label:'ألبوماتي',icon:Album,ownerOnly:true},
    {id:'social',label:'منصات التواصل',icon:ExternalLink},
    {id:'phone',label:'الهاتف وQR',icon:Smartphone},
    ...(manage?[{id:'settings',label:'الإعدادات',icon:Settings,ownerOnly:true}]:[])
  ];
}

function Notice({title,text}:{title:string;text:string}){
  return <section className="rounded-2xl border bg-white p-6 shadow-sm">
    <h2 className="font-black">{title}</h2>
    <p className="mt-2 text-sm leading-7 text-slate-600">{text}</p>
  </section>;
}

export default function ProfilePage(){
  const rawRole=getRole();
  const accountRole=read('sb1_account_role','guest') as SB1Role;
  const accountId=read('sb1_account_user_id','');
  const isOwn=!!accountId && accountId!=='profile';
  const role:SB1Role=accountRole!=='guest'?accountRole:(rawRole!=='guest'?rawRole:(isOwn?'client':'guest'));
  const manage=isOwn && ['client','specialist','institution','delivery_worker','owner','moderator'].includes(role);
  const name=read('sb1_account_name',read('chat_name','صفحة العميل'));
  const avatar=read('sb1_account_avatar',read('chat_photo',''));
  const tabs=useMemo(()=>makeClientTabs(manage),[manage]);
  const visible=tabs.filter(t=>!t.ownerOnly||manage);
  const [active,setActive]=useState('home');
  const navRef=useRef<HTMLElement|null>(null);
  const [navPinned,setNavPinned]=useState(false);

  useEffect(()=>{
    const check=()=>setNavPinned(!!navRef.current&&navRef.current.getBoundingClientRect().top<=1);
    check(); addEventListener('scroll',check,{passive:true}); addEventListener('resize',check);
    return()=>{removeEventListener('scroll',check);removeEventListener('resize',check)};
  },[]);

  const select=(id:string)=>{
    setActive(id);
    requestAnimationFrame(()=>document.getElementById('profile-content')?.scrollIntoView({behavior:'smooth',block:'start'}));
  };

  return <div dir="rtl" className="min-h-screen bg-slate-50 pb-16">
    <div className="mx-auto w-full max-w-[1500px] px-2 sm:px-4 lg:px-6">
      <div className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1fr)_225px] items-start">
        <main className="min-w-0">
          <section className="rounded-2xl border bg-white shadow-sm">
            <div className="p-5 sm:p-6 flex min-w-0 items-center gap-3">
              <div className="h-20 w-20 shrink-0 overflow-hidden rounded-full border-4 border-white bg-teal-100 shadow">
                {avatar?<img src={avatar} alt="" className="h-full w-full object-cover"/>:<div className="grid h-full place-items-center text-2xl font-black text-teal-700">{name.charAt(0)}</div>}
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="truncate text-xl font-black">{name}</h1>
                <p className="mt-1 text-sm text-slate-500">عميل SB1 · صفحتي الشخصية</p>
              </div>
              <button className="rounded-xl border p-2" title="مشاركة"><Share2 className="h-4 w-4"/></button>
            </div>
          </section>

          <nav ref={navRef as any} className={'sticky z-40 mt-2 overflow-hidden rounded-xl border bg-white shadow-sm '+(navPinned?'top-0':'top-0')}>
            <div className="flex min-h-12 items-center gap-1 overflow-x-auto px-1 py-1">
              {visible.map(t=>{const Icon=t.icon;return <button key={t.id} onClick={()=>select(t.id)} className={'flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-[13px] font-bold transition active:bg-slate-200 '+(active===t.id?'bg-teal-700 text-white':'text-slate-700 hover:bg-teal-50')}><Icon className="h-4 w-4"/>{t.label}</button>})}
            </div>
          </nav>

          <div id="profile-content" className="mt-3 min-w-0">
            {active==='home'&&<PageProfileTools canManage={manage} pageId={accountId||'client-profile'} pageName={name} pageAvatar={avatar||undefined} focusSection="home"/>}
            {active==='posts'&&<PageProfileTools canManage={manage} pageId={accountId||'client-profile'} pageName={name} pageAvatar={avatar||undefined} focusSection="home" onlyOwn/>}
            {active==='albums'&&<PageProfileTools canManage={manage} pageId={accountId||'client-profile'} pageName={name} pageAvatar={avatar||undefined} focusSection="albums"/>}
            {active==='favorites'&&<PageProfileTools canManage={manage} pageId={accountId||'client-profile'} pageName={name} pageAvatar={avatar||undefined} focusSection="albums"/>}
            {active==='social'&&<ProfessionalSocialHub/>}
            {active==='phone'&&<PageProfileTools canManage={manage} pageId={accountId||'client-profile'} pageName={name} pageAvatar={avatar||undefined} focusSection="phone"/>}
            {active==='settings'&&<PageProfileTools canManage={manage} pageId={accountId||'client-profile'} pageName={name} pageAvatar={avatar||undefined} focusSection="settings"/>}
            {active==='courses'&&<Notice title="دوراتي" text="الدورات التي اشترك بها العميل والدورات المكتملة تظهر هنا، مع بقاء الاشتراك والدفع مرتبطين بأقسام SB1 الفعلية."/>}
            {active==='wallet'&&manage&&<Notice title="الحساب والمحفظة" text="الرصيد والمعاملات والمدفوعات الخاصة بالحساب تظهر هنا لصاحب الحساب فقط."/>}
            {active==='appointments'&&manage&&<Notice title="جدول أعمالي" text="مواعيد العميل والحجوزات والجلسات القادمة تظهر هنا لصاحب الحساب."/>}
          </div>
        </main>

        <aside className="hidden xl:block min-w-0 border-r border-slate-200 pr-3">
          <div className="sticky top-14 space-y-2">
            {manage&&<button onClick={()=>select('wallet')} className="flex w-full items-center gap-2 rounded-xl bg-black px-3 py-3 text-sm font-extrabold text-white"><Wallet className="h-4 w-4"/>الحساب والمحفظة</button>}
            {manage&&<button onClick={()=>select('appointments')} className="flex w-full items-center gap-2 rounded-xl border bg-white px-3 py-3 text-sm font-extrabold"><CalendarClock className="h-4 w-4"/>جدول أعمالي</button>}
            {manage&&<div className="rounded-xl border bg-white p-2">
              {visible.filter(t=>['home','favorites','albums','social','phone','settings'].includes(t.id)).map(t=>{const Icon=t.icon;return <button key={t.id} onClick={()=>select(t.id)} className="flex w-full items-center gap-2 border-b px-3 py-3 text-sm font-bold last:border-0"><Icon className="h-4 w-4"/>{t.label}</button>})}
            </div>}
            {!manage&&<div className="rounded-xl border bg-white p-4 text-sm text-slate-500">أدوات الحساب الخاصة تظهر لصاحب الصفحة فقط.</div>}
          </div>
        </aside>
      </div>
    </div>

  </div>;
}
