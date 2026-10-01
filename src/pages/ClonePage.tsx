import {useMemo} from 'react';
import {useRouter} from '@/lib/router';
import {roleLabel,type SB1Role} from '@/lib/access';
import {Shield,LayoutDashboard,Stethoscope,Building2,Truck,UserRound,Wrench,Settings} from 'lucide-react';

const roleMap:Record<string,SB1Role>={client:'client',institution:'institution',specialist:'specialist',delivery_worker:'delivery_worker',service:'client',admin:'moderator'};

const items=[
 {key:'dashboard_view',href:'/dashboard',label:'لوحة التحكم',icon:LayoutDashboard},
 {key:'profile_view',href:'/',label:'عرض الصفحة',icon:UserRound},
 {key:'posts_create',href:'/',label:'النشر',icon:Wrench},
 {key:'sessions_manage',href:'/specialist-appointments',label:'الجلسات والمواعيد',icon:Stethoscope},
 {key:'services_manage',href:'/services',label:'الخدمات',icon:Building2},
 {key:'delivery_manage',href:'/delivery',label:'التوصيل',icon:Truck},
 {key:'admin_content',href:'/admin/content',label:'إدارة المحتوى',icon:Shield},
 {key:'admin_users',href:'/admin-dashboard',label:'لوحة الإدارة',icon:Shield},
 {key:'profile_settings',href:'/settings',label:'إعدادات الصفحة',icon:Settings},
];

export default function ClonePage(){
 const {path}=useRouter();
 const id=path.split('/')[2]||'';
 const clone=useMemo(()=>{try{return (JSON.parse(localStorage.getItem('sb1_fb_clones')||'[]') as any[]).find(x=>x.id===id)||null}catch{return null}},[id]);
 if(!clone)return <div className="min-h-screen pt-24 p-6 text-center">الصفحة المستنسخة غير موجودة.</div>;
 const role=roleMap[clone.type]||'client';
 const permissions=new Set<string>(clone.permissions||[]);
 const allowed=items.filter(x=>permissions.has(x.key));
 const isAdmin=clone.type==='admin'&&permissions.has('dashboard_view');
 return <div dir="rtl" className="min-h-screen bg-slate-50 pt-24 pb-16"><div className="mx-auto max-w-6xl px-4">
  <div className="rounded-3xl bg-white border p-7 shadow-sm"><div className="flex items-center gap-3"><div className="grid h-12 w-12 place-items-center rounded-2xl bg-teal-50 text-teal-700"><UserRound/></div><div><div className="text-xs text-slate-500">{roleLabel(role,'ar')} · صفحة مستنسخة</div><h1 className="text-2xl font-black">{clone.name}</h1></div></div><p className="mt-3 text-sm text-slate-500">هذه الصفحة تعمل بالصلاحيات التي اختارها صاحب الصفحة عند الإنشاء فقط.</p></div>
  <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{allowed.map(x=>{const I=x.icon;return <a key={x.key} href={x.href} className="rounded-2xl bg-white border p-5 hover:border-teal-400 hover:shadow-md"><I className="text-teal-700"/><b className="mt-3 block">{x.label}</b><span className="mt-1 text-xs text-slate-400">{x.key}</span></a>})}</div>
  {isAdmin&&<div className="mt-5 rounded-2xl border bg-indigo-50 p-5"><b>لوحة التحكم الإدارية متاحة لأن صلاحية لوحة الإدارة مفعلة.</b></div>}
  {allowed.length===0&&<div className="mt-5 rounded-2xl border border-dashed bg-white p-10 text-center text-slate-500">لا توجد صلاحيات مفعلة لهذه الصفحة.</div>}
 </div></div>;
}
