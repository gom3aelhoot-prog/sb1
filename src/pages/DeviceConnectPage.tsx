import { useEffect,useMemo,useRef,useState } from 'react';
import { QrCode, Smartphone, Upload, ShieldCheck, MonitorUp, Copy, CheckCircle2, Download } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { supabase } from '@/lib/supabase';

const CHUNK=16*1024;
const ice={iceServers:[{urls:'stun:stun.l.google.com:19302'}]};
const b64=(b:ArrayBuffer)=>{let s='';const a=new Uint8Array(b);for(let i=0;i<a.length;i+=0x8000)s+=String.fromCharCode(...a.subarray(i,i+0x8000));return btoa(s)};
const uid=()=>crypto.randomUUID?.()||Math.random().toString(36).slice(2)+Date.now();

export default function DeviceConnectPage(){
 const {lang,dir}=useI18n(); const params=useMemo(()=>new URLSearchParams(location.search),[]);
 const join=params.get('join'); const token=join||useMemo(()=>uid(),[join]);
 const [status,setStatus]=useState(join?'جاري انتظار الاتصال…':'أنشئ QR ثم افتحه من الهاتف');
 const [copied,setCopied]=useState(false); const [progress,setProgress]=useState(0); const [received,setReceived]=useState<string[]>([]);
 const [screen,setScreen]=useState<string|null>(null); const [connected,setConnected]=useState(false);
 const channelRef=useRef<any>(null); const pcRef=useRef<RTCPeerConnection|null>(null); const dcRef=useRef<RTCDataChannel|null>(null);
 const incoming=useRef<{id:string,name:string,mime:string,size:number,chunks:ArrayBuffer[],got:number}|null>(null);

 const pairUrl=location.origin+'/device?join='+encodeURIComponent(token);
 const qrUrl='https://api.qrserver.com/v1/create-qr-code/?size=280x280&margin=10&data='+encodeURIComponent(pairUrl);

 useEffect(()=>{let mounted=true;
  const ch=(supabase as any).channel?.('sb1-device-'+token,{config:{broadcast:{self:false}}});
  if(!ch){setStatus('الربط بين جهازين يحتاج اتصال SB1 الآمن؛ يمكنك استخدام رابط النقل يدوياً.');return;}
  channelRef.current=ch;
  const pc=new RTCPeerConnection(ice);pcRef.current=pc;
  const send=(payload:any)=>ch.send({type:'broadcast',event:'signal',payload});
  pc.onicecandidate=e=>{if(e.candidate)send({kind:'ice',role:join?'phone':'desktop',candidate:e.candidate})};
  pc.onconnectionstatechange=()=>{if(!mounted)return;setConnected(pc.connectionState==='connected');if(pc.connectionState==='connected')setStatus('تم الربط بين الجهازين بأمان')};
  pc.ontrack=e=>{const v=e.streams[0];const el=document.getElementById('sb1-remote-screen') as HTMLVideoElement|null;if(el)el.srcObject=v};
  if(join){
    pc.ondatachannel=e=>{dcRef.current=e.channel;attachReceiver(e.channel)};
  }else{
    const dc=pc.createDataChannel('files');dcRef.current=dc;attachReceiver(dc);
  }
  ch.on('broadcast',{event:'signal'},async({payload}:any)=>{
    if(!payload||payload.role===(join?'phone':'desktop'))return;
    try{
      if(payload.kind==='offer'&&join){await pc.setRemoteDescription(payload.sdp);const ans=await pc.createAnswer();await pc.setLocalDescription(ans);await send({kind:'answer',role:'phone',sdp:ans})}
      else if(payload.kind==='answer'&&!join)await pc.setRemoteDescription(payload.sdp);
      else if(payload.kind==='ice'&&payload.candidate)await pc.addIceCandidate(payload.candidate);
    }catch(e){setStatus('تعذر إنشاء الاتصال؛ أعد فتح QR مرة أخرى.')}
  }).subscribe(async(status2:any)=>{
    if(status2==='SUBSCRIBED'&&!join){const offer=await pc.createOffer();await pc.setLocalDescription(offer);await send({kind:'offer',role:'desktop',sdp:offer});setStatus('تم إنشاء جلسة آمنة؛ افتح QR من الهاتف')}
  });
  return()=>{mounted=false;try{pc.close();supabase.removeChannel?.(ch)}catch{}};
 },[token,join]);

 function attachReceiver(dc:RTCDataChannel){dc.binaryType='arraybuffer';dc.onmessage=(e)=>{if(typeof e.data==='string'){try{const m=JSON.parse(e.data);if(m.type==='file-meta'){incoming.current={id:m.id,name:m.name,mime:m.mime,size:m.size,chunks:[],got:0};setProgress(0)}else if(m.type==='file-end'){const f=incoming.current;if(!f)return;const blob=new Blob(f.chunks,{type:f.mime});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=f.name;a.click();setReceived(x=>[f.name,...x]);incoming.current=null;setProgress(100);setTimeout(()=>URL.revokeObjectURL(url),60000)}}catch{}}else{const f=incoming.current;if(!f)return;f.chunks.push(e.data);f.got+=e.data.byteLength;setProgress(Math.min(99,Math.round(f.got/f.size*100)))}}}

 async function sendFiles(files:FileList|null){if(!files||!dcRef.current||dcRef.current.readyState!=='open'){alert('يجب ربط الهاتف أولاً');return}for(const file of Array.from(files)){const id=uid();dcRef.current.send(JSON.stringify({type:'file-meta',id,name:file.name,mime:file.type,size:file.size}));let off=0;while(off<file.size){const chunk=await file.slice(off,off+CHUNK).arrayBuffer();while(dcRef.current.bufferedAmount>4*1024*1024)await new Promise(r=>setTimeout(r,30));dcRef.current.send(chunk);off+=chunk.byteLength;setProgress(Math.round(off/file.size*100))}dcRef.current.send(JSON.stringify({type:'file-end',id}));}}

 async function shareScreen(){if(!pcRef.current||!navigator.mediaDevices?.getDisplayMedia){alert('مشاركة الشاشة غير مدعومة في هذا المتصفح');return}try{const stream=await navigator.mediaDevices.getDisplayMedia({video:true,audio:true});stream.getTracks().forEach(t=>pcRef.current!.addTrack(t,stream));setStatus('تمت مشاركة شاشة الهاتف بعد موافقتك');}catch{setStatus('تم إلغاء مشاركة الشاشة أو رفض الإذن')}}
 async function copy(){await navigator.clipboard?.writeText(pairUrl);setCopied(true);setTimeout(()=>setCopied(false),1500)}

 return <div dir={dir} className="min-h-screen bg-slate-50 pt-24 pb-16"><div className="max-w-5xl mx-auto px-4">
  <div className="grid lg:grid-cols-[1fr_360px] gap-6">
   <section className="bg-white rounded-3xl border p-6 shadow-sm">
    <div className="flex items-center gap-3"><Smartphone className="text-teal-700"/><div><h1 className="text-2xl font-black">{join?'الهاتف':'ربط هاتفي بـ SB1'}</h1><p className="text-sm text-gray-500 mt-1">{status}</p></div></div>
    {!join&&<div className="mt-7 flex flex-col items-center"><img src={qrUrl} alt="SB1 QR" className="w-64 h-64 rounded-2xl border bg-white p-2"/><p className="text-xs text-gray-500 mt-3 text-center break-all">{pairUrl}</p><button onClick={copy} className="mt-3 flex items-center gap-2 rounded-xl border px-4 py-2">{copied?<CheckCircle2 className="h-4"/>:<Copy className="h-4"/>}{copied?'تم النسخ':'نسخ رابط الربط'}</button></div>}
    {join&&<div className="mt-7 space-y-4"><div className="rounded-2xl bg-teal-50 border border-teal-100 p-5"><ShieldCheck className="text-teal-700"/><h2 className="font-extrabold mt-2">نقل آمن بإذن منك</h2><p className="text-sm text-gray-600 mt-1">لن يقرأ SB1 ملفات الهاتف تلقائياً. اختر أنت الصور أو الفيديوهات أو الأغاني التي تريد إرسالها.</p></div><label className="flex items-center justify-center gap-3 cursor-pointer rounded-2xl bg-teal-600 text-white p-4 font-bold"><Upload/>اختيار ملفات من الهاتف<input type="file" multiple accept="image/*,video/*,audio/*,.pdf" className="hidden" onChange={e=>sendFiles(e.target.files)}/></label><button onClick={shareScreen} className="w-full flex items-center justify-center gap-2 rounded-2xl border p-4 font-bold"><MonitorUp/>مشاركة شاشة الهاتف بإذن المستخدم</button><div className="text-xs text-gray-500">الحالة: {connected?'متصل':'في انتظار جهاز الكمبيوتر'}</div></div>}
    {connected&&<div className="mt-6"><div className="h-3 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-teal-600 transition-all" style={{width:progress+'%'}}/></div>{received.length>0&&<div className="mt-3 text-sm">تم نقل: {received.join('، ')}</div>}<video id="sb1-remote-screen" autoPlay playsInline controls className="mt-5 w-full max-h-[420px] rounded-2xl bg-black"/></div>}
   </section>
   <aside className="bg-white rounded-3xl border p-6 h-fit"><div className="h-64 rounded-[2rem] border-8 border-slate-900 bg-slate-100 relative overflow-hidden shadow-xl"><div className="absolute top-2 left-1/2 -translate-x-1/2 w-24 h-5 rounded-full bg-slate-900"/><div className="p-6 pt-12"><div className="text-xs text-slate-400">SB1</div><div className="mt-3 grid grid-cols-3 gap-2">{['📷','🎵','🎬','📄','🖼️','📱'].map(x=><div className="h-12 rounded-xl bg-white grid place-items-center text-xl" key={x}>{x}</div>)}</div></div></div><p className="text-sm text-gray-500 mt-4 text-center">هذا الشكل يمثل واجهة الهاتف فقط. التحكم عن بعد الكامل في الهاتف غير مسموح به من موقع ويب عادي.</p></aside>
  </div>
 </div></div>
}