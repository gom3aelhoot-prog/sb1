import {useEffect,useMemo,useState} from 'react';
import {AudioLines,Image as ImageIcon,Music2,Play,Send,Upload,Video,X,Type,Palette,Scissors,Search,Bookmark,ExternalLink} from 'lucide-react';

type Mode='story'|'reel'|'post';
const uid=()=> 'sb1-'+Date.now()+'-'+Math.random().toString(36).slice(2,8);
const read=<T,>(k:string,f:T):T=>{try{const v=localStorage.getItem(k);return v?JSON.parse(v):f}catch{return f}};
const write=(k:string,v:any)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch{}};

const backgrounds=[
  {name:'أسود فاخر',value:'#050505'},{name:'أزرق ليلي',value:'#102a43'},{name:'أخضر SB1',value:'#0f766e'},
  {name:'بنفسجي',value:'#4c1d95'},{name:'وردي',value:'#9d174d'},{name:'ذهبي',value:'#92400e'},
  {name:'أبيض',value:'#ffffff'}
];
const sampleMusic=[
  {id:'music-1',name:'Calm Ambient',url:'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73467.mp3?filename=relaxing-ambient-11327.mp3'},
  {id:'music-2',name:'Positive Vibes',url:'https://cdn.pixabay.com/download/audio/2022/10/25/audio_946e9f9e1b.mp3?filename=positive-vibes-121744.mp3'},
  {id:'music-3',name:'Soft Piano',url:'https://cdn.pixabay.com/download/audio/2022/08/23/audio_7c6e9f5a2c.mp3'}
];

export default function ProfessionalCreateStudio({pageId,pageName,pageAvatar}:{pageId:string;pageName:string;pageAvatar?:string}){
 const [mode,setMode]=useState<Mode>('post');const [text,setText]=useState('');const [file,setFile]=useState<File|null>(null);const [url,setUrl]=useState('');
 const [bg,setBg]=useState('#ffffff');const [font,setFont]=useState('#0f172a');const [size,setSize]=useState(24);const [filter,setFilter]=useState('none');
 const [music,setMusic]=useState<any>(null);const [musicStart,setMusicStart]=useState(0);const [musicEnd,setMusicEnd]=useState(20);
 const [library,setLibrary]=useState<any[]>(()=>read('sb1_audio_library',sampleMusic));const [notice,setNotice]=useState('');
 const [preview,setPreview]=useState(false);
 useEffect(()=>{if(file){const u=URL.createObjectURL(file);setUrl(u);return()=>URL.revokeObjectURL(u)}setUrl('')},[file]);
 const mediaType=useMemo(()=>file?.type.startsWith('video/')?'video':file?.type.startsWith('image/')?'image':'', [file]);
 const addMusic=async(f:File)=>{const u=URL.createObjectURL(f);const item={id:uid(),name:f.name,url:u};setLibrary(v=>[item,...v]);setMusic(item);write('sb1_audio_library',[item,...library])};
 const publish=()=>{
   if(!text.trim()&&!url){setNotice('أضف نصاً أو صورة أو فيديو أولاً.');return}
   if(mode==='story'){
     const old=read<any[]>('sb1_fb_stories_'+pageId,[]);
     const item={id:uid(),name:'قصتي',text:text.trim(),mediaUrl:url||undefined,mediaKind:mediaType==='video'?'video':'image',audioUrl:music?.url,audioStart:musicStart,musicStart,createdAt:new Date().toISOString(),expiresAt:new Date(Date.now()+86400000),own:true,authorPhoto:pageAvatar,textStyle:{color:font,fontSize:size+'px',fontWeight:'800'},filter};
     write('sb1_fb_stories_'+pageId,[item,...old]);
   }else{
     const old=read<any[]>('sb1_fb_posts_'+pageId,[]);
     const item={id:uid(),kind:mode==='reel'?'reel':mediaType||'post',text:text.trim()||'منشور جديد',mediaUrl:url||undefined,createdAt:new Date().toISOString(),likes:0,views:0,comments:[],public:true,author:pageName,authorPhoto:pageAvatar,style:{background:bg,color:font,fontSize:size+'px',fontWeight:'700',filter}};
     write('sb1_fb_posts_'+pageId,[item,...old]);
   }
   setText('');setFile(null);setUrl('');setMusic(null);setNotice(mode==='story'?'تم نشر القصة.':'تم نشر المحتوى.');setPreview(true);
 };
 return <section className="rounded-2xl border bg-white shadow-lg overflow-hidden">
   <div className="flex items-center justify-between border-b bg-slate-950 px-4 py-3 text-white"><div className="flex items-center gap-3">{pageAvatar?<img src={pageAvatar} className="h-9 w-9 rounded-full object-cover" alt=""/>:<div className="grid h-9 w-9 place-items-center rounded-full bg-teal-700 font-black">{pageName[0]}</div>}<div><b className="block text-sm">استوديو النشر الاحترافي</b><span className="text-[11px] text-slate-300">صمم مرة واحدة ثم انشر Story / Reel / Post</span></div></div><button onClick={()=>setPreview(v=>!v)} className="rounded-lg bg-white/10 p-2"><Play className="h-4 w-4"/></button></div>
   <div className="grid md:grid-cols-[180px_1fr]">
    <div className="border-b bg-slate-50 p-2 md:border-b-0 md:border-l"><div className="grid gap-2">{[['post','منشور',Type],['story','قصة',ImageIcon],['reel','Reel',Video]].map(([k,l,I]:any)=><button key={k} onClick={()=>setMode(k)} className={'flex items-center gap-2 rounded-xl px-3 py-3 text-sm font-black '+(mode===k?'bg-teal-700 text-white':'bg-white border text-slate-700')}><I className="h-4 w-4"/>{l}</button>)}</div><div className="mt-3 rounded-xl border bg-white p-3"><b className="text-xs">الخلفيات</b><div className="mt-2 grid grid-cols-4 gap-1">{backgrounds.map(x=><button key={x.value} title={x.name} onClick={()=>setBg(x.value)} className="h-8 rounded-lg border" style={{background:x.value}}/>)}</div></div></div>
    <div className="p-4">
      <textarea value={text} onChange={e=>setText(e.target.value)} className="min-h-28 w-full rounded-2xl border bg-slate-50 p-4 text-sm outline-none focus:border-teal-500" placeholder={mode==='story'?'اكتب قصة مميزة...':mode==='reel'?'أضف وصفاً للـReel...':'بم تفكر؟ اكتب منشوراً احترافياً...'}/>
      <div className="mt-3 flex flex-wrap gap-2"><label className="cursor-pointer rounded-xl bg-slate-100 px-4 py-2 text-xs font-black"><Upload className="inline h-4 w-4 ml-1"/> صورة/فيديو<input type="file" accept="image/*,video/*" className="hidden" onChange={e=>setFile(e.target.files?.[0]||null)}/></label><label className="cursor-pointer rounded-xl bg-slate-100 px-4 py-2 text-xs font-black"><Music2 className="inline h-4 w-4 ml-1"/> إضافة موسيقى<input type="file" accept="audio/*" className="hidden" onChange={e=>{const f=e.target.files?.[0];if(f)addMusic(f)}}/></label><button onClick={()=>setNotice('يمكنك اختيار أي خلفية من لوحة الخلفيات.')} className="rounded-xl bg-slate-100 px-4 py-2 text-xs font-black"><Palette className="inline h-4 w-4 ml-1"/> خلفية</button></div>
      {url&&<div className="mt-3 overflow-hidden rounded-2xl bg-black">{mediaType==='video'?<video src={url} controls className="max-h-80 w-full object-contain"/>:<img src={url} className="max-h-80 w-full object-contain" alt=""/></div>}
      <div className="mt-3 grid gap-3 lg:grid-cols-2"><div className="rounded-2xl border bg-slate-50 p-3"><div className="flex items-center gap-2 text-xs font-black"><AudioLines className="h-4 w-4"/> مكتبة الموسيقى والأغاني</div><div className="mt-2 flex max-h-28 flex-wrap gap-2 overflow-y-auto">{library.map(a=><button key={a.id} onClick={()=>setMusic(a)} className={'rounded-lg border px-3 py-2 text-xs font-bold '+(music?.id===a.id?'bg-teal-700 text-white':'bg-white')}>{a.name}</button>)}</div>{music&&<><audio src={music.url} controls className="mt-2 w-full"/><div className="mt-2 flex items-center gap-2 text-[11px] font-bold"><Scissors className="h-4 w-4"/> من {musicStart}s إلى {musicEnd}s</div><input type="range" min="0" max="120" value={musicStart} onChange={e=>setMusicStart(Math.min(Number(e.target.value),musicEnd-1))} className="w-full"/><input type="range" min="1" max="120" value={musicEnd} onChange={e=>setMusicEnd(Math.max(Number(e.target.value),musicStart+1))} className="w-full"/></>}</div>
      <div className="rounded-2xl border bg-slate-50 p-3"><div className="text-xs font-black">النص والمؤثرات</div><div className="mt-2 flex flex-wrap gap-2"><input type="color" value={font} onChange={e=>setFont(e.target.value)} title="لون النص"/><input type="range" min="14" max="56" value={size} onChange={e=>setSize(Number(e.target.value))}/><select value={filter} onChange={e=>setFilter(e.target.value)} className="rounded-lg border p-2 text-xs"><option value="none">بدون فلتر</option><option value="contrast(1.15) saturate(1.25)">حيوي</option><option value="brightness(1.1)">فاتح</option><option value="grayscale(1)">أبيض وأسود</option><option value="sepia(.65)">دافئ</option></select></div></div></div>
      {preview&&<div className="mt-3 rounded-3xl border-4 border-slate-900 p-3"><div className="relative mx-auto min-h-64 max-w-md overflow-hidden rounded-2xl" style={{background:bg}}>{url&&mediaType==='image'&&<img src={url} className="absolute inset-0 h-full w-full object-cover" style={{filter}} alt=""/>}{url&&mediaType==='video'&&<video src={url} controls className="absolute inset-0 h-full w-full object-cover"/>}<div className="relative z-10 flex min-h-64 items-center justify-center p-8 text-center" style={{color:font,fontSize:size,fontWeight:800}}>{text||'المعاينة الاحترافية'}</div></div></div>}
      <div className="mt-4 flex items-center justify-end gap-2"><button onClick={()=>{setText('');setFile(null);setMusic(null)}} className="rounded-xl border px-4 py-3 text-sm font-bold">مسح</button><button onClick={publish} className="rounded-xl bg-teal-700 px-6 py-3 text-sm font-black text-white shadow-lg active:bg-teal-800"><Send className="inline h-4 w-4 ml-1"/> نشر الآن</button></div>
      {notice&&<div className="mt-3 rounded-xl bg-emerald-50 p-3 text-sm font-bold text-emerald-800">{notice}</div>}
    </div>
   </div>
 </section>
}