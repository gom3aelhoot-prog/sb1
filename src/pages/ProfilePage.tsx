import { useMemo,useState } from 'react';
import { BookOpen,Camera,Heart,MessageCircle,Users,Image as ImageIcon,Plus,Trash2,Share2,Link2,Play,Mic,FolderPlus,Globe2,Facebook,Instagram,Youtube,Linkedin,Music2,Smartphone,QrCode,Send,ShieldCheck } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { useRouter } from '@/lib/router';

type Photo={id:string;data:string;caption:string};
type Post={id:string;text:string;created:number};
type Favorite={id:string;title:string;url:string;type:'video'|'audio'|'link';album:string};
type Album={id:string;name:string;favoriteIds:string[];shared:boolean};

const accounts=[
 {id:'youtube',name:'YouTube',Icon:Youtube}, {id:'instagram',name:'Instagram',Icon:Instagram}, {id:'facebook',name:'Facebook',Icon:Facebook}, {id:'linkedin',name:'LinkedIn',Icon:Linkedin}, {id:'whatsapp',name:'WhatsApp',Icon:MessageCircle}, {id:'telegram',name:'Telegram',Icon:Send}, {id:'bip',name:'BiP',Icon:MessageCircle}, {id:'max',name:'MAX',Icon:Smartphone}, {id:'viber',name:'Viber',Icon:MessageCircle}, {id:'signal',name:'Signal',Icon:ShieldCheck}, {id:'vk',name:'VK',Icon:Globe2}, {id:'ok',name:'OK',Icon:Globe2},
];

const tr=(lang:string,ar:string,en:string,ru:string)=>lang==='ar'?ar:lang==='ru'?ru:en;

function read<T>(key:string,fallback:T):T{try{const v=localStorage.getItem(key);return v?JSON.parse(v):fallback}catch{return fallback}}
function write(key:string,v:unknown){localStorage.setItem(key,JSON.stringify(v))}

function youtubeId(url:string){const m=url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|shorts\/|embed\/))([A-Za-z0-9_-]{6,})/);return m?.[1]||null}
function detectType(url:string):Favorite['type']{if(/\.(mp3|wav|m4a|ogg)(\?|$)/i.test(url))return'audio';if(youtubeId(url)||/\/(video|reel|shorts?)/i.test(url))return'video';return'link'}

export default function ProfilePage(){
 const {lang,dir}=useI18n(); const {navigate}=useRouter();
 const [photos,setPhotos]=useState<Photo[]>(()=>read('sb1_profile_photos',[]));
 const [posts,setPosts]=useState<Post[]>(()=>read('sb1_profile_posts',[]));
 const [favorites,setFavorites]=useState<Favorite[]>(()=>read('sb1_profile_external_favorites',[]));
 const [albums,setAlbums]=useState<Album[]>(()=>read('sb1_profile_favorite_albums',[]));
 const [post,setPost]=useState('');
 const [favUrl,setFavUrl]=useState(''); const [favTitle,setFavTitle]=useState('');
 const [albumName,setAlbumName]=useState(''); const [selectedAlbum,setSelectedAlbum]=useState('all');
 const [connected,setConnected]=useState<Record<string,boolean>>(()=>read('sb1_social_connections',{}));
 const savePhotos=(v:Photo[])=>{setPhotos(v);write('sb1_profile_photos',v)};
 const savePosts=(v:Post[])=>{setPosts(v);write('sb1_profile_posts',v)};
 const saveFav=(v:Favorite[])=>{setFavorites(v);write('sb1_profile_external_favorites',v)};
 const saveAlbums=(v:Album[])=>{setAlbums(v);write('sb1_profile_favorite_albums',v)};

 const addPhoto=(file:File)=>{const r=new FileReader();r.onload=()=>savePhotos([{id:'ph-'+Date.now(),data:String(r.result),caption:''},...photos]);r.readAsDataURL(file)};
 const publish=()=>{if(!post.trim())return;savePosts([{id:'post-'+Date.now(),text:post.trim(),created:Date.now()},...posts]);setPost('')};
 const addFavorite=()=>{if(!favUrl.trim())return;const id='fav-'+Date.now();const f:Favorite={id,title:favTitle.trim()||tr(lang,'محتوى محفوظ','Saved content','Сохранённый контент'),url:favUrl.trim(),type:detectType(favUrl),album:albums[0]?.id||'uncategorized'};saveFav([f,...favorites]);setFavUrl('');setFavTitle('')};
 const createAlbum=()=>{if(!albumName.trim())return;const a:Album={id:'alb-'+Date.now(),name:albumName.trim(),favoriteIds:[],shared:false};saveAlbums([a,...albums]);setAlbumName('')};
 const addToAlbum=(favId:string,albumId:string)=>saveAlbums(albums.map(a=>a.id===albumId?{...a,favoriteIds:Array.from(new Set([...a.favoriteIds,favId]))}:a));
 const shareAlbum=(a:Album)=>{const payload=btoa(unescape(encodeURIComponent(JSON.stringify({name:a.name,items:favorites.filter(f=>a.favoriteIds.includes(f.id)).map(({title,url,type})=>({title,url,type}))}))));navigator.clipboard?.writeText(location.origin+'/profile?sharedAlbum='+encodeURIComponent(payload));setAlbums(albums.map(x=>x.id===a.id?{...x,shared:true}:x));alert(tr(lang,'تم نسخ رابط مشاركة الألبوم','Album sharing link copied','Ссылка для общего доступа скопирована'))};
 const visibleFav=useMemo(()=>selectedAlbum==='all'?favorites:selectedAlbum==='uncategorized'?favorites.filter(f=>!albums.some(a=>a.favoriteIds.includes(f.id))):favorites.filter(f=>albums.find(a=>a.id===selectedAlbum)?.favoriteIds.includes(f.id)),[favorites,albums,selectedAlbum]);

 return <div dir={dir} className="min-h-screen pt-24 pb-16 bg-gray-50">
  <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
   <div className="bg-white rounded-3xl border overflow-hidden shadow-sm">
    <div className="h-48 bg-gradient-to-r from-teal-700 via-cyan-600 to-sky-600 relative">
      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_30%_20%,white,transparent_35%)]"/>
    </div>
    <div className="px-6 pb-8">
      <div className="-mt-14 flex flex-col md:flex-row md:items-end gap-4">
       <div className="h-28 w-28 rounded-3xl border-4 border-white bg-teal-100 grid place-items-center text-3xl font-black text-teal-700 shadow-lg">GA</div>
       <div className="flex-1"><h1 className="text-2xl font-black">{tr(lang,'حسابي','My Profile','Мой профиль')}</h1><p className="text-sm text-gray-500 mt-1">{tr(lang,'هذا حساب شخصي — يمكنك نشر ما تريد ما دام لا يخالف قواعد SB1.','Personal account — you may publish any permitted content, not only medical content.','Личный профиль — можно публиковать разрешённый контент, не только медицинский.')}</p></div>
       <div className="flex gap-2"><button onClick={()=>navigate('/device')} className="rounded-xl border px-4 py-2 flex items-center gap-2"><QrCode className="h-4 w-4"/> ربط الهاتف</button><button onClick={()=>navigate('/settings')} className="rounded-xl border px-4 py-2">{tr(lang,'إعدادات الحساب','Account settings','Настройки')}</button>
      </div>

      <section className="mt-8">
       <div className="flex items-center justify-between"><h2 className="text-xl font-extrabold">{tr(lang,'ألبوم الصور الشخصي','Personal photo album','Личный фотоальбом')}</h2><label className="cursor-pointer rounded-xl bg-teal-600 text-white px-4 py-2 text-sm font-bold"><Camera className="inline h-4 w-4"/> {tr(lang,'إضافة صورة','Add photo','Добавить фото')}<input type="file" accept="image/*" className="hidden" onChange={e=>{const f=e.target.files?.[0];if(f)addPhoto(f)}}/></label></div>
       <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-3">{photos.map(p=><div key={p.id} className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100 group"><img src={p.data} className="w-full h-full object-cover"/><button onClick={()=>savePhotos(photos.filter(x=>x.id!==p.id))} className="absolute top-2 end-2 hidden group-hover:grid place-items-center h-8 w-8 rounded-full bg-white/90 text-red-600"><Trash2 className="h-4 w-4"/></button></div>)}{!photos.length&&<div className="col-span-full rounded-2xl border border-dashed p-10 text-center text-gray-400"><ImageIcon className="mx-auto h-10 w-10 mb-2"/>{tr(lang,'أضف صورك الشخصية هنا','Add your personal photos here','Добавьте личные фотографии')}</div>}</div>
      </section>

      <section className="mt-8 rounded-2xl border bg-gray-50 p-5">
       <h2 className="text-xl font-extrabold">{tr(lang,'منشوراتك','Your posts','Ваши публикации')}</h2>
       <textarea value={post} onChange={e=>setPost(e.target.value)} rows={3} className="mt-4 w-full rounded-xl border p-3 bg-white" placeholder={tr(lang,'اكتب أي منشور مسموح به في قواعد SB1، وليس بالضرورة محتوى طبياً...','Write any permitted post; it does not have to be medical...','Пишите любой разрешённый пост, не обязательно медицинский...')}/>
       <div className="mt-3 flex justify-end"><button onClick={publish} disabled={!post.trim()} className="rounded-xl bg-teal-600 text-white px-5 py-2.5 disabled:opacity-40">{tr(lang,'نشر','Publish','Опубликовать')}</button></div>
       <div className="mt-5 space-y-3">{posts.map(p=><article key={p.id} className="bg-white rounded-2xl border p-4"><p className="leading-7">{p.text}</p><div className="mt-2 text-xs text-gray-400">{new Date(p.created).toLocaleString()}</div></article>)}</div>
      </section>

      <section className="mt-8">
       <div className="flex items-center justify-between gap-3 flex-wrap"><div><h2 className="text-xl font-extrabold">{tr(lang,'الحسابات المرتبطة','Connected accounts','Подключённые аккаунты')}</h2><p className="text-sm text-gray-500 mt-1">{tr(lang,'تستخدمها لاستيراد المحتوى الذي تختاره إلى مفضلتك داخل SB1.','Use them to import selected content into your SB1 favorites.','Используйте их для импорта выбранного контента в избранное SB1.')}</p></div></div>
       <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-3">{accounts.map(({id,name,Icon})=><button key={id} onClick={()=>{const n={...connected,[id]:!connected[id]};setConnected(n);write('sb1_social_connections',n)}} className="bg-white border rounded-2xl p-4 flex items-center gap-3 text-start hover:border-teal-400"><Icon className="h-7 w-7 text-teal-600"/><div className="flex-1"><b>{name}</b><div className="text-xs text-gray-400">{connected[id]?tr(lang,'مرتبط','Connected','Подключено'):tr(lang,'ربط الحساب','Connect account','Подключить')}</div></div></button>)}</div>
       <div className="mt-4 rounded-2xl bg-amber-50 border border-amber-200 p-4 text-sm text-amber-900">{tr(lang,'الربط الحقيقي عبر OAuth يحتاج موافقة المستخدم ومفاتيح التطبيقات الرسمية لكل منصة. لن يتم الوصول إلى حساب أي شخص دون تفويضه.','Real OAuth connection requires user consent and official app credentials for each platform. SB1 will never access an account without authorization.','Реальное OAuth-подключение требует согласия пользователя и официальных ключей приложений.')}</div>
      </section>

      <section className="mt-8 rounded-2xl border bg-white p-5">
       <div className="flex items-center justify-between gap-3 flex-wrap"><div><h2 className="text-xl font-extrabold">{tr(lang,'مفضلتك داخل SB1','Your SB1 favorites','Ваше избранное SB1')}</h2><p className="text-sm text-gray-500 mt-1">{tr(lang,'احفظ فيديو أو صوت أو رابط من حساباتك الخارجية ليظهر هنا داخل SB1.','Save a video, audio item or link from your external accounts and view it here inside SB1.','Сохраняйте видео, аудио или ссылки из внешних аккаунтов и смотрите их здесь.')}</p></div></div>
       <div className="mt-4 grid md:grid-cols-[1fr_1fr_auto] gap-2"><input value={favTitle} onChange={e=>setFavTitle(e.target.value)} className="rounded-xl border px-3 py-2" placeholder={tr(lang,'اسم المفضلة','Favorite title','Название')}/><input value={favUrl} onChange={e=>setFavUrl(e.target.value)} className="rounded-xl border px-3 py-2" placeholder="YouTube / Instagram / VK / OK / Facebook / LinkedIn URL"/><button onClick={addFavorite} className="rounded-xl bg-teal-600 text-white px-4 py-2"><Plus className="inline h-4 w-4"/> {tr(lang,'إضافة','Add','Добавить')}</button></div>
       <div className="mt-5 flex flex-wrap gap-2"><button onClick={()=>setSelectedAlbum('all')} className={'rounded-full px-4 py-2 '+(selectedAlbum==='all'?'bg-teal-600 text-white':'bg-gray-100')}>{tr(lang,'الكل','All','Все')}</button>{albums.map(a=><button key={a.id} onClick={()=>setSelectedAlbum(a.id)} className={'rounded-full px-4 py-2 '+(selectedAlbum===a.id?'bg-teal-600 text-white':'bg-gray-100')}>{a.name}</button>)}</div>
       <div className="mt-5 grid gap-4 md:grid-cols-2">{visibleFav.map(f=>{const y=youtubeId(f.url);return <div key={f.id} className="rounded-2xl border overflow-hidden"><div className="p-4"><div className="flex items-center gap-2"><span className="rounded-full bg-teal-50 text-teal-700 px-2 py-1 text-xs">{f.type}</span><b>{f.title}</b></div>{y?<div className="mt-3 aspect-video"><iframe className="w-full h-full rounded-xl" src={'https://www.youtube.com/embed/'+y} title={f.title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen/></div>:f.type==='audio'?<audio controls src={f.url} className="w-full mt-3"/>:<div className="mt-3 rounded-xl bg-gray-50 p-6 text-sm text-gray-500 flex items-center gap-3"><Play className="h-5 w-5"/>{tr(lang,'تم حفظ المحتوى داخل SB1 ويمكن عرضه عندما يسمح المصدر بالتضمين.','Saved in SB1 and can be previewed when the source permits embedding.','Сохранено в SB1; предпросмотр доступен, если источник разрешает встраивание.')}</div>}</div><div className="border-t p-3 flex flex-wrap gap-2"><select defaultValue="" onChange={e=>e.target.value&&addToAlbum(f.id,e.target.value)} className="rounded-xl border px-3 py-2 text-sm"><option value="">{tr(lang,'إضافة إلى ألبوم','Add to album','Добавить в альбом')}</option>{albums.map(a=><option key={a.id} value={a.id}>{a.name}</option>)}</select><button onClick={()=>saveFav(favorites.filter(x=>x.id!==f.id))} className="rounded-xl border px-3 py-2 text-red-600"><Trash2 className="inline h-4 w-4"/></button></div></div>})}</div>
      </section>

      <section className="mt-8 rounded-2xl border bg-white p-5">
       <div className="flex items-center gap-2"><FolderPlus className="h-6 w-6 text-teal-600"/><h2 className="text-xl font-extrabold">{tr(lang,'ألبومات المفضلة','Favorite albums','Альбомы избранного')}</h2></div>
       <div className="mt-4 flex gap-2"><input value={albumName} onChange={e=>setAlbumName(e.target.value)} className="flex-1 rounded-xl border px-3 py-2" placeholder={tr(lang,'اسم الألبوم الذي تريده','Album name','Название альбома')}/><button onClick={createAlbum} className="rounded-xl bg-teal-600 text-white px-4"><Plus className="inline h-4 w-4"/> {tr(lang,'إنشاء','Create','Создать')}</button></div>
       <div className="mt-5 space-y-3">{albums.map(a=><div key={a.id} className="rounded-2xl border p-4 flex items-center gap-3"><BookOpen className="h-5 w-5 text-teal-600"/><div className="flex-1"><b>{a.name}</b><div className="text-xs text-gray-400">{a.favoriteIds.length} {tr(lang,'عنصر','items','элементов')}</div></div><button onClick={()=>shareAlbum(a)} className="rounded-xl bg-indigo-50 text-indigo-700 px-3 py-2"><Share2 className="inline h-4 w-4"/> {tr(lang,'مشاركة','Share','Поделиться')}</button></div>)}</div>
      </section>

      <div className="mt-6 rounded-2xl bg-slate-50 border p-4 text-sm text-slate-600 flex gap-3"><Link2 className="h-5 w-5 shrink-0"/>{tr(lang,'الألبوم المشترك يعرض العناصر داخل SB1. لن نضع اسم المنصة في بطاقة الألبوم؛ لكن مشغلات المنصات الخارجية قد تعرض علامتها أو نطاقها لأنها تعمل من المصدر نفسه. لا يمكن تقنياً إزالة هذه العلامة من مشغل طرف ثالث دون إعادة استضافة المحتوى.','Shared albums display items inside SB1. We do not label the platform in the album card, but third-party players may show their own branding/domain because playback comes from the original source.','Общие альбомы показываются внутри SB1; сторонний плеер может показывать свой бренд или домен.')}</div>
    </div>
   </div>
  </div>
 </div>
}