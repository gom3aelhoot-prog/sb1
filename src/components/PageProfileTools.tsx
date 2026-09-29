import { useEffect, useMemo, useState } from 'react';
import { Album, ExternalLink, Gift, Heart, Image, MessageCircle, Plus, Search, Share2, Smartphone, Video, Wand2, Music2, Settings, Shield, Lock, Copy, Globe2, Trash2, Clock3, KeyRound, Send, Upload, X, CheckCircle2, Eye, FileText } from 'lucide-react';

type MediaKind = 'post'|'video'|'reel'|'image'|'audio';
type FeedItem = { id:string; kind:MediaKind; text:string; mediaUrl?:string; mediaName?:string; createdAt:string; likes:number; comments:{id:string;name:string;body:string}[]; public:boolean; demo?:boolean };
type AlbumItem = {id:string; name:string; media: {name:string; kind:string; url?:string}[]; public:boolean};
type CloneRecord = {id:string; type:string; name:string; pin:string; password:string; link:string; expires:string; permissions:string[]; giftedTo:string; createdAt:string};

const key=(suffix:string,id?:string)=>`sb1_page_${suffix}_${id||'current'}`;
const read=<T,>(k:string,f:T):T=>{try{const v=localStorage.getItem(k);return v?JSON.parse(v):f}catch{return f}};
const write=(k:string,v:any)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch{}};
const id=()=>`sb1-${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
const qr=(url:string)=>`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(url)}`;

export default function PageProfileTools({ canManage=false, pageId='current', pageName='SB1', seedPosts=[] }:{canManage?:boolean;pageId?:string;pageName?:string;seedPosts?:Array<{id:string;body:string;image_url?:string|null;video_url?:string|null;post_type?:string;created_at:string}>}){
 const [feed,setFeed]=useState<FeedItem[]>(()=>{
   const saved=read<FeedItem[]>(key('feed',pageId),[]);
   if(saved.length)return saved;
   return seedPosts.map((p,i)=>({id:p.id,kind:p.video_url?(p.post_type==='reel'?'reel':'video'):(p.image_url?'image':'post'),text:p.body,mediaUrl:p.video_url||p.image_url||undefined,createdAt:p.created_at,likes:p.likes_count||0,comments:[],public:true,demo:false}));
 });
 const [albums,setAlbums]=useState<AlbumItem[]>(()=>read(key('albums',pageId),[{id:id(),name:'المحتوى العام',media:[],public:true}]));
 const [clones,setClones]=useState<CloneRecord[]>(()=>read('sb1_clone_registry',[]));
 const [post,setPost]=useState('');
 const [kind,setKind]=useState<MediaKind>('post');
 const [file,setFile]=useState<File|null>(null);
 const [fileUrl,setFileUrl]=useState('');
 const [comment,setComment]=useState<Record<string,string>>({});
 const [externalUrl,setExternalUrl]=useState('');
 const [externalSearch,setExternalSearch]=useState('');
 const [externalWindows,setExternalWindows]=useState<string[]>([]);
 const [favorites,setFavorites]=useState<string[]>(()=>read('sb1_private_external_favorites',[]));
 const [cloneType,setCloneType]=useState('specialist');
 const [cloneCount,setCloneCount]=useState(1);
 const [cloneName,setCloneName]=useState('');
 const [giftTo,setGiftTo]=useState('');
 const [expires,setExpires]=useState('');
 const [permissions,setPermissions]=useState<string[]>(['free_articles','free_services','video_monitoring']);
 const [phone,setPhone]=useState(()=>localStorage.getItem('sb1_private_phone')||'');
 const [settingsOpen,setSettingsOpen]=useState(false);
 const [publicMedical,setPublicMedical]=useState(false);
 const [note,setNote]=useState('');
 const [albumName,setAlbumName]=useState('');
 const [albumOpen,setAlbumOpen]=useState(false);
 const pageUrl=window.location.origin+`/doctors/${pageId}`;

 useEffect(()=>write(key('feed',pageId),feed),[feed,pageId]);
 useEffect(()=>write(key('albums',pageId),albums),[albums,pageId]);
 useEffect(()=>write('sb1_clone_registry',clones),[clones]);
 useEffect(()=>{if(file){const u=URL.createObjectURL(file);setFileUrl(u);return()=>URL.revokeObjectURL(u)}setFileUrl('')},[file]);

 const publicFeed=useMemo(()=>feed.filter(x=>x.public),[feed]);
 const reels=useMemo(()=>publicFeed.filter(x=>x.kind==='reel'),[publicFeed]);

 const addMediaPost=()=>{
   if(!post.trim() && !fileUrl)return;
   const item:FeedItem={id:id(),kind,text:post.trim(),mediaUrl:fileUrl||undefined,mediaName:file?.name,createdAt:new Date().toISOString(),likes:0,comments:[],public:true};
   setFeed(v=>[item,...v]);setPost('');setFile(null);setKind('post');
   setNote(publicMedical?'تم نشر المحتوى الطبي للعامة على صفحة SB1.':'تم نشر المحتوى على صفحة SB1.');
 };
 const like=(pid:string)=>setFeed(v=>v.map(p=>p.id===pid?{...p,likes:p.likes+1}:p));
 const addComment=(pid:string)=>{
   const body=(comment[pid]||'').trim();if(!body)return;
   const name=localStorage.getItem('chat_name')||'مستخدم SB1';
   setFeed(v=>v.map(p=>p.id===pid?{...p,comments:[...p.comments,{id:id(),name,body}]}:p));
   setComment(v=>({...v,[pid]:''}));
 };
 const createAlbum=()=>{
   if(!albumName.trim())return;
   setAlbums(v=>[...v,{id:id(),name:albumName.trim(),media:[],public:true}]);setAlbumName('');setAlbumOpen(false);
 };
 const saveExternal=()=>{
   const u=externalUrl.trim();if(!u)return;
   if(!favorites.includes(u))setFavorites(v=>[u,...v]);
   setExternalUrl('');setNote('تم حفظ الرابط في المفضلة الخاصة بهذا الحساب فقط.');
 };
 const openExternal=(u:string)=>{const w=window.open(u,'_blank','noopener,noreferrer,width=1000,height=760');if(w)setExternalWindows(v=>[...v,u])};
 const searchExternal=()=>{
   const q=externalSearch.trim();if(!q)return;
   const u=`https://www.google.com/search?q=${encodeURIComponent(q+' site:youtube.com OR site:vk.com OR site:ok.ru OR site:rutube.ru')}`;
   openExternal(u);
 };
 const makeClone=()=>{
   const count=Math.max(1,Math.min(50,Number(cloneCount)||1));
   const created:Array<CloneRecord>=[];
   for(let i=0;i<count;i++){
     const n=cloneName.trim()?(`${cloneName.trim()}${count>1?' '+(i+1):''}`):`صفحة ${cloneType} ${i+1}`;
     created.push({id:id(),type:cloneType,name:n,pin:String(Math.floor(1000+Math.random()*9000)),password:Math.random().toString(36).slice(2,10),link:window.location.origin+`/doctors/clone-${Date.now()}-${i}`,expires,permissions:[...permissions],giftedTo:'',createdAt:new Date().toISOString()});
   }
   setClones(v=>[...created,...v]);setNote(`تم إنشاء ${count} صفحة/صفحات. تم تسجيل النوع والاسم وPIN وكلمة المرور والرابط والصلاحيات في سجل المالك للمعاينة.`);
 };
 const gift=(c:CloneRecord)=>{
   const message=`صفحة SB1: ${c.name}\nالرابط: ${c.link}\nPIN: ${c.pin}\nكلمة المرور: ${c.password}\nالمدة: ${c.expires||'بدون تاريخ انتهاء'}`;
   const target=giftTo.trim();
   const shareUrl=target?target:'mailto:?subject='+encodeURIComponent('صفحة SB1')+'&body='+encodeURIComponent(message);
   if(target&&/^https?:\\/\\//.test(target))window.open(target,'_blank','noopener,noreferrer');else window.location.href=shareUrl;
   navigator.clipboard?.writeText(message).catch(()=>{});
 };
 const togglePermission=(p:string)=>setPermissions(v=>v.includes(p)?v.filter(x=>x!==p):[...v,p]);

 return <div className="mt-8 space-y-6" dir="rtl">
   {note&&<div className="rounded-2xl border border-teal-200 bg-teal-50 p-4 text-sm font-semibold text-teal-800 flex items-center gap-2"><CheckCircle2 className="h-5 w-5"/>{note}<button className="mr-auto" onClick={()=>setNote('')}><X className="h-4 w-4"/></button></div>}

   {canManage&&<section className="card p-6 border-2 border-teal-100">
     <div className="flex items-center justify-between gap-3"><div><h2 className="text-xl font-extrabold">الرئيسية — نشر المحتوى</h2><p className="mt-1 text-sm text-gray-500">منشور، صورة، فيديو، Reels أو تسجيل صوتي في صفحة الحساب.</p></div><Globe2 className="h-6 w-6 text-teal-600"/></div>
     <textarea value={post} onChange={e=>setPost(e.target.value)} className="mt-4 min-h-24 w-full rounded-2xl border p-4 outline-none focus:border-teal-500" placeholder="اكتب ما تريد نشره..." />
     <div className="mt-3 flex flex-wrap gap-2">
       {(['post','image','video','reel','audio'] as MediaKind[]).map(k=><button key={k} onClick={()=>setKind(k)} className={`rounded-xl px-4 py-2 text-sm font-bold ${kind===k?'bg-teal-700 text-white':'bg-slate-50 text-gray-700'}`}>{k==='post'?'منشور':k==='image'?'صورة':k==='video'?'فيديو':k==='reel'?'Reels':'صوت'}</button>)}
       <label className="rounded-xl bg-slate-50 px-4 py-2 text-sm font-bold cursor-pointer"><Upload className="inline h-4 w-4 ml-1"/>اختيار ملف<input type="file" accept={kind==='audio'?'audio/*':kind==='image'?'image/*':kind==='video'||kind==='reel'?'video/*':'*/*'} className="hidden" onChange={e=>setFile(e.target.files?.[0]||null)}/></label>
       <button onClick={addMediaPost} className="rounded-xl bg-teal-700 text-white px-5 py-2 font-bold">نشر</button>
     </div>
     {file&&<div className="mt-3 rounded-xl bg-slate-50 p-3 text-sm">{file.name}</div>}
     <label className="mt-4 flex items-center gap-2 text-sm font-semibold"><input type="checkbox" checked={publicMedical} onChange={e=>setPublicMedical(e.target.checked)}/> مشاركة المحتوى الطبي للعامة (عند التفعيل يصبح الفيديو/المحتوى الطبي متاحاً مجاناً للعامة)</label>
   </section>}

   <section className="card p-6">
     <div className="flex items-center justify-between"><h2 className="text-xl font-extrabold">Reels</h2><span className="text-xs text-gray-500">تظهر في أعلى الصفحة</span></div>
     {reels.length?<div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-3">{reels.slice(0,10).map((p,i)=><div key={p.id} className="overflow-hidden rounded-2xl bg-slate-900 text-white"><div className="aspect-[3/5]">{p.mediaUrl&&<video src={p.mediaUrl} controls className="h-full w-full object-cover"/>}<div className="p-2 text-xs font-semibold">{p.text||'Reel'}</div></div></div>)}</div>:<div className="mt-4 rounded-2xl bg-slate-50 p-6 text-center text-gray-500">لا توجد Reels منشورة بعد.</div>}
   </section>

   <section className="card p-6">
     <div className="flex items-center justify-between"><h2 className="text-xl font-extrabold">المنشورات والمحتوى العام</h2><span className="text-xs text-gray-500">{publicFeed.length} عنصر</span></div>
     <div className="mt-4 space-y-4">{publicFeed.map(p=><article key={p.id} className="rounded-2xl border p-4">
       <div className="flex items-center gap-2 text-xs text-gray-500"><span className="h-8 w-8 rounded-full bg-teal-100 grid place-items-center font-bold text-teal-700">{pageName.charAt(0)}</span><b>{pageName}</b><span>•</span><span>{new Date(p.createdAt).toLocaleString()}</span>{p.demo&&<span className="rounded-full bg-yellow-100 px-2 py-1 text-yellow-800">تجريبي</span>}</div>
       {p.text&&<p className="mt-3 text-sm leading-7 text-gray-700">{p.text}</p>}
       {p.mediaUrl&&(p.kind==='video'||p.kind==='reel')&&<video src={p.mediaUrl} controls className="mt-3 max-h-[520px] w-full rounded-2xl bg-black"/>}
       {p.mediaUrl&&p.kind==='image'&&<img src={p.mediaUrl} alt="" className="mt-3 max-h-[520px] w-full rounded-2xl object-cover"/>}
       {p.mediaUrl&&p.kind==='audio'&&<audio src={p.mediaUrl} controls className="mt-3 w-full"/>}
       <div className="mt-3 flex items-center gap-4 border-t pt-3 text-sm text-gray-500"><button onClick={()=>like(p.id)} className="flex items-center gap-1"><Heart className="h-4 w-4"/> {p.likes}</button><span><MessageCircle className="inline h-4 w-4 ml-1"/>{p.comments.length}</span></div>
       <div className="mt-3 space-y-2">{p.comments.map(c=><div key={c.id} className="rounded-xl bg-slate-50 p-3"><b className="text-xs">{c.name}</b><p className="text-sm">{c.body}</p></div>)}</div>
       <div className="mt-3 flex gap-2"><input value={comment[p.id]||''} onChange={e=>setComment(v=>({...v,[p.id]:e.target.value}))} onKeyDown={e=>e.key==='Enter'&&addComment(p.id)} className="flex-1 rounded-xl border px-3 py-2 text-sm" placeholder="اكتب تعليقاً..."/><button onClick={()=>addComment(p.id)} className="rounded-xl bg-teal-700 px-4 text-white"><Send className="h-4 w-4"/></button></div>
     </article>)}</div>
   </section>

   <section className="card p-6">
     <div className="flex items-center justify-between"><h2 className="text-xl font-extrabold"><Album className="inline h-5 w-5 ml-2"/>ألبومات الصفحة</h2>{canManage&&<button onClick={()=>setAlbumOpen(v=>!v)} className="rounded-xl bg-teal-700 text-white px-4 py-2 font-bold"><Plus className="inline h-4 w-4 ml-1"/>ألبوم جديد</button>}</div>
     {albumOpen&&<div className="mt-3 flex gap-2"><input value={albumName} onChange={e=>setAlbumName(e.target.value)} className="flex-1 rounded-xl border p-3" placeholder="اسم الألبوم"/><button onClick={createAlbum} className="rounded-xl bg-teal-700 text-white px-5">إنشاء</button></div>}
     <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{albums.map(a=><div key={a.id} className="rounded-2xl border p-4"><div className="flex items-center gap-2"><Album className="h-5 w-5 text-teal-600"/><b>{a.name}</b></div><p className="mt-2 text-xs text-gray-500">صور • فيديو • صوت • تسجيلات</p><span className="mt-2 inline-block rounded-full bg-teal-50 px-2 py-1 text-xs text-teal-700">{a.public?'عام':'خاص'}</span></div>)}</div>
   </section>

   {canManage&&<section className="card p-6">
     <div className="flex items-center justify-between"><div><h2 className="text-xl font-extrabold"><ExternalLink className="inline h-5 w-5 ml-2"/>منصات التواصل داخل SB1</h2><p className="text-sm text-gray-500 mt-1">عدة نوافذ، بحث مستقل، ومفضلة خاصة بالحساب. لا نعرض رقم هاتف أو بيانات شخصية لصاحب الحساب الخارجي.</p></div><Search className="h-6 w-6 text-teal-600"/></div>
     <div className="mt-4 grid gap-2 md:grid-cols-[1fr_auto]"><input value={externalSearch} onChange={e=>setExternalSearch(e.target.value)} onKeyDown={e=>e.key==='Enter'&&searchExternal()} className="rounded-xl border p-3" placeholder="ابحث عن محتوى YouTube / VK / OK / Rutube..." /><button onClick={searchExternal} className="rounded-xl bg-teal-700 text-white px-5">بحث في نافذة</button></div>
     <div className="mt-3 flex gap-2"><input value={externalUrl} onChange={e=>setExternalUrl(e.target.value)} className="flex-1 rounded-xl border p-3" placeholder="رابط خارجي"/><button onClick={()=>{saveExternal();externalUrl&&openExternal(externalUrl)}} className="rounded-xl bg-slate-900 text-white px-4">فتح + حفظ</button></div>
     {externalWindows.length>0&&<div className="mt-3 flex flex-wrap gap-2">{externalWindows.map((u,i)=><button key={i} onClick={()=>openExternal(u)} className="rounded-full bg-slate-100 px-3 py-1 text-xs">نافذة {i+1}</button>)}</div>}
     {favorites.length>0&&<div className="mt-4 rounded-2xl bg-slate-50 p-4"><b className="text-sm">المفضلة الخاصة بالحساب</b>{favorites.map(u=><div key={u} className="mt-2 flex items-center gap-2 text-xs"><span className="truncate flex-1">{u}</span><button onClick={()=>setFavorites(v=>v.filter(x=>x!==u))}><Trash2 className="h-4 w-4"/></button></div>)}</div>}
   </section>}

   {canManage&&<section className="card p-6">
     <h2 className="text-xl font-extrabold"><Wand2 className="inline h-5 w-5 ml-2"/>Clone / Gift</h2>
     <p className="mt-1 text-sm text-gray-500">يتم استنساخ نوع الحساب وعدد الصفحات فقط؛ لا يتم نسخ المنشورات أو المفضلة أو الدورات أو المقالات.</p>
     <div className="mt-4 grid gap-3 md:grid-cols-4"><select value={cloneType} onChange={e=>setCloneType(e.target.value)} className="rounded-xl border p-3"><option value="specialist">أخصائي</option><option value="institution">مؤسسة</option><option value="delivery_worker">عامل توصيل</option><option value="service_other">خدمة أخرى</option><option value="client">عميل</option></select><input type="number" min={1} max={50} value={cloneCount} onChange={e=>setCloneCount(Number(e.target.value))} className="rounded-xl border p-3" placeholder="العدد"/><input value={cloneName} onChange={e=>setCloneName(e.target.value)} className="rounded-xl border p-3" placeholder="اسم الصفحات"/><input type="date" value={expires} onChange={e=>setExpires(e.target.value)} className="rounded-xl border p-3"/></div>
     <div className="mt-4 flex flex-wrap gap-2">{[['free_articles','مقالات مجانية'],['paid_articles','مقالات مدفوعة'],['free_services','خدمات مجانية'],['admin','لوحة الإدارة'],['video_monitoring','مراقبة جلسات الفيديو'],['edit','تعديل وإضافة وحذف']].map(([p,l])=><label key={p} className="rounded-xl bg-slate-50 px-3 py-2 text-xs"><input type="checkbox" checked={permissions.includes(p)} onChange={()=>togglePermission(p)} className="ml-1"/>{l}</label>)}</div>
     <button onClick={makeClone} className="mt-4 rounded-xl bg-teal-700 text-white px-5 py-2 font-bold">إنشاء الصفحات</button>
     {clones.length>0&&<div className="mt-5 space-y-3">{clones.slice(0,20).map(c=><div key={c.id} className="rounded-2xl border p-4"><div className="flex items-center justify-between gap-3"><b>{c.name}</b><span className="rounded-full bg-teal-50 px-2 py-1 text-xs">{c.type}</span></div><div className="mt-2 grid gap-2 text-xs md:grid-cols-4"><span>PIN: <b>{c.pin}</b></span><span>كلمة المرور: <b>{c.password}</b></span><span>الانتهاء: <b>{c.expires||'—'}</b></span><span className="truncate">الرابط: {c.link}</span></div><div className="mt-3 flex gap-2"><input value={giftTo} onChange={e=>setGiftTo(e.target.value)} className="flex-1 rounded-xl border px-3 py-2 text-sm" placeholder="رابط Telegram/Facebook أو بريد إلكتروني"/><button onClick={()=>gift(c)} className="rounded-xl bg-slate-900 text-white px-4"><Gift className="inline h-4 w-4 ml-1"/>إرسال كهدية</button><button onClick={()=>navigator.clipboard?.writeText(`الاسم: ${c.name} | PIN: ${c.pin} | كلمة المرور: ${c.password} | الرابط: ${c.link}`)} className="rounded-xl border px-3"><Copy className="h-4 w-4"/></button></div></div>)}</div>}
   </section>}

   {canManage&&<section className="card p-6">
     <h2 className="text-xl font-extrabold"><Smartphone className="inline h-5 w-5 ml-2"/>الهاتف وQR</h2>
     <p className="mt-1 text-sm text-gray-500">رقم الهاتف خاص بالحساب ولا يظهر للعامة. QR يفتح صفحة SB1 فقط.</p>
     <div className="mt-4 flex flex-wrap gap-2"><input value={phone} onChange={e=>setPhone(e.target.value)} className="rounded-xl border p-3" placeholder="رقم الهاتف"/><button onClick={()=>{localStorage.setItem('sb1_private_phone',phone);setNote('تم حفظ رقم الهاتف كبيان خاص بالحساب.')}} className="rounded-xl bg-teal-700 text-white px-5">حفظ الهاتف</button></div>
     <div className="mt-4 flex flex-wrap items-center gap-5"><img src={qr(pageUrl)} alt="QR SB1" className="h-44 w-44 rounded-xl border bg-white p-2"/><div><b>ربط الهاتف بالموقع</b><p className="mt-2 text-sm text-gray-500">امسح QR لفتح الصفحة ثم ارفع الصور والفيديوهات من الهاتف.</p><a href={pageUrl} className="mt-3 inline-block rounded-xl bg-slate-900 px-4 py-2 text-white">فتح صفحة SB1</a></div></div>
   </section>}

   {canManage&&<section className="card p-6">
     <div className="flex items-center justify-between"><div><h2 className="text-xl font-extrabold"><Settings className="inline h-5 w-5 ml-2"/>إعدادات الصفحة</h2><p className="text-sm text-gray-500 mt-1">هذا القسم منفصل ولا يظهر للزوار.</p></div><Shield className="h-6 w-6 text-teal-600"/></div>
     <button onClick={()=>setSettingsOpen(v=>!v)} className="mt-3 rounded-xl border px-4 py-2 font-bold">{settingsOpen?'إخفاء الإعدادات':'فتح الإعدادات'}</button>
     {settingsOpen&&<div className="mt-4 grid gap-3 md:grid-cols-2"><div className="rounded-2xl bg-slate-50 p-4"><Lock className="h-5 w-5"/><b className="block mt-2">الخصوصية</b><p className="text-xs text-gray-500 mt-1">المحتوى الخاص والمفضلة وبيانات الهاتف لا تظهر للعامة.</p></div><div className="rounded-2xl bg-slate-50 p-4"><KeyRound className="h-5 w-5"/><b className="block mt-2">صلاحيات الإدارة</b><p className="text-xs text-gray-500 mt-1">المالك والمشرفون المصرح لهم فقط يمكنهم فتح هذا القسم.</p></div></div>}
   </section>}

   {!canManage&&<div className="rounded-2xl border bg-slate-50 p-4 text-center text-sm text-gray-500">المحتوى العام ظاهر للزوار. إعدادات الصفحة، المفضلة الخارجية، Clone/Gift، الهاتف وQR وإدارة المحتوى الخاص مخفية عن الزوار.</div>}
 </div>;
}
