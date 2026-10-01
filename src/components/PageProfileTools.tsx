import { useEffect, useMemo, useRef, useState } from 'react';
import { toggleSaved } from '@/lib/socialVault';
import {
  Album, AudioLines, BookOpen, CheckCircle2, ExternalLink, FileVideo, Gift, Heart,
  Image as ImageIcon, Library, MessageCircle, Mic, Plus, QrCode, Search, Send, Eye,
  Settings, Share2, Trash2, Upload, Video, X, Wand2, Bookmark
} from 'lucide-react';

type MediaKind = 'post' | 'image' | 'video' | 'reel' | 'audio' | 'article';
type StoryItem = { id:string; name:string; text:string; mediaUrl?:string; mediaKind?:'image'|'video'; createdAt:string; expiresAt:string; own?:boolean };
type FeedItem = {
  id:string; kind:MediaKind; text:string; mediaUrl?:string; mediaName?:string;
  createdAt:string; likes:number; views?:number; comments:{id:string;name:string;photo?:string;body:string}[];
  public:boolean; demo?:boolean; author:string;
  style?:{background:string;color:string;fontSize:string;fontWeight:string};
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
const demoPeopleImages = [
  'https://randomuser.me/api/portraits/women/44.jpg',
  'https://randomuser.me/api/portraits/men/32.jpg',
  'https://randomuser.me/api/portraits/women/68.jpg',
  'https://randomuser.me/api/portraits/men/75.jpg',
  'https://randomuser.me/api/portraits/women/65.jpg',
  'https://randomuser.me/api/portraits/men/52.jpg'
];
const demoPostImages = [
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=900&q=80'
];
const demoVideoUrl='https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4';

export default function PageProfileTools({
  canManage=false, pageId='current', pageName='SB1',
  seedPosts=[], hideStories=false, focusSection='home'
}:{
  canManage?:boolean;
  pageId?:string;
  pageName?:string;
  pageAvatar?:string;
  seedPosts?:Array<{id:string;body:string;image_url?:string|null;video_url?:string|null;post_type?:string;created_at:string;likes_count?:number}>;
  hideStories?:boolean;
  focusSection?:'home'|'reels'|'albums'|'medical'|'social'|'phone'|'clone'|'settings';
}) {
  const show=(section:string)=>focusSection===section;
  const initial = useMemo<FeedItem[]>(() => {
    const saved = read<FeedItem[]>('sb1_fb_posts_'+pageId, []);
    if (saved.length) return saved.map((p,i)=>p.demo && !p.mediaUrl ? {
      ...p,
      mediaUrl:p.kind==='image'?demoPostImages[i%demoPostImages.length]:(p.kind==='video'||p.kind==='reel'?demoVideoUrl:undefined),
      views:p.views||120+i*31
    } : p);
    const seeded = seedPosts.map(p=>({
      id:p.id, kind:(p.video_url ? (p.post_type==='reel'?'reel':'video') : p.image_url ? 'image':'post') as MediaKind,
      text:p.body, mediaUrl:p.video_url||p.image_url||undefined, createdAt:p.created_at,
      likes:p.likes_count||0, views:120, comments:[], public:true, demo:false, author:pageName, authorPhoto:pageAvatar
    }));
    const demo = Array.from({length:24},(_,i)=>{
      const kind=(i%4===0?'reel':i%5===0?'video':i%3===0?'image':'post') as MediaKind;
      return {
        id:'demo-'+i, kind,
        text:demoTexts[i%demoTexts.length], createdAt:new Date(Date.now()-i*3600000).toISOString(),
        mediaUrl:kind==='image'?demoPostImages[i%demoPostImages.length]:(kind==='video'||kind==='reel'?demoVideoUrl:undefined),
        likes:12+(i*7)%120, views:180+i*27,
        comments:[{id:'c'+i+'a',name:'مستخدم SB1',photo:demoPeopleImages[i%demoPeopleImages.length],body:'معلومة مفيدة، شكراً.'}],
        public:true,demo:true,author:pageName
      };
    });
    return [...seeded,...demo];
  },[pageId,pageName,pageAvatar,seedPosts.length]);

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
  const [likedIds,setLikedIds]=useState<string[]>(()=>read('sb1_fb_liked_'+pageId,[]));
  const [viewedIds,setViewedIds]=useState<string[]>([]);
  const hoverTimers=useRef<Record<string,number>>({});
  const [openComments,setOpenComments]=useState<string|null>(null);
  const [notice,setNotice]=useState('');
  const [active,setActive]=useState('home');
  const [share,setShare]=useState<{title:string;url:string}|null>(null);

  const [phone,setPhone]=useState(()=>localStorage.getItem('sb1_private_phone')||'');
  const [phoneLinked,setPhoneLinked]=useState(()=>localStorage.getItem('sb1_phone_linked')==='true');
  const [pairCode]=useState(()=>read('sb1_pair_code_'+pageId,String(Math.floor(100000+Math.random()*900000))));
  const [socialSearch,setSocialSearch]=useState('');
  const [socialUrl,setSocialUrl]=useState('');
  const [socialOpen,setSocialOpen]=useState<string[]>([]);
  const [socialEmbedded,setSocialEmbedded]=useState<string|null>(null);
  const [favorites,setFavorites]=useState<string[]>(()=>read('sb1_fb_social_favorites',[]));
  const [albums,setAlbums]=useState<any[]>(()=>read('sb1_fb_albums_'+pageId,[]));
  const [albumName,setAlbumName]=useState('');
  const [albumModal,setAlbumModal]=useState(false);
  const [albumPicker,setAlbumPicker]=useState<FeedItem|null>(null);
  const [reelViewer,setReelViewer]=useState<FeedItem|null>(null);
  const [postBackground,setPostBackground]=useState('#ffffff');
  const [postFontColor,setPostFontColor]=useState('#334155');
  const [postFontSize,setPostFontSize]=useState('18px');
  const [postFontWeight,setPostFontWeight]=useState('700');
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
  useEffect(()=>write('sb1_fb_liked_'+pageId,likedIds),[likedIds,pageId]);
  useEffect(()=>()=>Object.values(hoverTimers.current).forEach(t=>window.clearTimeout(t)),[]);
  useEffect(()=>write('sb1_fb_stories_'+pageId,stories),[stories,pageId]);
  useEffect(()=>write('sb1_fb_social_favorites',favorites),[favorites]);
  useEffect(()=>write('sb1_fb_albums_'+pageId,albums),[albums,pageId]);
  useEffect(()=>write('sb1_fb_clones',clones),[clones]);
  useEffect(()=>{if(postFile){const u=URL.createObjectURL(postFile);setPostUrl(u)}else setPostUrl('')},[postFile]);
  useEffect(()=>{if(storyFile){const u=URL.createObjectURL(storyFile);setStoryUrl(u)}else setStoryUrl('')},[storyFile]);
  useEffect(()=>()=>stream.current?.getTracks().forEach(t=>t.stop()),[]);

  const publicFeed=feed.filter(p=>p.public);
  const reels=publicFeed.filter(p=>p.kind==='reel');
  const activeStories=useMemo(()=>[
    ...stories.filter(s=>new Date(s.expiresAt)>new Date()),
    ...demoNames.map((name,i)=>({
      id:'demo-story-'+i,name,text:demoStoryTexts[i],
      mediaUrl:i%3===0?demoVideoUrl:demoPeopleImages[i%demoPeopleImages.length],
      mediaKind:i%3===0?'video':'image',
      createdAt:new Date(Date.now()-i*3600000).toISOString(),
      expiresAt:new Date(Date.now()+86400000).toISOString()
    }))
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
    const item:FeedItem={id:id(),kind:recordUrl?'audio':postKind,text:postText.trim()||'منشور جديد',mediaUrl:recordUrl||postUrl,mediaName:postFile?.name,createdAt:new Date().toISOString(),likes:0,comments:[],public:true,author:pageName,authorPhoto:pageAvatar};
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

  const like=(postId:string)=>{
    if(likedIds.includes(postId)) return;
    setLikedIds(v=>[...v,postId]);
    setFeed(v=>v.map(p=>p.id===postId?{...p,likes:p.likes+1}:p));
  };
  const startHoverView=(itemId:string,video?:HTMLVideoElement|null)=>{
    if(video) video.play().catch(()=>{});
    if(viewedIds.includes(itemId)||hoverTimers.current[itemId]) return;
    hoverTimers.current[itemId]=window.setTimeout(()=>{
      setViewedIds(v=>v.includes(itemId)?v:[...v,itemId]);
      setFeed(v=>v.map(p=>p.id===itemId?{...p,views:(p.views||0)+1}:p));
      delete hoverTimers.current[itemId];
    },1000);
  };
  const stopHoverView=(itemId:string,video?:HTMLVideoElement|null)=>{
    if(hoverTimers.current[itemId]){window.clearTimeout(hoverTimers.current[itemId]);delete hoverTimers.current[itemId];}
    if(video){video.pause();video.currentTime=0;}
  };
  const addComment=(postId:string)=>{
    const body=(comments[postId]||'').trim();if(!body)return;
    setFeed(v=>v.map(p=>p.id===postId?{...p,comments:[...p.comments,{id:id(),name:'مستخدم SB1',photo:pageAvatar,body}]}:p));
    setComments(v=>({...v,[postId]:''}));
  };
  const saveStoryToFavorites=(s:StoryItem)=>{toggleSaved({id:s.id,kind:s.mediaKind==='video'?'video':'image',title:s.text||s.name,body:s.text,author:s.name,url:s.mediaUrl,image_url:s.mediaKind==='image'?s.mediaUrl:undefined,created_at:s.createdAt});setNotice('تم حفظ القصة في مفضلتي.');};
  const saveToFavorites=(p:FeedItem)=>{toggleSaved({id:p.id,kind:p.kind==='image'?'image':p.kind==='reel'?'reel':p.kind==='video'?'video':p.kind==='audio'?'recording':p.kind==='article'?'article':'post',title:p.text,body:p.text,author:p.author,url:p.mediaUrl,image_url:p.kind==='image'?p.mediaUrl:undefined,created_at:p.createdAt});setNotice('تم الحفظ في مفضلتي تلقائياً ضمن القسم المناسب.');};
  const createAlbum=()=>{const n=albumName.trim();if(!n){setNotice('اكتب اسم الألبوم أولاً.');return}const a={id:id(),name:n,items:[]};setAlbums(v=>[a,...v]);setAlbumName('');setAlbumModal(false);setNotice('تم إنشاء الألبوم.');};
  const addToAlbum=(p:FeedItem,albumId:string)=>{setAlbums(v=>v.map(a=>a.id===albumId?{...a,items:[p,...(a.items||[]).filter((x:any)=>x.id!==p.id)]}:a));setAlbumPicker(null);setNotice('تمت إضافة المحتوى إلى الألبوم.');};

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
    const q=socialSearch.trim();
    if(!q)return;
    const providers=[['YouTube','https://www.youtube.com/embed/'+encodeURIComponent(q)],['Rutube','https://rutube.ru/play/embed/'+encodeURIComponent(q)]];
    const found=providers.find(([n])=>q.toLowerCase().includes(String(n).toLowerCase()));
    if(found) openSocial(found[1]);
    else setNotice('اختر منصة قابلة للعرض داخل SB1 ثم أدخل رابط/معرّف المحتوى.');
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
    <button key={key} onClick={()=>jump(key)} className={'shrink-0 rounded-lg px-3 py-2 text-sm font-bold transition active:bg-slate-200 '+(active===key?'bg-teal-700 text-white':'text-slate-700 hover:bg-teal-50')}>{Icon&&<Icon className="inline h-4 w-4 ml-1"/>}{label}</button>;

  return <div dir="rtl" className="mt-4 space-y-4">
    {show('home') && (<section id="fb-home" className="grid min-w-0 grid-cols-1 gap-4 overflow-hidden">
      <div className="space-y-4">
        {!hideStories&&(
          <div className="bg-transparent p-0">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="sr-only">القصص</h2>
              <button onClick={()=>setStoryComposer(true)} className="rounded-full bg-teal-50 p-2 text-teal-700" aria-label="إنشاء قصة"><Plus className="h-4 w-4"/></button>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-1">
              <button onClick={()=>setStoryComposer(true)} className="min-w-[104px] overflow-hidden rounded-xl bg-slate-50">
                <div className="grid h-28 place-items-center bg-gradient-to-br from-teal-600 to-teal-800 text-white"><Plus className="h-8 w-8"/></div>
                <div className="p-2 text-center text-xs font-bold">قصتك</div>
              </button>
              {activeStories.map(s=><button key={s.id} onClick={()=>setStoryViewer(s)} className="min-w-[104px] overflow-hidden rounded-xl bg-white text-right">
                <div className="relative grid h-28 place-items-center overflow-hidden bg-slate-900 text-white">
                  {s.mediaUrl ? (s.mediaKind==='video'
                    ? <video src={s.mediaUrl} muted playsInline className="h-full w-full object-cover" onMouseEnter={e=>startHoverView(s.id,e.currentTarget)} onMouseLeave={e=>stopHoverView(s.id,e.currentTarget)}/>
                    : <img src={s.mediaUrl} className="h-full w-full object-cover" alt="" onMouseEnter={()=>startHoverView(s.id)} onMouseLeave={()=>stopHoverView(s.id)}/>)
                    : <span className="p-3 text-xs font-bold">{s.text}</span>}
                  <span className="absolute bottom-2 right-2 rounded-full bg-white px-2 py-1 text-[10px] font-bold text-slate-800">{s.name}</span>
                </div>
              </button>)}
            </div>
          </div>
        )}

        {/* Facebook-style composer */}
        {canManage&&<div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <button onClick={()=>setComposer(true)} className="flex w-full items-center gap-3 text-right">
            {pageAvatar?<img src={pageAvatar} alt={pageName} className="h-11 w-11 shrink-0 rounded-full object-cover"/>:<div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-teal-100 font-extrabold text-teal-700">{pageName.charAt(0)}</div>}
            <div className="flex-1 rounded-full bg-slate-100 px-4 py-3 text-sm text-slate-500">بم تفكر؟ اكتب منشوراً أو أضف صورة أو فيديو أو Reel...</div>
          </button>
          <div className="mt-3 grid grid-cols-3 border-t pt-3 text-sm font-bold text-slate-600">
            <button onClick={()=>{setPostKind('image');setComposer(true)}} className="rounded-lg py-2 hover:bg-slate-50"><ImageIcon className="inline text-teal-600"/> صورة</button>
            <button onClick={()=>{setPostKind('video');setComposer(true)}} className="rounded-lg py-2 hover:bg-slate-50"><Video className="inline text-teal-600"/> فيديو</button>
            <button onClick={()=>{setPostKind('reel');setComposer(true)}} className="rounded-lg py-2 hover:bg-slate-50"><Video className="inline text-teal-600"/> Reel</button>
          </div>
        </div>}

        {/* Home order requested: posts heading -> horizontal Reels -> posts feed */}
        {/* Reels strip appears directly after the composer */}

        <div id="fb-reels" className="bg-transparent p-0"><div className="mb-3 flex justify-end"><button onClick={()=>jump("reels")} className="text-xs font-bold text-teal-700">عرض الكل</button></div>
          <div className="flex gap-3 overflow-x-auto">
            {reels.slice(0,10).map(r=><button key={r.id} onClick={()=>setReelViewer(r)} className="min-w-[118px] overflow-hidden rounded-xl bg-slate-900 text-white text-right">
              <div className="relative grid aspect-[3/4] max-h-40 place-items-center overflow-hidden bg-slate-950 p-2">
  <video src={r.mediaUrl||demoVideoUrl} muted playsInline className="absolute inset-0 h-full w-full object-cover" onMouseEnter={e=>startHoverView(r.id,e.currentTarget)} onMouseLeave={e=>stopHoverView(r.id,e.currentTarget)}/>
  <div className="absolute inset-0 bg-black/30"/>
  <span className="relative z-10 px-2 text-xs font-bold">{r.text.slice(0,55)}</span><span className="absolute bottom-2 left-2 z-10 rounded-full bg-black/60 px-2 py-1 text-[10px]"><Eye className="inline h-3 w-3 ml-1"/>{r.views||0}</span>
</div>
            </button>)}
          </div>
        </div>

        {/* Feed */}
        <div id="fb-posts" className="space-y-4">
          {publicFeed.map((p,i)=><div key={p.id}>
            <article className="mx-auto max-w-3xl overflow-hidden rounded-xl border border-slate-300 bg-white shadow-sm">
              <div className="p-3">
              <div className="flex items-center gap-3">
                {p.authorPhoto?<img src={p.authorPhoto} alt={p.author} className="h-10 w-10 rounded-full object-cover"/>:<div className="grid h-10 w-10 place-items-center rounded-full bg-teal-100 font-extrabold text-teal-700">{p.author.charAt(0)}</div>}
                <div className="flex-1"><b className="text-sm">{p.author}</b><div className="text-xs text-slate-400">{new Date(p.createdAt).toLocaleString()}</div></div>
              </div>
              <div className="mt-3 rounded-xl px-3 py-4 whitespace-pre-wrap leading-7 text-sm" style={p.style||{}}>{p.text}</div>
              {p.mediaUrl&&p.kind==='image'&&<img src={p.mediaUrl} alt="" className="mx-auto mt-3 max-h-[320px] w-full max-w-2xl rounded-xl object-contain"/>}
              {p.mediaUrl&&(p.kind==='video'||p.kind==='reel')&&<video src={p.mediaUrl} controls muted playsInline className="mx-auto mt-3 max-h-[320px] w-full max-w-2xl rounded-xl bg-black object-contain" onMouseEnter={e=>startHoverView(p.id,e.currentTarget)} onMouseLeave={e=>stopHoverView(p.id,e.currentTarget)}/>} 
              {p.mediaUrl&&p.kind==='audio'&&<audio src={p.mediaUrl} controls className="mt-3 w-full"/>}
              </div>
              <div className="flex items-center border-t border-slate-300 bg-slate-50 px-2 py-2 text-sm text-slate-600">
                <button onClick={()=>like(p.id)} disabled={likedIds.includes(p.id)} className={'flex-1 rounded-lg py-2 transition '+(likedIds.includes(p.id)?'text-red-600':'text-slate-600 hover:bg-white hover:text-teal-700')}><Heart className="inline h-4 w-4 ml-1" fill={likedIds.includes(p.id)?'currentColor':'none'}/> {p.likes}</button>
                <button onClick={()=>setOpenComments(p.id)} className="flex-1 rounded-lg py-2 hover:bg-white" aria-label="التعليقات">{p.authorPhoto?<img src={p.authorPhoto} alt="" className="inline-block h-5 w-5 rounded-full object-cover align-middle ml-1"/>:<MessageCircle className="inline h-4 w-4 ml-1"/>}<MessageCircle className="inline h-4 w-4 ml-1"/> {p.comments.length}</button>
                <span className="flex items-center gap-1 px-2 text-xs font-bold text-slate-500"><Eye className="h-4 w-4"/>{p.views||0}</span>
                <button onClick={()=>openShare(p.text)} className="flex-1 rounded-lg py-2 hover:bg-white active:bg-slate-100"><Share2 className="inline h-4 w-4 ml-1"/> مشاركة</button>
                <button onClick={()=>saveToFavorites(p)} className="rounded-lg px-3 py-2 hover:bg-white active:bg-slate-100" aria-label="حفظ"><Bookmark className="inline h-4 w-4"/></button>
                <button onClick={()=>setAlbumPicker(p)} className="rounded-lg px-3 py-2 hover:bg-white active:bg-slate-100" aria-label="إضافة إلى ألبوم"><Album className="inline h-4 w-4"/></button>
              </div>
            </article>
          </div>)}
        </div>
      </div>

      
    </section>) }

    {show('reels') && (<section id="fb-reels-all" className="bg-transparent p-0">
      <div className="mb-3 flex items-center justify-between"><h2 className="sr-only">Reels</h2><span className="text-xs text-slate-400">{reels.length} Reel</span></div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">{reels.slice(0,18).map(r=><button key={r.id} onClick={()=>setReelViewer(r)} className="relative overflow-hidden rounded-xl bg-slate-900 text-white text-right"><video src={r.mediaUrl||demoVideoUrl} muted playsInline className="h-full w-full object-cover" onMouseEnter={e=>startHoverView(r.id,e.currentTarget)} onMouseLeave={e=>stopHoverView(r.id,e.currentTarget)}/><div className="absolute inset-0 bg-black/25"/><span className="absolute bottom-2 right-2 left-2 z-10 text-xs font-bold">{r.text.slice(0,60)}</span><span className="absolute bottom-2 left-2 z-10 rounded-full bg-black/65 px-2 py-1 text-[10px]"><Eye className="inline h-3 w-3 ml-1"/>{r.views||0}</span></button>)}</div>
    </section>) }

    {show('albums') && (<section id="fb-albums" className="rounded-xl border bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between"><div><h2 className="text-lg font-extrabold">الألبومات</h2><p className="text-xs text-slate-500">أنشئ ألبوماً باسم جديد ثم احفظ داخله الصور والمنشورات والفيديوهات والريلز.</p></div><button onClick={()=>setAlbumModal(true)} className="rounded-xl bg-teal-700 px-4 py-2 text-sm font-bold text-white active:bg-teal-800"><Plus className="inline h-4 w-4 ml-1"/>ألبوم جديد</button></div>
      {albums.length===0?<div className="rounded-xl border border-dashed p-8 text-center text-sm text-slate-400">لا توجد ألبومات بعد. أنشئ أول ألبوم من هنا أو احفظ أي منشور عبر رمز الألبوم.</div>:<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{albums.map(a=><article key={a.id} className="rounded-xl border bg-slate-50 p-4"><div className="flex items-center justify-between"><b>{a.name}</b><span className="text-xs text-slate-400">{a.items?.length||0} عنصر</span></div><div className="mt-3 grid grid-cols-3 gap-2">{(a.items||[]).slice(0,6).map((x:any)=><div key={x.id} className="aspect-square overflow-hidden rounded-lg bg-white">{x.mediaUrl&&x.kind==='image'?<img src={x.mediaUrl} alt="" className="h-full w-full object-cover"/>:<div className="grid h-full place-items-center text-[10px] font-bold text-slate-500">{x.kind==='reel'?'Reel':x.kind==='video'?'فيديو':'منشور'}</div>}</div>)}</div></article>)}</div>}
    </section>) }

    {show('medical') && (<section id="fb-medical-content" className="rounded-xl border bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between"><div><h2 className="sr-only">المحتوى الطبي</h2><p className="text-xs text-slate-500">فيديوهات طبية وتعليمية داخل SB1</p></div><Library className="text-teal-700"/></div>
      <div className="grid gap-3 md:grid-cols-3">{Array.from({length:9},(_,i)=>({title:demoTexts[i%demoTexts.length],specialty:['علم النفس','الصحة النفسية','التقييم السريري'][i%3]})).map((v,i)=><article key={i} className="rounded-xl border p-3"><div className="grid aspect-video place-items-center rounded-lg bg-slate-900 text-white"><Video/></div><b className="mt-2 block text-sm">{v.title}</b><span className="text-xs text-slate-500">{v.specialty}</span><div className="mt-2 flex gap-2"><button className="rounded-lg bg-teal-50 px-3 py-1 text-xs font-bold text-teal-700">فيديوهاتي</button><button className="rounded-lg bg-slate-50 px-3 py-1 text-xs font-bold">شاهداتي</button></div></article>)}</div>
    </section>) }

    {show('social') && (<section id="fb-social" className="rounded-xl border bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between"><div><h2 className="text-xl font-extrabold">منصات التواصل</h2><p className="text-xs text-slate-500">تبقى كل منصة داخل SB1 ويمكن فتح أكثر من منصة داخل الصفحة نفسها.</p></div><ExternalLink className="text-teal-700"/></div>
      {canManage&&<div className="grid gap-2 md:grid-cols-[1fr_auto]">
        <input value={socialSearch} onChange={e=>setSocialSearch(e.target.value)} onKeyDown={e=>e.key==='Enter'&&searchSocial()} className="rounded-xl border p-3" placeholder="ابحث داخل المنصة المطلوبة..."/>
        <button onClick={searchSocial} className="rounded-xl bg-teal-700 px-4 text-white"><Search/></button>
      </div>}
      <div className="mt-3 flex flex-wrap gap-2">{[
        ['YouTube','https://www.youtube.com/embed/dQw4w9WgXcQ'],['Rutube','https://rutube.ru/play/embed/00000000000000000000000000000000']
      ].map(([n,u])=><button key={n} onClick={()=>openSocial(u)} className={'rounded-lg border px-3 py-2 text-sm font-bold '+(socialEmbedded===u?'border-teal-600 bg-teal-50 text-teal-700':'')}>{n}</button>)}</div>
      {socialOpen.length>0&&<div className="mt-4 flex gap-2 overflow-x-auto">{socialOpen.slice(0,8).map(u=><button key={u} onClick={()=>setSocialEmbedded(u)} className={'max-w-[220px] truncate rounded-lg border px-3 py-2 text-xs '+(socialEmbedded===u?'border-teal-600 bg-teal-50':'')}>{u}</button>)}</div>}
      {socialEmbedded&&<div className="mt-4 overflow-hidden rounded-2xl border bg-slate-100">
        <div className="flex items-center justify-between border-b bg-white px-3 py-2"><b>منصة داخل SB1</b><button onClick={()=>setSocialEmbedded(null)}><X/></button></div>
        <iframe title="social-platform" src={socialEmbedded} className="h-[720px] w-full border-0 bg-white" referrerPolicy="strict-origin-when-cross-origin"/>

      </div>}
    </section>) }

    {show('phone') && (<section id="fb-phone" className="rounded-xl border bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between"><div><h2 className="text-xl font-extrabold">الهاتف وQR</h2><p className="text-xs text-slate-500">الرقم خاص بالحساب.</p></div><QrCode className="text-teal-700"/></div>
      {canManage&&<div className="grid gap-5 md:grid-cols-2"><div><label className="text-sm font-bold">رقم الهاتف</label><input value={phone} onChange={e=>setPhone(e.target.value)} className="mt-2 w-full rounded-xl border p-3" placeholder="+49 ..."/><div className="mt-2 flex gap-2"><button onClick={()=>{localStorage.setItem('sb1_private_phone',phone);setNotice('تم حفظ رقم الهاتف.')}} className="rounded-lg bg-teal-700 px-4 py-2 text-sm font-bold text-white active:bg-teal-800">حفظ</button><button onClick={()=>{if(!phone.trim()){setNotice('اكتب رقم الهاتف أولاً.');return}localStorage.setItem('sb1_private_phone',phone);localStorage.setItem('sb1_phone_linked','true');setPhoneLinked(true);setNotice('تم ربط الهاتف بهذا الحساب.')}} className="rounded-lg border px-4 py-2 text-sm font-bold active:bg-slate-200">{phoneLinked?'الهاتف مربوط':'ربط الهاتف'}</button></div><div className="mt-3 rounded-xl bg-slate-50 p-3 text-xs">رمز الربط: <b>{pairCode}</b></div></div><div className="grid place-items-center rounded-xl bg-slate-50 p-4"><img src={'https://api.qrserver.com/v1/create-qr-code/?size=220x220&data='+encodeURIComponent(window.location.origin+'/doctors/'+pageId+'?pair='+pairCode)} alt="QR" className="h-44 w-44"/><span className="mt-2 text-xs">QR لفتح الصفحة وربط الهاتف</span></div></div>}
    </section>) }

    {canManage&&show('clone')&&(<section id="fb-clone" className="rounded-xl border bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between"><div><h2 className="text-xl font-extrabold">Clone / Gift</h2><p className="text-xs text-slate-500">ينسخ نوع الحساب والعدد فقط، ثم يمكن تغيير الاسم والصلاحيات.</p></div><Wand2 className="text-teal-700"/></div>
      <div className="grid gap-3 md:grid-cols-4"><select value={cloneType} onChange={e=>setCloneType(e.target.value)} className="rounded-xl border p-3"><option value="specialist">أخصائي</option><option value="institution">مؤسسة</option><option value="delivery_worker">عامل توصيل</option><option value="service">خدمة</option><option value="pharmacy">صيدلية</option><option value="facility">مرفق طبي</option><option value="content_creator">صانع محتوى</option><option value="admin">إداري</option></select><input type="number" min={1} max={50} value={cloneCount} onChange={e=>setCloneCount(Number(e.target.value))} className="rounded-xl border p-3"/><input value={cloneName} onChange={e=>setCloneName(e.target.value)} className="rounded-xl border p-3" placeholder="اسم الصفحة"/><input type="date" value={cloneExpiry} onChange={e=>setCloneExpiry(e.target.value)} className="rounded-xl border p-3"/></div>
      <div className="mt-4 rounded-xl border bg-slate-50 p-4"><div className="mb-3 flex flex-wrap items-center justify-between gap-2"><b>صلاحيات الصفحة المستنسخة — كل وظائف SB1</b><div className="flex gap-2"><button onClick={()=>setClonePermissions(allPermissionKeys)} className="rounded-lg bg-teal-700 px-3 py-1 text-xs font-bold text-white">تفعيل الكل</button><button onClick={()=>setClonePermissions([])} className="rounded-lg bg-white px-3 py-1 text-xs font-bold">إلغاء الكل</button></div></div>
        <div className="grid gap-3 md:grid-cols-2">{permissionGroups.map(group=><div key={group.title} className="rounded-xl bg-white p-3"><b className="text-sm">{group.title}</b><div className="mt-2 space-y-2">{group.items.map(([key,label])=><label key={key} className="flex items-center gap-2 text-xs"><input type="checkbox" checked={clonePermissions.includes(key)} onChange={e=>setClonePermissions(v=>e.target.checked?[...v,key]:v.filter(x=>x!==key))} className="h-4 w-4"/>{label}</label>)}</div></div>)}</div>
      </div>
      <button onClick={makeClones} className="mt-3 rounded-xl bg-teal-700 px-5 py-2 font-bold text-white">إنشاء الصفحة بالصلاحيات المحددة</button>
      {clones.slice(0,8).map(c=><div key={c.id} className="mt-3 rounded-xl border p-3"><div className="flex justify-between"><b>{c.name}</b><span className="text-xs">{c.type}</span></div><div className="mt-2 text-xs">PIN: {c.pin} • كلمة المرور: {c.password} • {c.expires||'بدون انتهاء'}</div><button onClick={()=>setShare({title:c.name+' | PIN '+c.pin, url:c.link})} className="mt-2 rounded-lg bg-teal-700 px-3 py-2 text-xs font-bold text-white"><Gift className="inline h-4 w-4 ml-1"/> إرسال</button></div>)}
    </section>) }

    {canManage&&show('settings')&&(<section id="fb-settings" className="rounded-xl border bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between"><div><h2 className="text-xl font-extrabold">الإعدادات</h2><p className="text-xs text-slate-500">تظهر لصاحب الصفحة والمالك/المشرف فقط.</p></div><Settings className="text-teal-700"/></div>
      <button onClick={()=>setSettingsOpen(v=>!v)} className="mt-3 rounded-xl bg-teal-700 px-4 py-2 font-bold text-white active:bg-teal-800">{settingsOpen?'إغلاق':'فتح الإعدادات'}</button>
      {settingsOpen&&<div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border bg-slate-50 p-4"><b>إعدادات الحساب</b><p className="mt-1 text-xs text-slate-500">البريد الإلكتروني، رقم الهاتف، اللغة، الدولة والمدينة.</p><div className="mt-3 space-y-2"><input value={localStorage.getItem('sb1_account_email')||''} readOnly className="w-full rounded-lg border bg-white p-2 text-sm"/><select defaultValue={localStorage.getItem('sb1_account_language')||''} onChange={e=>{localStorage.setItem('sb1_account_language',e.target.value);setNotice('تم حفظ لغة الحساب.')}} className="w-full rounded-lg border bg-white p-2 text-sm"><option value="">لغة الحساب</option><option value="ar">العربية</option><option value="en">English</option><option value="de">Deutsch</option><option value="ru">Русский</option></select></div></div>
        <div className="rounded-xl border bg-slate-50 p-4"><b>الخصوصية والحساب</b><p className="mt-1 text-xs text-slate-500">إدارة ظهور الصفحة والمحتوى والحساب.</p><div className="mt-3 space-y-2"><label className="flex items-center gap-2 text-sm"><input type="checkbox" defaultChecked onChange={e=>localStorage.setItem('sb1_profile_public',String(e.target.checked))}/> الصفحة عامة</label><label className="flex items-center gap-2 text-sm"><input type="checkbox" defaultChecked onChange={e=>localStorage.setItem('sb1_notifications_enabled',String(e.target.checked))}/> إشعارات الحساب</label></div></div>
      </div>}
      {settingsOpen&&<div className="mt-3 grid gap-3 md:grid-cols-2"><label className="rounded-xl bg-slate-50 p-4 text-sm"><b>المحتوى الطبي العام</b><p className="mt-1 text-xs text-slate-500">يمكن للزوار مشاهدة المحتوى الطبي المجاني.</p><input type="checkbox" defaultChecked className="mt-3 h-5 w-5"/></label><label className="rounded-xl bg-slate-50 p-4 text-sm"><b>السماح بالقصص</b><p className="mt-1 text-xs text-slate-500">إظهار القصص في أعلى الصفحة.</p><input type="checkbox" defaultChecked className="mt-3 h-5 w-5"/></label></div>}
    </section>) }

    {storyComposer&&<div className="fixed inset-0 z-[200] grid place-items-center bg-black/60 p-4" onClick={()=>setStoryComposer(false)}><div className="w-full max-w-lg rounded-2xl bg-white p-5" onClick={e=>e.stopPropagation()}><div className="flex items-center justify-between"><h3 className="text-xl font-extrabold">إنشاء قصة</h3><button onClick={()=>setStoryComposer(false)}><X/></button></div><textarea value={storyText} onChange={e=>setStoryText(e.target.value)} className="mt-4 min-h-28 w-full rounded-xl border p-3" placeholder="اكتب ما تريد في قصتك..."/><div className="mt-3 flex flex-wrap gap-2"><label className="cursor-pointer rounded-lg bg-slate-100 px-3 py-2 text-sm font-bold"><Upload className="inline h-4 w-4 ml-1"/> صورة / فيديو<input type="file" accept="image/*,video/*" className="hidden" onChange={e=>{const f=e.target.files?.[0]||null;setStoryFile(f);setStoryVideo(f?.type.startsWith('video/')||false)}}/></label><button onClick={createStory} className="rounded-lg bg-teal-700 px-4 py-2 font-bold text-white">نشر القصة</button></div>{storyFile&&<div className="mt-2 text-xs text-slate-500">{storyFile.name}</div>}</div></div>}

    {composer&&<div className="fixed inset-0 z-[200] grid place-items-center bg-black/60 p-4" onClick={()=>setComposer(false)}><div className="w-full max-w-xl rounded-2xl bg-white p-5" onClick={e=>e.stopPropagation()}><div className="flex items-center justify-between"><h3 className="text-xl font-extrabold">إنشاء منشور</h3><button onClick={()=>setComposer(false)}><X/></button></div><textarea value={postText} onChange={e=>setPostText(e.target.value)} className="mt-4 min-h-32 w-full rounded-xl border p-3" placeholder="اكتب منشوراً..."/><div className="mt-3 flex flex-wrap gap-2">{(['post','image','video','reel','article'] as MediaKind[]).map(k=><button key={k} onClick={()=>setPostKind(k)} className={'rounded-lg px-3 py-2 text-sm font-bold active:bg-slate-200 '+(postKind===k?'bg-teal-700 text-white':'bg-slate-100')}>{k==='post'?'نص':k==='image'?'صورة':k==='video'?'فيديو':k==='reel'?'Reel':'مقالة'}</button>)}<label className="cursor-pointer rounded-lg bg-slate-100 px-3 py-2 text-sm font-bold"><Upload className="inline h-4 w-4 ml-1"/> رفع ملف<input type="file" accept={postKind==='image'?'image/*':postKind==='video'||postKind==='reel'?'video/*':'*/*'} className="hidden" onChange={e=>setPostFile(e.target.files?.[0]||null)}/></label><div className="mt-3 rounded-xl border bg-slate-50 p-3"><div className="mb-2 text-xs font-extrabold">تنسيق المنشور الكتابي</div><div className="flex flex-wrap gap-2"><label className="flex items-center gap-2 rounded-lg bg-white px-2 py-2 text-xs font-bold">الخلفية <input type="color" value={postBackground} onChange={e=>setPostBackground(e.target.value)} className="h-7 w-7 cursor-pointer rounded"/></label><label className="flex items-center gap-2 rounded-lg bg-white px-2 py-2 text-xs font-bold">الخط <input type="color" value={postFontColor} onChange={e=>setPostFontColor(e.target.value)} className="h-7 w-7 cursor-pointer rounded"/></label><select value={postFontSize} onChange={e=>setPostFontSize(e.target.value)} className="rounded-lg border bg-white px-2 py-2 text-xs font-bold"><option value="14px">صغير</option><option value="18px">متوسط</option><option value="24px">كبير</option><option value="32px">كبير جداً</option></select><button onClick={()=>setPostFontWeight(v=>v==='700'?'900':'700')} className="rounded-lg border bg-white px-3 py-2 text-xs font-black active:bg-slate-200">{postFontWeight==='900'?'عريض جداً':'عريض'}</button></div><div className="mt-3 rounded-xl px-4 py-4" style={{background:postBackground,color:postFontColor,fontSize:postFontSize,fontWeight:postFontWeight}}>{postText||'معاينة المنشور'}</div></div><button onClick={recording?stopRecord:startRecord} className={'rounded-lg px-3 py-2 text-sm font-bold '+(recording?'bg-red-600 text-white':'bg-slate-100')}><Mic className="inline h-4 w-4 ml-1"/>{recording?'إيقاف':'تسجيل صوت'}</button></div>{(postUrl||recordUrl)&&<div className="mt-3 rounded-xl bg-slate-50 p-3 text-sm">{postFile?.name||'تسجيل صوتي جاهز'}</div>}<button onClick={publish} className="mt-4 w-full rounded-xl bg-teal-700 py-3 font-bold text-white">نشر الآن</button></div></div>}

    {storyViewer&&<div className="fixed inset-0 z-[210] grid place-items-center bg-black/80 p-4" onClick={()=>setStoryViewer(null)}><div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-slate-950 text-white" onClick={e=>e.stopPropagation()}><button onClick={()=>setStoryViewer(null)} className="absolute left-3 top-3 z-10 rounded-full bg-black/50 p-2"><X/></button>{storyViewer.mediaUrl ? (storyViewer.mediaKind==='video' ? <video src={storyViewer.mediaUrl} controls autoPlay className="max-h-[72vh] w-full bg-black object-contain"/> : <img src={storyViewer.mediaUrl} alt="" className="max-h-[72vh] w-full object-contain"/>) : <div className="grid min-h-[60vh] place-items-center p-8 text-center text-2xl font-extrabold">{storyViewer.text}</div>}<div className="flex items-center justify-between p-4"><div><b>{storyViewer.name}</b><p className="text-xs opacity-70">{storyViewer.text}</p></div><div className="flex gap-2">{<button onClick={()=>saveStoryToFavorites(storyViewer)} className="rounded-lg bg-white/10 px-3 py-2 text-xs font-bold active:bg-white/20"><Bookmark className="inline h-4 w-4 ml-1"/>حفظ</button>}{storyViewer.own&&<button onClick={()=>deleteStory(storyViewer)} className="rounded-lg bg-red-600 px-3 py-2 text-xs font-bold"><Trash2 className="inline h-4 w-4 ml-1"/>حذف</button>}</div></div></div></div>}

    {openComments&&(()=>{const post=feed.find(x=>x.id===openComments); if(!post)return null; return <div className="fixed inset-0 z-[120] grid place-items-center bg-black/60 p-4" onClick={()=>setOpenComments(null)}>
      <div className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-xl" onClick={e=>e.stopPropagation()}>
        <div className="flex items-center justify-between border-b pb-3">
          <b className="text-lg">التعليقات</b>
          <button onClick={()=>setOpenComments(null)} aria-label="إغلاق"><X/></button>
        </div>
        <div className="max-h-[55vh] space-y-2 overflow-y-auto py-4">
          {post.comments.length===0&&<div className="py-8 text-center text-sm text-slate-500">لا توجد تعليقات بعد.</div>}
          {post.comments.map(c=><div key={c.id} className="flex gap-2 rounded-xl bg-slate-50 p-3 text-sm">{c.photo?<img src={c.photo} alt={c.name} className="h-8 w-8 shrink-0 rounded-full object-cover"/>:<div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-teal-100 text-xs font-bold text-teal-700">{c.name.charAt(0)}</div>}<div><b>{c.name}</b><div className="mt-1">{c.body}</div></div></div>)}
        </div>
        <div className="flex gap-2 border-t pt-3">
          <input autoFocus value={comments[post.id]||''} onChange={e=>setComments(v=>({...v,[post.id]:e.target.value}))} onKeyDown={e=>e.key==='Enter'&&addComment(post.id)} className="flex-1 rounded-full border bg-slate-50 px-4 py-2 text-sm" placeholder="اكتب تعليقاً..."/>
          <button onClick={()=>addComment(post.id)} className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-teal-700 text-white" aria-label="إرسال التعليق"><Send className="h-4 w-4"/></button>
        </div>
      </div>
    </div>})()}
    {share&&<div className="fixed inset-0 z-[120] grid place-items-center bg-black/60 p-4" onClick={()=>setShare(null)}><div className="w-full max-w-lg rounded-2xl bg-white p-5" onClick={e=>e.stopPropagation()}><div className="flex items-center justify-between"><h3 className="text-xl font-extrabold">إرسال</h3><button onClick={()=>setShare(null)}><X/></button></div><button onClick={async()=>{try{await navigator.share?.({title:share.title,url:share.url});}catch{}}} className="mt-4 w-full rounded-xl bg-teal-700 py-3 font-bold text-white"><Share2 className="inline ml-1"/>مشاركة من الجهاز</button><div className="mt-3 grid grid-cols-2 gap-2">{[['telegram','Telegram'],['whatsapp','WhatsApp'],['facebook','Facebook'],['x','X'],['email','البريد'],['sms','الرسائل']].map(([k,l])=><button key={k} onClick={()=>send(k)} className="rounded-xl border p-3 font-bold hover:border-teal-500 hover:text-teal-700">{l}</button>)}</div></div></div>}

    {albumModal&&<div className="fixed inset-0 z-[140] grid place-items-center bg-black/60 p-4" onClick={()=>setAlbumModal(false)}><div className="w-full max-w-md rounded-2xl bg-white p-5" onClick={e=>e.stopPropagation()}><div className="flex items-center justify-between"><b className="text-lg">إنشاء ألبوم</b><button onClick={()=>setAlbumModal(false)}><X/></button></div><input autoFocus value={albumName} onChange={e=>setAlbumName(e.target.value)} onKeyDown={e=>e.key==='Enter'&&createAlbum()} className="mt-4 w-full rounded-xl border p-3" placeholder="اسم الألبوم الجديد"/><button onClick={createAlbum} className="mt-3 w-full rounded-xl bg-teal-700 py-3 font-bold text-white active:bg-teal-800">حفظ الألبوم</button></div></div>}
    {albumPicker&&<div className="fixed inset-0 z-[140] grid place-items-center bg-black/60 p-4" onClick={()=>setAlbumPicker(null)}><div className="w-full max-w-md rounded-2xl bg-white p-5" onClick={e=>e.stopPropagation()}><div className="flex items-center justify-between"><b>إضافة إلى ألبوم</b><button onClick={()=>setAlbumPicker(null)}><X/></button></div>{albums.length===0?<p className="py-6 text-center text-sm text-slate-500">أنشئ ألبوماً أولاً.</p>:<div className="mt-4 space-y-2">{albums.map(a=><button key={a.id} onClick={()=>addToAlbum(albumPicker,a.id)} className="flex w-full items-center justify-between rounded-xl border p-3 text-right hover:bg-slate-50 active:bg-slate-100"><b>{a.name}</b><span className="text-xs text-slate-400">{a.items?.length||0}</span></button>)}</div>}<button onClick={()=>{setAlbumPicker(null);setAlbumModal(true)}} className="mt-3 w-full rounded-xl bg-slate-100 py-3 font-bold active:bg-slate-200">+ إنشاء ألبوم جديد</button></div></div>}
    {reelViewer&&<div className="fixed inset-0 z-[145] grid place-items-center bg-black/85 p-4" onClick={()=>setReelViewer(null)}><div className="relative w-full max-w-xl overflow-hidden rounded-2xl bg-black" onClick={e=>e.stopPropagation()}><button onClick={()=>setReelViewer(null)} className="absolute left-3 top-3 z-10 rounded-full bg-black/60 p-2 text-white"><X/></button>{reelViewer.mediaUrl?<video src={reelViewer.mediaUrl} controls autoPlay className="max-h-[80vh] w-full object-contain"/>:<div className="grid min-h-[65vh] place-items-center p-8 text-center text-2xl font-extrabold text-white">{reelViewer.text}</div>}<div className="flex items-center justify-between bg-slate-950 p-4 text-white"><div><b>{reelViewer.author}</b><p className="mt-1 text-xs text-slate-300">{reelViewer.text}</p></div><button onClick={()=>saveToFavorites(reelViewer)} className="rounded-lg bg-white/10 px-3 py-2 active:bg-white/20"><Bookmark className="inline h-4 w-4 ml-1"/>حفظ</button></div></div></div>}
    {notice&&<div className="fixed bottom-5 left-1/2 z-[130] -translate-x-1/2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white shadow-xl">{notice}<button onClick={()=>setNotice('')} className="mr-3"><CheckCircle2 className="inline h-4 w-4"/></button></div>}
  </div>;
}