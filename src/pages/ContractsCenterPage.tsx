import { useEffect, useMemo, useState } from 'react';
import { Download, Plus, Trash2, Save, Power, FileText, ExternalLink } from 'lucide-react';
import { supabase } from '@/lib/supabase';

type Contract = { id:string; title:string; category:string; language:string; body:string; enabled:boolean; version:number; disabledUntil:string };
const seed:Contract[]=[
 {id:'specialist-registration',title:'استمارة تسجيل الأخصائي',category:'registration',language:'ar',body:'الاسم القانوني الكامل\nالتخصص\nرقم الترخيص المهني\nالدولة والمدينة\nبيانات التواصل',enabled:true,version:1,disabledUntil:''},
 {id:'specialist-contract',title:'عقد وشروط الأخصائي',category:'specialist',language:'ar',body:'يلتزم الأخصائي بصحة بياناته ووثائقه وترخيصه.\nيحافظ على سرية بيانات العملاء.\nتحدد الأسعار والعمولات وفق سياسة SB1.',enabled:true,version:1,disabledUntil:''},
 {id:'institution-registration',title:'استمارة تسجيل المؤسسة الطبية',category:'registration',language:'ar',body:'اسم المؤسسة ونوعها.\nالترخيص والجهة المانحة.\nالعنوان والدولة والمدينة.\nالخدمات والأسعار وساعات العمل.',enabled:true,version:1,disabledUntil:''},
 {id:'pharmacy-contract',title:'عقد الصيدلية',category:'pharmacy',language:'ar',body:'تقر الصيدلية بصحة الترخيص.\nتلتزم بقواعد البيع والتوصيل والقوانين المحلية.',enabled:true,version:1,disabledUntil:''},
];
const load=()=>{try{const x=JSON.parse(localStorage.getItem('sb1_contract_center_templates')||'null');return Array.isArray(x)&&x.length?x:seed}catch{return seed}};
export default function ContractsCenterPage(){
 const [authorized,setAuthorized]=useState<boolean|null>(null);
 const [items,setItems]=useState<Contract[]>(load);
 const [selected,setSelected]=useState('');
 const [notice,setNotice]=useState('');
 useEffect(()=>{try{const a=JSON.parse(localStorage.getItem('admin_auth')||'null');setAuthorized(!!a&&['owner','moderator','content_manager','support'].includes(a.role))}catch{setAuthorized(false)}},[]);
 useEffect(()=>{if(!selected&&items[0])setSelected(items[0].id)},[items,selected]);
 useEffect(()=>{(async()=>{try{const {data}=await supabase.from('contract_templates').select('*').order('updated_at',{ascending:false});if(data?.length){const mapped=data.map((x:any)=>({id:x.id,title:x.title,category:x.category,language:x.language||'ar',body:x.body||'',enabled:x.is_active!==false,version:x.version||1,disabledUntil:x.disabled_until||''}));setItems(mapped);localStorage.setItem('sb1_contract_center_templates',JSON.stringify(mapped))}}catch{}})()},[]);
 const current=useMemo(()=>items.find(x=>x.id===selected)||items[0], [items,selected]);
 const save=(next:Contract[])=>{setItems(next);localStorage.setItem('sb1_contract_center_templates',JSON.stringify(next))};
 if(authorized===null)return <div className="min-h-screen grid place-items-center">جارٍ التحقق...</div>;
 if(!authorized)return <div className="min-h-screen grid place-items-center p-6"><div className="rounded-2xl bg-white border p-8 text-center"><h1 className="text-xl font-bold">غير مصرح</h1><a href="/admin" className="mt-4 inline-block rounded-xl bg-teal-700 text-white px-5 py-3">العودة للوحة التحكم</a></div></div>;
 if(!current)return null;
 const update=(patch:Partial<Contract>)=>save(items.map(x=>x.id===current.id?{...x,...patch,version:x.version+1}:x));
 const add=()=>{const n={id:'custom-'+Date.now(),title:'استمارة جديدة',category:'custom',language:'ar',body:'اكتب بنود الاستمارة هنا.',enabled:true,version:1,disabledUntil:''};save([...items,n]);setSelected(n.id)};
 const remove=()=>{if(items.length<2)return;const next=items.filter(x=>x.id!==current.id);save(next);setSelected(next[0].id)};
 const persist=async()=>{try{await supabase.from('contract_templates').upsert({id:current.id,template_key:current.id,title:current.title,category:current.category,language:current.language,body:current.body,is_active:current.enabled,disabled_until:current.disabledUntil||null,version:current.version,updated_at:new Date().toISOString()});setNotice('تم الحفظ.')}catch{setNotice('تم الحفظ محلياً.')}};
 const exportText=()=>{const blob=new Blob([current.title+'\n\n'+current.body],{type:'text/plain;charset=utf-8'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=current.id+'.txt';a.click();URL.revokeObjectURL(a.href)};
 return <div dir="rtl" className="min-h-screen bg-slate-50 pt-24 pb-16"><div className="mx-auto max-w-6xl px-4">
  <div className="rounded-3xl bg-slate-900 p-7 text-white"><h1 className="text-2xl font-extrabold">مركز إدارة العقود والاستمارات</h1><p className="mt-2 text-white/70">إنشاء وتعديل وحفظ واستيراد نماذج العقود من مكان واحد.</p></div>
  <div className="mt-6 grid gap-5 lg:grid-cols-[280px_1fr]">
   <aside className="rounded-2xl bg-white border p-3"><div className="flex items-center justify-between mb-3"><b>الوثائق</b><button onClick={add} className="rounded-lg bg-teal-50 p-2 text-teal-700"><Plus className="h-4 w-4"/></button></div>{items.map(x=><button key={x.id} onClick={()=>setSelected(x.id)} className={'w-full text-right rounded-xl p-3 mb-1 '+(x.id===current.id?'bg-teal-50':'hover:bg-slate-50')}><div className="font-bold text-sm">{x.title}</div><div className="text-xs text-slate-400">v{x.version} · {x.enabled?'مفعلة':'معطلة'}</div></button>)}</aside>
   <main className="rounded-2xl bg-white border p-6"><div className="flex flex-wrap justify-between gap-3"><div><h2 className="text-xl font-extrabold">{current.title}</h2><p className="text-sm text-slate-500">الإصدار {current.version}</p></div><div className="flex gap-2"><button onClick={persist} className="rounded-xl bg-teal-700 text-white px-4 py-2"><Save className="inline h-4 w-4"/> حفظ</button><button onClick={exportText} className="rounded-xl bg-slate-100 px-4 py-2"><Download className="inline h-4 w-4"/> تصدير</button><button onClick={remove} className="rounded-xl bg-red-50 text-red-700 px-3"><Trash2 className="inline h-4 w-4"/></button></div></div>
    <input value={current.title} onChange={e=>update({title:e.target.value})} className="mt-5 w-full rounded-xl border p-3 font-bold"/>
    <textarea value={current.body} onChange={e=>update({body:e.target.value})} rows={18} className="mt-3 w-full rounded-2xl border p-4 leading-8"/>
    <div className="mt-4 flex flex-wrap gap-2"><button onClick={()=>update({enabled:!current.enabled})} className="rounded-xl bg-slate-100 px-4 py-2"><Power className="inline h-4 w-4"/> {current.enabled?'تعطيل':'تفعيل'}</button><button onClick={()=>update({disabledUntil:new Date(Date.now()+86400000).toISOString(),enabled:false})} className="rounded-xl bg-amber-50 text-amber-700 px-4 py-2">تعطيل 24 ساعة</button></div>
    {notice&&<p className="mt-4 rounded-xl bg-emerald-50 p-3 text-emerald-700">{notice}</p>}
    <div className="mt-6 rounded-2xl bg-slate-50 p-5"><h3 className="font-bold">المعاينة</h3><div className="mt-3 whitespace-pre-wrap rounded-xl bg-white border p-5 leading-8"><h4 className="font-extrabold text-lg">{current.title}</h4>{current.body}</div></div>
    <a href="/admin" className="mt-5 inline-flex items-center gap-2 text-teal-700"><ExternalLink className="h-4 w-4"/> لوحة الإدارة</a>
   </main>
  </div>
 </div></div>;
}