import type {ReactNode} from 'react';
import {getRole,routeAllowed,setPreviewRole,type SB1Role} from '@/lib/access';
export default function RoleGate({path,children}:{path:string;children:ReactNode}){
 const role=getRole();
 if(routeAllowed(path,role)) return <>{children}</>;
 const labels:any={ar:{title:'هذه الصفحة لحساب محدد',body:'سجّل الدخول بالحساب الصحيح للوصول إلى هذه الصفحة.',login:'تسجيل الدخول'},en:{title:'This area is for a specific account',body:'Sign in with the correct account to access this area.',login:'Sign in'}}[document.documentElement.lang||'ar']||{title:'هذه الصفحة لحساب محدد',body:'سجّل الدخول بالحساب الصحيح للوصول إلى هذه الصفحة.',login:'تسجيل الدخول'};
 const actual=typeof window!=='undefined'?(localStorage.getItem('sb1_account_role')||'guest') as SB1Role:'guest';
 const preview=typeof window!=='undefined'&&localStorage.getItem('sb1_preview_role');
 return <div dir="rtl" className="min-h-screen bg-slate-50 pt-28 px-5 grid place-items-center"><div className="max-w-xl w-full rounded-3xl bg-white border shadow-lg p-8 text-center"><div className="text-4xl">🔒</div><h1 className="mt-4 text-2xl font-black">{labels.title}</h1><p className="mt-3 text-slate-500 leading-7">{labels.body}</p><a href="/register" className="inline-block mt-6 rounded-xl bg-teal-700 text-white px-6 py-3 font-bold">{labels.login}</a>{actual==='owner'&&preview&&<button onClick={()=>{setPreviewRole(null);window.location.href='/owner/commands'}} className="block mx-auto mt-3 rounded-xl border px-5 py-2 font-bold">العودة إلى حساب المالك</button>}</div></div>
}