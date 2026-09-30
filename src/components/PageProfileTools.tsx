import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Album, AudioLines, BookOpen, CheckCircle2, ExternalLink, FileVideo, Gift, Heart,
  Image as ImageIcon, Library, MessageCircle, Mic, Plus, QrCode, Search, Send,
  Settings, Share2, Trash2, Upload, Video, X, Wand2
} from 'lucide-react';

type MediaKind = 'post' | 'image' | 'video' | 'reel' | 'audio';
type StoryItem = { id:string; name:string; text:string; mediaUrl?:string; mediaKind?:'image'|'video'; createdAt:string; expiresAt:string; own?:boolean };
type FeedItem = {
  id:string; kind:MediaKind; text:string; mediaUrl?:string; mediaName?:string;
  createdAt:string; likes:number; comments:{id:string;name:string;body:string}[];
  public:boolean; demo?:boolean; author:string;
};

const read = <T,>(key:string, fallback:T):T => {
  try { const v=localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch { return fallback; }
};
const write = (key:string, value:unknown) => { try { localStorage.setItem(key, JSON.stringify(value)); } catch {} };
const id = () => 'sb1-' + Date.now() + '-' + Math.random().toString(36).slice(2,8);

const demoTexts = [
  'منشور تعليمي من د. جمال نادي حول علم النفس الإكلينيكي.',
  'كيف نميز بين القلق الطبيعي والقلق الذي يحتاج إلى تقييم مختص؟',
  'معلومة تثقيفية عامة عن النوم والصحة النفسية.',
  'أسئلة مهمة يمكن طرحها على المختص قبل بدء الجلسات.',
  'مقدمة مبسطة في العلاج المعرفي السلوكي.',
  'كيف يمكن للأسرة دعم شخص يطلب مساعدة متخصصة؟',
  'معلومة عامة عن الذاكرة والتركيز والضغط النفسي.',
  'متى تكون الاستشارة المتخصصة مناسبة؟'
];

const demoNames = ['د. ليان','د. أحمد','مركز الحياة','سارة','محمد','عيادة الأسرة'];
const demoStoryTexts = ['معلومة طبية جديدة اليوم','جلسة تعليمية قصيرة','سؤال وجواب مع المتابعين','فيديو جديد في المحتوى الطبي','تسجيل صوتي جديد','موعد جلسة تعليمية هذا الأسبوع'];

export default function PageProfileTools({
  canManage=false, pageId='current', pageName='SB1',
  seedPosts=[]
}:{
  canManage?:boolean;
  pageId?:string;
  pageName?:string;
  seedPosts?:Array<{id:string;body:string;image_url?:string|null;video_url?:string|null;post_type?:string;created_at:string;likes_count?:number}>;
}) {
  const initial = useMemo<FeedItem[]>(() => {
    const saved = read<FeedItem[]>('sb1_fb_posts_'+pageId, []);
    if (saved.length) return saved;
    const seeded = seedPosts.map(p=>({
      id:p.id, kind:(p.video_url ? (p.post_type==='reel'?'reel':'video') : p.image_url ? 'image':'post') as MediaKind,
      text:p.body, mediaUrl:p.video_url||p.image_url||undefined, createdAt:p.created_at,
      likes:p.likes_count||0, comments:[], public:true, demo:false, author:pageName
    }));
    const demo = Array.from({length:60},(_,i)=>({
      id:'demo-'+i, kind:(i%4===0?'reel':i%5===0?'video':i%3===0?'image':'post') as MediaKind,
      text:demoTexts[i%demoTexts.length], createdAt:new Date(Date.now()-i*3600000).toISOString(),
      likes:12+(i*7)%120,
      comments:[{id:'c'+i+'a',name:'مستخدم تجريبي',body:'معلومة مفيدة، شكراً.'}],
      public:true,demo:true,author:pageName
    }));
    return [...seeded,...demo];
  },[pageId,pageName,seedPosts.length]);

  const [feed,setFeed]=useState<FeedItem[]>(initial);
  const [stories,setStories]=useState<StoryItem[]>(()=>read('sb1_fb_stories_'+pageId,[]));
  const [storyViewer,setStoryViewer]=useState<StoryItem|null>(null);
  const [storyComposer,setStoryComposer]=useState(false);
  const [storyText,setStoryText]=useState('');
  const [storyFile,setStoryFile]=useState<File|null>(null);
  const [storyUrl,setStoryUrl]=useState('');
  const [storyVideo,setStoryVideo]=useState(false);

  const [composer,setComposer]=useState(false);
  const [postText,setPostText]=useState('');
  const [postKind,setPostKind]=useState<MediaKind>('post');
  const [postFile,setPostFile]=useState<File|null>(null);
  const [postUrl,setPostUrl]=useState('');
  const [comments,setComments]=useState<Record<string,string>>({});
  const [openComments,setOpenComments]=useState<string|null>(null);
  const [notice,setNotice]=useState('');
  const [active,setActive]=useState('home');
  const [share,setShare]=useState<{title:string;url:string}|null>(null);

  const [phone,setPhone]=useState(()=>localStorage.getItem('sb1_private_phone')||'');
  const [socialSearch,setSocialSearch]=useState('');
  const [socialUrl,setSocialUrl]=useState('');
  const [socialOpen,setSocialOpen]=useState<string[]>([]);
  const [socialEmbedded,setSocialEmbedded]=useState<string|null>(null);
  const [favorites,setFavorites]=useState<string[]>(()=>read('sb1_fb_social_favorites',[]));
  const [clonePermissions,setClonePermissions]=useState<string[]>([]);
  const [cloneType,setCloneType]=useState('specialist');
  const [cloneCount,setCloneCount]=useState(1);
  const [cloneName,setCloneName]=useState('');
  const [cloneExpiry,setCloneExpiry]=useState('');
  const [clones,setClones]=useState<any[]>(()=>read('sb1_fb_clones',[]));
  const [settingsOpen,setSettingsOpen]=useState(false);
  const [recording,setRecording]=useState(false);
  const [recordUrl,setRecordUrl]=useState('');
  const recorder=useRef<MediaRecorder|null>(null);
  const stream=useRef<MediaStream|null>(null);
  const chunks=useRef<Blob[]>([]);

  useEffect(()=>write('sb1_fb_posts_'+pageId,feed),[feed,pageId]);
  useEffect(()=>write('sb1_fb_stories_'+pageId,stories),[stories,pageId]);
  useEffect(()=>write('sb1_fb_social_favorites',favorites),[favorites]);
  useEffect(()=>write('sb1_fb_clones',clones),[clones]);
  useEffect(()=>{if(postFile){const u=URL.createObjectURL(postFile);setPostUrl(u);return()=>URL.revokeObjectURL(u)}setPostUrl('')},[postFile]);
  useEffect(()=>{if(storyFile){const u=URL.createObjectURL(storyFile);setStoryUrl(u);return()=>URL.revokeObjectURL(u)}setStoryUrl('')},[storyFile]);
  useEffect(()=>()=>stream.current?.getTracks().forEach(t=>t.stop()),[]);

  const publicFeed=feed.filter(p=>p.public);
  const reels=publicFeed.filter(p=>p.kind==='reel');
  const activeStories=useMemo(()=>[
    ...stories.filter(s=>new Date(s.expiresAt)>new Date()),
    ...demoNames.map((name,i)=>({id:'demo-story-'+i,name,text:demoStoryTexts[i],createdAt:new Date(Date.now()-i*3600000).toISOString(),expiresAt:new Date(Date.now()+86400000).toISOString()}))
  ],[stories]);

  const jump=(target:string)=>{setActive(target);document.getElementById('fb-'+target)?.scrollIntoView({behavior:'smooth',block:'start'})};

  const createStory=()=>{
    if(!storyText.trim()&&!storyUrl){setNotice('أضف نصاً أو صورة أو فيديو للقصة.');return}
    const item:StoryItem={id:id(),name:'قصتي',text:storyText.trim(),mediaUrl:storyUrl||undefined,mediaKind:storyVideo?'video':'image',createdAt:new Date().toISOString(),expiresAt:new Date(Date.now()+86400000),own:true};
    setStories(v=>[item,...v]);setStoryText('');setStoryFile(null);setStoryComposer(false);setNotice('تم نشر قصتك.');setStoryViewer(item);
  };
  const deleteStory=(story:StoryItem)=>{
    if(!story.own)return;
    setStories(v=>v.filter(x=>x.id!==story.id));setStoryViewer(null);setNotice('تم حذف القصة.');
  };

  const publish=()=>{
    if(!postText.trim()&&!postUrl&&!recordUrl){setNotice('اكتب نصاً أو اختر صورة/فيديو أو سجّل صوتاً.');return}
    const item:FeedItem={id:id(),kind:recordUrl?'audio':postKind,text:postText.trim()||'منشور جديد',mediaUrl:recordUrl||postUrl,mediaName:postFile?.name,createdAt:new Date().toISOString(),likes:0,comments:[],public:true,author:pageName};
    setFeed(v=>[item,...v]);setPostText('');setPostFile(null);setRecordUrl('');setComposer(false);setNotice('تم نشر المحتوى في الرئيسية.');
  };

  const startRecord=async()=>{
    try{
      const s=await navigator.mediaDevices.getUserMedia({audio:true});
      const mime=MediaRecorder.isTypeSupported('audio/webm')?'audio/webm':'audio/ogg';
      const r=new MediaRecorder(s,{mimeType:mime});chunks.current=[];stream.current=s;recorder.current=r;
      r.ondataavailable=e=>e.data.size&&chunks.current.push(e.data);
      r.onstop=()=>{const u=URL.createObjectURL(new Blob(chunks.current,{type:mime}));setRecordUrl(u);s.getTracks().forEach(t=>t.stop());setNotice('التسجيل جاهز للنشر.');};
      r.start();setRecording(true);
    }catch{setNotice('اسمح للمتصفح باستخدام الميكروفون ثم حاول مرة أخرى.')}
  };
  const stopRecord=()=>{recorder.current?.stop();setRecording(false)};

  const like=(postId:string)=>setFeed(v=>v.map(p=>p.id===postId?{...p,likes:p.likes+1}:p));
  const addComment=(postId:string)=>{
    const body=(comments[postId]||'').trim();if(!body)return;
    setFeed(v=>v.map(p=>p.id===postId?{...p,comments:[...p.comments,{id:id(),name:'مستخدم SB1',body}]}:p));
    setComments(v=>({...v,[postId]:''}));
  };

  const openShare=(title:string)=>{
    setShare({title,url:window.location.origin+'/doctors/'+pageId});
  };
  const send=(target:string)=>{
    if(!share)return;
    const u=encodeURIComponent(share.url), t=encodeURIComponent(share.title+' - '+share.url);
    const urls:any={telegram:'https://t.me/share/url?url='+u+'&text='+encodeURIComponent(share.title),whatsapp:'https://wa.me/?text='+t,facebook:'https://www.facebook.com/sharer/sharer.php?u='+u,x:'https://twitter.com/intent/tweet?text='+t,email:'mailto:?subject='+encodeURIComponent(share.title)+'&body='+t,sms:'sms:?body='+t};
    window.open(urls[target],'_blank','noopener,noreferrer');
  };

  const openSocial=(url:string)=>{
    if(!/^https?:\/\//.test(url))return;
    setSocialOpen(v=>[url,...v.filter(x=>x!==url)]);
    setSocialEmbedded(url);
    if(!favorites.includes(url))setFavorites(v=>[url,...v]);
  };
  const searchSocial=()=>{
    if(!socialSearch.trim())return;
    const url='https://www.google.com/search?q='+encodeURIComponent(socialSearch+' site:youtube.com OR site:vk.com OR site:ok.ru OR site:rutube.ru OR site:mail.ru');
    openSocial(url);
  };

  const permissionGroups=[
    {title:'الحساب والهوية',items:[['profile_view','عرض الملف الشخصي'],['profile_edit','تعديل بيانات الصفحة'],['profile_media','إدارة صورة وغلاف الصفحة'],['profile_settings','إعدادات الصفحة'],['verification','التحقق والوثائق والعقود']]},
    {title:'المحتوى والنشر',items:[['posts_view','عرض المنشورات'],['posts_create','إنشاء المنشورات'],['posts_edit','تعديل المنشورات'],['posts_delete','حذف المنشورات'],['stories_create','إنشاء القصص'],['stories_delete','حذف القصص'],['reels_create','إنشاء Reels'],['reels_manage','إدارة Reels'],['albums_manage','إدارة الألبومات'],['media_upload','رفع الصور والفيديو والصوت والتسجيلات']]},
    {title:'التفاعل والمجتمع',items:[['likes_manage','الإعجابات والتفاعلات'],['comments_manage','التعليقات والردود'],['followers_manage','المتابعون والمتابَعون'],['messages_manage','الرسائل'],['notifications_manage','الإشعارات'],['reports_manage','الشكاوى والبلاغات']]},
    {title:'المحتوى الطبي والعلمي',items:[['articles_view','عرض المقالات'],['articles_manage','إنشاء وتعديل المقالات'],['questions_view','عرض الأسئلة والإجابات'],['questions_answer','الإجابة عن الأسئلة'],['sessions_manage','الجلسات والاستشارات'],['courses_manage','الدورات والكورسات'],['books_manage','الكتب والمكتبة'],['medical_videos_manage','المحتوى الطبي والفيديوهات'],['audio_manage','الصوتيات والتسجيلات'],['dictionary_manage','القاموس والمصطلحات']]},
    {title:'الخدمات والمنصة',items:[['services_manage','الخدمات'],['facilities_manage','المؤسسات والمرافق'],['pharmacy_manage','الصيدلية والمنتجات'],['delivery_manage','التوصيل والتتبع'],['marketplace_manage','السوق الطبي'],['pricing_manage','الأسعار والباقات'],['payments_manage','المدفوعات'],['gifts_manage','الهدايا'],['vip_manage','VIP']]},
    {title:'الاجتماعي والخارجي',items:[['social_platforms','منصات التواصل الخارجية'],['external_favorites','المفضلة الخارجية الخاصة'],['sharing','المشاركة والنشر الخارجي'],['phone_qr','الهاتف وQR']]},
    {title:'الإدارة والتقارير',items:[['dashboard_view','لوحة التحكم'],['analytics_view','الإحصائيات والتقارير'],['admin_users','إدارة المستخدمين'],['admin_content','إدارة المحتوى'],['admin_permissions','إدارة الصلاحيات'],['admin_penalties','العقوبات والتنبيهات'],['backups','النسخ الاحتياطي'],['audit_log','سجل العمليات']]},
  ];
  const allPermissionKeys=permissionGroups.flatMap(g=>g.items.map(x=>x[0]));
  const makeClones=()=>{
    const count=Math.min(50,Math.max(1,Number(cloneCount)||1));
    const permissions=clonePermissions.length?clonePermissions:allPermissionKeys;
    const next=Array.from({length:count},(_,i)=>({id:id(),type:cloneType,name:(cloneName.trim()||'صفحة '+cloneType)+(count>1?' '+(i+1):''),pin:String(1000+Math.floor(Math.random()*9000)),password:Math.random().toString(36).slice(2,10),link:window.location.origin+'/clone/'+id(),expires:cloneExpiry,permissions,createdAt:new Date().toISOString()}));
    setClones(v=>[...next,...v]);setNotice('تم إنشاء الصفحات المستنسخة بالصلاحيات المحددة.');
  };

  const sectionButton=(key:string,label:string,Icon:any)=>
    <button key={key} onClick={()=>jump(key)} className={'shrink-0 rounded-lg px-3 py-2 text-sm font-bold transition '+(active===key?'bg-teal-700 text-white':'text-slate-700 hover:bg-teal-50')}>{Icon&&<Icon className="inline h-4 w-4 ml-1"/>}{label}</button>;

  return <div dir="rtl" className="mt-4 space-y-4">
    {/* Facebook-style navigation: one clean bar directly below the green profile header */}
    <nav className="sticky top-[72px] z-30 rounded-xl border bg-white/95 shadow-sm backdrop-blur">
      <div className="flex overflow-x-auto px-2 py-1">
        {sectionButton('home','الرئيسية',BookOpen)}
        {sectionButton('reels','Reels',Video)}
        {sectionButton('posts','المنشورات',MessageCircle)}
        {sectionButton('albums','الألبومات',Album)}
        {sectionButton('medical','المحتوى الطبي',Library)}
        {sectionButton('social','منصات التواصل',ExternalLink)}
        {sectionButton('phone','الهاتف وQR',QrCode)}
        {canManage&&sectionButton('clone','Clone / Gift',Wand2)}
        {canManage&&sectionButton('settings','الإعدادات',Settings)}
      </div>
    </nav>

    <section id="fb-home" className="grid gap-4 lg:grid-cols-[1fr_280px]">
      <div className="space-y-4">
        {/* Stories row */}
        <div className="rounded-xl border bg-white p-3 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-extrabold">القصص</h2>
            <button onClick={()=>setStoryComposer(true)} className="text-sm font-bold text-teal-700"><Plus className="inline h-4 w-4"/> إنشاء قصة</button>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-1">
            <button onClick={()=>setStoryComposer(true)} className="min-w-[112px] overflow-hidden rounded-xl border bg-slate-50">
              <div className="grid h-28 place-items-center bg-gradient-to-br from-teal-600 to-teal-800 text-white"><Plus className="h-8 w-8"/></div>
              <div className="p-2 text-center text-xs font-bold">قصتك</div>
            </button>
            {activeStories.map(s=><button key={s.id} onClick={()=>setStoryViewer(s)} className="min-w-[112px] overflow-hidden rounded-xl border bg-white text-right">
              <div className="relative grid h-28 place-items-center overflow-hidden bg-gradient-to-br from-slate-800 to-teal-900 text-white">
                {s.mediaUrl?<img src={s.mediaUrl} className="h-full w-full object-cover" alt=""/>:<span className="p-3 text-xs font-bold">{s.text}</span>}
                <span className="absolute bottom-2 right-2 rounded-full bg-white px-2 py-1 text-[10px] font-bold text-slate-800">{s.name}</span>
              </div>
            </button>)}
          </div>
        </div>

        {/* Facebook-style composer */}
        {canManage&&<div className="rounded-xl border bg-white p-4 shadow-sm">
          <button onClick={()=>setComposer(true)} className="flex w-full items-center gap-3 text-right">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-teal-100 font-extrabold text-teal-700">{pageName.charAt(0)}</div>
            <div className="flex-1 rounded-full bg-slate-100 px-4 py-3 text-sm text-slate-500">بم تفكر؟ اكتب منشوراً أو أضف صورة أو فيديو أو Reel...</div>
          </button>
          <div className="mt-3 grid grid-cols-3 border-t pt-3 text-sm font-bold text-slate-600">
            <button onClick={()=>{setPostKind('image');setComposer(true)}} className="rounded-lg py-2 hover:bg-slate-50"><ImageIcon className="inline text-teal-600"/> صورة</button>
            <button onClick={()=>{setPostKind('video');setComposer(true)}} className="rounded-lg py-2 hover:bg-slate-50"><Video className="inline text-teal-600"/> فيديو</button>
            <button onClick={()=>{setPostKind('reel');setComposer(true)}} className="rounded-lg py-2 hover:bg-slate-50"><Video className="inline text-teal-600"/> Reel</button>
          </div>
        </div>}

        {/* Reels strip is part of Home, not a separate bottom page */}
        <div id="fb-reels" className="rounded-xl border bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between"><h2 className="font-extrabold">Reels</h2><button onClick={()=>jump('reels')} className="text-xs font-bold text-teal-700">عرض الكل</button></div>
          <div className="flex gap-3 overflow-x-auto">
            {reels.slice(0,10).map(r=><button key={r.id} onClick={()=>openShare(r.text)} className="min-w-[145px] overflow-hidden rounded-xl bg-slate-900 text-white text-right">
              <div className="grid aspect-[3/4] place-items-center bg-gradient-to-br from-teal-900 to-slate-950 p-3"><Video className="h-8 w-8 opacity-80"/><span className="text-xs font-bold">{r.text.slice(0,55)}</span></div>
            </button>)}
          </div>
        </div>

        {/* Medical content appears in Home as a compact horizontal module */}
        <div id="fb-medical" className="rounded-xl border bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between"><h2 className="font-extrabold">المحتوى الطبي</h2><button onClick={()=>jump('medical')} className="text-xs font-bold text-teal-700">عرض الكل</button></div>
          <div className="grid gap-3 sm:grid-cols-3">
            {['فيديوهات طبية وتعليمية','شاهداتي','فيديوهاتي'].map((x,i)=><button key={x} onClick={()=>jump('medical')} className="rounded-xl bg-slate-50 p-4 text-right hover:bg-teal-50"><Library className="mb-2 h-5 w-5 text-teal-700"/><b className="text-sm">{x}</b><span className="mt-1 block text-xs text-slate-500">{i===0?'محتوى مرئي داخل SB1':'قائمة خاصة بالحساب'}</span></button>)}
          </div>
        </div>

        {/* Feed */}
        <div id="fb-posts" className="space-y-4">
          <div className="flex items-center justify-between px-1"><h2 className="text-xl font-extrabold">المنشورات</h2><span className="text-xs text-slate-400">{publicFeed.length}</span></div>
          {publicFeed.map((p,i)=><div key={p.id}>
            <article className="rounded-xl border bg-white p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-full bg-teal-100 font-extrabold text-teal-700">{p.author.charAt(0)}</div>
                <div className="flex-1"><b className="text-sm">{p.author}</b><div className="text-xs text-slate-400">{new Date(p.createdAt).toLocaleString()}</div></div>
                {p.demo&&<span className="rounded-full bg-amber-50 px-2 py-1 text-[10px] font-bold text-amber-700">تجريبي</span>}
              </div>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-700">{p.text}</p>
              {p.mediaUrl&&p.kind==='image'&&<img src={p.mediaUrl} alt="" className="mt-3 max-h-[560px] w-full rounded-xl object-cover"/>}
              {p.mediaUrl&&(p.kind==='video'||p.kind==='reel')&&<video src={p.mediaUrl} controls className="mt-3 max-h-[560px] w-full rounded-xl bg-black"/>}
              {p.mediaUrl&&p.kind==='audio'&&<audio src={p.mediaUrl} controls className="mt-3 w-full"/>}
              <div className="mt-3 flex items-center border-t pt-2 text-sm text-slate-500">
                <button onClick={()=>like(p.id)} className="flex-1 rounded-lg py-2 hover:bg-slate-50 hover:text-teal-700"><Heart className="inline h-4 w-4 ml-1"/> {p.likes}</button>
                <button onClick={()=>setOpenComments(p.id)} className="flex-1 rounded-lg py-2 hover:bg-slate-50" aria-label="التعليقات"><MessageCircle className="inline h-4 w-4 ml-1"/> {p.comments.length}</button>
                <button onClick={()=>openShare(p.text)} className="flex-1 rounded-lg py-2 hover:bg-slate-50"><Share2 className="inline h-4 w-4 ml-1"/> مشاركة</button>
              </div>
            </article>
            {(i+1)%20===0&&i<publicFeed.length-1&&<div className="rounded-xl border bg-white p-4 shadow-sm"><div className="mb-3 flex items-center justify-between"><b>Reels</b><button onClick={()=>jump('reels')} className="text-xs font-bold text-teal-700">عرض الكل</button></div><div className="flex gap-3 overflow-x-auto">{reels.slice(Math.floor(i/20)*5,Math.floor(i/20)*5+5).map(r=><button key={r.id} onClick={()=>openShare(r.text)} className="min-w-[130px] rounded-xl bg-slate-900 p-4 text-right text-xs font-bold text-white">{r.text.slice(0,48)}</button>)}</div></div>}
          </div>)}
        </div>
      </div>

      <aside className="hidden lg:block">
        <div className="sticky top-28 space-y-3">
          <div className="rounded-xl border bg-white p-4 shadow-sm"><b>اختصارات الصفحة</b><div className="mt-3 space-y-1">
            {sectionButton('posts','المنشورات',MessageCircle)}
            {sectionButton('reels','Reels',Video)}
            {sectionButton('albums','الألبومات',Album)}
            {sectionButton('medical','المحتوى الطبي',Library)}
            {sectionButton('social','منصات التواصل',ExternalLink)}
            {sectionButton('phone','الهاتف وQR',QrCode)}
            {canManage&&sectionButton('clone','Clone / Gift',Wand2)}
            {canManage&&sectionButton('settings','الإعدادات',Settings)}
          </div></div>
        </div>
      </aside>
    </section>

    <section id="fb-reels-all" className="rounded-xl border bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between"><h2 className="text-xl font-extrabold">Reels</h2><span className="text-xs text-slate-400">{reels.length} Reel</span></div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">{reels.slice(0,18).map(r=><button key={r.id} onClick={()=>openShare(r.text)} className="overflow-hidden rounded-xl bg-slate-900 text-white text-right"><div className="grid aspect-[3/5] place-items-center bg-gradient-to-br from-teal-900 to-slate-950 p-3"><Video/><span className="text-xs font-bold">{r.text.slice(0,60)}</span></div></button>)}</div>
    </section>

    <section id="fb-albums" className="rounded-xl border bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between"><h2 className="text-xl font-extrabold">الألبومات</h2><Album className="text-teal-700"/></div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{['الصور','الفيديوهات','التسجيلات','الصوتيات'].map((name,i)=><button key={name} className="rounded-xl border bg-slate-50 p-3 text-right hover:bg-teal-50"><div className="grid h-28 place-items-center rounded-lg bg-white">{i===0?<ImageIcon/>:i===1?<FileVideo/>:<AudioLines/>}</div><b className="mt-2 block">{name}</b><span className="text-xs text-slate-500">محتوى الصفحة</span></button>)}</div>
    </section>

    <section id="fb-medical-all" className="rounded-xl border bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between"><div><h2 className="text-xl font-extrabold">المحتوى الطبي</h2><p className="text-xs text-slate-500">فيديوهات طبية وتعليمية داخل SB1</p></div><Library className="text-teal-700"/></div>
      <div className="grid gap-3 md:grid-cols-3">{Array.from({length:9},(_,i)=>({title:demoTexts[i%demoTexts.length],specialty:['علم النفس','الصحة النفسية','التقييم السريري'][i%3]})).map((v,i)=><article key={i} className="rounded-xl border p-3"><div className="grid aspect-video place-items-center rounded-lg bg-slate-900 text-white"><Video/></div><b className="mt-2 block text-sm">{v.title}</b><span className="text-xs text-slate-500">{v.specialty}</span><div className="mt-2 flex gap-2"><button className="rounded-lg bg-teal-50 px-3 py-1 text-xs font-bold text-teal-700">فيديوهاتي</button><button className="rounded-lg bg-slate-50 px-3 py-1 text-xs font-bold">شاهداتي</button></div></article>)}</div>
    </section>

    <section id="fb-social" className="rounded-xl border bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between"><div><h2 className="text-xl font-extrabold">منصات التواصل</h2><p className="text-xs text-slate-500">تبقى كل منصة داخل SB1 ويمكن فتح أكثر من منصة داخل الصفحة نفسها.</p></div><ExternalLink className="text-teal-700"/></div>
      {canManage&&<div className="grid gap-2 md:grid-cols-[1fr_auto]">
        <input value={socialSearch} onChange={e=>setSocialSearch(e.target.value)} onKeyDown={e=>e.key==='Enter'&&searchSocial()} className="rounded-xl border p-3" placeholder="ابحث داخل المنصة المطلوبة..."/>
        <button onClick={searchSocial} className="rounded-xl bg-teal-700 px-4 text-white"><Search/></button>
      </div>}
      <div className="mt-3 flex flex-wrap gap-2">{[
        ['YouTube','https://www.youtube.com'],['VK','https://vk.com'],['OK','https://ok.ru'],['Rutube','https://rutube.ru'],['Mail.ru','https://mail.ru']
      ].map(([n,u])=><button key={n} onClick={()=>openSocial(u)} className={'rounded-lg border px-3 py-2 text-sm font-bold '+(socialEmbedded===u?'border-teal-600 bg-teal-50 text-teal-700':'')}>{n}</button>)}</div>
      {socialOpen.length>0&&<div className="mt-4 flex gap-2 overflow-x-auto">{socialOpen.slice(0,8).map(u=><button key={u} onClick={()=>setSocialEmbedded(u)} className={'max-w-[220px] truncate rounded-lg border px-3 py-2 text-xs '+(socialEmbedded===u?'border-teal-600 bg-teal-50':'')}>{u}</button>)}</div>}
      {socialEmbedded&&<div className="mt-4 overflow-hidden rounded-2xl border bg-slate-100">
        <div className="flex items-center justify-between border-b bg-white px-3 py-2"><b>منصة داخل SB1</b><button onClick={()=>setSocialEmbedded(null)}><X/></button></div>
        <iframe title="social-platform" src={socialEmbedded} className="h-[720px] w-full border-0 bg-white" referrerPolicy="strict-origin-when-cross-origin"/>
        <div className="border-t bg-amber-50 p-2 text-xs text-amber-800">بعض المنصات تمنع التضمين داخل المواقع من طرفها؛ في هذه الحالة قد تظهر صفحة منع التضمين داخل هذه النافذة بدلاً من فتح متصفح خارجي.</div>
      </div>}
    </section>

    <section id="fb-phone" className="rounded-xl border bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between"><div><h2 className="text-xl font-extrabold">الهاتف وQR</h2><p className="text-xs text-slate-500">الرقم خاص بالحساب.</p></div><QrCode className="text-teal-700"/></div>
      {canManage&&<div className="grid gap-5 md:grid-cols-2"><div><label className="text-sm font-bold">رقم الهاتف</label><input value={phone} onChange={e=>{setPhone(e.target.value);localStorage.setItem('sb1_private_phone',e.target.value)}} className="mt-2 w-full rounded-xl border p-3" placeholder="+49 ..."/><button onClick={()=>setNotice('تم حفظ الرقم بشكل خاص.')} className="mt-2 rounded-lg bg-teal-700 px-4 py-2 text-sm font-bold text-white">حفظ</button></div><div className="grid place-items-center rounded-xl bg-slate-50 p-4"><img src={'https://api.qrserver.com/v1/create-qr-code/?size=220x220&data='+encodeURIComponent(window.location.origin+'/doctors/'+pageId)} alt="QR" className="h-44 w-44"/><span className="mt-2 text-xs">QR لفتح صفحة SB1</span></div></div>}
    </section>

    {canManage&&<section id="fb-clone" className="rounded-xl border bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between"><div><h2 className="text-xl font-extrabold">Clone / Gift</h2><p className="text-xs text-slate-500">ينسخ نوع الحساب والعدد فقط، ثم يمكن تغيير الاسم والصلاحيات.</p></div><Wand2 className="text-teal-700"/></div>
      <div className="grid gap-3 md:grid-cols-4"><select value={cloneType} onChange={e=>setCloneType(e.target.value)} className="rounded-xl border p-3"><option value="specialist">أخصائي</option><option value="institution">مؤسسة</option><option value="delivery_worker">عامل توصيل</option><option value="service">خدمة</option><option value="pharmacy">صيدلية</option><option value="facility">مرفق طبي</option><option value="content_creator">صانع محتوى</option><option value="admin">إداري</option></select><input type="number" min={1} max={50} value={cloneCount} onChange={e=>setCloneCount(Number(e.target.value))} className="rounded-xl border p-3"/><input value={cloneName} onChange={e=>setCloneName(e.target.value)} className="rounded-xl border p-3" placeholder="اسم الصفحة"/><input type="date" value={cloneExpiry} onChange={e=>setCloneExpiry(e.target.value)} className="rounded-xl border p-3"/></div>
      <div className="mt-4 rounded-xl border bg-slate-50 p-4"><div className="mb-3 flex flex-wrap items-center justify-between gap-2"><b>صلاحيات الصفحة المستنسخة — كل وظائف SB1</b><div className="flex gap-2"><button onClick={()=>setClonePermissions(allPermissionKeys)} className="rounded-lg bg-teal-700 px-3 py-1 text-xs font-bold text-white">تفعيل الكل</button><button onClick={()=>setClonePermissions([])} className="rounded-lg bg-white px-3 py-1 text-xs font-bold">إلغاء الكل</button></div></div>
        <div className="grid gap-3 md:grid-cols-2">{permissionGroups.map(group=><div key={group.title} className="rounded-xl bg-white p-3"><b className="text-sm">{group.title}</b><div className="mt-2 space-y-2">{group.items.map(([key,label])=><label key={key} className="flex items-center gap-2 text-xs"><input type="checkbox" checked={clonePermissions.includes(key)} onChange={e=>setClonePermissions(v=>e.target.checked?[...v,key]:v.filter(x=>x!==key))} className="h-4 w-4"/>{label}</label>)}</div></div>)}</div>
      </div>
      <button onClick={makeClones} className="mt-3 rounded-xl bg-teal-700 px-5 py-2 font-bold text-white">إنشاء الصفحة بالصلاحيات المحددة</button>
      {clones.slice(0,8).map(c=><div key={c.id} className="mt-3 rounded-xl border p-3"><div className="flex justify-between"><b>{c.name}</b><span className="text-xs">{c.type}</span></div><div className="mt-2 text-xs">PIN: {c.pin} • كلمة المرور: {c.password} • {c.expires||'بدون انتهاء'}</div><button onClick={()=>setShare({title:c.name+' | PIN '+c.pin, url:c.link})} className="mt-2 rounded-lg bg-teal-700 px-3 py-2 text-xs font-bold text-white"><Gift className="inline h-4 w-4 ml-1"/> إرسال</button></div>)}
    </section>}

    {canManage&&<section id="fb-settings" className="rounded-xl border bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between"><div><h2 className="text-xl font-extrabold">الإعدادات</h2><p className="text-xs text-slate-500">تظهر لصاحب الصفحة والمالك/المشرف فقط.</p></div><Settings className="text-teal-700"/></div>
      <button onClick={()=>setSettingsOpen(v=>!v)} className="mt-3 rounded-xl bg-teal-700 px-4 py-2 font-bold text-white">{settingsOpen?'إغلاق':'فتح الإعدادات'}</button>
      {settingsOpen&&<div className="mt-3 grid gap-3 md:grid-cols-2"><label className="rounded-xl bg-slate-50 p-4 text-sm"><b>المحتوى الطبي العام</b><p className="mt-1 text-xs text-slate-500">يمكن للزوار مشاهدة المحتوى الطبي المجاني.</p><input type="checkbox" defaultChecked className="mt-3 h-5 w-5"/></label><label className="rounded-xl bg-slate-50 p-4 text-sm"><b>السماح بالقصص</b><p className="mt-1 text-xs text-slate-500">إظهار القصص في أعلى الصفحة.</p><input type="checkbox" defaultChecked className="mt-3 h-5 w-5"/></label></div>}
    </section>}

    {storyComposer&&<div className="fixed inset-0 z-[100] grid place-items-center bg-black/60 p-4" onClick={()=>setStoryComposer(false)}><div className="w-full max-w-lg rounded-2xl bg-white p-5" onClick={e=>e.stopPropagation()}><div className="flex items-center justify-between"><h3 className="text-xl font-extrabold">إنشاء قصة</h3><button onClick={()=>setStoryComposer(false)}><X/></button></div><textarea value={storyText} onChange={e=>setStoryText(e.target.value)} className="mt-4 min-h-28 w-full rounded-xl border p-3" placeholder="اكتب ما تريد في قصتك..."/><div className="mt-3 flex flex-wrap gap-2"><label className="cursor-pointer rounded-lg bg-slate-100 px-3 py-2 text-sm font-bold"><Upload className="inline h-4 w-4 ml-1"/> صورة / فيديو<input type="file" accept="image/*,video/*" className="hidden" onChange={e=>{const f=e.target.files?.[0]||null;setStoryFile(f);setStoryVideo(f?.type.startsWith('video/')||false)}}/></label><button onClick={createStory} className="rounded-lg bg-teal-700 px-4 py-2 font-bold text-white">نشر القصة</button></div>{storyFile&&<div className="mt-2 text-xs text-slate-500">{storyFile.name}</div>}</div></div>}

    {composer&&<div className="fixed inset-0 z-[100] grid place-items-center bg-black/60 p-4" onClick={()=>setComposer(false)}><div className="w-full max-w-xl rounded-2xl bg-white p-5" onClick={e=>e.stopPropagation()}><div className="flex items-center justify-between"><h3 className="text-xl font-extrabold">إنشاء منشور</h3><button onClick={()=>setComposer(false)}><X/></button></div><textarea value={postText} onChange={e=>setPostText(e.target.value)} className="mt-4 min-h-32 w-full rounded-xl border p-3" placeholder="اكتب منشوراً..."/><div className="mt-3 flex flex-wrap gap-2">{(['post','image','video','reel'] as MediaKind[]).map(k=><button key={k} onClick={()=>setPostKind(k)} className={'rounded-lg px-3 py-2 text-sm font-bold '+(postKind===k?'bg-teal-700 text-white':'bg-slate-100')}>{k==='post'?'نص':k==='image'?'صورة':k==='video'?'فيديو':'Reel'}</button>)}<label className="cursor-pointer rounded-lg bg-slate-100 px-3 py-2 text-sm font-bold"><Upload className="inline h-4 w-4 ml-1"/> اختيار ملف<input type="file" accept={postKind==='image'?'image/*':postKind==='video'||postKind==='reel'?'video/*':'*/*'} className="hidden" onChange={e=>setPostFile(e.target.files?.[0]||null)}/></label><button onClick={recording?stopRecord:startRecord} className={'rounded-lg px-3 py-2 text-sm font-bold '+(recording?'bg-red-600 text-white':'bg-slate-100')}><Mic className="inline h-4 w-4 ml-1"/>{recording?'إيقاف':'تسجيل صوت'}</button></div>{(postUrl||recordUrl)&&<div className="mt-3 rounded-xl bg-slate-50 p-3 text-sm">{postFile?.name||'تسجيل صوتي جاهز'}</div>}<button onClick={publish} className="mt-4 w-full rounded-xl bg-teal-700 py-3 font-bold text-white">نشر الآن</button></div></div>}

    {storyViewer&&<div className="fixed inset-0 z-[110] grid place-items-center bg-black/80 p-4" onClick={()=>setStoryViewer(null)}><div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-slate-950 text-white" onClick={e=>e.stopPropagation()}><button onClick={()=>setStoryViewer(null)} className="absolute left-3 top-3 z-10 rounded-full bg-black/50 p-2"><X/></button>{storyViewer.mediaUrl ? (storyViewer.mediaKind==='video' ? <video src={storyViewer.mediaUrl} controls autoPlay className="max-h-[72vh] w-full bg-black object-contain"/> : <img src={storyViewer.mediaUrl} alt="" className="max-h-[72vh] w-full object-contain"/>) : <div className="grid min-h-[60vh] place-items-center p-8 text-center text-2xl font-extrabold">{storyViewer.text}</div>}<div className="flex items-center justify-between p-4"><div><b>{storyViewer.name}</b><p className="text-xs opacity-70">{storyViewer.text}</p></div>{storyViewer.own&&<button onClick={()=>deleteStory(storyViewer)} className="rounded-lg bg-red-600 px-3 py-2 text-xs font-bold"><Trash2 className="inline h-4 w-4 ml-1"/>حذف</button>}</div></div></div>}

    {openComments&&(()=>{const post=feed.find(x=>x.id===openComments); if(!post)return null; return <div className="fixed inset-0 z-[120] grid place-items-center bg-black/60 p-4" onClick={()=>setOpenComments(null)}>
      <div className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-xl" onClick={e=>e.stopPropagation()}>
        <div className="flex items-center justify-between border-b pb-3">
          <b className="text-lg">التعليقات</b>
          <button onClick={()=>setOpenComments(null)} aria-label="إغلاق"><X/></button>
        </div>
        <div className="max-h-[55vh] space-y-2 overflow-y-auto py-4">
          {post.comments.length===0&&<div className="py-8 text-center text-sm text-slate-500">لا توجد تعليقات بعد.</div>}
          {post.comments.map(c=><div key={c.id} className="rounded-xl bg-slate-50 p-3 text-sm"><b>{c.name}</b><div className="mt-1">{c.body}</div></div>)}
        </div>
        <div className="flex gap-2 border-t pt-3">
          <input autoFocus value={comments[post.id]||''} onChange={e=>setComments(v=>({...v,[post.id]:e.target.value}))} onKeyDown={e=>e.key==='Enter'&&addComment(post.id)} className="flex-1 rounded-full border bg-slate-50 px-4 py-2 text-sm" placeholder="اكتب تعليقاً..."/>
          <button onClick={()=>addComment(post.id)} className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-teal-700 text-white" aria-label="إرسال التعليق"><Send className="h-4 w-4"/></button>
        </div>
      </div>
    </div>})()}
    {share&&<div className="fixed inset-0 z-[120] grid place-items-center bg-black/60 p-4" onClick={()=>setShare(null)}><div className="w-full max-w-lg rounded-2xl bg-white p-5" onClick={e=>e.stopPropagation()}><div className="flex items-center justify-between"><h3 className="text-xl font-extrabold">إرسال</h3><button onClick={()=>setShare(null)}><X/></button></div><button onClick={async()=>{try{await navigator.share?.({title:share.title,url:share.url});}catch{}}} className="mt-4 w-full rounded-xl bg-teal-700 py-3 font-bold text-white"><Share2 className="inline ml-1"/>مشاركة من الجهاز</button><div className="mt-3 grid grid-cols-2 gap-2">{[['telegram','Telegram'],['whatsapp','WhatsApp'],['facebook','Facebook'],['x','X'],['email','البريد'],['sms','الرسائل']].map(([k,l])=><button key={k} onClick={()=>send(k)} className="rounded-xl border p-3 font-bold hover:border-teal-500 hover:text-teal-700">{l}</button>)}</div></div></div>}

    {notice&&<div className="fixed bottom-5 left-1/2 z-[130] -translate-x-1/2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white shadow-xl">{notice}<button onClick={()=>setNotice('')} className="mr-3"><CheckCircle2 className="inline h-4 w-4"/></button></div>}
  </div>;
}
