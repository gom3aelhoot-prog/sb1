import { useEffect, useState } from 'react';
import { Eye, ShieldCheck } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { getRole } from '@/lib/access';

type Row={id:string;applicant_type:string;full_name:string;email:string;phone:string|null;license_number:string|null;frame_1_path:string;frame_2_path:string;frame_3_path:string;status:string;created_at:string};

export default function FaceVerificationReviewPage(){
 const role=getRole();
 const allowed=role==='owner'||role==='moderator';
 const [rows,setRows]=useState<Row[]>([]);
 const [urls,setUrls]=useState<Record<string,string[]>>({});
 useEffect(()=>{if(!allowed)return;(async()=>{const {data}=await supabase.from('sb1_face_verification_submissions').select('*').order('created_at',{ascending:false});const list=(data||[]) as Row[];setRows(list);for(const row of list){const paths=[row.frame_1_path,row.frame_2_path,row.frame_3_path];const signed:string[]=[];for(const path of paths){const r=await supabase.storage.from('sb1-face-verification').createSignedUrl(path,300);if(r.data?.signedUrl)signed.push(r.data.signedUrl);}setUrls(v=>({...v,[row.id]:signed}));}})()},[allowed]);
 if(!allowed)return <div className="min-h-screen grid place-items-center bg-slate-50 p-6"><div className="card p-8 text-center"><ShieldCheck className="mx-auto h-10 w-10 text-red-600"/><h1 className="mt-4 text-2xl font-extrabold">هذه الملفات خاصة</h1><p className="mt-2 text-gray-500">ملفات التحقق متاحة للمالك والمشرفين فقط.</p></div></div>;
 return <div className="min-h-screen bg-gray-50 py-10"><div className="mx-auto max-w-7xl px-4"><div className="mb-6"><h1 className="text-3xl font-extrabold">مراجعة ملفات التحقق</h1><p className="mt-1 text-sm text-gray-500">ثلاث لقطات للمتقدم، محفوظة داخل SB1 دون ربط بخدمة مطابقة وجه خارجية.</p></div><div className="grid gap-5">{rows.map(row=><div key={row.id} className="card p-5"><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="font-extrabold">{row.full_name}</h2><p className="text-sm text-gray-500">{row.applicant_type} • {row.email} {row.phone ? '• '+row.phone : ''}</p></div><span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">{row.status}</span></div><div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">{(urls[row.id]||[]).map((u,i)=><a key={u} href={u} target="_blank" rel="noreferrer" className="relative overflow-hidden rounded-2xl border bg-black"><img src={u} alt={'لقطة '+(i+1)} className="aspect-square w-full object-cover"/><span className="absolute bottom-2 start-2 rounded-lg bg-black/70 px-2 py-1 text-xs text-white"><Eye className="inline h-3 w-3"/> اللقطة {i+1}</span></a>)}</div></div>)}{rows.length===0&&<div className="card p-8 text-center text-gray-500">لا توجد ملفات تحقق بعد.</div>}</div></div></div>;
}