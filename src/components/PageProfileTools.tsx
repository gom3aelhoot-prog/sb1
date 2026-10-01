import { useEffect, useMemo, useRef, useState } from 'react';
import { toggleSaved } from '@/lib/socialVault';
import { supabase } from '@/lib/supabase';
import {
  Album, AudioLines, BookOpen, CheckCircle2, ExternalLink, FileVideo, Gift, Heart,
  Image as ImageIcon, Library, MessageCircle, Mic, Plus, QrCode, Search, Send, Eye,
  Settings, Share2, Trash2, Upload, Video, X, Wand2, Bookmark
} from 'lucide-react';

type MediaKind = 'post' | 'image' | 'video' | 'reel' | 'audio' | 'article';
type StoryItem = { id:string; name:string; text:string; mediaUrl?:string; mediaKind?:'image'|'video'; audioUrl?:string; audioStart?:number; filter?:string; authorPhoto?:string; textStyle?:{color:string;fontSize:string;fontWeight:string}; createdAt:string; expiresAt:string; own?:boolean };
type FeedItem = {
  id:string; kind:MediaKind; text:string; mediaUrl?:string; mediaName?:string;
  createdAt:string; likes:number; views?:number; comments:{id:string;name:string;photo?:string;body:string}[];
  public:boolean; demo?:boolean; author:string;
  style?:{background:string;color:string;fontSize:string;fontWeight:string;filter?:string};
  authorPhoto?:string;
  likedBy?:{name:string;photo?:string}[];
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
const demoReelUrl='https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/360/Big_Buck_Bunny_360_10s_1MB.mp4';

export default function PageProfileTools({
  canManage=false, pageId='current', pageName='SB1', pageAvatar,
  seedPosts=[], hideStories=false, focusSection='home', onlyOwn=false
}:{
  canManage?:boolean;
  pageId?:string;
  pageName?:string;
  pageAvatar?:string;
  seedPosts?:Array<{id:string;body:string;image_url?:string|null;video_url?:string|null;post_type?:string;created_at:string;likes_count?:number}>;
  hideStories?:boolean;
  focusSection?:'home'|'reels'|'albums'|'medical'|'social'|'phone'|'clone'|'settings';
  onlyOwn?:boolean;
}) {
  const show=(section:string)=>focusSection===section;
  const initial = useMemo<FeedItem[]>(() => {
    const saved = read<FeedItem[]>('sb1_fb_posts_'+pageId, []);
    if (saved.length) {
      const normalized=saved.map((p,i)=>p.demo && !p.mediaUrl ? {
        ...p,
        mediaUrl:p.kind==='image'?demoPostImages[i%demoPostImages.length]:(p.kind==='reel'?demoReelUrl:p.kind==='video'?demoVideoUrl:undefined),
        views:p.views||120+i*31
      } : {...p,views:typeof p.views==='number'?p.views:0});
      if(!normalized.some(p=>p.kind==='reel')) normalized.unshift({
        id:'demo-real-reel',kind:'reel',text:'Reel تجريبي حقيقي لتجربة التشغيل عند الوقوف بالفأرة لمدة ثانية.',
        mediaUrl:demoReelUrl,createdAt:new Date().toISOString(),likes:42,views:0,comments:[],
        public:true,demo:true,author:pageName,authorPhoto:pageAvatar
      });
      return normalized;
    }
    const seeded = seedPosts.map(p=>({
      id:p.id, kind:(p.video_url ? (p.post_type==='reel'?'reel':'video') : p.image_url ? 'image':'post') as MediaKind,
      text:p.body, mediaUrl:p.video_url||p.image_url||undefined, createdAt:p.created_at,
      likes:p.likes_count||0, views:120, comments:[], public:true, demo:false, author:pageName, authorPhoto:pageAvatar
    }));
    const demo = Array.from({length:120},(_,i)=>{
      const kind=(i%4===0?'reel':i%5===0?'video':i%3===0?'image':'post') as MediaKind;
      return {
        id:'demo-'+i, kind,
        text:demoTexts[i%demoTexts.length], createdAt:new Date(Date.now()-i*3600000).toISOString(),
        mediaUrl:kind==='image'?demoPostImages[i%demoPostImages.length]:(kind==='reel'?demoReelUrl:kind==='video'?demoVideoUrl:undefined),
        likes:12+(i*7)%120, views:180+i*27,
        comments:[{id:'c'+i+'a',name:'مستخدم SB1',photo:demoPeopleImages[i%demoPeopleImages.length],body:'معلومة مفيدة، شكراً.'}],
        public:true,demo:true,author:demoNames[i%demoNames.length],authorPhoto:demoPeopleImages[i%demoPeopleImages.length]
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
  const [storyAudioUrl,setStoryAudioUrl]=useState('');
  const [storyAudioStart,setStoryAudioStart]=useState(0);
  const [storyFilter,setStoryFilter]=useState('none');
  const [storyTextColor,setStoryTextColor]=useState('#ffffff');
  const [storyTextSize,setStoryTextSize]=useState('24px');
  const [audioLibrary,setAudioLibrary]=useState<any[]>(()=>read('sb1_audio_library',[{id:'demo-audio-1',name:'موسيقى هادئة',url:'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73467.mp3?filename=relaxing-ambient-11327.mp3'},{id:'demo-audio-2',name:'إيقاع خفيف',url:'https://cdn.pixabay.com/download/audio/2022/10/25/audio_946e9f9e1b.mp3?filename=positive-vibes-121744.mp3'}]));

  const [composer,setComposer]=useState(false);
  const [postText,setPostText]=useState('');
  const [postKind,setPostKind]=useState<MediaKind>('post');
  const [postFile,setPostFile]=useState<File|null>(null);
  const [postUrl,setPostUrl]=useState('');
  const [comments,setComments]=useState<Record<string,string>>({});
  const [likedIds,setLikedIds]=useState<string[]>(()=>read('sb1_fb_liked_'+pageId,[]));
  const hoverTimers=useRef<Record<string,number>>({});
  const viewedOnce=useRef<Set<string>>(new Set());
  const [openComments,setOpenComments]=useState<string|null>(null);
  const [notice,setNotice]=useState('');
  const [active,setActive]=useState('home');
  const [share,setShare]=useState<{title:string;url:string}|null>(null);
  const [likesViewer,setLikesViewer]=useState<FeedItem|null>(null);
  const [albumType,setAlbumType]=useState<'all'|'images'|'videos'|'files'|'audio'>('all');
  const [albumViewer,setAlbumViewer]=useState<any|null>(null);
  const [albumUpload,setAlbumUpload]=useState<File|null>(null);

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
  const [postFilter,setPostFilter]=useState('none');
  const [postMuted,setPostMuted]=useState(true);
  const filters=[['none','بدون فلتر'],['grayscale(1)','أبيض وأسود'],['sepia(.65)','دافئ'],['contrast(1.15) saturate(1.25)','حيوي'],['brightness(1.12)','فاتح']];
  const emojis=['❤️','👍','😂','😍','👏','🔥','😊','🎉','🧠','🩺','⭐','✨'];
  const [clonePermissions,setClonePermissions]=useState<string[]>([]);
  const [cloneType,setCloneType]=useState('specialist');
  const [cloneCount,setCloneCount]=useState(1);
  const [cloneName,setCloneName]=useState('');
  const [cloneExpiry,setCloneExpiry]=useState('');
  const [clones,setClones]=useState<any[]>(()=>read('sb1_fb_clones',[]));
  const [settingsOpen,setSettingsOpen]=useState(false);
  const [settingsSection,setSettingsSection]=useState('account');
  const [pageSettings,setPageSettings]=useState(()=>read('sb1_page_settings_'+pageId,{public:true,allowStories:true,allowComments:true,allowMessages:true,showFollowers:true,notifyBookings:true,notifyQuestions:true,notifyLikes:true,autoPlayMedia:true,language:'ar'}));
  useEffect(()=>write('sb1_page_settings_'+pageId,pageSettings),[pageSettings,pageId]);
  const [recording,setRecording]=useState(false);
  const [recordUrl,setRecordUrl]=useState('');
  const recorder=useRef<MediaRecorder|null>(null);
  const stream=useRef<MediaStream|null>(null);
  const chunks=useRef<Blob[]>([]);

  useEffect(()=>write('sb1_fb_posts_'+pageId,feed),[feed,pageId]);
  useEffect(()=>write('sb1_fb_liked_'+pageId,likedIds),[likedIds,pageId]);
  useEffect(()=>()=>Object.values(hoverTimers.current).forEach(t=>window.clearTimeout(t)),[]);
  useEffect(()=>write('sb1_fb_stories_'+pageId,stories),[stories,pageId]);
  useEffect(()=>write('sb1_audio_library',audioLibrary),[audioLibrary]);
  useEffect(()=>write('sb1_fb_social_favorites',favorites),[favorites]);
  useEffect(()=>write('sb1_fb_albums_'+pageId,albums),[albums,pageId]);
  useEffect(()=>write('sb1_fb_clones',clones),[clones]);
  useEffect(()=>{if(postFile){const u=URL.createObjectURL(postFile);setPostUrl(u)}else setPostUrl('')},[postFile]);
  useEffect(()=>{if(storyFile){const u=URL.createObjectURL(storyFile);setStoryUrl(u)}else setStoryUrl('')},[storyFile]);
  useEffect(()=>()=>stream.current?.getTracks().forEach(t=>t.stop()),[]);

  const publicFeed=feed.filter(p=>p.public&&(!onlyOwn||p.author===pageName));
  const reels=publicFeed.filter(p=>p.kind==='reel');
  const activeStories=useMemo(()=>[
    ...stories.filter(s=>new Date(s.expiresAt)>new Date()),
    ...demoNames.map((name,i)=>({
      id:'demo-story-'+i,name,text:demoStoryTexts[i],authorPhoto:demoPeopleImages[i%demoPeopleImages.length],
      mediaUrl:i%3===0?demoVideoUrl:demoPeopleImages[i%demoPeopleImages.length],
      mediaKind:i%3===0?'video':'image',
      createdAt:new Date(Date.now()-i*3600000).toISOString(),
      expiresAt:new Date(Date.now()+86400000).toISOString()
    }))
  ],[stories]);

  const jump=(target:string)=>{setActive(target);document.getElementById('fb-'+target)?.scrollIntoView({behavior:'smooth',block:'start'})};

  const createStory=()=>{
    if(!storyText.trim()&&!storyUrl){setNotice('أضف نصاً أو صورة أو فيديو للقصة.');return}
    const item:StoryItem={id:id(),name:'قصتي',text:storyText.trim(),mediaUrl:storyUrl||undefined,mediaKind:storyVideo?'video':'image',audioUrl:storyAudioUrl||undefined,audioStart:storyAudioStart,authorPhoto:pageAvatar,filter:storyFilter,textStyle:{color:storyTextColor,fontSize:storyTextSize,fontWeight:'800'},createdAt:new Date().toISOString(),expiresAt:new Date(Date.now()+86400000),own:true};
    setStories(v=>[item,...v]);setStoryText('');setStoryFile(null);setStoryAudioUrl('');setStoryAudioStart(0);setStoryFilter('none');setStoryComposer(false);setNotice('تم نشر قصتك.');setStoryViewer(item);
  };
  const deleteStory=(story:StoryItem)=>{
    if(!story.own)return;
    setStories(v=>v.filter(x=>x.id!==story.id));setStoryViewer(null);setNotice('تم حذف القصة.');
  };

  const publish=()=>{
    if(!postText.trim()&&!postUrl&&!recordUrl){setNotice('اكتب نصاً أو اختر صورة/فيديو أو سجّل صوتاً.');return}
    const item:FeedItem={id:id(),kind:recordUrl?'audio':postKind,text:postText.trim()||'منشور جديد',mediaUrl:recordUrl||postUrl,mediaName:postFile?.name,createdAt:new Date().toISOString(),likes:0,likedBy:[],comments:[],public:true,author:pageName,authorPhoto:pageAvatar,style:{background:postBackground,color:postFontColor,fontSize:postFontSize,fontWeight:postFontWeight,filter:postFilter}};
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
    const name=localStorage.getItem('chat_name')||'مستخدم SB1';
    const photo=localStorage.getItem('chat_photo')||pageAvatar;
    setLikedIds(v=>[...v,postId]);
    setFeed(v=>v.map(p=>p.id===postId?{...p,likes:p.likes+1,likedBy:[...(p.likedBy||[]),{name,photo}]}:p));
  };
  const startHoverView=(itemId:string,video?:HTMLVideoElement|null)=>{
    if(video) video.play().catch(()=>{});
    if(hoverTimers.current[itemId]) return;
    if(!canManage && viewedOnce.current.has(itemId)) return;
    hoverTimers.current[itemId]=window.setTimeout(()=>{
      if(!canManage) viewedOnce.current.add(itemId);
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
  const createAlbum=()=>{const n=albumName.trim();if(!n){setNotice('اكتب اسم الألبوم أولاً.');return}const a={id:id(),name:n,type:albumType,public:false,items:[]};setAlbums(v=>[a,...v]);setAlbumName('');setAlbumType('all');setAlbumModal(false);setNotice('تم إنشاء الألبوم.');};
  const fileAsDataUrl=(file:File)=>new Promise<string>((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(String(r.result||''));r.onerror=reject;r.readAsDataURL(file)});
  const albumItemKind=(file:File):MediaKind=>file.type.startsWith('image/')?'image':file.type.startsWith('video/')?'video':file.type.startsWith('audio/')?'audio':'post';
  const addUploadedToAlbum=async(albumId:string,file:File)=>{let url='';try{const path=(pageId||'page')+'/'+Date.now()+'-'+file.name.replace(/[^a-zA-Z0-9._-]/g,'_');const up=await supabase.storage.from('specialist-content').upload(path,file,{upsert:false,contentType:file.type||undefined});if(!up.error)url=supabase.storage.from('specialist-content').getPublicUrl(path).data.publicUrl;}catch{}if(!url){if(file.size>5*1024*1024){setNotice('تعذر حفظ الملف الكبير. تأكد من إعداد تخزين Supabase.');return}url=await fileAsDataUrl(file);}const item={id:id(),kind:albumItemKind(file),text:file.name,mediaUrl:url,mediaName:file.name,createdAt:new Date().toISOString(),likes:0,views:0,comments:[],public:true,author:pageName,authorPhoto:pageAvatar};setAlbums(v=>v.map(a=>a.id===albumId?{...a,items:[item,...(a.items||[])]}:a));setAlbumUpload(null);setNotice('تم حفظ الملف داخل الألبوم.');};
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
    const provider=(document.getElementById('sb1-social-provider') as HTMLSelectElement|null)?.value||'YouTube';
    if(provider==='Google Search'||provider==='Yandex Search'){setSocialEmbedded(provider);return;}
    if(provider==='Pinterest'||provider==='OK'){setSocialEmbedded(provider);return;}
    if(!q){setNotice('اكتب كلمة البحث أو رابط المحتوى.');return;}
    setSocialEmbedded(provider);
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

  const scrollerRefs=useRef<Record<string,HTMLDivElement|null>>({});
  const scrollStrip=(key:string,direction:number)=>{scrollerRefs.current[key]?.scrollBy({left:direction*420,behavior:'smooth'});};
  const ReelStrip=({stripId='reels-inline'}:{stripId?:string})=><div id={stripId} className="bg-transparent p-0">
    <div className="mb-2 flex items-center justify-between">
      <span className="text-xs font-bold text-teal-700">Reels</span>
      <div className="flex gap-1" dir="ltr">
        <button onClick={()=>scrollStrip(stripId,-1)} className="grid h-8 w-8 place-items-center rounded-full border bg-white text-teal-700 shadow-sm active:bg-teal-50">‹</button>
        <button onClick={()=>scrollStrip(stripId,1)} className="grid h-8 w-8 place-items-center rounded-full border bg-white text-teal-700 shadow-sm active:bg-teal-50">›</button>
      </div>
    </div>
    <div ref={el=>{scrollerRefs.current[stripId]=el}} className="flex gap-3 overflow-x-auto pb-1 scroll-smooth">
      {reels.map(r=><button key={r.id+'-'+stripId} onClick={()=>setReelViewer(r)} className="min-w-[118px] overflow-hidden rounded-xl bg-slate-900 text-white text-right">
        <div className="relative aspect-[3/4] max-h-40 overflow-hidden bg-slate-950">
          <video src={r.mediaUrl||demoReelUrl} muted playsInline loop preload="metadata" className="absolute inset-0 h-full w-full object-cover" onMouseEnter={e=>startHoverView(r.id,e.currentTarget)} onMouseLeave={e=>stopHoverView(r.id,e.currentTarget)}/>
          <div className="absolute inset-0 bg-black/20"/>
          <span className="absolute bottom-2 right-2 max-w-[90%] rounded bg-black/60 px-2 py-1 text-[10px] font-bold">{r.text.slice(0,38)}</span>
          <span className="absolute top-2 right-2 h-7 w-7 overflow-hidden rounded-full border-2 border-white shadow"><img src={r.authorPhoto||pageAvatar} alt="" className="h-full w-full object-cover"/></span><span className="absolute bottom-2 left-2 rounded-full bg-black/70 px-2 py-1 text-[10px]"><Eye className="inline h-3 w-3 ml-1"/>{r.views||0}</span>
        </div>
      </button>)}
      {albums.filter(a=>a.public).map(a=><button key={a.id+'-'+stripId} onClick={()=>setAlbumViewer(a)} className="min-w-[118px] overflow-hidden rounded-xl border-2 border-indigo-400 bg-indigo-950 text-white text-right"><div className="relative aspect-[3/4] max-h-40 overflow-hidden">{a.items?.[0]?.mediaUrl&&a.items?.[0]?.kind==='image'?<img src={a.items[0].mediaUrl} alt="" className="absolute inset-0 h-full w-full object-cover"/>:<div className="absolute inset-0 grid place-items-center text-3xl">📁</div>}<span className="absolute top-2 right-2 h-7 w-7 overflow-hidden rounded-full border-2 border-white"><img src={pageAvatar} alt="" className="h-full w-full object-cover"/></span><span className="absolute bottom-2 right-2 rounded bg-black/70 px-2 py-1 text-[10px] font-bold">ألبوم · {a.name}</span></div></button>)}
    </div>
  </div>;
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
                  <span className="absolute top-2 right-2 h-7 w-7 overflow-hidden rounded-full border-2 border-white shadow"><img src={s.authorPhoto||pageAvatar} alt="" className="h-full w-full object-cover"/></span><span className="absolute bottom-2 right-2 rounded-full bg-white px-2 py-1 text-[10px] font-bold text-slate-800">{s.name}</span>
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

        {/* ترتيب الرئيسية: شريط Reels -> منشئ المنشورات -> 3 منشورات -> Reels دوري */}
        <ReelStrip stripId="fb-reels"/>

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

        <div id="fb-posts" className="space-y-4">
          {publicFeed.map((post,i)=>{
            const n=i+1;
            const showReel=[3,20,30,40].includes(n) || (n>50 && (n-50)%50===0);
            const showStories=n===50 || (n>50 && (n-50)%200===0);
            return <div key={post.id}>
              <article onMouseEnter={()=>startHoverView(post.id)} onMouseLeave={()=>stopHoverView(post.id)} className="mx-auto max-w-3xl overflow-hidden rounded-xl border border-slate-300 bg-white shadow-sm">
                <div className="p-3">
                  <div className="flex items-center gap-3">
                    {post.authorPhoto?<img src={post.authorPhoto} alt={post.author} className="h-10 w-10 rounded-full object-cover"/>:<div className="grid h-10 w-10 place-items-center rounded-full bg-teal-100 font-extrabold text-teal-700">{post.author.charAt(0)}</div>}
                    <div className="flex-1"><b className="text-sm">{post.author}</b><div className="text-xs text-slate-400">{new Date(post.createdAt).toLocaleString()}</div></div>
                  </div>
                  <div className="mt-3 rounded-xl px-3 py-4 whitespace-pre-wrap leading-7 text-sm" style={post.style||{}}>{post.text}</div>
                  {post.mediaUrl&&post.kind==='image'&&<img src={post.mediaUrl} alt="" className="mx-auto mt-3 max-h-[320px] w-full max-w-2xl rounded-xl object-contain" onMouseEnter={()=>startHoverView(post.id)} onMouseLeave={()=>stopHoverView(post.id)}/>}
                  {post.mediaUrl&&(post.kind==='video'||post.kind==='reel')&&<video src={post.mediaUrl} controls muted={postMuted} playsInline loop={post.kind==='reel'} preload="metadata" className="mx-auto mt-3 max-h-[320px] w-full max-w-2xl rounded-xl bg-black object-contain" style={post.style?.filter?{filter:post.style.filter}:undefined}/>}
                  {post.mediaUrl&&post.kind==='audio'&&<audio src={post.mediaUrl} controls className="mt-3 w-full"/>}
                </div>
                <div className="flex items-center border-t border-teal-900 bg-teal-800 px-2 py-2 text-sm text-white">
                  <button onClick={()=>{if(canManage)setLikesViewer(post);else like(post.id)}} className={'flex-1 rounded-lg py-2 transition '+(likedIds.includes(post.id)?'text-red-300':'text-white hover:bg-teal-700')}><Heart className="inline h-4 w-4 ml-1" fill={likedIds.includes(post.id)?'currentColor':'none'}/> {post.likes}</button>
                  <button onClick={()=>setOpenComments(post.id)} className="flex-1 rounded-lg py-2 hover:bg-teal-700" aria-label="التعليقات">{post.authorPhoto?<img src={post.authorPhoto} alt="" className="inline-block h-5 w-5 rounded-full object-cover align-middle ml-1"/>:<MessageCircle className="inline h-4 w-4 ml-1"/>}<MessageCircle className="inline h-4 w-4 ml-1"/> {post.comments.length}</button>
                  <span className="flex items-center gap-1 px-2 text-xs font-bold text-white"><Eye className="h-4 w-4"/>{post.views||0}</span>
                  <button onClick={()=>openShare(post.text)} className="flex-1 rounded-lg py-2 hover:bg-teal-700 active:bg-teal-900"><Share2 className="inline h-4 w-4 ml-1"/> مشاركة</button>
                  <button onClick={()=>saveToFavorites(post)} className="rounded-lg px-3 py-2 text-white hover:bg-teal-700 active:bg-teal-900" aria-label="حفظ"><Bookmark className="inline h-4 w-4"/></button>
                  <button onClick={()=>setAlbumPicker(post)} className="rounded-lg px-3 py-2 text-white hover:bg-teal-700 active:bg-teal-900" aria-label="إضافة إلى ألبوم"><Album className="inline h-4 w-4"/></button>
                </div>
              </article>
              {showReel&&<ReelStrip stripId={'reels-'+n}/>}
              {showStories&&<div className="my-2 border-y-2 border-black py-2"><div className="text-xs font-bold text-teal-700 mb-2">القصص</div><div className="flex gap-3 overflow-x-auto pb-1">{activeStories.map(s=><button key={s.id+'-mid'} onClick={()=>setStoryViewer(s)} className="min-w-[104px] overflow-hidden rounded-xl bg-white"><div className="h-28 overflow-hidden bg-slate-900">{s.mediaUrl?(s.mediaKind==='video'?<video src={s.mediaUrl} muted playsInline className="h-full w-full object-cover" onMouseEnter={e=>startHoverView(s.id,e.currentTarget)} onMouseLeave={e=>stopHoverView(s.id,e.currentTarget)}/>:<img src={s.mediaUrl} alt="" className="h-full w-full object-cover" onMouseEnter={()=>startHoverView(s.id)} onMouseLeave={()=>stopHoverView(s.id)}/>):<span className="p-3 text-xs font-bold">{s.text}</span>}</div></button>)}</div></div>}
            </div>
          })}
        </div>
      </div>

      
    </section>) }

    {show('reels') && (<section id="fb-reels-all" className="bg-transparent p-0">
      <div className="mb-3 flex items-center justify-between"><h2 className="sr-only">Reels</h2><span className="text-xs text-slate-400">{reels.length} Reel</span></div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">{reels.slice(0,18).map(r=><button key={r.id} onClick={()=>setReelViewer(r)} className="relative overflow-hidden rounded-xl bg-slate-900 text-white text-right"><video src={r.mediaUrl||demoReelUrl} muted playsInline loop preload="metadata" className="h-full w-full object-cover" onMouseEnter={e=>startHoverView(r.id,e.currentTarget)} onMouseLeave={e=>stopHoverView(r.id,e.currentTarget)}/><div className="absolute inset-0 bg-black/25"/><span className="absolute bottom-2 right-2 left-2 z-10 text-xs font-bold">{r.text.slice(0,60)}</span><span className="absolute bottom-2 left-2 z-10 rounded-full bg-black/65 px-2 py-1 text-[10px]"><Eye className="inline h-3 w-3 ml-1"/>{r.views||0}</span></button>)}</div>
    </section>) }

    {show('albums') && (<section id="fb-albums" className="rounded-xl border bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between"><div><h2 className="text-lg font-extrabold">الألبومات</h2><p className="text-xs text-slate-500">صور، فيديو، صوت، MP3/WAV، ملفات Word/PDF وأي ملف من الجهاز.</p></div><button onClick={()=>setAlbumModal(true)} title="إنشاء ألبوم" className="rounded-xl bg-teal-700 px-4 py-2 text-sm font-bold text-white active:bg-teal-800"><Plus className="inline h-4 w-4 ml-1"/>ألبوم جديد</button></div>
      {albums.length===0?<div className="rounded-xl border border-dashed p-8 text-center text-sm text-slate-400">لا توجد ألبومات بعد.</div>:<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{albums.map(a=><article key={a.id} className="rounded-xl border bg-slate-50 p-4"><button onClick={()=>setAlbumViewer(a)} className="w-full text-right"><div className="flex items-center justify-between"><b>{a.name}</b><span className="text-xs text-slate-400">{a.items?.length||0} عنصر</span></div><div className="mt-3 grid grid-cols-3 gap-2">{(a.items||[]).slice(0,6).map((x:any)=><div key={x.id} className="aspect-square overflow-hidden rounded-lg bg-white">{x.mediaUrl&&x.kind==='image'?<img src={x.mediaUrl} alt="" className="h-full w-full object-cover"/>:x.mediaUrl&&x.kind==='video'?<video src={x.mediaUrl} muted className="h-full w-full object-cover"/>:<div className="grid h-full place-items-center p-1 text-[10px] font-bold text-slate-500">{x.mediaName||x.text||x.kind}</div>}</div>)}</div><div className="mt-3 text-xs font-bold text-teal-700">{a.type==='all'?'الكل':a.type==='images'?'صور':a.type==='videos'?'فيديو':a.type==='audio'?'صوت':'ملفات'} {a.public?'· عام':'· خاص'}</div><div className="mt-2 flex items-center gap-2"><button onClick={e=>{e.stopPropagation();setAlbums(v=>v.map(x=>x.id===a.id?{...x,public:!x.public}:x))}} className="rounded-lg bg-white px-2 py-1 text-[10px] font-bold">{a.public?'إخفاء عن العامة':'مشاركة للعامة'}}</button><span className="h-7 w-7 overflow-hidden rounded-full border"><img src={pageAvatar} alt="" className="h-full w-full object-cover"/></span></div></button></article>)}</div>}
    </section>)}

    {show('medical') && (<section id="fb-medical-content" className="rounded-xl border bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between"><div><h2 className="sr-only">المحتوى الطبي</h2><p className="text-xs text-slate-500">فيديوهات طبية وتعليمية داخل SB1</p></div><Library className="text-teal-700"/></div>
      <div className="grid gap-3 md:grid-cols-3">{Array.from({length:9},(_,i)=>({title:demoTexts[i%demoTexts.length],specialty:['علم النفس','الصحة النفسية','التقييم السريري'][i%3]})).map((v,i)=><article key={i} className="rounded-xl border p-3"><div className="grid aspect-video place-items-center rounded-lg bg-slate-900 text-white"><Video/></div><b className="mt-2 block text-sm">{v.title}</b><span className="text-xs text-slate-500">{v.specialty}</span><div className="mt-2 flex gap-2"><button className="rounded-lg bg-teal-50 px-3 py-1 text-xs font-bold text-teal-700">فيديوهاتي</button><button className="rounded-lg bg-slate-50 px-3 py-1 text-xs font-bold">شاهداتي</button></div></article>)}</div>
    </section>) }

    {show('social') && (<section id="fb-social" className="rounded-xl border bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between"><div><h2 className="text-xl font-extrabold">منصات التواصل والمتصفح</h2><p className="text-xs text-slate-500">نستخدم فقط طرق العرض التي تسمح بها المنصة. يمكن حفظ المحتوى أو نشره أو إضافته إلى ألبوم.</p></div><ExternalLink className="text-teal-700"/></div>
      <div className="grid gap-2 md:grid-cols-[180px_1fr_auto]"><select id="sb1-social-provider" className="rounded-xl border p-3 text-sm font-bold"><option>YouTube</option><option>Rutube</option><option>Pinterest</option><option>OK</option><option>Google Search</option><option>Yandex Search</option></select><input value={socialSearch} onChange={e=>setSocialSearch(e.target.value)} onKeyDown={e=>e.key==='Enter'&&searchSocial()} className="rounded-xl border p-3" placeholder="ابحث داخل المنصة..."/><button onClick={searchSocial} className="rounded-xl bg-teal-700 px-4 text-white" title="بحث"><Search/></button></div>
      <div className="mt-3 flex flex-wrap gap-2">{[['YouTube','YouTube'],['Rutube','Rutube'],['Pinterest','Pinterest'],['OK','OK'],['Google Search','Google'],['Yandex Search','Yandex']].map(([n,l])=><button key={n} onClick={()=>{setSocialSearch('');setSocialEmbedded(n)}} title={'فتح '+l+' داخل SB1'} className={'rounded-lg border px-3 py-2 text-sm font-bold '+(socialEmbedded===n?'border-teal-600 bg-teal-50 text-teal-700':'')}>{l}</button>)}</div>
      {socialEmbedded&&<div className="mt-4 overflow-hidden rounded-2xl border bg-slate-100">
        <div className="flex items-center justify-between border-b bg-white px-3 py-2"><b>{socialEmbedded}</b><div className="flex gap-2"><button onClick={()=>{toggleSaved({id:'social-'+socialEmbedded+'-'+socialSearch,kind:'video',title:socialSearch||socialEmbedded,body:'محتوى من منصة خارجية',url:socialSearch,created_at:new Date().toISOString()});setNotice('تمت الإضافة إلى مفضلتي.')}} title="إضافة إلى مفضلتي" className="rounded-lg bg-teal-50 px-3 py-2 text-xs font-bold text-teal-700"><Bookmark className="inline h-4 w-4 ml-1"/>مفضلتي</button><button onClick={()=>{setNotice('تمت إضافة المحتوى إلى الألبوم المحدد من قسم الألبومات.')}} title="إضافة إلى ألبوم" className="rounded-lg bg-indigo-50 px-3 py-2 text-xs font-bold text-indigo-700"><Album className="inline h-4 w-4 ml-1"/>ألبوم</button><button onClick={()=>{setNotice('تم تجهيز المحتوى للنشر المباشر في صفحة SB1.')}} title="نشر مباشر" className="rounded-lg bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700"><Send className="inline h-4 w-4 ml-1"/>نشر</button><button onClick={()=>setSocialEmbedded(null)} title="إغلاق"><X/></button></div></div>
        {socialEmbedded==='Pinterest' ? <div className="min-h-[520px] bg-white p-6"><p className="mb-4 text-xs text-slate-500">ألصق رابط Pin كامل ثم اضغط بحث. Pinterest يوفر Widget رسمي لعرض الـPin داخل الصفحة.</p><a href={socialSearch||'https://www.pinterest.com/'} data-pin-do="embedPin" className="block text-center text-teal-700">{socialSearch||'Pinterest'}</a></div> :
         socialEmbedded==='Google Search' ? <iframe title="Google Search" src={'https://www.google.com/search?igu=1&q='+encodeURIComponent(socialSearch||'SB1')} className="h-[720px] w-full border-0 bg-white"/> :
         socialEmbedded==='Yandex Search' ? <iframe title="Yandex Search" src={'https://yandex.com/search/?text='+encodeURIComponent(socialSearch||'SB1')} className="h-[720px] w-full border-0 bg-white"/> :
         socialEmbedded==='YouTube' ? <div className="bg-white p-4"><p className="mb-3 text-xs text-slate-500">بحث YouTube الحقيقي يحتاج YouTube Data API؛ رابط البحث داخل المشغل لم يعد مدعوماً رسمياً. يمكنك إدخال رابط فيديو أو معرفه هنا لفتحه كمشغل.</p><input value={socialSearch} onChange={e=>setSocialSearch(e.target.value)} className="w-full rounded-xl border p-3" placeholder="رابط YouTube أو Video ID"/><button onClick={()=>{const m=socialSearch.match(/(?:v=|youtu\.be\/|embed\/)([\w-]{6,})/);const vid=m?.[1]||socialSearch.trim();if(vid)setSocialEmbedded('https://www.youtube.com/embed/'+encodeURIComponent(vid))}} className="mt-2 rounded-xl bg-teal-700 px-4 py-2 text-sm font-bold text-white">فتح الفيديو</button>{/^https:\/\/www\.youtube\.com\/embed\//.test(socialEmbedded)&&<iframe title="YouTube" src={socialEmbedded} className="mt-4 h-[520px] w-full border-0 bg-black"/>}</div> :
         socialEmbedded==='Rutube' ? <div className="bg-white p-4"><input value={socialSearch} onChange={e=>setSocialSearch(e.target.value)} className="w-full rounded-xl border p-3" placeholder="رابط Rutube أو معرف الفيديو"/><button onClick={()=>{const m=socialSearch.match(/(?:video|play)\/(?:embed\/)?([\w-]+)/i);if(m)setSocialEmbedded('https://rutube.ru/play/embed/'+m[1])}} className="mt-2 rounded-xl bg-teal-700 px-4 py-2 text-sm font-bold text-white">فتح</button>{socialEmbedded.startsWith('https://rutube.ru/')&&<iframe title="Rutube" src={socialEmbedded} className="mt-4 h-[520px] w-full border-0 bg-black"/>}</div> :
         socialEmbedded==='OK' ? <div className="min-h-[520px] bg-white p-6 text-sm">أدخل رابط فيديو/منشور عام من OK لعرضه عبر Widget الرسمي.</div> :
         <iframe title="social-platform" src={socialEmbedded} className="h-[720px] w-full border-0 bg-white" referrerPolicy="strict-origin-when-cross-origin"/>}
      </div>}
    </section>)}

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
      <div className="flex items-center justify-between"><div><h2 className="text-xl font-extrabold">إعدادات الصفحة والحساب</h2><p className="mt-1 text-xs text-slate-500">إدارة الخصوصية والمحتوى والإشعارات والوسائط والأمان.</p></div><Settings className="text-teal-700"/></div>
      <div className="mt-5 grid gap-2 sm:grid-cols-3 lg:grid-cols-6">{[['account','الحساب'],['privacy','الخصوصية'],['content','المحتوى'],['notifications','الإشعارات'],['media','الوسائط'],['security','الأمان']].map(([k,l])=><button key={k} onClick={()=>setSettingsSection(k)} className={'rounded-xl border px-3 py-3 text-sm font-bold active:bg-slate-200 '+(settingsSection===k?'bg-teal-700 text-white':'bg-white')}>{l}</button>)}</div>
      <div className="mt-5 rounded-2xl border bg-slate-50 p-5">
        {settingsSection==='account'&&<div className="grid gap-4 md:grid-cols-2"><label className="text-sm font-bold">اسم الصفحة<input value={pageName} readOnly className="mt-2 w-full rounded-xl border bg-white p-3"/></label><label className="text-sm font-bold">لغة الحساب<select value={pageSettings.language} onChange={e=>setPageSettings((s:any)=>({...s,language:e.target.value}))} className="mt-2 w-full rounded-xl border bg-white p-3"><option value="ar">العربية</option><option value="en">English</option><option value="de">Deutsch</option><option value="ru">Русский</option></select></label></div>}
        {settingsSection==='privacy'&&<div className="space-y-3">{[['public','الصفحة عامة'],['showFollowers','إظهار المتابعين'],['allowComments','السماح بالتعليقات'],['allowMessages','السماح بالرسائل']].map(([k,l])=><label key={k} className="flex items-center justify-between rounded-xl bg-white p-4 text-sm font-bold"><span>{l}</span><input type="checkbox" checked={!!(pageSettings as any)[k]} onChange={e=>setPageSettings((s:any)=>({...s,[k]:e.target.checked}))} className="h-5 w-5"/></label>)}</div>}
        {settingsSection==='content'&&<div className="space-y-3">{[['allowStories','السماح بالقصص'],['autoPlayMedia','تشغيل الوسائط عند المرور']].map(([k,l])=><label key={k} className="flex items-center justify-between rounded-xl bg-white p-4 text-sm font-bold"><span>{l}</span><input type="checkbox" checked={!!(pageSettings as any)[k]} onChange={e=>setPageSettings((s:any)=>({...s,[k]:e.target.checked}))} className="h-5 w-5"/></label>)}</div>}
        {settingsSection==='notifications'&&<div className="space-y-3">{[['notifyBookings','إشعارات الحجوزات'],['notifyQuestions','إشعارات الأسئلة'],['notifyLikes','إشعارات الإعجابات']].map(([k,l])=><label key={k} className="flex items-center justify-between rounded-xl bg-white p-4 text-sm font-bold"><span>{l}</span><input type="checkbox" checked={!!(pageSettings as any)[k]} onChange={e=>setPageSettings((s:any)=>({...s,[k]:e.target.checked}))} className="h-5 w-5"/></label>)}</div>}
        {settingsSection==='media'&&<div className="grid gap-3 md:grid-cols-2"><div className="rounded-xl bg-white p-4"><b>التشغيل عند المرور</b><p className="mt-1 text-xs text-slate-500">الفيديو والريلز والقصة يبدأ بعد الوقوف لمدة ثانية.</p><button onClick={()=>setPageSettings((s:any)=>({...s,autoPlayMedia:!s.autoPlayMedia}))} className="mt-3 rounded-lg bg-teal-50 px-3 py-2 text-xs font-bold text-teal-700">{pageSettings.autoPlayMedia?'مفعل':'متوقف'}</button></div><div className="rounded-xl bg-white p-4"><b>الملفات</b><p className="mt-1 text-xs text-slate-500">رفع الصور والفيديو والصوت والملفات داخل الألبومات.</p><span className="mt-3 inline-block rounded-lg bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700">متاح</span></div></div>}
        {settingsSection==='security'&&<div className="space-y-3"><div className="rounded-xl bg-white p-4"><b>صلاحيات الإدارة</b><p className="mt-1 text-xs text-slate-500">هذا القسم خاص بصاحب الصفحة والمالك/المشرف.</p></div><button onClick={()=>{localStorage.setItem('sb1_page_settings_'+pageId,JSON.stringify(pageSettings));setNotice('تم حفظ إعدادات الصفحة.')}} className="rounded-xl bg-teal-700 px-5 py-3 font-bold text-white">حفظ الإعدادات</button></div>}
      </div>
    </section>)}

    {storyComposer&&<div className="fixed inset-0 z-[200] grid place-items-center bg-black/60 p-4" onClick={()=>setStoryComposer(false)}><div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-5" onClick={e=>e.stopPropagation()}><div className="flex items-center justify-between"><h3 className="text-xl font-extrabold">إنشاء قصة · 20 ثانية</h3><button onClick={()=>setStoryComposer(false)}><X/></button></div><textarea value={storyText} onChange={e=>setStoryText(e.target.value)} className="mt-4 min-h-28 w-full rounded-xl border p-3" placeholder="اكتب ما تريد في قصتك..."/><div className="mt-3 flex flex-wrap gap-2"><label className="cursor-pointer rounded-lg bg-slate-100 px-3 py-2 text-sm font-bold"><Upload className="inline h-4 w-4 ml-1"/> صورة / فيديو<input type="file" accept="image/*,video/*" className="hidden" onChange={e=>{const f=e.target.files?.[0]||null;setStoryFile(f);setStoryVideo(!!f?.type.startsWith('video/'))}}/></label><label className="cursor-pointer rounded-lg bg-slate-100 px-3 py-2 text-sm font-bold"><AudioLines className="inline h-4 w-4 ml-1"/> رفع صوت<input type="file" accept="audio/*,.mp3,.wav,.m4a,.ogg" className="hidden" onChange={async e=>{const f=e.target.files?.[0];if(!f)return;const u=await fileAsDataUrl(f);setAudioLibrary(v=>[{id:id(),name:f.name,url:u},...v]);setStoryAudioUrl(u);setStoryAudioStart(0)}}/></label></div><div className="mt-4 rounded-xl border bg-slate-50 p-4"><b>مكتبة الصوت</b><div className="mt-2 flex flex-wrap gap-2">{audioLibrary.map(a=><button key={a.id} onClick={()=>{setStoryAudioUrl(a.url);setStoryAudioStart(0)}} className={'rounded-lg border px-3 py-2 text-xs font-bold '+(storyAudioUrl===a.url?'bg-teal-700 text-white':'bg-white')}>{a.name}</button>)}</div>{storyAudioUrl&&<div className="mt-3"><audio src={storyAudioUrl} controls className="w-full"/><label className="mt-2 block text-xs font-bold">بداية الصوت (اختر أي نقطة) <input type="range" min="0" max="120" value={storyAudioStart} onChange={e=>setStoryAudioStart(Number(e.target.value))} className="w-full"/></label></div>}</div><div className="mt-4 rounded-xl border bg-slate-50 p-4"><b>الخط والفلاتر والإيموجي</b><div className="mt-2 flex flex-wrap gap-1">{filters.map(([v,l])=><button key={v} onClick={()=>setStoryFilter(v)} className={'rounded-lg px-2 py-1 text-[11px] font-bold '+(storyFilter===v?'bg-teal-700 text-white':'bg-white border')}>{l}</button>)}</div><div className="mt-2 flex flex-wrap gap-1">{emojis.map(e=><button key={e} onClick={()=>setStoryText(v=>v+e)} className="rounded-lg bg-white px-2 py-1 text-lg">{e}</button>)}</div><div className="mt-2 flex gap-2"><input type="color" value={storyTextColor} onChange={e=>setStoryTextColor(e.target.value)} title="لون الخط"/><select value={storyTextSize} onChange={e=>setStoryTextSize(e.target.value)} className="rounded-lg border p-2 text-xs"><option value="18px">صغير</option><option value="24px">متوسط</option><option value="32px">كبير</option><option value="40px">كبير جداً</option></select></div></div><button onClick={createStory} className="mt-4 w-full rounded-lg bg-teal-700 px-4 py-3 font-bold text-white">نشر القصة</button>{storyFile&&<div className="mt-2 text-xs text-slate-500">{storyFile.name}</div>}</div></div>}

    {composer&&<div className="fixed inset-0 z-[200] grid place-items-center bg-black/60 p-4" onClick={()=>setComposer(false)}><div className="w-full max-w-xl rounded-2xl bg-white p-5" onClick={e=>e.stopPropagation()}><div className="flex items-center justify-between"><h3 className="text-xl font-extrabold">إنشاء منشور</h3><button onClick={()=>setComposer(false)}><X/></button></div><textarea value={postText} onChange={e=>setPostText(e.target.value)} className="mt-4 min-h-32 w-full rounded-xl border p-3" placeholder="اكتب منشوراً..."/><div className="mt-3 flex flex-wrap gap-2">{(['post','image','video','reel','article'] as MediaKind[]).map(k=><button key={k} onClick={()=>setPostKind(k)} className={'rounded-lg px-3 py-2 text-sm font-bold active:bg-slate-200 '+(postKind===k?'bg-teal-700 text-white':'bg-slate-100')}>{k==='post'?'نص':k==='image'?'صورة':k==='video'?'فيديو':k==='reel'?'Reel':'مقالة'}</button>)}<label className="cursor-pointer rounded-lg bg-slate-100 px-3 py-2 text-sm font-bold"><Upload className="inline h-4 w-4 ml-1"/> رفع ملف<input type="file" accept={postKind==='image'?'image/*':postKind==='video'||postKind==='reel'?'video/*':'*/*'} className="hidden" onChange={e=>setPostFile(e.target.files?.[0]||null)}/></label><div className="mt-3 rounded-xl border bg-slate-50 p-3"><div className="mb-2 text-xs font-extrabold">تنسيق النص والصورة</div><div className="flex flex-wrap gap-2"><label className="flex items-center gap-2 rounded-lg bg-white px-2 py-2 text-xs font-bold">الخلفية <input type="color" value={postBackground} onChange={e=>setPostBackground(e.target.value)} className="h-7 w-7 cursor-pointer rounded"/></label><label className="flex items-center gap-2 rounded-lg bg-white px-2 py-2 text-xs font-bold">لون الخط <input type="color" value={postFontColor} onChange={e=>setPostFontColor(e.target.value)} className="h-7 w-7 cursor-pointer rounded"/></label><select value={postFontSize} onChange={e=>setPostFontSize(e.target.value)} className="rounded-lg border bg-white px-2 py-2 text-xs font-bold"><option value="14px">صغير</option><option value="18px">متوسط</option><option value="24px">كبير</option><option value="32px">كبير جداً</option></select><button onClick={()=>setPostFontWeight(v=>v==='700'?'900':'700')} className="rounded-lg border bg-white px-3 py-2 text-xs font-black active:bg-slate-200">{postFontWeight==='900'?'عريض جداً':'عريض'}</button></div><div className="mt-2 flex flex-wrap gap-1">{filters.map(([v,l])=><button key={v} onClick={()=>setPostFilter(v)} className={'rounded-lg px-2 py-1 text-[11px] font-bold '+(postFilter===v?'bg-teal-700 text-white':'bg-white border')}>{l}</button>)}</div><div className="mt-2 flex flex-wrap gap-1">{emojis.map(e=><button key={e} onClick={()=>setPostText(v=>v+e)} className="rounded-lg bg-white px-2 py-1 text-lg">{e}</button>)}</div><div className="mt-3 rounded-xl px-4 py-4 whitespace-pre-wrap" style={{background:postBackground,color:postFontColor,fontSize:postFontSize,fontWeight:postFontWeight,filter:postFilter}}>{postText||'معاينة المنشور'}</div></div></div><button onClick={recording?stopRecord:startRecord} className={'rounded-lg px-3 py-2 text-sm font-bold '+(recording?'bg-red-600 text-white':'bg-slate-100')}><Mic className="inline h-4 w-4 ml-1"/>{recording?'إيقاف':'تسجيل صوت'}</button></div>{(postUrl||recordUrl)&&<div className="mt-3 rounded-xl bg-slate-50 p-3 text-sm">{postFile?.name||'تسجيل صوتي جاهز'}</div>}<button onClick={publish} className="mt-4 w-full rounded-xl bg-teal-700 py-3 font-bold text-white">نشر الآن</button></div></div>}

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

    {albumViewer&&<div className="fixed inset-0 z-[180] grid place-items-center bg-black/70 p-4" onClick={()=>setAlbumViewer(null)}><div className="w-full max-w-5xl max-h-[90vh] overflow-hidden rounded-2xl bg-white" onClick={e=>e.stopPropagation()}><div className="flex items-center justify-between border-b p-4"><div><b>{albumViewer.name}</b><span className="ms-2 text-xs text-slate-400">{albumViewer.items?.length||0} عنصر</span></div><button onClick={()=>setAlbumViewer(null)}><X/></button></div><div className="grid max-h-[80vh] md:grid-cols-[1fr_280px]"><div className="grid min-h-[420px] place-items-center bg-slate-950 p-4">{albumViewer.items?.[0]?.kind==='image'?<img src={albumViewer.items[0].mediaUrl} className="max-h-[65vh] max-w-full object-contain" alt=""/>:albumViewer.items?.[0]?.kind==='video'?<video src={albumViewer.items[0].mediaUrl} controls className="max-h-[65vh] max-w-full"/>:albumViewer.items?.[0]?.kind==='audio'?<audio src={albumViewer.items[0].mediaUrl} controls className="w-full max-w-xl"/>:<div className="text-white">{albumViewer.items?.[0]?.mediaName||'ملف'}</div>}</div><div className="overflow-y-auto border-s bg-white p-3"><label className="mb-3 flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-teal-50 px-3 py-3 text-sm font-bold text-teal-700"><Upload className="h-4 w-4"/>إضافة من الجهاز<input type="file" multiple className="hidden" onChange={async e=>{const f=Array.from(e.target.files||[])[0];if(f){await addUploadedToAlbum(albumViewer.id,f);setAlbumViewer({...albumViewer,items:[{id:id(),kind:albumItemKind(f),text:f.name,mediaName:f.name,mediaUrl:'',createdAt:new Date().toISOString()},...(albumViewer.items||[])]})}}/></label>{(albumViewer.items||[]).map((x:any)=><button key={x.id} onClick={()=>setAlbumViewer({...albumViewer,items:[x,...(albumViewer.items||[]).filter((y:any)=>y.id!==x.id)]})} className="mb-2 flex w-full items-center gap-2 rounded-xl border p-2 text-right"><span className="h-12 w-12 overflow-hidden rounded-lg bg-slate-100">{x.kind==='image'&&x.mediaUrl?<img src={x.mediaUrl} className="h-full w-full object-cover" alt=""/>:<span className="grid h-full place-items-center text-[9px]">{x.kind}</span>}</span><span className="min-w-0 truncate text-xs font-bold">{x.mediaName||x.text}</span></button>)}</div></div></div></div>}
    {likesViewer&&canManage&&<div className="fixed inset-0 z-[185] grid place-items-center bg-black/60 p-4" onClick={()=>setLikesViewer(null)}><div className="w-full max-w-md rounded-2xl bg-white p-5" onClick={e=>e.stopPropagation()}><div className="flex items-center justify-between"><b>من وضع الإعجاب</b><button onClick={()=>setLikesViewer(null)}><X/></button></div><div className="mt-4 space-y-2">{(likesViewer.likedBy||[]).map((u,i)=><div key={i} className="flex items-center gap-3 rounded-xl border p-3"><img src={u.photo||'https://api.dicebear.com/9.x/personas/svg?seed='+encodeURIComponent(u.name)} className="h-9 w-9 rounded-full object-cover" alt=""/><b>{u.name}</b></div>)}{!(likesViewer.likedBy||[]).length&&<p className="py-8 text-center text-sm text-slate-500">لم يسجل إعجاب من هذا الحساب بعد.</p>}</div></div></div>}
    {albumModal&&<div className="fixed inset-0 z-[140] grid place-items-center bg-black/60 p-4" onClick={()=>setAlbumModal(false)}><div className="w-full max-w-md rounded-2xl bg-white p-5" onClick={e=>e.stopPropagation()}><div className="flex items-center justify-between"><b className="text-lg">إنشاء ألبوم</b><button onClick={()=>setAlbumModal(false)}><X/></button></div><input autoFocus value={albumName} onChange={e=>setAlbumName(e.target.value)} onKeyDown={e=>e.key==='Enter'&&createAlbum()} className="mt-4 w-full rounded-xl border p-3" placeholder="اسم الألبوم الجديد"/><div className="mt-3 grid grid-cols-2 gap-2"><select value={albumType} onChange={e=>setAlbumType(e.target.value as any)} className="rounded-xl border p-3 text-sm"><option value="all">الكل</option><option value="images">صور</option><option value="videos">فيديو</option><option value="audio">صوت</option><option value="files">ملفات</option></select><button onClick={()=>setNotice('بعد إنشاء الألبوم يمكنك مشاركته للعامة من بطاقة الألبوم.')} className="rounded-xl border p-3 text-sm font-bold">مشاركة عامة</button></div><button onClick={createAlbum} className="mt-3 w-full rounded-xl bg-teal-700 py-3 font-bold text-white active:bg-teal-800">حفظ الألبوم</button></div></div>}
    {albumPicker&&<div className="fixed inset-0 z-[140] grid place-items-center bg-black/60 p-4" onClick={()=>setAlbumPicker(null)}><div className="w-full max-w-md rounded-2xl bg-white p-5" onClick={e=>e.stopPropagation()}><div className="flex items-center justify-between"><b>إضافة إلى ألبوم</b><button onClick={()=>setAlbumPicker(null)}><X/></button></div>{albums.length===0?<p className="py-6 text-center text-sm text-slate-500">أنشئ ألبوماً أولاً.</p>:<div className="mt-4 space-y-2">{albums.map(a=><button key={a.id} onClick={()=>addToAlbum(albumPicker,a.id)} className="flex w-full items-center justify-between rounded-xl border p-3 text-right hover:bg-slate-50 active:bg-slate-100"><b>{a.name}</b><span className="text-xs text-slate-400">{a.items?.length||0}</span></button>)}</div>}<button onClick={()=>{setAlbumPicker(null);setAlbumModal(true)}} className="mt-3 w-full rounded-xl bg-slate-100 py-3 font-bold active:bg-slate-200">+ إنشاء ألبوم جديد</button></div></div>}
    {reelViewer&&<div className="fixed inset-0 z-[145] grid place-items-center bg-black/85 p-4" onClick={()=>setReelViewer(null)}><div className="relative w-full max-w-xl overflow-hidden rounded-2xl bg-black" onClick={e=>e.stopPropagation()}><button onClick={()=>setReelViewer(null)} className="absolute left-3 top-3 z-10 rounded-full bg-black/60 p-2 text-white"><X/></button>{reelViewer.mediaUrl?<video src={reelViewer.mediaUrl} controls autoPlay className="max-h-[80vh] w-full object-contain"/>:<div className="grid min-h-[65vh] place-items-center p-8 text-center text-2xl font-extrabold text-white">{reelViewer.text}</div>}<div className="flex items-center justify-between bg-slate-950 p-4 text-white"><div><b>{reelViewer.author}</b><p className="mt-1 text-xs text-slate-300">{reelViewer.text}</p></div><button onClick={()=>saveToFavorites(reelViewer)} className="rounded-lg bg-white/10 px-3 py-2 active:bg-white/20"><Bookmark className="inline h-4 w-4 ml-1"/>حفظ</button></div></div></div>}
    {notice&&<div className="fixed bottom-5 left-1/2 z-[130] -translate-x-1/2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white shadow-xl">{notice}<button onClick={()=>setNotice('')} className="mr-3"><CheckCircle2 className="inline h-4 w-4"/></button></div>}
  </div>;
}