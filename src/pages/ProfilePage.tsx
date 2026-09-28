import { useState } from 'react';
import { Camera, QrCode, Trash2, MessageCircle, Send, Smartphone, ShieldCheck, Globe2, Share2 } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { useRouter } from '@/lib/router';

type Photo={id:string;data:string};
type Post={id:string;text:string;created:number};

const apps=[['WhatsApp','https://wa.me/?text='],['Telegram','https://t.me/share/url?url='],['BiP','https://web.bip.com/'],['MAX','https://web.max.ru/'],['Viber','https://www.viber.com/'],['Signal','https://signal.org/'],['Facebook','https://www.facebook.com/'],['Instagram','https://www.instagram.com/']];

function read<T>(k:string,f:T):T{try{const x=localStorage.getItem(k);return x?JSON.parse(x):f}catch{return f}}
function tr(lang:string,ar:string,en:string,ru:string){return lang==='ar'?ar:lang==='ru'?ru:en}

export default function ProfilePage(){
 const {lang,dir}=useI18n(); const {navigate}=useRouter();
 const [photos,setPhotos]=useState<Photo[]>(()=>read('sb1_profile_photos',[]));
 const [posts,setPosts]=useState<Post[]>(()=>read('sb1_profile_posts',[]));
 const [post,setPost]=useState('');
 const savePhotos=(v:Photo[])=>{setPhotos(v);localStorage.setItem('sb1_profile_photos',JSON.stringify(v))};
 const savePosts=(v:Post[])=>{setPosts(v);localStorage.setItem('sb1_profile_posts',JSON.stringify(v))};
 const addPhoto=(file:File)=>{const r=new FileReader();r.onload=()=>savePhotos([{id:'p-'+Date.now(),data:String(r.result)},...photos]);r.readAsDataURL(file)};
 const publish=()=>{if(!post.trim())return;savePosts([{id:'post-'+Date.now(),text:post.trim(),created:Date.now()},...posts]);setPost('')};
 const share=async()=>{try{await navigator.share?.({title:'SB1',text:'SB1',url:location.origin})}catch{}};
 return <div dir={dir} className="min-h-screen bg-gray-50 pt-24 pb-16">
  <div className="mx-auto max-w-6xl px-4">
   <div className="overflow-hidden rounded-3xl border bg-white shadow-sm">
    <div className="h-40 bg-gradient-to-r from-teal-700 to-cyan-500"/>
    <div className="px-6 pb-8">
     <div className="-mt-12 flex flex-wrap items-end gap-4">
      <div className="grid h-24 w-24 place-items-center rounded-3xl border-4 border-white bg-teal-100 text-2xl font-black text-teal-700 shadow">SB1</div>
      <div className="flex-1"><h1 className="text-2xl font-black">{tr(lang,'حسابي','My Profile','Мой профиль')}</h1><p className="mt-1 text-sm text-gray-500">{tr(lang,'ملف المستخدم الشخصي','Personal user profile','Личный профиль')}</p></div>
      <div className="flex flex-wrap gap-2">
       <button onClick={()=>navigate('/device')} className="flex items-center gap-2 rounded-xl border px-4 py-2 font-bold"><QrCode className="h-4 w-4"/> {tr(lang,'ربط الهاتف','Link phone','Подключить телефон')}</button>
       <button onClick={share} className="flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2 font-bold text-white"><Share2 className="h-4 w-4"/> {tr(lang,'مشاركة','Share','Поделиться')}</button>
      </div>
     </div>

     <section className="mt-8 rounded-2xl border p-5">
      <div className="flex items-center justify-between gap-3"><h2 className="text-xl font-extrabold">{tr(lang,'صورك','Your photos','Ваши фото')}</h2><label className="cursor-pointer rounded-xl bg-teal-600 px-4 py-2 text-sm font-bold text-white"><Camera className="mr-1 inline h-4 w-4"/>{tr(lang,'إضافة صورة','Add photo','Добавить фото')}<input type="file" accept="image/*" className="hidden" onChange={e=>{const f=e.target.files?.[0];if(f)addPhoto(f)}}/></label></div>
      <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-5">{photos.map(p=><div key={p.id} className="group relative aspect-square overflow-hidden rounded-2xl bg-gray-100"><img src={p.data} className="h-full w-full object-cover"/><button onClick={()=>savePhotos(photos.filter(x=>x.id!==p.id))} className="absolute right-2 top-2 hidden rounded-full bg-white p-2 text-red-600 shadow group-hover:block"><Trash2 className="h-4 w-4"/></button></div>)}{photos.length===0&&<div className="col-span-full rounded-2xl border border-dashed p-10 text-center text-gray-400">لا توجد صور بعد</div>}</div>
     </section>

     <section className="mt-6 rounded-2xl border p-5">
      <h2 className="text-xl font-extrabold">{tr(lang,'منشوراتك','Your posts','Ваши публикации')}</h2>
      <textarea value={post} onChange={e=>setPost(e.target.value)} rows={3} className="mt-4 w-full rounded-xl border p-3" placeholder={tr(lang,'اكتب منشوراً...','Write a post...','Напишите публикацию...')}/>
      <div className="mt-3 flex justify-end"><button onClick={publish} className="rounded-xl bg-teal-600 px-5 py-2.5 font-bold text-white">نشر</button></div>
      <div className="mt-4 space-y-3">{posts.map(p=><article key={p.id} className="rounded-2xl bg-gray-50 p-4"><p>{p.text}</p><time className="mt-2 block text-xs text-gray-400">{new Date(p.created).toLocaleString()}</time></article>)}</div>
     </section>

     <section className="mt-6 rounded-2xl border p-5">
      <div className="flex items-center justify-between gap-3"><div><h2 className="text-xl font-extrabold">{tr(lang,'التواصل والتطبيقات','Communication & apps','Связь и приложения')}</h2><p className="mt-1 text-sm text-gray-500">WhatsApp · Telegram · BiP · MAX · Viber · Signal · Facebook · Instagram</p></div><button onClick={()=>navigate('/social-apps')} className="rounded-xl bg-teal-600 px-4 py-2 font-bold text-white">فتح</button></div>
      <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">{apps.map(([name,url])=><button key={name} onClick={()=>window.open(name==='WhatsApp'?url+encodeURIComponent(location.href):name==='Telegram'?url+encodeURIComponent(location.href)+'&text='+encodeURIComponent('SB1'):url,'_blank','noopener,noreferrer')} className="flex items-center gap-3 rounded-2xl border p-4 text-start hover:border-teal-400"><MessageCircle className="h-5 w-5 text-teal-600"/><span className="font-bold">{name}</span></button>)}</div>
     </section>

     <section className="mt-6 rounded-2xl border bg-teal-50 p-5">
      <div className="flex gap-3"><ShieldCheck className="h-6 w-6 shrink-0 text-teal-700"/><div><h2 className="font-extrabold">{tr(lang,'الخصوصية أولاً','Privacy first','Приватность прежде всего')}</h2><p className="mt-1 text-sm text-gray-600">{tr(lang,'ربط الهاتف لا يقرأ ملفاته تلقائياً. أنت تختار الملفات التي تريد نقلها، وكل صلاحية يطلبها المتصفح تحتاج موافقتك.','Phone linking does not read files automatically. You choose what to transfer and browser permissions require your consent.','Связь с телефоном не читает файлы автоматически. Вы сами выбираете файлы, а разрешения браузера требуют согласия.')}</p><button onClick={()=>navigate('/device')} className="mt-3 rounded-xl bg-white px-4 py-2 font-bold text-teal-700">فتح QR</button></div></div>
     </section>
    </div>
   </div>
  </div>
 </div>;
}
