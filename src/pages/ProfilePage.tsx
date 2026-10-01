import { useMemo, useState } from 'react';
import {
  Album, BookOpen, BriefcaseBusiness, CalendarClock, ChevronLeft, Copy, ExternalLink,
  Heart, Home, Library, MessageCircle, PackageOpen, Settings, Share2, Smartphone,
  Wallet, Stethoscope, Video, GraduationCap, Award, FileText, Users, ShoppingBag
} from 'lucide-react';
import PageProfileTools from '@/components/PageProfileTools';
import { getRole, type SB1Role } from '@/lib/access';

type ProfileTab={id:string;label:string;icon:any;ownerOnly?:boolean};
type ActivityKey='pharmacy'|'clinic'|'medical_center'|'home_nursing'|'ambulance'|'laboratory'|'other'|'generic';

const read=(key:string,fallback='')=>{
  if(typeof window==='undefined')return fallback;
  return localStorage.getItem(key)||fallback;
};

function activityKey(value:string):ActivityKey{
  const v=value.toLowerCase();
  if(v.includes('صيد')||v.includes('pharm'))return 'pharmacy';
  if(v.includes('عياد')||v.includes('clinic'))return 'clinic';
  if(v.includes('مركز')||v.includes('center'))return 'medical_center';
  if(v.includes('تمريض')||v.includes('nurs'))return 'home_nursing';
  if(v.includes('اسعاف')||v.includes('ambulance'))return 'ambulance';
  if(v.includes('مختبر')||v.includes('labor'))return 'laboratory';
  return 'other';
}

const roleNames:Record<SB1Role,string>={
  guest:'زائر',client:'عميل',specialist:'أخصائي',institution:'مؤسسة',
  delivery_worker:'عامل توصيل',property_owner:'صاحب منشأة',moderator:'مشرف',owner:'مالك'
};

function buildTabs(role:SB1Role,activity:ActivityKey,canManage:boolean):ProfileTab[]{
  const common:ProfileTab[]=[
    {id:'home',label:'الرئيسية',icon:Home},
    {id:'posts',label:'منشوراتي',icon:FileText,ownerOnly:true},
    {id:'favorites',label:'مفضلتي',icon:Heart,ownerOnly:true},
    {id:'albums',label:'ألبوماتي',icon:Album,ownerOnly:true},
  ];
  if(role==='specialist') return [
    {id:'home',label:'الرئيسية',icon:Home},
    {id:'sessions',label:'جلساتي',icon:CalendarClock,ownerOnly:true},
    {id:'articles',label:'مقالتي',icon:FileText},
    {id:'questions',label:'الأسئلة',icon:MessageCircle},
    {id:'recordings',label:'تسجيلاتي',icon:Video},
    {id:'courses',label:'الدورات والكورسات',icon:GraduationCap},
    {id:'certificates',label:'شهاداتي',icon:Award},
    {id:'posts',label:'منشوراتي',icon:FileText,ownerOnly:true},
    {id:'videos',label:'فيديوهاتي',icon:Video,ownerOnly:true},
    {id:'appointments',label:'مواعيدي',icon:CalendarClock,ownerOnly:true},
  ];
  if(role==='institution'){
    const business:ProfileTab[]=
      activity==='pharmacy'
        ? [{id:'products',label:'الأدوية',icon:ShoppingBag}]
        : [{id:'services',label:'خدماتي',icon:BriefcaseBusiness}];
    return [
      ...common.slice(0,1),
      ...business,
      {id:'certificates',label:'شهاداتي',icon:Award},
      {id:'courses',label:'دوراتي',icon:GraduationCap},
      ...common.slice(1),
      {id:'social',label:'منصات التواصل',icon:ExternalLink},
      {id:'phone',label:'الهاتف وQR',icon:Smartphone},
      ...(canManage?[{id:'settings',label:'الإعدادات',icon:Settings}]:[])
    ];
  }
  if(role==='client') return [
    {id:'home',label:'الرئيسية',icon:Home},
    {id:'courses',label:'دوراتي',icon:GraduationCap},
    {id:'posts',label:'منشوراتي',icon:FileText,ownerOnly:true},
    {id:'favorites',label:'مفضلتي',icon:Heart,ownerOnly:true},
    {id:'albums',label:'ألبوماتي',icon:Album,ownerOnly:true},
    {id:'social',label:'منصات التواصل',icon:ExternalLink},
    {id:'phone',label:'الهاتف وQR',icon:Smartphone},
  ];
  if(role==='delivery_worker') return [
    {id:'home',label:'الرئيسية',icon:Home},
    {id:'posts',label:'منشوراتي',icon:FileText,ownerOnly:true},
    {id:'favorites',label:'مفضلتي',icon:Heart,ownerOnly:true},
    {id:'albums',label:'ألبوماتي',icon:Album,ownerOnly:true},
    {id:'social',label:'منصات التواصل',icon:ExternalLink},
    {id:'phone',label:'الهاتف وQR',icon:Smartphone},
  ];
  return [...common,{id:'social',label:'منصات التواصل',icon:ExternalLink},{id:'phone',label:'الهاتف وQR',icon:Smartphone},...(canManage?[{id:'settings',label:'الإعدادات',icon:Settings}]:[])];
}

function LinkedActivity({role,activity}:{role:SB1Role;activity:ActivityKey}){
  if(role!=='institution')return null;
  const data:Record<ActivityKey,{title:string;body:string;items:string[]}>={
    pharmacy:{title:'الأدوية',body:'المحتوى المعروض هنا مرتبط بمنتجات الصيدلية. الشراء يتم من قسم الأدوية في SB1، وليس من الصفحة الاجتماعية.',items:['اسم الدواء وصورته','السعر والوصف','التوفر']},
    clinic:{title:'خدمات العيادة',body:'الخدمات المعروضة مرتبطة بقسم الخدمات والحجز في SB1. الصفحة هنا للعرض والتواصل فقط.',items:['الخدمة','الوصف','الموعد عند تفعيله']},
    medical_center:{title:'خدمات المركز',body:'الخدمات والأطباء مرتبطة بأقسام المركز داخل SB1.',items:['الخدمات','الأطباء','المواعيد حسب الخدمة']},
    home_nursing:{title:'خدمات التمريض المنزلي',body:'الخدمات مرتبطة بمقدمي التمريض والحجز في قسم الخدمات الأخرى.',items:['نوع التمريض','منطقة الخدمة','الحجز']},
    ambulance:{title:'خدمات الإسعاف',body:'الخدمات مرتبطة بطلبات النقل والإسعاف في القسم المختص.',items:['نوع المركبة','النطاق','طلب الخدمة']},
    laboratory:{title:'خدمات المختبر',body:'الفحوصات مرتبطة بقسم المختبر داخل SB1.',items:['الفحص','الوصف','السعر/الحجز']},
    other:{title:'خدماتي',body:'الخدمات يحددها مالك المؤسسة ويمكن أن تكون بخاصية موعد أو بدون موعد.',items:['الخدمة','التفاصيل','الحجز عند التفعيل']},
    generic:{title:'خدماتي',body:'الخدمات المرتبطة بهذه الصفحة تظهر هنا للعرض فقط.',items:['الخدمة','التفاصيل']}
  };
  const x=data[activity]||data.other;
  return <section className="rounded-2xl border bg-white p-4 shadow-sm">
    <div className="flex items-start gap-3"><div className="rounded-xl bg-teal-50 p-3 text-teal-700"><BriefcaseBusiness className="h-5 w-5"/></div><div><h2 className="font-black">{x.title}</h2><p className="mt-1 text-sm text-slate-500">{x.body}</p></div></div>
    <div className="mt-4 grid gap-2 sm:grid-cols-3">{x.items.map((item,i)=><div key={i} className="rounded-xl border bg-slate-50 p-3 text-sm font-bold">{item}</div>)}</div>
  </section>;
}

export default function ProfilePage(){
  const role=getRole();
  const canManage=['client','specialist','institution','delivery_worker','owner','moderator'].includes(role);
  const actualId=read('sb1_account_user_id','profile');
  const name=read('sb1_account_name',read('chat_name','صفحة SB1'));
  const avatar=read('sb1_account_avatar',read('chat_photo',''));
  const activity=activityKey(read('sb1_account_activity_type',read('sb1_institution_activity',read('sb1_business_type',''))));
  const tabs=useMemo(()=>buildTabs(role,activity,canManage),[role,activity,canManage]);
  const [active,setActive]=useState('home');

  const select=(id:string)=>{
    setActive(id);
    requestAnimationFrame(()=>document.getElementById('profile-content')?.scrollIntoView({behavior:'smooth',block:'start'}));
  };
  const visibleTabs=tabs.filter(t=>!t.ownerOnly||canManage);

  const focusSection:any=active==='albums'||active==='favorites'?'albums':
    active==='social'?'social':active==='phone'?'phone':active==='settings'?'settings':'home';

  const ownerTools=canManage?[
    {label:'الحساب والمحفظة',icon:Wallet,black:true,id:'wallet'},
    ...(role==='owner'||role==='specialist'?[{label:'الاستنساخ',icon:Copy,green:true,id:'clone'}]:[]),
    ...(role==='specialist'?[{label:'جدول أعمالي',icon:CalendarClock,id:'appointments'}]:[])
  ]:[];

  return <div dir="rtl" className="min-h-screen bg-slate-50">
    <div className="mx-auto w-full max-w-[1500px] px-2 sm:px-4 lg:px-6">
      <div className="grid min-w-0 grid-cols-[minmax(0,1fr)] xl:grid-cols-[minmax(0,1fr)_220px] gap-4 items-start">

        <main className="order-1 min-w-0">
          <section className="overflow-hidden rounded-2xl border bg-white shadow-sm">
            <div className="px-4 py-4 sm:px-6">
              <div className="flex min-w-0 items-center gap-3">
                <div className="h-20 w-20 shrink-0 overflow-hidden rounded-full border-4 border-white bg-teal-100 shadow">
                  {avatar?<img src={avatar} alt="" className="h-full w-full object-cover"/>:<div className="grid h-full place-items-center text-2xl font-black text-teal-700">{name.charAt(0)}</div>}
                </div>
                <div className="min-w-0 flex-1"><h1 className="truncate text-xl font-black">{name}</h1><p className="mt-1 text-sm text-slate-500">{roleNames[role]}{role==='institution'&&activity!=='other'?' · '+(activity==='pharmacy'?'صيدلية':activity==='home_nursing'?'تمريض منزلي':activity==='ambulance'?'سيارة إسعاف':activity==='clinic'?'عيادة':activity==='medical_center'?'مركز طبي':activity==='laboratory'?'مختبر':'خدمات أخرى'):''}</p></div>
                <div className="hidden sm:flex gap-2"><button className="rounded-xl border p-2" title="مشاركة"><Share2 className="h-4 w-4"/></button></div>
              </div>
            </div>
          </section>

          <nav className="sticky top-0 z-40 mt-2 overflow-hidden rounded-xl border bg-white shadow-sm">
            <div className="flex min-h-12 items-center gap-1 overflow-x-auto px-1 py-1">
              {visibleTabs.map(t=>{const Icon=t.icon;return <button key={t.id} onClick={()=>select(t.id)} className={'flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-[13px] font-bold transition active:bg-slate-200 '+(active===t.id?'bg-teal-700 text-white':'text-slate-700 hover:bg-teal-50')}><Icon className="h-4 w-4"/>{t.label}</button>})}
            </div>
          </nav>

          <div id="profile-content" className="mt-3 min-w-0 space-y-3">
            {active==='home'&&<PageProfileTools canManage={canManage} pageId={actualId} pageName={name} pageAvatar={avatar||undefined} focusSection="home"/>}
            {active==='posts'&&<PageProfileTools canManage={canManage} pageId={actualId} pageName={name} pageAvatar={avatar||undefined} focusSection="home" onlyOwn/>}
            {active==='albums'&&<PageProfileTools canManage={canManage} pageId={actualId} pageName={name} pageAvatar={avatar||undefined} focusSection="albums"/>}
            {active==='favorites'&&<PageProfileTools canManage={canManage} pageId={actualId} pageName={name} pageAvatar={avatar||undefined} focusSection="albums"/>}
            {['social','phone','settings'].includes(active)&&<PageProfileTools canManage={canManage} pageId={actualId} pageName={name} pageAvatar={avatar||undefined} focusSection={focusSection}/>}
            {active==='sessions'&&<PrivateNotice title="جلساتي" text="هذا القسم خاص بالأخصائي وصاحب الحساب فقط، ولا يظهر للزوار."/>}
            {active==='appointments'&&<PrivateNotice title="مواعيدي وجدول أعمالي" text="المواعيد والحجوزات تظهر لصاحب الحساب فقط. التنفيذ الفعلي للحجز يبقى في قسم المواعيد في SB1."/>}
            {active==='articles'&&<PublicNotice title="مقالتي" text="المقالات المنشورة يمكن للجمهور قراءتها من قسم المقالات المرتبط بالمحتوى."/>}
            {active==='questions'&&<PublicNotice title="الأسئلة" text="الأسئلة والإجابات العامة يمكن عرضها، أما الأسئلة الخاصة التي سألها صاحب الحساب فلا تظهر للعامة."/>}
            {active==='recordings'&&<PublicNotice title="تسجيلاتي" text="تسجيلات الأخصائي الخاصة ليست عامة. التسجيلات التي يختار نشرها ترتبط بقسم التسجيلات في SB1."/>}
            {active==='courses'&&<CoursesNotice role={role}/>}
            {active==='certificates'&&<PublicNotice title="شهاداتي" text="الشهادات الظاهرة للعامة تعرض كبيانات/إنجازات، بينما فتح المستند الأصلي يبقى لصاحب الحساب حسب الصلاحية."/>}
            {active==='videos'&&<PrivateNotice title="فيديوهاتي" text="هذا القسم خاص بصاحب الحساب."/>}
            {active==='products'&&<LinkedActivity role={role} activity={activity}/>}
            {active==='services'&&<LinkedActivity role={role} activity={activity}/>}
          </div>
        </main>

        <aside className="order-2 hidden xl:block min-w-0 border-r border-slate-200 pr-3">
          <div className="sticky top-14 space-y-2">
            {ownerTools.map(x=>{const Icon=x.icon;return <button key={x.id} onClick={()=>select(x.id)} className={'flex w-full items-center gap-2 rounded-xl px-3 py-3 text-sm font-extrabold shadow-sm '+(x.black?'bg-black text-white':x.green?'bg-emerald-100 text-emerald-800':'border bg-white text-slate-800')}><Icon className="h-4 w-4"/>{x.label}</button>})}
            <div className="rounded-xl border bg-white p-2">
              <button onClick={()=>select('home')} className="flex w-full items-center gap-2 border-b px-3 py-3 text-sm font-bold"><Home className="h-4 w-4 text-teal-600"/>الرئيسية</button>
              {visibleTabs.filter(t=>['favorites','albums','social','phone','settings'].includes(t.id)).map(t=>{const Icon=t.icon;return <button key={t.id} onClick={()=>select(t.id)} className="flex w-full items-center gap-2 border-b px-3 py-3 text-sm font-bold last:border-0"><Icon className="h-4 w-4"/>{t.label}</button>})}
            </div>
          </div>
        </aside>
      </div>
    </div>
  </div>;
}

function PrivateNotice({title,text}:{title:string;text:string}){return <section className="rounded-2xl border bg-white p-6 shadow-sm"><div className="flex items-center gap-3"><div className="rounded-xl bg-slate-100 p-3"><BriefcaseBusiness className="h-5 w-5"/></div><div><h2 className="font-black">{title}</h2><p className="mt-1 text-sm text-slate-500">{text}</p></div></div></section>}
function PublicNotice({title,text}:{title:string;text:string}){return <section className="rounded-2xl border bg-white p-6 shadow-sm"><h2 className="font-black">{title}</h2><p className="mt-2 text-sm leading-7 text-slate-600">{text}</p></section>}
function CoursesNotice({role}:{role:SB1Role}){return <section className="rounded-2xl border bg-white p-6 shadow-sm"><div className="flex items-center gap-3"><GraduationCap className="h-6 w-6 text-teal-700"/><div><h2 className="font-black">{role==='specialist'?'الدورات والكورسات':'دوراتي'}</h2><p className="mt-1 text-sm text-slate-500">تظهر هنا الدورات المفتوحة والدورات المسجل بها والحاصلة على الإكمال. فتح محتوى الدورة محصور بالحساب الذي يملك صلاحية الوصول، بينما تنفيذ الاشتراك/الدفع يبقى في قسم الدورات داخل SB1.</p></div></div><div className="mt-4 grid gap-3 sm:grid-cols-3">{['الدورات المفتوحة','قيد الدراسة','المكتملة'].map(x=><div key={x} className="rounded-xl border bg-slate-50 p-4 text-sm font-bold">{x}</div>)}</div></section>}
