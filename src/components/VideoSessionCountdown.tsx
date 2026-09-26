import {useEffect,useState} from 'react';
import {Video,Clock,CalendarDays} from 'lucide-react';
import {useI18n} from '@/lib/i18n';
import {nextAcceptedAppointment,formatRemaining,runAppointmentReminders} from '@/lib/appointments';
export default function VideoSessionCountdown(){
 const {lang,dir}=useI18n(); const [a,setA]=useState(nextAcceptedAppointment()); const [now,setNow]=useState(Date.now());
 useEffect(()=>{const tick=()=>{runAppointmentReminders(lang);setA(nextAcceptedAppointment());setNow(Date.now())};tick();const id=window.setInterval(tick,1000);window.addEventListener('sb1-appointments-change',tick);return()=>{clearInterval(id);window.removeEventListener('sb1-appointments-change',tick)}},[lang]);
 if(!a||!a.scheduledAt)return null; const left=new Date(a.scheduledAt).getTime()-now;
 return <a href="/appointments" dir={dir} className="fixed bottom-4 end-4 z-40 w-80 max-w-[calc(100vw-2rem)] rounded-2xl border border-teal-200 bg-white p-4 shadow-2xl hover:shadow-xl">
  <div className="flex items-center gap-3"><div className="rounded-xl bg-teal-100 p-2"><Video className="h-5 w-5 text-teal-700"/></div><div className="min-w-0"><b className="block truncate text-sm text-gray-900">{a.doctorName}</b><span className="block truncate text-xs text-gray-500">{a.specialty}</span></div><span className="ms-auto rounded-full bg-teal-50 px-2 py-1 text-[10px] font-bold text-teal-700">جلسة فيديو</span></div>
  <div className="mt-3 rounded-xl bg-gray-50 p-3 text-center"><div className="flex items-center justify-center gap-2 text-xs text-gray-500"><CalendarDays className="h-4 w-4"/>{new Date(a.scheduledAt).toLocaleString()}</div><div className="mt-1 flex items-center justify-center gap-2 text-lg font-extrabold text-teal-700"><Clock className="h-5 w-5"/>{formatRemaining(left,lang)}</div></div>
 </a>
}