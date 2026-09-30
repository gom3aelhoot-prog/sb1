import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Album, AudioLines, BookOpen, CheckCircle2, ChevronLeft, ChevronRight, Clock3, Copy,
  ExternalLink, FileVideo, Gift, Globe2, Heart, Image as ImageIcon, Library,
  MessageCircle, Mic, Pause, Phone, Play, Plus, QrCode, Search, Send, Settings,
  Share2, Smartphone, Sparkles, BookOpen, Upload, Video, X, Youtube, Wand2
} from 'lucide-react';

type MediaKind = 'post' | 'image' | 'video' | 'reel' | 'audio';
type StoryItem = { id:string; name:string; text:string; mediaUrl?:string; createdAt:string; expiresAt:string; own?:boolean };
type FeedItem = {
  id:string; kind:MediaKind; text:string; mediaUrl?:string; mediaName?:string;
  createdAt:string; likes:number; comments:{id:string;name:string;body:string}[];
  public:boolean; demo?:boolean; author:string;
};
type CloneRecord = {
  id:string; type:string; name:string; pin:string; password:string; link:string;
  expires:string; permissions:string[]; createdAt:string;
};
type MedicalMedia = { id:string; title:string; specialty:string; source:string; kind:'video'|'audio'; url?:string; progress?:number };

const read = <T,>(key:string, fallback:T):T => {
  try { const v=localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch { return fallback; }
};
const write = (key:string, value:unknown) => { try { localStorage.setItem(key, JSON.stringify(value)); } catch {} };
const makeId = () => 'sb1-' + Date.now() + '-' + Math.random().toString(36).slice(2,8);

const demoPostTexts = [
  'شرح مبسط لأسباب القلق وكيفية التعامل معه يومياً.',
  'علامات تستحق مناقشة الطبيب النفسي المختص.',
  'كيف نفرّق بين التوتر الطبيعي والقلق المستمر؟',
  'معلومة طبية: النوم المنتظم جزء مهم من العناية بالصحة النفسية.',
  'أسئلة شائعة عن جلسات العلاج النفسي وكيفية الاستعداد لها.',
  'دليل مبسط لفهم نوبات الهلع وما الذي يمكن فعله أثناء النوبة.',
  'العلاقة بين الضغط النفسي والتركيز والذاكرة.',
  'متى تكون الاستشارة الطبية مناسبة للأطفال والمراهقين؟',
  'كيف يساعد تدوين الأعراض في تحسين الحوار مع الطبيب؟',
  'نصائح عامة لبناء روتين صحي داعم للصحة النفسية.',
  'ما الفرق بين الاستشارة الفردية والجلسات الجماعية؟',
  'التعامل مع الأفكار المتكررة: معلومات عامة وليست تشخيصاً.',
  'كيف تؤثر العادات اليومية في جودة النوم؟',
  'أسئلة مهمة يمكن طرحها على المختص قبل بدء الجلسات.',
  'مقدمة في العلاج المعرفي السلوكي.',
  'متى نحتاج إلى تقييم طبي شامل للأعراض النفسية؟',
  'الخصوصية والسرية في الجلسات الطبية.',
  'كيف يمكن للأسرة دعم شخص يطلب مساعدة متخصصة؟',
  'محتوى تعليمي عن الصحة النفسية بلغة مبسطة.',
  'مراجعة أسبوعية لأهم الأسئلة الطبية المنشورة على SB1.'
];

const demoStoryNames = ['قصتي','د. ليان','د. أحمد','مركز الحياة','سارة','محمد','عيادة الأسرة','فريق SB1'];
const demoStoryTexts = [
  'اليوم: معلومة طبية جديدة عن الصحة النفسية.',
  'جلسة تعليمية قصيرة عن النوم الصحي.',
  'سؤال وجواب مع المتابعين اليوم.',
  'فيديو جديد في المكتبة الطبية.',
  'تسجيل صوتي جديد في قسم المحتوى.',
  'موعد جلسة تعليمية مباشرة هذا الأسبوع.',
  'نصيحة عامة للعناية بالصحة النفسية.',
  'محتوى جديد باللغة العربية.'
];

const medicalVideos:MedicalMedia[] = [
  ['mv1','شرح تشريحي تعليمي: الدماغ والجهاز العصبي','علم الأعصاب','YouTube','video',undefined,0],
  ['mv2','مقدمة تعليمية عن اضطرابات القلق','الصحة النفسية','YouTube','video',undefined,24],
  ['mv3','شرح مبسط لآلية النوم ومراحله','طب النوم','YouTube','video',undefined,52],
  ['mv4','وثائقي تعليمي عن العمل السريري','الطب النفسي','YouTube','video',undefined,76],
  ['mv5','شرح مصور: كيف يعمل الجهاز العصبي؟','علم الأعصاب','YouTube','video',undefined,15],
  ['mv6','أساسيات الإسعاف النفسي الأولي','الصحة النفسية','YouTube','video',undefined,39],
  ['mv7','شرح تعليمي عن الذاكرة والتركيز','علم النفس','YouTube','video',undefined,61],
  ['mv8','مقدمة في العلاج المعرفي السلوكي','العلاج النفسي','YouTube','video',undefined,83],
  ['mv9','فهم نوبات الهلع: مادة تعليمية','الصحة النفسية','YouTube','video',undefined,10],
  ['mv10','مبادئ المقابلة الطبية المتخصصة','التقييم السريري','YouTube','video',undefined,44],
  ['mv11','شرح تعليمي عن التوتر والاستجابة الجسدية','الطب النفسي','YouTube','video',undefined,68],
  ['mv12','محتوى طبي مرئي: قراءة الأعراض بطريقة صحيحة','التثقيف الصحي','YouTube','video',undefined,32]
].map(x=>({id:x[0] as string,title:x[1] as string,specialty:x[2] as string,source:x[3] as string,kind:x[4] as 'video',url:x[5] as string|undefined,progress:x[6] as number}));

const medicalAudios:MedicalMedia[] = [
  'التسجيل الصوتي: كيف نستعد للاستشارة الطبية',
  'تسجيل قصير: معلومات عامة عن القلق',
  'تسجيل قصير: خطوات عملية لتحسين النوم',
  'تسجيل طبي: أسئلة شائعة من المرضى',
  'تسجيل صوتي: مقدمة في العلاج النفسي',
  'تسجيل صوتي: دعم الأسرة للمريض',
  'تسجيل صوتي: كيف ندوّن الأعراض؟',
  'تسجيل صوتي: متى نطلب مساعدة مختصة؟'
].map((title,i)=>({id:'ma'+i,title,specialty:'المحتوى الطبي',source:'SB1',kind:'audio'}));

export default function PageProfileTools({
  canManage=false, pageId='current', pageName='SB1',
  seedPosts=[]
}:{
  canManage?:boolean;
  pageId?:string;
  pageName?:string;
  seedPosts?:Array<{id:string;body:string;image_url?:string|null;video_url?:string|null;post_type?:string;created_at:string;likes_count?:number}>;
}) {
  const storedPosts = read<FeedItem[]>('sb1_workspace_posts_'+pageId,[]);
  const initialPosts = useMemo<FeedItem[]>(() => {
    if (storedPosts.length) return storedPosts;
    const seeded = seedPosts.map(p=>({
      id:p.id, kind:(p.video_url ? (p.post_type==='reel'?'reel':'video') : p.image_url ? 'image':'post') as MediaKind,
      text:p.body, mediaUrl:p.video_url||p.image_url||undefined, mediaName:undefined,
      createdAt:p.created_at, likes:p.likes_count||0, comments:[], public:true, demo:false, author:pageName
    }));
    const demo = Array.from({length:60},(_,i)=>({
      id:'demo-'+i, kind:(i%10===0?'reel':i%5===0?'video':i%4===0?'image':'post') as MediaKind,
      text:demoPostTexts[i%demoPostTexts.length], createdAt:new Date(Date.now()-i*3600000).toISOString(),
      likes:8+(i*7)%95, comments:[{id:'c'+i+'a',name:'مستخدم تجريبي',body:'معلومة مفيدة، شكراً.'},{id:'c'+i+'b',name:'عضو SB1',body:'ننتظر المزيد من هذا المحتوى.'}],
      public:true,demo:true,author:pageName
    }));
    return [...seeded,...demo];
  },[pageId,pageName,seedPosts.length]);

  const [feed,setFeed]=useState<FeedItem[]>(initialPosts);
  const [stories,setStories]=useState<StoryItem[]>(()=>read('sb1_workspace_stories_'+pageId,[]));
  const [section,setSection]=useState('home');
  const [post,setPost]=useState('');
  const [kind,setKind]=useState<MediaKind>('post');
  const [file,setFile]=useState<File|null>(null);
  const [fileUrl,setFileUrl]=useState('');
  const [comment,setComment]=useState<Record<string,string>>({});
  const [storyText,setStoryText]=useState('');
  const [storyFile,setStoryFile]=useState<File|null>(null);
  const [storyFileUrl,setStoryFileUrl]=useState('');
  const [storyOpen,setStoryOpen]=useState<StoryItem|null>(null);
  const [recording,setRecording]=useState(false);
  const [recordUrl,setRecordUrl]=useState('');
  const recorderRef=useRef<MediaRecorder|null>(null);
  const streamRef=useRef<MediaStream|null>(null);
  const chunksRef=useRef<Blob[]>([]);
  const [shareTarget,setShareTarget]=useState<{title:string;url:string}|null>(null);
  const [cloneType,setCloneType]=useState('specialist');
  const [cloneCount,setCloneCount]=useState(1);
  const [cloneName,setCloneName]=useState('');
  const [expires,setExpires]=useState('');
  const [permissions,setPermissions]=useState<string[]>(['free_articles','free_services','video_monitoring']);
  const [clones,setClones]=useState<CloneRecord[]>(()=>read('sb1_clone_registry',[]));
  const [giftClone,setGiftClone]=useState<CloneRecord|null>(null);
  const [externalSearch,setExternalSearch]=useState('');
  const [externalUrl,setExternalUrl]=useState('');
  const [externalWindows,setExternalWindows]=useState<string[]>([]);
  const [favorites,setFavorites]=useState<string[]>(()=>read('sb1_private_external_favorites',[]));
  const [phone,setPhone]=useState(()=>localStorage.getItem('sb1_private_phone')||'');
  const [settingsOpen,setSettingsOpen]=useState(false);
  const [medicalPublic,setMedicalPublic]=useState(true);
  const [note,setNote]=useState('');
  const [audioRecords,setAudioRecords]=useState<{id:string;name:string;url:string;createdAt:string}[]>(()=>read('sb1_audio_records_'+pageId,[]));
  const [watched,setWatched]=useState<string[]>(()=>read('sb1_watched_videos',[]));

  const rtl = !['en','fr','de','es','it','pt','ru','tr','zh','ja','ko'].includes((localStorage.getItem('language')||localStorage.getItem('lang')||'ar').slice(0,2));
  const pageUrl = window.location.origin+'/doctors/'+pageId;

  useEffect(()=>write('sb1_workspace_posts_'+pageId,feed),[feed,pageId]);
  useEffect(()=>write('sb1_workspace_stories_'+pageId,stories),[stories,pageId]);
  useEffect(()=>write('sb1_clone_registry',clones),[clones]);
  useEffect(()=>write('sb1_private_external_favorites',favorites),[favorites]);
  useEffect(()=>write('sb1_audio_records_'+pageId,audioRecords),[audioRecords,pageId]);
  useEffect(()=>write('sb1_watched_videos',watched),[watched]);
  useEffect(()=>{ if(file){const u=URL.createObjectURL(file);setFileUrl(u);return()=>URL.revokeObjectURL(u)} setFileUrl('') },[file]);
  useEffect(()=>{ if(storyFile){const u=URL.createObjectURL(storyFile);setStoryFileUrl(u);return()=>URL.revokeObjectURL(u)} setStoryFileUrl('') },[storyFile]);
  useEffect(()=>()=>{streamRef.current?.getTracks().forEach(t=>t.stop())},[]);

  const publicFeed=useMemo(()=>feed.filter(x=>x.public),[feed]);
  const reels=useMemo(()=>publicFeed.filter(x=>x.kind==='reel'),[publicFeed]);
  const myVideos=useMemo(()=>publicFeed.filter(x=>x.kind==='video'||x.kind==='reel').slice(0,12),[publicFeed]);
  const watchedVideos=useMemo(()=>medicalVideos.filter(v=>watched.includes(v.id)).concat(medicalVideos.filter(v=>!watched.includes(v.id)).slice(0,6)),[watched]);
  const activeStories=useMemo(()=>stories.filter(s=>new Date(s.expiresAt)>new Date()).concat(demoStoryNames.slice(1).map((name,i)=>({id:'demo-story-'+i,name,text:demoStoryTexts[i],createdAt:new Date(Date.now()-i*3600000).toISOString(),expiresAt:new Date(Date.now()+86400000).toISOString()}))),[stories]);

  const jump=(id:string)=>{setSection(id);document.getElementById('sb1-section-'+id)?.scrollIntoView({behavior:'smooth',block:'start'})};
  const btn=(id:string,label:string,Icon:any)=><button key={id} onClick={()=>jump(id)} className={'flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold transition '+(section===id?'bg-teal-700 text-white':'bg-white text-gray-700 hover:bg-teal-50') }><Icon className="h-4 w-4"/>{label}</button>;

  const addPost=()=>{
    if(!post.trim()&&!fileUrl&&!recordUrl)return;
    const item:FeedItem={id:makeId(),kind,text:post.trim()||'محتوى طبي جديد',mediaUrl:recordUrl||fileUrl||undefined,mediaName:file?.name,createdAt:new Date().toISOString(),likes:0,comments:[],public:true,demo:false,author:pageName};
    setFeed(v=>[item,...v]);setPost('');setFile(null);setRecordUrl('');setKind('post');setNote('تم نشر المحتوى بنجاح.');
  };

  const createStory=()=>{
    if(!storyText.trim()&&!storyFileUrl)return;
    setStories(v=>[{id:makeId(),name:'قصتي',text:storyText.trim(),mediaUrl:storyFileUrl||undefined,createdAt:new Date().toISOString(),expiresAt:new Date(Date.now()+86400000).toISOString(),own:true},...v]);
    setStoryText('');setStoryFile(null);setNote('تم إنشاء قصتك وتظهر في أعلى الصفحة لمدة 24 ساعة.');
  };

  const startRecording=async()=>{
    try{
      const stream=await navigator.mediaDevices.getUserMedia({audio:true});
      const mime=MediaRecorder.isTypeSupported('audio/webm')?'audio/webm':'audio/ogg';
      const recorder=new MediaRecorder(stream,{mimeType:mime});
      chunksRef.current=[];streamRef.current=stream;recorderRef.current=recorder;
      recorder.ondataavailable=e=>{if(e.data.size)chunksRef.current.push(e.data)};
      recorder.onstop=()=>{const blob=new Blob(chunksRef.current,{type:mime});const url=URL.createObjectURL(blob);setRecordUrl(url);setAudioRecords(v=>[{id:makeId(),name:'تسجيل صوتي جديد',url,createdAt:new Date().toISOString()},...v]);stream.getTracks().forEach(t=>t.stop());};
      recorder.start();setRecording(true);setNote('جارٍ تسجيل الصوت... اضغط إيقاف عند الانتهاء.');
    }catch{setNote('تعذر الوصول إلى الميكروفون. اسمح للمتصفح باستخدام الميكروفون ثم حاول مرة أخرى.')}
  };
  const stopRecording=()=>{recorderRef.current?.stop();setRecording(false);setNote('تم حفظ التسجيل الصوتي للمعاينة.');};

  const like=(id:string)=>setFeed(v=>v.map(p=>p.id===id?{...p,likes:p.likes+1}:p));
  const addComment=(id:string)=>{const body=(comment[id]||'').trim();if(!body)return;setFeed(v=>v.map(p=>p.id===id?{...p,comments:[...p.comments,{id:makeId(),name:'مستخدم SB1',body}]}:p));setComment(v=>({...v,[id]:''}));};

  const openShare=(title:string,url:string)=>setShareTarget({title,url});
  const nativeShare=async()=>{
    if(!shareTarget)return;
    const data={title:shareTarget.title,text:'صفحة SB1',url:shareTarget.url};
    try{if(navigator.share){await navigator.share(data);return}}catch{}
    setNote('اختر إحدى طرق الإرسال من القائمة.');
  };
  const shareLinks=(kind:string,url:string,title:string)=>{
    const text=encodeURIComponent(title+' - '+url);
    if(kind==='telegram')return 'https://t.me/share/url?url='+encodeURIComponent(url)+'&text='+encodeURIComponent(title);
    if(kind==='whatsapp')return 'https://wa.me/?text='+text;
    if(kind==='facebook')return 'https://www.facebook.com/sharer/sharer.php?u='+encodeURIComponent(url);
    if(kind==='x')return 'https://twitter.com/intent/tweet?text='+text;
    if(kind==='email')return 'mailto:?subject='+encodeURIComponent(title)+'&body='+text;
    return 'sms:?body='+text;
  };

  const makeClone=()=>{
    const count=Math.min(50,Math.max(1,Number(cloneCount)||1));
    const created=Array.from({length:count},(_,i)=>({id:makeId(),type:cloneType,name:(cloneName.trim()||'صفحة '+cloneType)+(count>1?' '+(i+1):''),pin:String(1000+Math.floor(Math.random()*9000)),password:Math.random().toString(36).slice(2,10),link:window.location.origin+'/clone/'+makeId(),expires,permissions:[...permissions],createdAt:new Date().toISOString()}));
    setClones(v=>[...created,...v]);setNote('تم إنشاء الصفحة/الصفحات المستنسخة.');
  };

  const searchExternal=()=>{
    const q=externalSearch.trim();if(!q)return;
    const u='https://www.google.com/search?q='+encodeURIComponent(q+' (site:youtube.com OR site:vk.com OR site:ok.ru OR site:rutube.ru OR site:mail.ru)');
    window.open(u,'_blank','noopener,noreferrer,width=1100,height=800');setExternalWindows(v=>[u,...v]);
  };
  const openExternal=(url:string)=>{if(!(url.startsWith('http://')||url.startsWith('https://')))return;window.open(url,'_blank','noopener,noreferrer,width=1100,height=800');setExternalWindows(v=>[url,...v]);if(!favorites.includes(url))setFavorites(v=>[url,...v]);};

  const sidebar = (
    <aside className={'fixed top-1/2 z-50 hidden w-56 -translate-y-1/2 rounded-2xl border bg-white/95 p-3 shadow-2xl backdrop-blur lg:block '+(rtl?'right-3':'left-3')}>
      <div className="mb-3 flex items-center gap-2 border-b pb-3"><Sparkles className="h-5 w-5 text-teal-700"/><b>SB1</b><span className="text-xs text-gray-400">القائمة الرئيسية</span></div>
      <div className="space-y-1">
        {btn('home','الرئيسية',Globe2)}
        {btn('reels','Reels',Video)}
        {btn('posts','المنشورات',MessageCircle)}
        {btn('albums','الألبومات',Album)}
        {btn('social','منصات التواصل',ExternalLink)}
        {btn('clone','Clone / Gift',Wand2)}
        {btn('phone','الهاتف وQR',QrCode)}
        {btn('settings','الإعدادات',Settings)}
      </div>
    </aside>
  );

  return <div dir={rtl?'rtl':'ltr'} className={(rtl?'lg:pr-64 ':'lg:pl-64 ')+'mt-8 space-y-6'}>
    {sidebar}

    <section id="sb1-section-home" className="card overflow-hidden border-2 border-teal-100">
      <div className="border-b bg-gradient-to-l from-teal-700 to-teal-500 p-5 text-white">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div><div className="text-xs font-bold opacity-80">SB1 • الرئيسية</div><h2 className="mt-1 text-2xl font-extrabold">القصص والريلز والمحتوى الطبي</h2><p className="mt-1 text-sm opacity-90">معاينة كاملة للمحتوى والتفاعل والنشر.</p></div>
          <button onClick={()=>openShare(pageName,pageUrl)} className="rounded-xl bg-white/15 px-4 py-2 font-bold hover:bg-white/25"><Share2 className="inline h-4 w-4 ml-1"/>إرسال الصفحة</button>
        </div>
      </div>

      <div className="p-5">
        <div className="mb-3 flex items-center justify-between"><h3 className="text-lg font-extrabold">Stories — القصص</h3><span className="text-xs text-gray-500">تختفي تلقائياً بعد 24 ساعة</span></div>
        <div className="flex gap-4 overflow-x-auto pb-2">
          <button onClick={()=>document.getElementById('sb1-story-create')?.scrollIntoView({behavior:'smooth'})} className="min-w-24 text-center">
            <div className="mx-auto grid h-20 w-20 place-items-center rounded-full border-4 border-teal-500 bg-teal-50"><Plus className="h-8 w-8 text-teal-700"/></div><span className="mt-2 block text-xs font-bold">قصتي</span>
          </button>
          {activeStories.map(s=><button key={s.id} onClick={()=>setStoryOpen(s)} className="min-w-24 text-center">
            <div className="mx-auto h-20 w-20 overflow-hidden rounded-full border-4 border-teal-500 bg-gradient-to-br from-teal-100 to-slate-100">
              {s.mediaUrl ? <img src={s.mediaUrl} className="h-full w-full object-cover" alt=""/> : <div className="grid h-full place-items-center p-2 text-center text-xs font-bold text-teal-800">{s.name}</div>}
            </div><span className="mt-2 block truncate text-xs font-bold">{s.name}</span>
          </button>)}
        </div>
      </div>
    </section>

    <section id="sb1-story-create" className="card p-5">
      <div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="text-lg font-extrabold">إنشاء قصتي</h3><p className="text-sm text-gray-500">نص أو صورة أو فيديو. القصة خاصة بحسابك ويمكن حذفها لاحقاً.</p></div><BookOpen className="h-6 w-6 text-teal-700"/></div>
      <textarea value={storyText} onChange={e=>setStoryText(e.target.value)} className="mt-3 min-h-20 w-full rounded-xl border p-3" placeholder="اكتب قصتك..."/>
      <div className="mt-3 flex flex-wrap gap-2">
        <label className="cursor-pointer rounded-xl bg-slate-50 px-4 py-2 text-sm font-bold"><Upload className="inline h-4 w-4 ml-1"/>إضافة صورة/فيديو<input type="file" accept="image/*,video/*" className="hidden" onChange={e=>setStoryFile(e.target.files?.[0]||null)}/></label>
        <button onClick={createStory} className="rounded-xl bg-teal-700 px-5 py-2 font-bold text-white">إنشاء القصة</button>
      </div>
      {storyFile&&<div className="mt-2 text-xs text-gray-500">{storyFile.name}</div>}
    </section>

    <section id="sb1-section-reels" className="card p-5">
      <div className="flex items-center justify-between"><h3 className="text-xl font-extrabold">Reels</h3><span className="text-xs text-gray-500">{reels.length} Reel • بيانات تجريبية للمعاينة</span></div>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
        {reels.slice(0,18).map(r=><button key={r.id} onClick={()=>openShare(r.text,pageUrl)} className="group overflow-hidden rounded-2xl bg-slate-900 text-right text-white">
          <div className="relative aspect-[3/5] bg-gradient-to-br from-teal-900 via-slate-900 to-indigo-900">
            {r.mediaUrl ? <video src={r.mediaUrl} controls className="h-full w-full object-cover"/> : <div className="grid h-full place-items-center p-4"><Video className="h-10 w-10 opacity-70"/></div>}
            <span className="absolute right-2 top-2 rounded-full bg-white/15 px-2 py-1 text-[10px]">Reel</span>
            <span className="absolute bottom-2 right-2 left-2 text-xs font-bold">{r.text.slice(0,55)}</span>
          </div>
        </button>)}
      </div>
    </section>

    <section id="sb1-section-posts" className="space-y-4">
      <div className="card p-5">
        <div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="text-xl font-extrabold">المنشورات</h3><p className="text-sm text-gray-500">كل 20 منشوراً يظهر شريط Reels كما طلبت.</p></div><span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-bold text-teal-700">{publicFeed.length} منشور</span></div>
        {canManage&&<div className="mt-4 rounded-2xl border-2 border-teal-100 p-4">
          <textarea value={post} onChange={e=>setPost(e.target.value)} className="min-h-20 w-full rounded-xl border p-3" placeholder="اكتب منشوراً..."/>
          <div className="mt-3 flex flex-wrap gap-2">
            {(['post','image','video','reel','audio'] as MediaKind[]).map(k=><button key={k} onClick={()=>setKind(k)} className={'rounded-xl px-4 py-2 text-sm font-bold '+(kind===k?'bg-teal-700 text-white':'bg-slate-50 text-gray-700')}>{k==='post'?'منشور':k==='image'?'صورة':k==='video'?'فيديو':k==='reel'?'Reel':'صوت'}</button>)}
            <label className="cursor-pointer rounded-xl bg-slate-50 px-4 py-2 text-sm font-bold"><Upload className="inline h-4 w-4 ml-1"/>ملف<input type="file" accept={kind==='audio'?'audio/*':kind==='image'?'image/*':kind==='video'||kind==='reel'?'video/*':'*/*'} className="hidden" onChange={e=>setFile(e.target.files?.[0]||null)}/></label>
            <button onClick={recording?stopRecording:startRecording} className={'rounded-xl px-4 py-2 text-sm font-bold '+(recording?'bg-red-600 text-white':'bg-slate-50 text-gray-700')}><Mic className="inline h-4 w-4 ml-1"/>{recording?'إيقاف التسجيل':'تسجيل صوتي'}</button>
            <button onClick={addPost} className="rounded-xl bg-teal-700 px-5 py-2 font-bold text-white">نشر</button>
          </div>
          {(file||recordUrl)&&<div className="mt-3 rounded-xl bg-slate-50 p-3 text-sm">{file?.name||'تسجيل صوتي جاهز للنشر'}</div>}
          <label className="mt-3 flex items-center gap-2 text-sm"><input type="checkbox" checked={medicalPublic} onChange={e=>setMedicalPublic(e.target.checked)}/> المحتوى الطبي المنشور هنا متاح مجاناً للعامة.</label>
        </div>}
      </div>

      {Array.from({length:Math.ceil(publicFeed.length/20)},(_,block)=>publicFeed.slice(block*20,(block+1)*20)).map((block,bi)=><div key={bi} className="space-y-4">
        {block.map(p=><article key={p.id} className="card p-5">
          <div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-full bg-teal-100 font-bold text-teal-700">{p.author.charAt(0)}</div><div><b className="text-sm">{p.author}</b><div className="text-xs text-gray-400">{new Date(p.createdAt).toLocaleString()}</div></div>{p.demo&&<span className="mr-auto rounded-full bg-amber-50 px-2 py-1 text-[10px] font-bold text-amber-700">بيانات تجريبية</span>}</div>
          <p className="mt-3 leading-7 text-gray-700">{p.text}</p>
          {p.mediaUrl&&p.kind==='image'&&<img src={p.mediaUrl} alt="" className="mt-3 max-h-[520px] w-full rounded-2xl object-cover"/>}
          {p.mediaUrl&&(p.kind==='video'||p.kind==='reel')&&<video src={p.mediaUrl} controls className="mt-3 max-h-[520px] w-full rounded-2xl bg-black"/>}
          {p.mediaUrl&&p.kind==='audio'&&<audio src={p.mediaUrl} controls className="mt-3 w-full"/>}
          <div className="mt-4 flex items-center gap-4 border-t pt-3 text-sm"><button onClick={()=>like(p.id)} className="flex items-center gap-1 font-bold hover:text-teal-700"><Heart className="h-4 w-4"/>{p.likes}</button><span><MessageCircle className="inline h-4 w-4 ml-1"/>{p.comments.length}</span><button onClick={()=>openShare(p.text,pageUrl)} className="mr-auto rounded-lg bg-slate-50 px-3 py-1"><Share2 className="inline h-4 w-4 ml-1"/>إرسال</button></div>
          <div className="mt-3 space-y-2">{p.comments.map(c=><div key={c.id} className="rounded-xl bg-slate-50 p-3"><b className="text-xs">{c.name}</b><p className="text-sm">{c.body}</p></div>)}</div>
          <div className="mt-3 flex gap-2"><input value={comment[p.id]||''} onChange={e=>setComment(v=>({...v,[p.id]:e.target.value}))} onKeyDown={e=>e.key==='Enter'&&addComment(p.id)} className="flex-1 rounded-xl border px-3 py-2 text-sm" placeholder="اكتب تعليقاً..."/><button onClick={()=>addComment(p.id)} className="rounded-xl bg-teal-700 px-4 text-white"><Send className="h-4 w-4"/></button></div>
        </article>)}
        {bi<Math.ceil(publicFeed.length/20)-1&&<div className="card border-2 border-teal-100 p-4"><div className="mb-3 flex items-center justify-between"><b>Reels بعد 20 منشوراً</b><button onClick={()=>jump('reels')} className="text-xs font-bold text-teal-700">عرض الكل</button></div><div className="flex gap-3 overflow-x-auto">{reels.slice(bi*6,bi*6+6).map(r=><button key={r.id} onClick={()=>openShare(r.text,pageUrl)} className="min-w-32 overflow-hidden rounded-xl bg-slate-900 text-white"><div className="aspect-[3/4] grid place-items-center"><Video className="h-7 w-7"/><span className="px-2 text-xs">{r.text.slice(0,35)}</span></div></button>)}</div></div>}
      </div>)}
    </section>

    <section id="sb1-section-albums" className="card p-5">
      <div className="flex items-center justify-between"><div><h3 className="text-xl font-extrabold">الألبومات</h3><p className="text-sm text-gray-500">صور وفيديو وتسجيلات وصوتيات الصفحة.</p></div><Album className="h-6 w-6 text-teal-700"/></div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{['الصور','الفيديوهات','التسجيلات الصوتية','المحتوى الطبي'].map((n,i)=><div key={n} className="rounded-2xl border p-4"><div className="grid h-28 place-items-center rounded-xl bg-gradient-to-br from-teal-50 to-slate-100">{i===0?<ImageIcon/>:i===1?<FileVideo/>:<AudioLines/>}</div><b className="mt-3 block">{n}</b><span className="text-xs text-gray-500">{i===3?'محتوى عام ومجاني':'مكتبة الصفحة'}</span></div>)}</div>
    </section>

    <section className="card p-5">
      <div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="text-xl font-extrabold">المحتوى الطبي: فيديوهاتي وشاهداتي</h3><p className="text-sm text-gray-500">فيديوهات طبية وتعليمية تظهر داخل SB1. يمكن ربط مصادر YouTube بداخل الموقع باستخدام المشغل المضمن.</p></div><Library className="h-6 w-6 text-teal-700"/></div>
      <div className="mt-4 flex gap-2"><button className="rounded-xl bg-teal-700 px-4 py-2 text-sm font-bold text-white">فيديوهاتي</button><button className="rounded-xl border px-4 py-2 text-sm font-bold">شاهداتي</button></div>
      <div className="mt-4 grid gap-4 md:grid-cols-3">{watchedVideos.map(v=><div key={v.id} className="overflow-hidden rounded-2xl border bg-white"><div className="aspect-video bg-slate-900 p-4 text-white">{v.url?<iframe title={v.title} src={v.url} className="h-full w-full" allowFullScreen/>:<div className="grid h-full place-items-center text-center"><Video className="h-10 w-10 opacity-70"/><span className="text-xs">{v.title}</span></div>}</div><div className="p-3"><b className="text-sm">{v.title}</b><div className="mt-1 text-xs text-gray-500">{v.specialty} • {v.source}</div><div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100"><div className="h-full bg-teal-600" style={{width:(v.progress||0)+'%'}}/></div><button onClick={()=>setWatched(x=>x.includes(v.id)?x.filter(y=>y!==v.id):[...x,v.id])} className="mt-3 rounded-lg bg-teal-50 px-3 py-1 text-xs font-bold text-teal-700">{watched.includes(v.id)?'تمت المشاهدة':'تسجيل كمشاهد'}</button></div></div>)}</div>
    </section>

    <section className="card p-5">
      <div className="flex items-center justify-between"><div><h3 className="text-xl font-extrabold">تسجيلاتي الصوتية</h3><p className="text-sm text-gray-500">تسجيلاتك التي تعكس التسجيلات الصوتية داخل المحتوى الطبي.</p></div><AudioLines className="h-6 w-6 text-teal-700"/></div>
      <div className="mt-4 grid gap-3 md:grid-cols-2">{[...audioRecords,...medicalAudios.map(a=>({id:a.id,name:a.title,url:'',createdAt:new Date().toISOString()}))].slice(0,12).map(a=><div key={a.id} className="rounded-2xl border p-4"><div className="flex items-center gap-3"><div className="grid h-11 w-11 place-items-center rounded-full bg-teal-50"><AudioLines className="text-teal-700"/></div><div className="min-w-0 flex-1"><b className="block truncate text-sm">{a.name}</b><span className="text-xs text-gray-400">{new Date(a.createdAt).toLocaleString()}</span></div></div>{a.url?<audio controls src={a.url} className="mt-3 w-full"/>:<div className="mt-3 rounded-xl bg-slate-50 p-3 text-xs text-gray-500">تسجيل طبي تجريبي — اضغط «تسجيل صوتي» لإنشاء تسجيل فعلي من الميكروفون.</div>}</div>)}</div>
    </section>

    <section id="sb1-section-social" className="card p-5">
      <div className="flex items-center justify-between"><div><h3 className="text-xl font-extrabold">منصات التواصل</h3><p className="text-sm text-gray-500">بحث وفتح عدة نوافذ وحفظ المفضلة الخارجية بشكل خاص.</p></div><ExternalLink className="h-6 w-6 text-teal-700"/></div>
      {canManage&&<><div className="mt-4 flex gap-2"><input value={externalSearch} onChange={e=>setExternalSearch(e.target.value)} onKeyDown={e=>e.key==='Enter'&&searchExternal()} className="flex-1 rounded-xl border p-3" placeholder="ابحث عن YouTube / VK / OK / Rutube..."/><button onClick={searchExternal} className="rounded-xl bg-teal-700 px-5 text-white"><Search className="inline h-4 w-4 ml-1"/>بحث</button></div><div className="mt-3 flex gap-2"><input value={externalUrl} onChange={e=>setExternalUrl(e.target.value)} className="flex-1 rounded-xl border p-3" placeholder="ألصق رابط المنصة"/><button onClick={()=>{const u=externalUrl.trim();if(u)openExternal(u)}} className="rounded-xl bg-slate-900 px-5 text-white">فتح</button></div></>}
      <div className="mt-4 flex flex-wrap gap-2">{['YouTube','VK','OK','Rutube','Mail.ru'].map(n=><button key={n} onClick={()=>openExternal('https://www.google.com/search?q='+encodeURIComponent(n+' medical'))} className="rounded-xl border px-4 py-2 text-sm font-bold hover:border-teal-500">{n}</button>)}</div>
      {favorites.length>0&&<div className="mt-4 rounded-2xl bg-slate-50 p-4"><b>المفضلة الخاصة</b>{favorites.map(u=><div key={u} className="mt-2 flex gap-2 text-xs"><span className="flex-1 truncate">{u}</span><button onClick={()=>setFavorites(v=>v.filter(x=>x!==u))}><X className="h-4 w-4"/></button></div>)}</div>}
    </section>

    <section id="sb1-section-clone" className="card p-5">
      <div className="flex items-center justify-between"><div><h3 className="text-xl font-extrabold">Clone / Gift</h3><p className="text-sm text-gray-500">استنساخ نوع الحساب والعدد والصلاحيات فقط.</p></div><Wand2 className="h-6 w-6 text-teal-700"/></div>
      {canManage&&<><div className="mt-4 grid gap-3 md:grid-cols-4"><select value={cloneType} onChange={e=>setCloneType(e.target.value)} className="rounded-xl border p-3"><option value="specialist">أخصائي</option><option value="institution">مؤسسة</option><option value="delivery_worker">عامل توصيل</option><option value="service_other">خدمة أخرى</option><option value="client">عميل</option></select><input type="number" min={1} max={50} value={cloneCount} onChange={e=>setCloneCount(Number(e.target.value))} className="rounded-xl border p-3"/><input value={cloneName} onChange={e=>setCloneName(e.target.value)} className="rounded-xl border p-3" placeholder="اسم الصفحة"/><input type="date" value={expires} onChange={e=>setExpires(e.target.value)} className="rounded-xl border p-3"/></div><div className="mt-3 flex flex-wrap gap-2">{[['free_articles','مقالات مجانية'],['paid_articles','مقالات مدفوعة'],['free_services','خدمات مجانية'],['admin','لوحة الإدارة'],['video_monitoring','مراقبة الفيديو'],['edit','تعديل وإضافة وحذف']].map(([p,l])=><label key={p} className="rounded-xl bg-slate-50 px-3 py-2 text-xs"><input type="checkbox" checked={permissions.includes(p)} onChange={()=>setPermissions(v=>v.includes(p)?v.filter(x=>x!==p):[...v,p])} className="ml-1"/>{l}</label>)}</div><button onClick={makeClone} className="mt-3 rounded-xl bg-teal-700 px-5 py-2 font-bold text-white">إنشاء</button></>}
      <div className="mt-4 space-y-3">{clones.slice(0,10).map(c=><div key={c.id} className="rounded-2xl border p-4"><div className="flex items-center justify-between"><b>{c.name}</b><span className="text-xs text-gray-500">{c.type}</span></div><div className="mt-2 grid gap-2 text-xs md:grid-cols-4"><span>PIN: <b>{c.pin}</b></span><span>كلمة المرور: <b>{c.password}</b></span><span>الانتهاء: <b>{c.expires||'بدون'}</b></span><span className="truncate">{c.link}</span></div><button onClick={()=>setGiftClone(c)} className="mt-3 rounded-xl bg-teal-700 px-4 py-2 text-sm font-bold text-white"><Gift className="inline h-4 w-4 ml-1"/>إرسال</button></div>)}</div>
    </section>

    <section id="sb1-section-phone" className="card p-5">
      <div className="flex items-center justify-between"><div><h3 className="text-xl font-extrabold">الهاتف وQR</h3><p className="text-sm text-gray-500">QR يفتح صفحة SB1 مباشرة لرفع الصور والفيديو.</p></div><QrCode className="h-6 w-6 text-teal-700"/></div>
      {canManage&&<div className="mt-4 grid gap-5 md:grid-cols-2"><div><label className="text-sm font-bold">رقم الهاتف</label><input value={phone} onChange={e=>{setPhone(e.target.value);localStorage.setItem('sb1_private_phone',e.target.value)}} className="mt-2 w-full rounded-xl border p-3" placeholder="+49 ..."/><p className="mt-2 text-xs text-gray-500">الرقم محفوظ كبيان خاص ولا يظهر للزوار.</p></div><div className="grid place-items-center rounded-2xl bg-white p-4"><img src={'https://api.qrserver.com/v1/create-qr-code/?size=240x240&data='+encodeURIComponent(pageUrl)} alt="QR" className="h-48 w-48"/><b className="mt-2 text-xs">امسح QR لفتح صفحة SB1</b></div></div>}
    </section>

    <section id="sb1-section-settings" className="card p-5">
      <div className="flex items-center justify-between"><div><h3 className="text-xl font-extrabold">الإعدادات</h3><p className="text-sm text-gray-500">الإعدادات منفصلة ولا تظهر إلا لصاحب الصفحة أو المالك/المشرف.</p></div><Settings className="h-6 w-6 text-teal-700"/></div>
      {canManage&&<><button onClick={()=>setSettingsOpen(v=>!v)} className="mt-3 rounded-xl bg-teal-700 px-5 py-2 font-bold text-white">{settingsOpen?'إخفاء الإعدادات':'فتح الإعدادات'}</button>{settingsOpen&&<div className="mt-4 grid gap-3 md:grid-cols-2"><label className="rounded-xl bg-slate-50 p-4"><b className="block">المحتوى الطبي العام</b><span className="text-xs text-gray-500">السماح للزوار بمشاهدة المحتوى الطبي المجاني.</span><input type="checkbox" checked={medicalPublic} onChange={e=>setMedicalPublic(e.target.checked)} className="mt-3 h-5 w-5"/></label><label className="rounded-xl bg-slate-50 p-4"><b className="block">القصص</b><span className="text-xs text-gray-500">إظهار القصص أعلى الصفحة.</span><input type="checkbox" defaultChecked className="mt-3 h-5 w-5"/></label></div>}</>}
    </section>

    {storyOpen&&<div className="fixed inset-0 z-[100] grid place-items-center bg-black/70 p-4" onClick={()=>setStoryOpen(null)}><div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-slate-900 text-white" onClick={e=>e.stopPropagation()}><button onClick={()=>setStoryOpen(null)} className="absolute left-3 top-3 z-10 rounded-full bg-black/40 p-2"><X/></button>{storyOpen.mediaUrl?<img src={storyOpen.mediaUrl} className="max-h-[70vh] w-full object-contain" alt=""/>:<div className="grid min-h-[60vh] place-items-center bg-gradient-to-br from-teal-900 to-indigo-950 p-10 text-center text-2xl font-extrabold">{storyOpen.text}</div>}<div className="p-4"><b>{storyOpen.name}</b><p className="mt-2 text-sm opacity-80">{storyOpen.text}</p></div></div></div>}

    {shareTarget&&<div className="fixed inset-0 z-[100] grid place-items-center bg-black/50 p-4" onClick={()=>setShareTarget(null)}><div className="w-full max-w-lg rounded-3xl bg-white p-6" onClick={e=>e.stopPropagation()}><div className="flex items-center justify-between"><h3 className="text-xl font-extrabold">إرسال الصفحة</h3><button onClick={()=>setShareTarget(null)}><X/></button></div><p className="mt-2 text-sm text-gray-500">اختر المكان الذي تريد الإرسال إليه. على الأجهزة التي تدعم المشاركة الأصلية سيظهر لك أيضاً كل تطبيقات المشاركة المتاحة.</p><button onClick={nativeShare} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-teal-700 px-4 py-3 font-bold text-white"><Share2/>المشاركة من الجهاز</button><div className="mt-4 grid grid-cols-2 gap-2">{[['telegram','Telegram'],['whatsapp','WhatsApp'],['facebook','Facebook'],['x','X'],['email','البريد الإلكتروني'],['sms','الرسائل']].map(([k,l])=><a key={k} target="_blank" rel="noreferrer" href={shareLinks(k,shareTarget.url,shareTarget.title)} className="rounded-xl border p-3 text-center font-bold hover:border-teal-500 hover:text-teal-700">{l}</a>)}</div></div></div>}

    {note&&<div className="fixed bottom-5 left-1/2 z-[120] -translate-x-1/2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white shadow-xl"><CheckCircle2 className="inline h-4 w-4 ml-1 text-teal-300"/>{note}<button onClick={()=>setNote('')} className="mr-3"><X className="inline h-4 w-4"/></button></div>}
  </div>;
}
