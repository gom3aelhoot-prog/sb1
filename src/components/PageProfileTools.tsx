import { useEffect, useMemo, useRef, useState } from 'react';
import { toggleSaved, getSaved } from '@/lib/socialVault';
import MediaPublishWizard from './MediaPublishWizard';
import { supabase } from '@/lib/supabase';
import {
  Album, AudioLines, BookOpen, CheckCircle2, ExternalLink, FileVideo, Gift, Heart,
  Image as ImageIcon, Library, MessageCircle, Mic, Plus, QrCode, Search, Send, Eye,
  Settings, Share2, Trash2, Upload, Video, X, Wand2, Bookmark, Smile, Sticker, Film
} from 'lucide-react';

type MediaKind = 'post' | 'image' | 'video' | 'reel' | 'audio' | 'article';
type StoryItem = { id:string; name:string; text:string; mediaUrl?:string; mediaKind?:'image'|'video'|'gif'|'sticker'; audioUrl?:string; audioStart?:number; audioEnd?:number; mediaStart?:number; mediaEnd?:number; filter?:string; authorPhoto?:string; textStyle?:{color:string;fontSize:string;fontWeight:string}; createdAt:string; expiresAt:string; own?:boolean };
type FeedItem = {
  id:string; kind:MediaKind; text:string; mediaUrl?:string; mediaName?:string;
  createdAt:string; likes:number; views?:number; comments:{id:string;name:string;photo?:string;body:string}[];
  public:boolean; demo?:boolean; author:string; embedUrl?:string;
  style?:{background:string;color:string;fontSize:string;fontWeight:string;filter?:string};
  authorPhoto?:string; mediaStart?:number; mediaEnd?:number; isPaid?:boolean; purchased?:boolean;
  likedBy?:{name:string;photo?:string}[];
  videoSettings?:{title?:string;description?:string;muted?:boolean;duration?:number;target?:'story'|'reel'|'video';music?:any};
  music?:any;
  imageSequence?:string[];
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


function GoogleImagesSearch({query,results,googleImageSearched,onSearch,onOpen,onFavorite,onAlbum,onPublish}:{query:string;results:any[];googleImageSearched:boolean;onSearch:(q:string)=>void;onOpen:(item:any)=>void;onFavorite:(item:any)=>void;onAlbum:(item:any)=>void;onPublish:(item:any)=>void}) {
    return <div className="bg-white p-3">
    <div className="mb-3 flex items-center justify-between"><div><b className="text-sm">Google Images</b><p className="text-[11px] text-slate-500">اضغط على أي صورة لفتحها ومعاينتها وحفظها أو إضافتها إلى ألبوم.</p></div></div>
    {!query.trim()&&<div className="rounded-xl border border-dashed p-8 text-center text-xs text-slate-500">اكتب البحث في خانة البحث الرئيسية ثم اضغط «بحث».</div>}
    {query.trim() && googleImageSearched && results.length===0 && <div className="overflow-hidden rounded-xl border bg-slate-50">
      <div className="border-b bg-white px-3 py-2 text-xs text-slate-600">تعذر استخراج الصور من Google على الخادم، لذلك نعرض نتائج Google Images مباشرة داخل SB1.</div>
      <iframe title="Google Images" src={"https://www.google.com/search?igu=1&tbm=isch&udm=2&safe=active&q="+encodeURIComponent(query)} className="h-[70vh] w-full border-0" />
    </div>}
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {results.map((item:any)=><article key={item.id} className="overflow-hidden rounded-xl border bg-white shadow-sm">
        <button onClick={()=>onOpen(item)} className="block w-full text-right">
          <div className="aspect-square overflow-hidden bg-slate-100"><img src={item.image||item.thumbnail} alt={item.title||''} className="h-full w-full object-cover" loading="lazy"/></div>
          <div className="p-2"><b className="line-clamp-2 text-xs">{item.title||'صورة'}</b><span className="mt-1 block truncate text-[10px] text-slate-400">{item.source||'Google Images'}</span></div>
        </button>
        <div className="flex flex-wrap gap-1 border-t p-2">
          <button onClick={()=>onFavorite(item)} className="rounded-lg bg-teal-50 px-2 py-1 text-[10px] font-bold text-teal-700"><Bookmark className="inline h-3 w-3 ml-1"/>مفضلتي</button>
          <button onClick={()=>onAlbum(item)} className="rounded-lg bg-indigo-50 px-2 py-1 text-[10px] font-bold text-indigo-700"><Album className="inline h-3 w-3 ml-1"/>ألبوم</button>
          <button onClick={()=>onPublish(item)} className="rounded-lg bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-700"><Send className="inline h-3 w-3 ml-1"/>نشر</button>
        </div>
      </article>)}
    </div>
  </div>;
}

export default function PageProfileTools({
  canManage=false, pageId='current', pageName='SB1', pageAvatar,
  seedPosts=[], hideStories=false, focusSection='home', onlyOwn=false
}:{
  canManage?:boolean;
  pageId?:string;
  pageName?:string;
  pageAvatar?:string;
  seedPosts?:Array<{id:string;body:string;image_url?:string|null;video_url?:string|null;post_type?:string;created_at:string;likes_count?:number;is_paid?:boolean;price?:number}>;
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
      likes:p.likes_count||0, views:120, comments:[], public:true, demo:false, author:pageName, authorPhoto:pageAvatar, isPaid:Boolean((p as any).is_paid||Number((p as any).price||0)>0), purchased:localStorage.getItem('sb1_paid_'+p.id)==='1'
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
  type LibraryItem={id:string;name:string;url:string;kind:'image'|'video'|'audio'|'gif'|'sticker';source?:string;createdAt:string;thumbnail?:string;embedUrl?:string};
  const [mediaLibrary,setMediaLibrary]=useState<LibraryItem[]>(()=>read('sb1_media_library_'+pageId,[{id:'demo-lib-img-1',name:'صورة طبية تجريبية',url:demoPostImages[0],kind:'image',source:'SB1',createdAt:new Date().toISOString()},{id:'demo-lib-img-2',name:'صورة تجريبية ثانية',url:demoPostImages[1],kind:'image',source:'SB1',createdAt:new Date().toISOString()},{id:'demo-lib-video-1',name:'فيديو تجريبي',url:demoVideoUrl,kind:'video',source:'SB1',createdAt:new Date().toISOString()},{id:'demo-lib-audio-1',name:'موسيقى هادئة',url:'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73467.mp3?filename=relaxing-ambient-11327.mp3',kind:'audio',source:'SB1',createdAt:new Date().toISOString()}]));
  const [composerPanel,setComposerPanel]=useState<'media'|'emoji'|'gif'|'sticker'>('media');
  const [mediaSource,setMediaSource]=useState<'library'|'favorites'|'albums'>('library');
  const [selectedMedia,setSelectedMedia]=useState<LibraryItem|null>(null);
  const [mediaStart,setMediaStart]=useState(0); const [mediaEnd,setMediaEnd]=useState(0);
  const [storySelectedMedia,setStorySelectedMedia]=useState<LibraryItem|null>(null);
  const [storyMediaStart,setStoryMediaStart]=useState(0); const [storyMediaEnd,setStoryMediaEnd]=useState(0);
  const [storyComposerPanel,setStoryComposerPanel]=useState<'media'|'emoji'|'gif'|'sticker'>('media');
  const [storyMediaSource,setStoryMediaSource]=useState<'library'|'favorites'|'albums'>('library');

  const [composer,setComposer]=useState(false);
  const [wizardInitialMedia,setWizardInitialMedia]=useState<any|null>(null);
  const [postGeneratorTopic,setPostGeneratorTopic]=useState('');
  const [postGenerating,setPostGenerating]=useState(false);
  const [postText,setPostText]=useState('');
  const [postKind,setPostKind]=useState<MediaKind>('post');
  const [postFile,setPostFile]=useState<File|null>(null);
  const [publishMode,setPublishMode]=useState<'smart'|'video'|'image'|'reel'|'story'|'post'>('smart');
  const [videoTitle,setVideoTitle]=useState('');
  const [videoDescription,setVideoDescription]=useState('');
  const [videoMuted,setVideoMuted]=useState(false);
  const [videoDuration,setVideoDuration]=useState(0);
  const [publishTarget,setPublishTarget]=useState<'story'|'reel'|'video'>('video');
  const [selectedImages,setSelectedImages]=useState<LibraryItem[]>([]);
  const [musicQuery,setMusicQuery]=useState('');
  const [musicResults,setMusicResults]=useState<any[]>([]);
  const [musicLoading,setMusicLoading]=useState(false);
  const [selectedMusic,setSelectedMusic]=useState<any|null>(null);
  const [libraryTab,setLibraryTab]=useState<'music'|'stickers'|'gifs'|'emoji'>('music');
  const [fontFamily,setFontFamily]=useState('system-ui');
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
  const [socialProvider,setSocialProvider]=useState('YouTube');
  const [hasSocialSearch,setHasSocialSearch]=useState(false);
  const [socialUrl,setSocialUrl]=useState('');
  const [socialOpen,setSocialOpen]=useState<string[]>([]);
  const [socialEmbedded,setSocialEmbedded]=useState<string|null>(null);
  const [youtubeResults,setYoutubeResults]=useState<any[]>([]);
  const [googleImageResults,setGoogleImageResults]=useState<any[]>([]);
  const [googleImageSearched,setGoogleImageSearched]=useState(false);
  const [externalResults,setExternalResults]=useState<any[]>([]);
  const [googleImageViewer,setGoogleImageViewer]=useState<any|null>(null);
  const [externalViewer,setExternalViewer]=useState<any|null>(null);
  const [externalPublish,setExternalPublish]=useState<any|null>(null);
  const [favorites,setFavorites]=useState<string[]>(()=>read('sb1_fb_social_favorites',[]));
  const [albums,setAlbums]=useState<any[]>(()=>read('sb1_fb_albums_'+pageId,[]));
  const [albumName,setAlbumName]=useState('');
  const [albumModal,setAlbumModal]=useState(false);
  const [albumPicker,setAlbumPicker]=useState<any|null>(null);
  const [reelViewer,setReelViewer]=useState<FeedItem|null>(null);
  const [postBackground,setPostBackground]=useState('#ffffff');
  const [postFontColor,setPostFontColor]=useState('#334155');
  const [postFontSize,setPostFontSize]=useState('18px');
  const [postFontWeight,setPostFontWeight]=useState('700');
  const [postFilter,setPostFilter]=useState('none');
  const [postMuted,setPostMuted]=useState(true);
  const filters=[['none','بدون فلتر'],['grayscale(1)','أبيض وأسود'],['sepia(.65)','دافئ'],['contrast(1.15) saturate(1.25)','حيوي'],['brightness(1.12)','فاتح']];
  const emojiBase=['😀','😃','😄','😁','😆','😅','😂','🤣','😊','😇','🙂','🙃','😉','😌','😍','🥰','😘','😗','😙','😚','😋','😛','😝','😜','🤪','🤨','🧐','🤓','😎','🤩','🥳','😏','😒','😞','😔','😟','😕','🙁','☹️','😣','😖','😫','😩','🥺','😢','😭','😤','😠','😡','🤬','🤯','😳','🥵','🥶','😱','😨','😰','😥','😓','🤗','🤔','🫣','🤭','🤫','🤥','😶','😐','😑','😬','🙄','😯','😦','😧','😮','😲','🥱','😴','🤤','😪','😵','🤐','🥴','🤢','🤮','🤧','😷','🤒','🤕','🤑','🤠','👋','🤚','🖐️','✋','🖖','👌','🤏','✌️','🤞','🤟','🤘','🤙','👈','👉','👆','👇','☝️','👍','👎','✊','👊','🤝','👏','🙌','👐','🤲','🙏','💪','🫶','❤️','🧡','💛','💚','💙','💜','🖤','🤍','🤎','💔','❣️','💕','💞','💓','💗','💖','💘','💝','💟','✨','⭐','🌟','💫','🔥','💥','💯','🎉','🎊','🎈','🎁','🎂','🍰','🍓','🍕','☕','🍵','🥗','⚽','🏀','🏆','🎮','🎵','🎶','🎤','🎧','📸','📹','🎬','📚','🧠','🩺','💊','🏥','💡','📌','✅','❌','⚠️','❗','❓','🔔','🔒','🔓','🌈','☀️','🌙','🌸','🌺','🌹','🌻','🌷','🍀','🌿','🌊','🌍','🚀','💎','🎯','🧩','🛍️','💰','📱','💻','⌚','🔑','🗝️','🏠','🚗','✈️','🌍','🕊️'];
const emojis=Array.from(new Set([...emojiBase,...emojiBase.map((e,i)=>e+(i%3===0?'🏻':i%3===1?'🏽':'🏿'))])).slice(0,300);
  const [clonePermissions,setClonePermissions]=useState<string[]>([]);
  const [cloneType,setCloneType]=useState('client');
  const [cloneCount,setCloneCount]=useState(1);
  const [cloneName,setCloneName]=useState('');
  const [cloneExpiry,setCloneExpiry]=useState('');
  const [clones,setClones]=useState<any[]>(()=>read('sb1_fb_clones',[]));
  const [settingsOpen,setSettingsOpen]=useState(false);
  const [settingsSection,setSettingsSection]=useState('account');
  const [pageSettings,setPageSettings]=useState(()=>read('sb1_page_settings_'+pageId,{public:true,allowStories:true,allowComments:true,allowMessages:true,showFollowers:true,showCertificates:true,showCourses:true,showArticles:true,showVideos:true,showRecordings:true,showPosts:true,showDiary:true,notifyBookings:true,notifyQuestions:true,notifyLikes:true,notifyMessages:true,notifyFollowers:true,notifySystem:true,autoPlayMedia:true,language:'ar'}));
  useEffect(()=>{write('sb1_page_settings_'+pageId,pageSettings);window.dispatchEvent(new Event('sb1-settings-change'))},[pageSettings,pageId]);
  const [recording,setRecording]=useState(false);
  const [recordUrl,setRecordUrl]=useState('');
  const recorder=useRef<MediaRecorder|null>(null);
  const stream=useRef<MediaStream|null>(null);
  const chunks=useRef<Blob[]>([]);

  useEffect(()=>{document.querySelectorAll<HTMLElement>('button,a,[role="button"]').forEach((b)=>{if(!b.title){const label=(b.getAttribute('aria-label')||b.getAttribute('data-tooltip')||b.textContent||'').replace(/\\s+/g,' ').trim();if(label)b.title=label.slice(0,120)}})},[]);
  useEffect(()=>write('sb1_fb_posts_'+pageId,feed),[feed,pageId]);
  useEffect(()=>write('sb1_fb_liked_'+pageId,likedIds),[likedIds,pageId]);
  useEffect(()=>()=>Object.values(hoverTimers.current).forEach(t=>window.clearTimeout(t)),[]);
  useEffect(()=>write('sb1_fb_stories_'+pageId,stories),[stories,pageId]);
  useEffect(()=>write('sb1_audio_library',audioLibrary),[audioLibrary]);
  useEffect(()=>write('sb1_media_library_'+pageId,mediaLibrary),[mediaLibrary,pageId]);
  useEffect(()=>{(async()=>{try{const r=await supabase.from('sb1_media_library').select('*').eq('page_id',pageId).order('created_at',{ascending:false}).limit(100);if(!r.error&&r.data?.length)setMediaLibrary(r.data.map((x:any)=>({id:x.id,name:x.name,url:x.url,kind:x.kind,source:x.source,createdAt:x.created_at,thumbnail:x.thumbnail_url})));}catch{}})()},[pageId]);
  useEffect(()=>write('sb1_fb_social_favorites',favorites),[favorites]);
  useEffect(()=>write('sb1_fb_albums_'+pageId,albums),[albums,pageId]);
  useEffect(()=>write('sb1_fb_clones',clones),[clones]);
  useEffect(()=>{if(socialEmbedded!=='Pinterest')return;const id='sb1-pinterest-widget';if(document.getElementById(id))return;const s=document.createElement('script');s.id=id;s.async=true;s.defer=true;s.src='https://assets.pinterest.com/js/pinit.js';document.body.appendChild(s);return()=>{}},[socialEmbedded]);
  useEffect(()=>{if(postFile){const u=URL.createObjectURL(postFile);setPostUrl(u)}else setPostUrl('')},[postFile]);
  useEffect(()=>{if(storyFile){const u=URL.createObjectURL(storyFile);setStoryUrl(u)}else setStoryUrl('')},[storyFile]);
  useEffect(()=>()=>stream.current?.getTracks().forEach(t=>t.stop()),[]);

  const publicFeed=feed.filter(p=>p.public&&(!onlyOwn||p.author===pageName));
  const canOpenPost=(p:FeedItem)=>!p.isPaid||p.purchased||localStorage.getItem('sb1_paid_'+p.id)==='1';
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

  const savedMedia=()=>getSaved().filter((x:any)=>x.url||x.image_url).map((x:any)=>({id:'fav-'+x.id,name:x.title||x.author||'مفضلتي',url:x.image_url||x.embed_url||x.url,kind:(x.kind==='audio'||x.kind==='recording')?'audio':(x.kind==='video'||x.kind==='reel')?'video':'image',source:'مفضلتي',createdAt:x.created_at||new Date().toISOString(),thumbnail:x.thumbnail} as LibraryItem));
  const albumMedia=()=>albums.flatMap((a:any)=>((a.items||[]) as any[]).map(x=>({id:'album-'+x.id,name:x.mediaName||x.text||a.name,url:x.mediaUrl,kind:x.kind==='audio'?'audio':(x.kind==='video'||x.kind==='reel')?'video':'image',source:'ألبوماتي',createdAt:x.createdAt||new Date().toISOString()} as LibraryItem))).filter(x=>x.url);
  const sourceMedia=()=>mediaSource==='favorites'?savedMedia():mediaSource==='albums'?albumMedia():mediaLibrary;
  const storySourceMedia=()=>storyMediaSource==='favorites'?savedMedia():storyMediaSource==='albums'?albumMedia():mediaLibrary;
  const addMediaFile=async(file:File,forStory=false)=>{
    const kind=file.type==='image/gif'?'gif':file.type.startsWith('image/')?'image':file.type.startsWith('video/')?'video':file.type.startsWith('audio/')?'audio':'sticker'; let url='';
    try{const path=(pageId||'page')+'/library/'+Date.now()+'-'+file.name.replace(/[^a-zA-Z0-9._-]/g,'_');const up=await supabase.storage.from('specialist-content').upload(path,file,{upsert:false,contentType:file.type||undefined});if(!up.error)url=supabase.storage.from('specialist-content').getPublicUrl(path).data.publicUrl;}catch{}
    if(!url){if(file.size>8*1024*1024){setNotice('الملف كبير جداً للمكتبة المحلية.');return}url=await fileAsDataUrl(file);}
    const item:LibraryItem={id:id(),name:file.name,url,kind,source:'الجهاز',createdAt:new Date().toISOString()};setMediaLibrary(v=>[item,...v]);try{await supabase.from('sb1_media_library').insert({id:item.id,page_id:pageId,name:item.name,url:item.url,kind:item.kind,source:item.source,created_at:item.createdAt});}catch{}
    if(forStory){setStorySelectedMedia(item);setStoryMediaStart(0);setStoryMediaEnd(0);}else{setSelectedMedia(item);setMediaStart(0);setMediaEnd(0);}
  };
  const chooseMedia=async(m:LibraryItem,forStory=false)=>{if(forStory){setStorySelectedMedia(m);setStoryMediaStart(0);setStoryMediaEnd(0);return}setSelectedMedia(m);setMediaStart(0);setMediaEnd(0);if(m.kind==='video'){const d=await getMediaDuration(m.url);setVideoDuration(d);setPublishTarget(d>0&&d<20?'story':d>=20&&d<180?'reel':'video');setPublishMode('video');setPostKind('video');}else if(m.kind==='image'){setVideoDuration(0);setPublishMode('image');setPostKind('image');}};
  const mediaButtons=(forStory=false)=>{    const list=forStory?storySourceMedia():sourceMedia();    const selected=forStory?storySelectedMedia:selectedMedia;    return (      <div className="mt-2 grid max-h-44 grid-cols-3 gap-2 overflow-y-auto sm:grid-cols-4">        {list.map((m)=>{          const active=selected?.id===m.id;          return (            <button key={m.id} type="button" onClick={()=>chooseMedia(m,forStory)} className={`overflow-hidden rounded-xl border p-1 text-right ${active?"border-teal-600 ring-2 ring-teal-100":"bg-white"}`}>              <div className="aspect-square overflow-hidden rounded-lg bg-slate-950">                {m.kind==="video" ? <video src={m.url} muted playsInline className="h-full w-full object-cover" /> : m.kind==="audio" ? <div className="grid h-full place-items-center text-teal-700"><AudioLines className="h-8 w-8" /></div> : <img src={m.url} alt="" className="h-full w-full object-cover" />}              </div>              <span className="block truncate px-1 py-1 text-[10px] font-bold">{m.name}</span>            </button>          );        })}        {!list.length && <div className="col-span-full rounded-xl border border-dashed p-5 text-center text-xs text-slate-400">لا يوجد محتوى هنا بعد.</div>}      </div>    );  };
  const previewSelected=(m:LibraryItem|null,start:number,end:number)=>{if(!m)return null;const onTime=(e:any)=>{if(end>start&&e.currentTarget.currentTime>=end)e.currentTarget.currentTime=start;};return <div className="mt-3 overflow-hidden rounded-2xl border-2 border-teal-200 bg-slate-950 shadow-sm"><div className="border-b border-white/10 bg-slate-900 px-3 py-2 text-xs font-bold text-white">معاينة المحتوى الذي سيتم نشره</div>{m.embedUrl?<iframe title="معاينة الفيديو" src={m.embedUrl} className="aspect-video w-full border-0 bg-black" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen/>:m.kind==='audio'?<audio src={m.url} controls className="w-full p-2" onTimeUpdate={onTime}/>:m.kind==='video'?<video src={m.url} controls playsInline preload="metadata" className="mx-auto aspect-video max-h-[360px] w-full object-contain" onTimeUpdate={onTime}/>:<img src={m.url} alt="" className="mx-auto max-h-[360px] w-full object-contain"/>}<div className="bg-white px-3 py-2 text-[10px] font-bold text-slate-500">الفيديو ظاهر هنا قبل النشر، ويمكن تشغيله ومعاينته وتحديد المقطع.</div></div>};
  const addTextEmoji=(e:string,forStory=false)=>forStory?setStoryText(v=>v+e):setPostText(v=>v+e);
  const stickerSet=['❤️','👍','😂','😍','👏','🔥','😊','🎉','✨','⭐','🌸','🩺','🧠','💚','💙','🥰','😎','🤍','🙌','🎈','🌟','💫','😄','😉','🥳','🤗','🙏','💡','📌','🎁'];
  const gifSet=mediaLibrary.filter(x=>x.kind==='gif'||x.kind==='sticker').slice(0,12);
  const createStory=()=>{
    const chosen=storySelectedMedia;if(!storyText.trim()&&!storyUrl&&!chosen){setNotice('أضف نصاً أو صورة أو فيديو أو اختر محتوى من المكتبة.');return}
    const item:StoryItem={id:id(),name:'قصتي',text:storyText.trim(),mediaUrl:chosen?.url||storyUrl||undefined,mediaKind:(chosen?.kind==='video'?'video':chosen?.kind==='gif'?'gif':chosen?.kind==='sticker'?'sticker':'image') as any,audioUrl:chosen?.kind==='audio'?chosen.url:(storyAudioUrl||undefined),audioStart:chosen?.kind==='audio'?storyMediaStart:storyAudioStart,mediaStart:storyMediaStart,mediaEnd:storyMediaEnd||undefined,authorPhoto:pageAvatar,filter:storyFilter,textStyle:{color:storyTextColor,fontSize:storyTextSize,fontWeight:'800'},createdAt:new Date().toISOString(),expiresAt:new Date(Date.now()+86400000),own:true};
    setStories(v=>[item,...v]);setStoryText('');setStoryFile(null);setStoryAudioUrl('');setStoryAudioStart(0);setStorySelectedMedia(null);setStoryMediaStart(0);setStoryMediaEnd(0);setStoryFilter('none');setStoryComposer(false);setNotice('تم نشر قصتك.');setStoryViewer(item);
  };
  const deleteStory=(story:StoryItem)=>{
    if(!story.own)return;
    setStories(v=>v.filter(x=>x.id!==story.id));setStoryViewer(null);setNotice('تم حذف القصة.');
  };

  const generatePostDraft=async()=>{const topic=postGeneratorTopic.trim();if(!topic){setNotice('اكتب موضوع المنشور أولاً.');return}setPostGenerating(true);try{const r=await fetch('/api/marketing/publish',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({action:'generate',topic,language:pageSettings.language||'ar'})});const x=await r.json();if(r.ok&&x.text){setPostText(x.text);setNotice('تم توليد مسودة المنشور ويمكنك تعديلها قبل النشر.')}else throw new Error(x.error||'تعذر توليد المنشور')}catch{const local=pageSettings.language==='en'?'New update about '+topic+'. Here is a concise educational post for the SB1 community. What do you think?':pageSettings.language==='de'?'Neuer Beitrag zum Thema '+topic+'. Eine kurze informative Veröffentlichung für die SB1-Community. Was denken Sie?':pageSettings.language==='ru'?'Новая публикация о теме «'+topic+'». Краткий информационный текст для сообщества SB1. Что вы думаете?':'منشور جديد حول '+topic+'. هذه مسودة تثقيفية مختصرة لمجتمع SB1. ما رأيك؟';setPostText(local);setNotice('تم إنشاء مسودة محلية؛ يمكنك تعديلها قبل النشر.')}finally{setPostGenerating(false)}};

  const getMediaDuration=(url:string)=>new Promise<number>((resolve)=>{try{const v=document.createElement('video');v.preload='metadata';v.onloadedmetadata=()=>resolve(Number.isFinite(v.duration)?v.duration:0);v.onerror=()=>resolve(0);v.src=url}catch{resolve(0)}});
  const searchMusic=async()=>{const q=musicQuery.trim();if(!q){setNotice('اكتب اسم الأغنية أو كلمة مثل حزين أو فرح.');return}setMusicLoading(true);try{const r=await fetch('/api/music-search?q='+encodeURIComponent(q));const x=await r.json();setMusicResults(x.items||[])}catch{setNotice('تعذر البحث في مكتبة الموسيقى.')}finally{setMusicLoading(false)}};
  const choosePublishMode=(mode:'video'|'image'|'reel'|'story'|'post')=>{setPublishMode(mode);setPostKind(mode==='video'?'video':mode==='reel'?'reel':mode==='image'?'image':'post')};
  const publish=async()=>{
    const media=selectedMedia;
    const sourceUrl=media?.url||recordUrl||postUrl||'';
    const mediaSource=sourceUrl||media?.embedUrl||'';
    if(!postText.trim()&&!videoTitle.trim()&&!mediaSource&&!selectedImages.length){setNotice('أضف محتوى قبل النشر.');return}
    const mode=publishMode==='smart'?(media?.kind==='video'?'video':media?.kind==='image'?'image':postKind):publishMode;
    const videoLike=media?.kind==='video'||mode==='video'||mode==='reel';
    const duration=videoDuration||((sourceUrl&&videoLike&&!media?.embedUrl)?await getMediaDuration(sourceUrl):0);

    let target=publishTarget;
    if(videoLike&&duration>0){
      if(duration<20) target='story';
      else if(duration<180 && target==='story') target='reel';
      else if(duration>=180) target='video';
    }

    if(videoLike && target==='story'){
      const story:StoryItem={
        id:id(),name:'قصتي',text:videoTitle.trim()||postText.trim()||'قصة فيديو',
        mediaUrl:sourceUrl||undefined,mediaKind:'video',authorPhoto:pageAvatar,
        createdAt:new Date().toISOString(),expiresAt:new Date(Date.now()+86400000),own:true
      };
      setStories(v=>[story,...v]);
      setStoryViewer(story);
      setNotice('✓ تم نشر الفيديو كقصة لأن مدته أقل من 20 ثانية.');
      setPostText('');setVideoTitle('');setVideoDescription('');setPostFile(null);setRecordUrl('');setSelectedMedia(null);setSelectedMusic(null);setComposer(false);
      return;
    }

    const finalKind=videoLike?target:mode;
    const finalMedia=selectedImages.length>1?selectedImages.map(x=>x.url).join('|'):sourceUrl;
    const item:FeedItem={
      id:id(),kind:finalKind as MediaKind,
      text:(videoLike?videoTitle:postText).trim()||'منشور جديد',
      mediaUrl:finalMedia||media?.embedUrl,embedUrl:media?.embedUrl,mediaName:postFile?.name||media?.name,
      createdAt:new Date().toISOString(),likes:0,likedBy:[],comments:[],public:true,
      author:pageName,authorPhoto:pageAvatar,mediaStart:mediaStart||undefined,mediaEnd:mediaEnd||undefined,
      style:{background:postBackground,color:postFontColor,fontSize:postFontSize,fontWeight:postFontWeight,filter:postFilter},
      videoSettings:videoLike?{title:videoTitle,description:videoDescription,muted:videoMuted,duration,target,music:selectedMusic||null}:undefined,
      music:selectedMusic||undefined,
      imageSequence:selectedImages.length>1?selectedImages.map(x=>x.url):undefined
    };
    setFeed(v=>[item,...v]);
    setPostText('');setVideoTitle('');setVideoDescription('');setPostFile(null);setRecordUrl('');
    setSelectedMedia(null);setSelectedImages([]);setSelectedMusic(null);setVideoDuration(0);setPublishTarget('video');
    setComposer(false);setNotice('✓ تم نشر المحتوى بالإعدادات المحددة.');
  };

  const publishWizard=async(p:any)=>{
    const first=p.media?.[0];
    const video=first?.kind==='video';
    const rawUrl=first?.url||'';
    const embedUrl=first?.embedUrl;
    const duration=Number(first?.duration||videoDuration||0);
    let finalMode=p.mode as MediaKind;
    if(video){finalMode=duration<20?'story':duration<180?(p.mode==='video'?'video':'reel'):'video'}
    if(finalMode==='story'){
      if(video&&duration>=20){setNotice('لا يمكن نشر هذا الفيديو كقصة لأن مدته 20 ثانية أو أكثر.');return}
      const story:StoryItem={id:id(),name:'قصتي',text:p.title||p.text||'قصة',mediaUrl:rawUrl||undefined,mediaKind:video?'video':'image',authorPhoto:pageAvatar,createdAt:new Date().toISOString(),expiresAt:new Date(Date.now()+86400000),own:true,audioUrl:p.audio?.url,audioStart:p.audioStart,audioEnd:p.audioEnd,filter:p.filter,textStyle:{color:p.textColor,fontSize:String(p.textSize),fontWeight:'700'}};
      setStories(v=>[story,...v]);setStoryViewer(story);setNotice('✓ تم نشر القصة بالإعدادات المحددة.');setComposer(false);setWizardInitialMedia(null);return;
    }
    const urls=(p.media||[]).filter((x:any)=>x.kind==='image').map((x:any)=>x.url);
    const item:FeedItem={id:id(),kind:finalMode,text:(p.title||p.text||'منشور جديد').trim(),mediaUrl:urls.length>1?urls.join('|'):rawUrl||embedUrl,embedUrl,mediaName:first?.name,createdAt:new Date().toISOString(),likes:0,likedBy:[],comments:[],public:true,author:pageName,authorPhoto:pageAvatar,mediaStart:p.audioStart,mediaEnd:p.audioEnd,style:{background:p.background,color:p.textColor,fontSize:String(p.textSize),fontWeight:'700',filter:p.filter},videoSettings:video?{title:p.title,description:p.description,muted:p.muted,duration,target:finalMode as any,music:p.audio||null}:undefined,music:p.audio||undefined,imageSequence:urls.length>1?urls:undefined};
    setFeed(v=>[item,...v]);setNotice('✓ تم النشر بنجاح بعد اكتمال جميع المراحل.');setComposer(false);setWizardInitialMedia(null);
  };

  const publishExternal=(item:any,kind:'reel'|'video'|'image'|'audio'|'post'|'story')=>{const url=item.url||item.image||item.thumbnail||item.embedUrl||'';if(!url&&!item.embedUrl){setNotice('لا يوجد رابط صالح لهذا المحتوى.');return;}if(kind==='story'){setStorySelectedMedia({id:'external-'+(item.id||url),name:item.title||'محتوى خارجي',url,kind:item.resourceType==='video'||item.kind==='video'||item.type==='video'?'video':'image',source:item.source||socialProvider,createdAt:new Date().toISOString(),thumbnail:item.thumbnail,embedUrl:item.embedUrl});setStoryComposer(true);setExternalViewer(null);return;}publishExternalToComposer(item,kind);};
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
    const alreadyLiked=likedIds.includes(postId);
    const name=localStorage.getItem('chat_name')||'مستخدم SB1';
    const photo=localStorage.getItem('chat_photo')||pageAvatar;
    setLikedIds(v=>alreadyLiked?v.filter(id=>id!==postId):[...v,postId]);
    setFeed(v=>v.map(p=>p.id===postId?{...p,likes:Math.max(0,p.likes+(alreadyLiked?-1:1)),likedBy:[...(p.likedBy||[]),{name,photo}]}:p));
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
    const commenterName=localStorage.getItem('chat_name')||localStorage.getItem('sb1_account_name')||'مستخدم SB1'; const commenterPhoto=localStorage.getItem('chat_photo')||localStorage.getItem('sb1_account_avatar')||undefined; setFeed(v=>v.map(p=>p.id===postId?{...p,comments:[...p.comments,{id:id(),name:commenterName,photo:commenterPhoto,body}]}:p));
    setComments(v=>({...v,[postId]:''}));
  };
  const saveStoryToFavorites=(s:StoryItem)=>{const saved=getSaved();if(saved.some((x:any)=>x.id===s.id)){setNotice('✓ القصة موجودة بالفعل في مفضلتي.');return;}const next=toggleSaved({id:s.id,kind:s.mediaKind==='video'?'video':'image',title:s.text||s.name,body:s.text,author:s.name,url:s.mediaUrl,image_url:s.mediaKind==='image'?s.mediaUrl:undefined,created_at:s.createdAt});setFavorites(next.map((x:any)=>x.id));setNotice('✓ تمت إضافة القصة إلى مفضلتي.');};
  const saveToFavorites=(p:FeedItem)=>{const saved=getSaved();if(saved.some((x:any)=>x.id===p.id)){setNotice('✓ المحتوى موجود بالفعل في مفضلتي.');return;}const next=toggleSaved({id:p.id,kind:p.kind==='image'?'image':p.kind==='reel'?'reel':p.kind==='video'?'video':p.kind==='audio'?'recording':p.kind==='article'?'article':'post',title:p.text,body:p.text,author:p.author,url:p.mediaUrl,embed_url:p.embedUrl,image_url:p.kind==='image'?p.mediaUrl:undefined,created_at:p.createdAt});setFavorites(next.map((x:any)=>x.id));setNotice('✓ تمت إضافة المحتوى إلى مفضلتي.');};
  const createAlbum=()=>{const n=albumName.trim();if(!n){setNotice('اكتب اسم الألبوم أولاً.');return}const pending=albumPicker;const a={id:id(),name:n,type:albumType,public:false,items:pending?[pending]:[]};setAlbums(v=>[a,...v]);setAlbumName('');setAlbumType('all');setAlbumModal(false);setAlbumPicker(null);setNotice(pending?'تم إنشاء الألبوم وإضافة المحتوى إليه.':'تم إنشاء الألبوم.');};
  const fileAsDataUrl=(file:File)=>new Promise<string>((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(String(r.result||''));r.onerror=reject;r.readAsDataURL(file)});
  const albumItemKind=(file:File):MediaKind=>file.type.startsWith('image/')?'image':file.type.startsWith('video/')?'video':file.type.startsWith('audio/')?'audio':'post';
  const addUploadedToAlbum=async(albumId:string,file:File)=>{let url='';try{const path=(pageId||'page')+'/'+Date.now()+'-'+file.name.replace(/[^a-zA-Z0-9._-]/g,'_');const up=await supabase.storage.from('specialist-content').upload(path,file,{upsert:false,contentType:file.type||undefined});if(!up.error)url=supabase.storage.from('specialist-content').getPublicUrl(path).data.publicUrl;}catch{}if(!url){if(file.size>5*1024*1024){setNotice('تعذر حفظ الملف الكبير. تأكد من إعداد تخزين Supabase.');return}url=await fileAsDataUrl(file);}const item={id:id(),kind:albumItemKind(file),text:file.name,mediaUrl:url,mediaName:file.name,createdAt:new Date().toISOString(),likes:0,views:0,comments:[],public:true,author:pageName,authorPhoto:pageAvatar};setAlbums(v=>v.map(a=>a.id===albumId?{...a,items:[item,...(a.items||[])]}:a));setAlbumUpload(null);setNotice('تم حفظ الملف داخل الألبوم.');};
  const addToAlbum=(p:FeedItem,albumId:string)=>{
    const item={...p,source:p.source||socialProvider};
    setAlbums(v=>v.map(a=>a.id===albumId?{...a,items:[item,...(a.items||[]).filter((x:any)=>x.id!==p.id)]}:a));
    setAlbumPicker(null);
    setExternalViewer(null);
    setNotice('تمت إضافة المحتوى إلى الألبوم وسيظهر الآن داخل الألبوم.');
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
  const fetchJson=async(url:string)=>{
    const r=await fetch(url);
    const text=await r.text();
    let x:any=null;
    try{x=text?JSON.parse(text):null;}catch{throw new Error('الخادم أعاد استجابة غير صالحة.');}
    if(!r.ok) throw new Error(x?.error||'تعذر تنفيذ البحث.');
    return x;
  };

  const searchSocial=async()=>{
    const q=socialSearch.trim();
    const provider=socialProvider;
    if(!q){setNotice(provider==='Pinterest'?'ألصق رابط Pin هنا.':'اكتب كلمة البحث أو رابط المحتوى.');return;}
    setHasSocialSearch(true);
    if(provider==='YouTube'){
      if(/^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\//i.test(q)){
        const m=q.match(/(?:v=|youtu\.be\/|embed\/)([\\w-]{6,})/);if(m){setYoutubeResults([{id:m[1],title:'YouTube video',thumbnail:'',channelTitle:''}]);setSocialEmbedded('YouTube');return;}
      }
      try{const x=await fetchJson('/api/youtube-search?q='+encodeURIComponent(q)+'&type=video');setYoutubeResults(x.items||[]);setSocialEmbedded('YouTube');}catch(e){setNotice(e instanceof Error?e.message:'تعذر البحث في YouTube');}
      return;
    }
    if(provider==='Google Images'){
      setSocialEmbedded('Google Images');
      await searchGoogleImages(q);
      return;
    }
    if(provider==='Pinterest'||provider==='Rutube'||provider==='OK'||provider==='Yandex Search'){
      const apiProvider=provider==='Yandex Search'?'yandex':provider.toLowerCase();
      try{
        const x=await fetchJson('/api/social-search?provider='+encodeURIComponent(apiProvider)+'&q='+encodeURIComponent(q));
        setExternalResults(x.items||[]);
        setSocialEmbedded(provider);
      }catch(e){setNotice(e instanceof Error?e.message:'تعذر البحث في '+provider);}
      return;
    }
    if(provider==='Google Search'){setSocialEmbedded(provider);setSocialUrl('https://www.google.com/search?igu=1&q='+encodeURIComponent(q));return;}
    setSocialEmbedded(provider);
  };

  const searchGoogleImages=async(q:string)=>{
    try{
      const x=await fetchJson('/api/social-search?provider=google_images&q='+encodeURIComponent(q));
      setGoogleImageResults(x.items||[]);
      setGoogleImageSearched(true);
    }catch(e){
      setGoogleImageResults([]);
      setGoogleImageSearched(true);
      setNotice('');
    }
  };
  useEffect(()=>{
    if(!socialSearch.trim()) return;
    if(!hasSocialSearch) return;
    searchSocial();
  },[socialProvider,hasSocialSearch]);

  const externalFavoriteId=(item:any)=>'external-'+(item.id||item.image||item.thumbnail||item.url||item.embedUrl||'item');
  const favoriteExternal=(item:any,kind:'image'|'video'|'post'='image')=>{
    const url=item.image||item.thumbnail||item.url||item.embedUrl||'';if(!url){setNotice('لا يوجد محتوى صالح للحفظ.');return;}
    const sid=externalFavoriteId(item);if(favorites.includes(sid)){setNotice('✓ المحتوى موجود بالفعل في مفضلتي.');return;}
    const next=toggleSaved({id:sid,kind,title:item.title||socialProvider,body:item.description||item.snippet||'',author:item.author||item.channelTitle||item.source||socialProvider,url,image_url:item.image||item.thumbnail||undefined,embed_url:item.embedUrl||undefined,thumbnail:item.thumbnail||item.image||undefined,created_at:new Date().toISOString()} as any);
    setFavorites(next.map((x:any)=>x.id));setNotice('✓ تمت إضافة المحتوى إلى مفضلتي.');
  };
  const albumExternal=(item:any)=>{
    const url=item.image||item.thumbnail||item.url||item.embedUrl||'';
    if(!url){setNotice('لا يوجد محتوى صالح للإضافة إلى الألبوم.');return;}
    const isVideo=Boolean(item.resourceType==='video'||item.kind==='video'||item.type==='video'||item.embedUrl||/youtube|rutube|ok\.ru/i.test(String(item.source||socialProvider)));
    setAlbumPicker({id:'external-'+(item.id||url),kind:isVideo?'video':'image',text:item.title||socialProvider,mediaUrl:url,mediaName:item.title||socialProvider,createdAt:new Date().toISOString(),likes:0,views:0,comments:[],public:true,author:pageName,authorPhoto:pageAvatar,demo:false,source:item.source||socialProvider} as any);
    setNotice('اختر الألبوم وسيظهر المحتوى فيه مباشرة.');
  };
  const publishExternalToComposer=(item:any,kind:'reel'|'video'|'image'|'post'|'story')=>{
    const rawUrl=String(item.url||item.link||item.videoUrl||item.mediaUrl||'');
    const youtubeId=String(item.videoId||item.id||'').match(/[A-Za-z0-9_-]{6,}/)?.[0]||'';
    const isYouTube=/youtube\\.com|youtu\\.be/i.test(String(item.source||socialProvider))||Boolean(item.channelTitle||item.videoId);
    const embedUrl=item.embedUrl||item.embed_url||(isYouTube&&youtubeId?'https://www.youtube.com/embed/'+youtubeId+'?controls=1&playsinline=1':'');
    const url=rawUrl||item.image||item.thumbnail||embedUrl||'';
    if(!url&&!embedUrl){setNotice('لا يوجد محتوى صالح للنشر.');return}
    const mediaKind=(item.resourceType==='video'||item.kind==='video'||item.type==='video'||kind==='reel'||kind==='video'||Boolean(embedUrl))?'video':'image';
    if(kind==='story'){setStorySelectedMedia({id:'external-'+(item.id||url),name:item.title||socialProvider,url,kind:mediaKind,source:item.source||socialProvider,createdAt:new Date().toISOString(),thumbnail:item.thumbnail||item.image,embedUrl:item.embedUrl});setStoryComposer(true);setExternalViewer(null);return}
    const mode=mediaKind==='video'?(kind==='reel'?'reel':'video'):'image';
    setPostText(mediaKind==='image'?'':item.title||'');setVideoTitle(item.title||'');setVideoDescription(item.description||item.snippet||'');
    setSelectedMedia({id:'external-'+(item.id||url),name:item.title||socialProvider,url,kind:mediaKind,source:item.source||socialProvider,createdAt:new Date().toISOString(),thumbnail:item.thumbnail||item.image,embedUrl} as any);
    setPostKind(mode as MediaKind);setPublishMode(mode);setPublishTarget(mode==='reel'?'reel':'video');setVideoDuration(Number(item.duration||0));setWizardInitialMedia({id:'external-'+(item.id||url),name:item.title||socialProvider,url,kind:mediaKind,source:item.source||socialProvider,createdAt:new Date().toISOString(),thumbnail:item.thumbnail||item.image,embedUrl});setComposer(true);setExternalViewer(null);
    setNotice('تم فتح نافذة إعدادات النشر الكاملة.');
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
  const makeClones=()=>{if(!clonePermissions.length){setNotice('اختر صلاحية واحدة على الأقل أو اضغط تفعيل الكل.');return}
    const count=Math.min(50,Math.max(1,Number(cloneCount)||1));
    const permissions=[...clonePermissions];
    const next=Array.from({length:count},(_,i)=>({id:id(),type:cloneType,name:(cloneName.trim()||'صفحة '+cloneType)+(count>1?' '+(i+1):''),pin:String(1000+Math.floor(Math.random()*9000)),password:Math.random().toString(36).slice(2,10),link:window.location.origin+'/clone/'+id(),expires:cloneExpiry,permissions,createdAt:new Date().toISOString()}));
    setClones(v=>[...next,...v]);setNotice('تم إنشاء الصفحات المستنسخة بالصلاحيات المحددة.');
  };

  const scrollerRefs=useRef<Record<string,HTMLDivElement|null>>({});
  const scrollStrip=(key:string,direction:number)=>{scrollerRefs.current[key]?.scrollBy({left:direction*420,behavior:'smooth'});};
  const StoryStrip=()=> <div className="bg-transparent p-0">
    <div className="mb-2 flex items-center justify-between">
      <span className="text-xs font-bold text-teal-700">القصص</span>
      <div className="flex gap-1" dir="ltr">
        <button title="تحريك القصص لليسار" onClick={()=>scrollStrip('stories-top',-1)} className="grid h-8 w-8 place-items-center rounded-full border bg-white text-teal-700 shadow-sm active:bg-teal-50">‹</button>
        <button title="تحريك القصص لليمين" onClick={()=>scrollStrip('stories-top',1)} className="grid h-8 w-8 place-items-center rounded-full border bg-white text-teal-700 shadow-sm active:bg-teal-50">›</button>
      </div>
    </div>
    <div ref={el=>{scrollerRefs.current['stories-top']=el}} className="flex gap-3 overflow-x-auto pb-1 scroll-smooth">
      {canManage&&<button onClick={()=>setStoryComposer(true)} className="relative min-w-[92px] h-36 overflow-hidden rounded-xl bg-teal-700 text-white"><div className="absolute inset-0 grid place-items-center"><Plus className="h-8 w-8"/></div><span className="absolute bottom-2 right-2 left-2 text-center text-[10px] font-bold">إضافة قصة</span></button>}
      {activeStories.map(s=><button key={s.id} onClick={()=>setStoryViewer(s)} className="relative min-w-[92px] h-36 overflow-hidden rounded-xl bg-slate-900 text-right text-white">
        {s.mediaUrl ? (s.mediaKind==='video'?<video src={s.mediaUrl} muted playsInline className="absolute inset-0 h-full w-full object-cover" onMouseEnter={e=>{e.currentTarget.play().catch(()=>{});startHoverView(s.id,e.currentTarget)}} onMouseLeave={e=>stopHoverView(s.id,e.currentTarget)}/>:<img src={s.mediaUrl} alt="" className="absolute inset-0 h-full w-full object-cover"/>) : <div className="absolute inset-0 grid place-items-center p-3 text-center text-sm font-bold">{s.text}</div>}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"/>
        <span className="absolute bottom-2 right-2 left-2 truncate text-[10px] font-bold">{s.name}</span>
        <span className="absolute top-2 right-2 h-8 w-8 overflow-hidden rounded-full border-2 border-white"><img src={s.authorPhoto||pageAvatar||demoPeopleImages[0]} alt="" className="h-full w-full object-cover"/></span>
      </button>)}
    </div>
  </div>;

  const ReelStrip=({stripId='reels-inline'}:{stripId?:string})=><div id={stripId} className="bg-transparent p-0">
    <div className="mb-2 flex items-center justify-between">
      <span className="text-xs font-bold text-teal-700">Reels</span>
      <div className="flex gap-1" dir="ltr">
        <button title="تحريك الريلز لليسار" onClick={()=>scrollStrip(stripId,-1)} className="grid h-8 w-8 place-items-center rounded-full border bg-white text-teal-700 shadow-sm active:bg-teal-50">‹</button>
        <button title="تحريك الريلز لليمين" onClick={()=>scrollStrip(stripId,1)} className="grid h-8 w-8 place-items-center rounded-full border bg-white text-teal-700 shadow-sm active:bg-teal-50">›</button>
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
        {/* ترتيب الرئيسية: القصص ثم إنشاء المنشور ثم شريط Reels واحد ثم الـFeed */}
        {!hideStories&&<StoryStrip/>}

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
            <button onClick={()=>setStoryComposer(true)} className="rounded-lg py-2 hover:bg-slate-50"><ImageIcon className="inline text-teal-600"/> قصة</button>
          </div>
        </div>}

        <div className="rounded-xl border bg-white p-3"><ReelStrip stripId="fb-reels"/></div>
        <div id="fb-posts" className="space-y-4">
          {publicFeed.map((post,i)=>{
            const n=i+1;
            const showStories=false;
            return <div key={post.id}>
              <article onMouseEnter={()=>startHoverView(post.id)} onMouseLeave={()=>stopHoverView(post.id)} className="mx-auto max-w-3xl overflow-hidden rounded-xl border border-slate-300 bg-white shadow-sm">
                <div className="p-3">
                  <div className="flex items-center gap-3">
                    {post.authorPhoto?<img src={post.authorPhoto} alt={post.author} className="h-10 w-10 rounded-full object-cover"/>:<div className="grid h-10 w-10 place-items-center rounded-full bg-teal-100 font-extrabold text-teal-700">{post.author.charAt(0)}</div>}
                    <div className="flex-1"><b className="text-sm">{post.author}</b><div className="text-xs text-slate-400">{new Date(post.createdAt).toLocaleString()}</div></div>
                  </div>
                  <div className="mt-3 rounded-xl px-3 py-4 whitespace-pre-wrap leading-7 text-sm" style={post.style||{}}>{post.text}</div>
                  {post.mediaUrl&&post.kind==='image'&&canOpenPost(post)&&<>{(post as any).imageSequence?.length>1?<div className="flex gap-2 overflow-x-auto">{(post as any).imageSequence.map((u:string,i:number)=><img key={i} src={u} alt="" className="max-h-[280px] w-[82%] shrink-0 rounded-xl object-contain"/>)}</div>:<img src={post.mediaUrl} alt="" className="mx-auto mt-3 max-h-[280px] w-full max-w-xl rounded-xl object-contain"/>}</>}
                  {post.mediaUrl&&(post.kind==='video'||post.kind==='reel')&&canOpenPost(post)&&<>{post.embedUrl?<iframe title="الفيديو المنشور" src={post.embedUrl} className="mx-auto mt-3 aspect-video h-auto min-h-[270px] w-full max-w-2xl rounded-xl bg-black" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen/>:<video key={post.mediaUrl} src={post.mediaUrl} controls muted={Boolean((post as any).videoSettings?.muted)} playsInline loop={post.kind==='reel'} preload="auto" className="mx-auto mt-3 aspect-video max-h-[420px] w-full max-w-2xl rounded-xl bg-black object-contain" onError={()=>setNotice('تعذر تشغيل ملف الفيديو. تأكد أن الملف محفوظ بصيغة MP4/WebM صالحة.')}/>}</>}
                  {post.mediaUrl&&post.kind==='audio'&&canOpenPost(post)&&<audio src={post.mediaUrl} controls className="mt-3 w-full"/>}
                </div>
                {post.isPaid&&!canOpenPost(post)&&<div className="mx-3 mb-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs font-bold text-amber-800">🔒 محتوى مدفوع — يظهر عنوانه للعامة، ولا يمكن فتحه إلا بعد الشراء.</div>}
                <div className="flex items-center border-t border-teal-900 bg-teal-800 px-2 py-2 text-sm text-white">
                  <button onClick={()=>like(post.id)} className={'flex-1 rounded-lg py-2 transition '+(likedIds.includes(post.id)?'text-red-300':'text-white hover:bg-teal-700')}><Heart className="inline h-4 w-4 ml-1" fill={likedIds.includes(post.id)?'currentColor':'none'}/> {post.likes}</button>
                  <button onClick={()=>setOpenComments(post.id)} className="flex-1 rounded-lg py-2 hover:bg-teal-700" aria-label="التعليقات">{post.authorPhoto?<img src={post.authorPhoto} alt="" className="inline-block h-5 w-5 rounded-full object-cover align-middle ml-1"/>:<MessageCircle className="inline h-4 w-4 ml-1"/>}<MessageCircle className="inline h-4 w-4 ml-1"/> {post.comments.length}</button>
                  <span className="flex items-center gap-1 px-2 text-xs font-bold text-white"><Eye className="h-4 w-4"/>{post.views||0}</span>
                  <button onClick={()=>openShare(post.text)} className="flex-1 rounded-lg py-2 hover:bg-teal-700 active:bg-teal-900"><Share2 className="inline h-4 w-4 ml-1"/> مشاركة</button>
                  <button onClick={()=>saveToFavorites(post)} className="rounded-lg px-3 py-2 text-white hover:bg-teal-700 active:bg-teal-900" aria-label="حفظ"><Bookmark className="inline h-4 w-4"/></button>
                  <button onClick={()=>setAlbumPicker(post)} className="rounded-lg px-3 py-2 text-white hover:bg-teal-700 active:bg-teal-900" aria-label="إضافة إلى ألبوم"><Album className="inline h-4 w-4"/></button>
                </div>
              </article>
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

    {show('favorites') && (<section id="fb-favorites" className="rounded-xl border bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between"><div><h2 className="text-lg font-extrabold">مفضلتي</h2><p className="text-xs text-slate-500">كل ما حفظته من المنشورات والمنصات والصور يظهر هنا.</p></div><Bookmark className="text-teal-700"/></div>
      {getSaved().length===0?<div className="rounded-xl border border-dashed p-8 text-center text-sm text-slate-400">لا يوجد محتوى محفوظ بعد.</div>:<div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">{getSaved().map((item:any)=><article key={item.id} className="overflow-hidden rounded-xl border bg-white"><button onClick={()=>setExternalViewer({id:item.id,title:item.title,source:item.author||item.kind,image:item.image_url||item.thumbnail,url:item.url,embedUrl:item.embed_url,thumbnail:item.thumbnail})} className="block w-full text-right"><div className="aspect-square overflow-hidden bg-slate-100">{item.image_url||item.thumbnail?<img src={item.image_url||item.thumbnail} alt="" className="h-full w-full object-cover"/>:<div className="grid h-full place-items-center text-xs font-bold text-slate-400">{item.kind}</div>}</div><div className="p-2"><b className="line-clamp-2 text-xs">{item.title||'محتوى محفوظ'}</b><span className="mt-1 block truncate text-[10px] text-slate-400">{item.author||item.kind}</span></div></button><div className="flex gap-1 border-t p-2"><button onClick={()=>albumExternal(item)} className="rounded-lg bg-indigo-50 px-2 py-1 text-[10px] font-bold text-indigo-700">ألبوم</button><button onClick={()=>publishExternalToComposer(item,'image')} className="rounded-lg bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-700">نشر</button></div></article>)}</div>}
    </section>) }

    {show('albums') && (<section id="fb-albums" className="rounded-xl border bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between"><div><h2 className="text-lg font-extrabold">الألبومات</h2><p className="text-xs text-slate-500">صور، فيديو، صوت، MP3/WAV، ملفات Word/PDF وأي ملف من الجهاز.</p></div><button onClick={()=>setAlbumModal(true)} title="إنشاء ألبوم" className="rounded-xl bg-teal-700 px-4 py-2 text-sm font-bold text-white active:bg-teal-800"><Plus className="inline h-4 w-4 ml-1"/>ألبوم جديد</button></div>
      {albums.length===0?<div className="rounded-xl border border-dashed p-8 text-center text-sm text-slate-400">لا توجد ألبومات بعد.</div>:<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{albums.map(a=><article key={a.id} className="rounded-xl border bg-slate-50 p-4"><button onClick={()=>setAlbumViewer(a)} className="w-full text-right"><div className="flex items-center justify-between"><b>{a.name}</b><span className="text-xs text-slate-400">{a.items?.length||0} عنصر</span></div><div className="mt-3 grid grid-cols-3 gap-2">{(a.items||[]).slice(0,6).map((x:any)=><div key={x.id} className="aspect-square overflow-hidden rounded-lg bg-white">{x.mediaUrl&&x.kind==='image'?<img src={x.mediaUrl} alt="" className="h-full w-full object-cover"/>:x.mediaUrl&&x.kind==='video'?<video src={x.mediaUrl} muted className="h-full w-full object-cover"/>:<div className="grid h-full place-items-center p-1 text-[10px] font-bold text-slate-500">{x.mediaName||x.text||x.kind}</div>}</div>)}</div><div className="mt-3 text-xs font-bold text-teal-700">{a.type==='all'?'الكل':a.type==='images'?'صور':a.type==='videos'?'فيديو':a.type==='audio'?'صوت':'ملفات'} {a.public?'· عام':'· خاص'}</div><div className="mt-2 flex items-center gap-2"><button onClick={e=>{e.stopPropagation();setAlbums(v=>v.map(x=>x.id===a.id?{...x,public:!x.public}:x))}} className="rounded-lg bg-white px-2 py-1 text-[10px] font-bold">{a.public?'إخفاء عن العامة':'مشاركة للعامة'}</button><span className="h-7 w-7 overflow-hidden rounded-full border"><img src={pageAvatar} alt="" className="h-full w-full object-cover"/></span></div></button></article>)}</div>}
    </section>)}

    {show('medical') && (<section id="fb-medical-content" className="rounded-xl border bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between"><div><h2 className="sr-only">المحتوى الطبي</h2><p className="text-xs text-slate-500">فيديوهات طبية وتعليمية داخل SB1</p></div><Library className="text-teal-700"/></div>
      <div className="grid gap-3 md:grid-cols-3">{Array.from({length:9},(_,i)=>({title:demoTexts[i%demoTexts.length],specialty:['علم النفس','الصحة النفسية','التقييم السريري'][i%3]})).map((v,i)=><article key={i} className="rounded-xl border p-3"><div className="grid aspect-video place-items-center rounded-lg bg-slate-900 text-white"><Video/></div><b className="mt-2 block text-sm">{v.title}</b><span className="text-xs text-slate-500">{v.specialty}</span><div className="mt-2 flex gap-2"><button className="rounded-lg bg-teal-50 px-3 py-1 text-xs font-bold text-teal-700">فيديوهاتي</button><button className="rounded-lg bg-slate-50 px-3 py-1 text-xs font-bold">شاهداتي</button></div></article>)}</div>
    </section>) }

    {show('social') && (<section id="fb-social" className="rounded-xl border bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between"><div><h2 className="text-xl font-extrabold">منصات التواصل والمتصفح</h2><p className="text-xs text-slate-500">نستخدم فقط طرق العرض التي تسمح بها المنصة. يمكن حفظ المحتوى أو نشره أو إضافته إلى ألبوم.</p></div><ExternalLink className="text-teal-700"/></div>
      <div className="grid gap-2 md:grid-cols-[1fr_auto]"><input value={socialSearch} onChange={e=>setSocialSearch(e.target.value)} onKeyDown={e=>e.key==='Enter'&&searchSocial()} className="rounded-xl border p-3" placeholder="ابحث داخل المنصة..."/><button onClick={searchSocial} className="rounded-xl bg-teal-700 px-4 text-white" title="بحث"><Search/></button></div>
      <div className="mt-3 flex flex-nowrap gap-2 overflow-x-auto pb-1">{[['YouTube','YouTube','youtube'],['Rutube','Rutube','rutube'],['Pinterest','Pinterest','pinterest'],['OK','OK','ok'],['Google Images','Google Images','google'],['Google Search','Google','google'],['Yandex Search','Yandex','yandex']].map(([n,l,icon])=><button key={n} onClick={()=>{setSocialProvider(n);setSocialEmbedded(n);setExternalResults([]);setGoogleImageResults([])}} title={'فتح '+l+' داخل SB1'} className={'flex shrink-0 items-center gap-2 rounded-lg border bg-white px-3 py-2 text-sm font-bold '+(socialEmbedded===n?'border-slate-400 shadow-sm':'')}><img src={'https://cdn.simpleicons.org/'+icon} alt="" className="h-5 w-5" onError={(e:any)=>{e.currentTarget.style.display='none'}}/><span>{l}</span></button>)}</div>
      {socialEmbedded&&<div className="mt-4 overflow-hidden rounded-2xl border bg-slate-100">
        <div className="flex items-center justify-between border-b bg-white px-3 py-2"><b>{socialEmbedded}</b><div className="flex gap-2"><button onClick={()=>{toggleSaved({id:'social-'+socialEmbedded+'-'+socialSearch,kind:'video',title:socialSearch||socialEmbedded,body:'محتوى من منصة خارجية',url:socialSearch,created_at:new Date().toISOString()});setNotice('تمت الإضافة إلى مفضلتي.')}} title="إضافة إلى مفضلتي" className="rounded-lg bg-teal-50 px-3 py-2 text-xs font-bold text-teal-700"><Bookmark className="inline h-4 w-4 ml-1"/>مفضلتي</button><button onClick={()=>{setAlbumPicker({id:'social-header-'+socialEmbedded+'-'+socialSearch,kind:'image',text:socialSearch||socialEmbedded,mediaUrl:socialSearch,mediaName:socialSearch||socialEmbedded,createdAt:new Date().toISOString(),likes:0,views:0,comments:[],public:true,author:pageName,authorPhoto:pageAvatar} as any)}} title="إضافة إلى ألبوم" className="rounded-lg bg-indigo-50 px-3 py-2 text-xs font-bold text-indigo-700"><Album className="inline h-4 w-4 ml-1"/>ألبوم</button><button onClick={()=>publishExternalToComposer({id:'social-header-'+socialEmbedded+'-'+socialSearch,title:socialSearch||socialEmbedded,url:socialUrl||socialSearch,source:socialEmbedded,resourceType:socialEmbedded==='YouTube'?'video':'image'},'video')} title="نشر" className="rounded-lg bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700"><Send className="inline h-4 w-4 ml-1"/>نشر</button><button onClick={()=>setSocialEmbedded(null)} title="إغلاق"><X/></button></div></div>
        {socialEmbedded==='Pinterest' ? <div className="bg-white p-4"><div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">{externalResults.map((item:any)=><article key={item.id||item.url} className="overflow-hidden rounded-xl border bg-white"><button onClick={()=>setExternalViewer(item)} className="block w-full text-right"><div className="aspect-video overflow-hidden bg-slate-100">{item.thumbnail||item.image?<img src={item.thumbnail||item.image} alt="" className="h-full w-full object-cover"/>:<div className="grid h-full place-items-center text-xs text-slate-400">محتوى</div>}</div><div className="p-2"><b className="line-clamp-2 text-xs">{item.title||'محتوى'}</b><span className="mt-1 block truncate text-[10px] text-slate-400">{item.author||socialEmbedded}</span></div></button><div className="flex flex-wrap gap-1 border-t p-2"><button onClick={()=>favoriteExternal(item,item.thumbnail||item.image?'image':'video')} className="rounded-lg bg-teal-50 px-2 py-1 text-[10px] font-bold text-teal-700">مفضلتي</button><button onClick={()=>albumExternal(item)} className="rounded-lg bg-indigo-50 px-2 py-1 text-[10px] font-bold text-indigo-700">ألبوم</button><button onClick={()=>publishExternalToComposer(item,item.thumbnail||item.image?'image':'video')} className="rounded-lg bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-700">نشر</button></div></article>)}</div>{!externalResults.length&&<div className="py-10 text-center text-xs text-slate-500">لا توجد نتائج. اكتب البحث في الخانة الرئيسية واضغط «بحث».</div>}</div> :
         socialEmbedded==='Google Images' ? <GoogleImagesSearch query={socialSearch} results={googleImageResults} onSearch={searchGoogleImages} googleImageSearched={googleImageSearched} onOpen={setExternalViewer} onFavorite={(item)=>favoriteExternal(item,'image')} onAlbum={albumExternal} onPublish={(item)=>publishExternalToComposer(item,'image')} /> :
socialEmbedded==='Google Search' ? <div className="bg-white p-4"><iframe title="Google Search" src={socialUrl||'https://www.google.com/search?igu=1'} className="h-[720px] w-full border-0"/><a href={socialUrl} target="_blank" rel="noreferrer" className="mt-2 block text-center text-xs font-bold text-teal-700">فتح النتائج إذا منعت Google العرض داخل SB1</a></div> :
         socialEmbedded==='Yandex Search' ? <div className="bg-white p-4"><div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">{externalResults.map((item:any)=><article key={item.id||item.url} className="overflow-hidden rounded-xl border bg-white"><button onClick={()=>setExternalViewer(item)} className="block w-full text-right"><div className="aspect-video overflow-hidden bg-slate-100">{item.thumbnail||item.image?<img src={item.thumbnail||item.image} alt="" className="h-full w-full object-cover"/>:<div className="grid h-full place-items-center text-xs text-slate-400">محتوى</div>}</div><div className="p-2"><b className="line-clamp-2 text-xs">{item.title||'محتوى'}</b><span className="mt-1 block truncate text-[10px] text-slate-400">{item.author||socialEmbedded}</span></div></button><div className="flex flex-wrap gap-1 border-t p-2"><button onClick={()=>favoriteExternal(item,item.thumbnail||item.image?'image':'video')} className="rounded-lg bg-teal-50 px-2 py-1 text-[10px] font-bold text-teal-700">مفضلتي</button><button onClick={()=>albumExternal(item)} className="rounded-lg bg-indigo-50 px-2 py-1 text-[10px] font-bold text-indigo-700">ألبوم</button><button onClick={()=>publishExternalToComposer(item,item.thumbnail||item.image?'image':'video')} className="rounded-lg bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-700">نشر</button></div></article>)}</div>{!externalResults.length&&<div className="py-10 text-center text-xs text-slate-500">لا توجد نتائج. اكتب البحث في الخانة الرئيسية واضغط «بحث».</div>}</div> :
         socialEmbedded==='YouTube' ? <div className="bg-white p-4"><p className="mb-3 text-xs text-slate-500">استخدم خانة البحث الرئيسية أعلى المنصات، ثم اضغط بحث.</p>{youtubeResults.length>0&&<div className="mt-4 space-y-3">{youtubeResults.map((item:any)=><article key={item.id} className="overflow-hidden rounded-xl border bg-slate-50"><div className="grid gap-3 p-3 md:grid-cols-[180px_1fr]"><img src={item.thumbnail} alt="" className="h-28 w-full rounded-lg object-cover bg-slate-900"/><div className="min-w-0"><b className="line-clamp-2 text-sm">{item.title}</b><p className="mt-1 text-[11px] text-slate-500">{item.channelTitle}</p><div className="mt-2 flex flex-wrap gap-1"><button onClick={()=>{setSocialEmbedded(item.embedUrl);}} className="rounded-lg bg-slate-900 px-2 py-1 text-[10px] font-bold text-white">معاينة</button><button onClick={()=>favoriteExternal({id:'youtube-'+item.id,title:item.title,description:item.description,url:item.url,embedUrl:item.embedUrl,thumbnail:item.thumbnail,source:'YouTube'},'video')} className="rounded-lg bg-teal-50 px-2 py-1 text-[10px] font-bold text-teal-700">مفضلتي</button><button onClick={()=>albumExternal({id:'youtube-'+item.id,title:item.title,url:item.url,embedUrl:item.embedUrl,thumbnail:item.thumbnail,source:'YouTube'})} className="rounded-lg bg-indigo-50 px-2 py-1 text-[10px] font-bold text-indigo-700">ألبوم</button><button onClick={()=>publishExternalToComposer(item,'reel')} className="rounded-lg bg-emerald-600 px-2 py-1 text-[10px] font-bold text-white">نشر Reel</button><button onClick={()=>publishExternalToComposer(item,'video')} className="rounded-lg bg-blue-600 px-2 py-1 text-[10px] font-bold text-white">منشور فيديو</button><button onClick={()=>publishExternalToComposer(item,'story')} className="rounded-lg bg-amber-500 px-2 py-1 text-[10px] font-bold text-white">قصة</button></div></div></div></article>)}</div>}{/^https:\/\/www\.youtube\.com\/embed\//.test(socialEmbedded)&&<div className="mt-4"><iframe title="YouTube" src={socialEmbedded} className="h-[520px] w-full border-0 bg-black"/><div className="mt-2 flex flex-wrap gap-2"><button onClick={()=>favoriteExternal({id:'youtube-embed-'+socialEmbedded,title:'YouTube video',embedUrl:socialEmbedded,url:socialEmbedded,resourceType:'video',source:'YouTube'},'video')} className="rounded-lg bg-teal-50 px-3 py-2 text-xs font-bold text-teal-700">مفضلتي</button><button onClick={()=>albumExternal({id:'youtube-embed-'+socialEmbedded,title:'YouTube video',embedUrl:socialEmbedded,url:socialEmbedded,resourceType:'video',source:'YouTube'})} className="rounded-lg bg-indigo-50 px-3 py-2 text-xs font-bold text-indigo-700">ألبوم</button><button onClick={()=>{const idm=socialEmbedded.split('/').pop();if(idm)publishExternal({id:idm,title:'YouTube video',embedUrl:socialEmbedded,url:'https://www.youtube.com/watch?v='+idm,resourceType:'video'},'reel')}} className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white">نشر كـ Reel</button><button onClick={()=>{const idm=socialEmbedded.split('/').pop();if(idm)publishExternal({id:idm,title:'YouTube video',embedUrl:socialEmbedded,url:'https://www.youtube.com/watch?v='+idm,resourceType:'video'},'video')}} className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-bold text-white">نشر فيديو</button><button onClick={()=>{const idm=socialEmbedded.split('/').pop();if(idm)publishExternal({id:idm,title:'YouTube video',embedUrl:socialEmbedded,url:'https://www.youtube.com/watch?v='+idm,resourceType:'video'},'story')}} className="rounded-lg bg-amber-500 px-3 py-2 text-xs font-bold text-white">قصة</button></div></div>}</div> :
         socialEmbedded==='Rutube' ? <div className="bg-white p-4"><p className="text-xs text-slate-500">استخدم خانة البحث الرئيسية أعلى المنصات. لفتح فيديو Rutube، أدخل رابطه في خانة البحث الرئيسية.</p><button onClick={()=>{const m=socialSearch.match(/(?:video|play)\/(?:embed\/)?([\w-]+)/i);if(m)setSocialEmbedded('https://rutube.ru/play/embed/'+m[1])}} className="mt-2 rounded-xl bg-teal-700 px-4 py-2 text-sm font-bold text-white">فتح</button>{socialEmbedded.startsWith('https://rutube.ru/')&&<iframe title="Rutube" src={socialEmbedded} className="mt-4 h-[520px] w-full border-0 bg-black"/>}</div> :
         socialEmbedded==='OK' ? <div className="bg-white p-4"><div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">{externalResults.map((item:any)=><article key={item.id||item.url} className="overflow-hidden rounded-xl border bg-white"><button onClick={()=>setExternalViewer(item)} className="block w-full text-right"><div className="aspect-video overflow-hidden bg-slate-100">{item.thumbnail||item.image?<img src={item.thumbnail||item.image} alt="" className="h-full w-full object-cover"/>:<div className="grid h-full place-items-center text-xs text-slate-400">محتوى</div>}</div><div className="p-2"><b className="line-clamp-2 text-xs">{item.title||'محتوى'}</b><span className="mt-1 block truncate text-[10px] text-slate-400">{item.author||socialEmbedded}</span></div></button><div className="flex flex-wrap gap-1 border-t p-2"><button onClick={()=>favoriteExternal(item,item.thumbnail||item.image?'image':'video')} className="rounded-lg bg-teal-50 px-2 py-1 text-[10px] font-bold text-teal-700">مفضلتي</button><button onClick={()=>albumExternal(item)} className="rounded-lg bg-indigo-50 px-2 py-1 text-[10px] font-bold text-indigo-700">ألبوم</button><button onClick={()=>publishExternalToComposer(item,item.thumbnail||item.image?'image':'video')} className="rounded-lg bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-700">نشر</button></div></article>)}</div>{!externalResults.length&&<div className="py-10 text-center text-xs text-slate-500">لا توجد نتائج. اكتب البحث في الخانة الرئيسية واضغط «بحث».</div>}</div> :
         <iframe title="social-platform" src={socialEmbedded} className="h-[720px] w-full border-0 bg-white" referrerPolicy="strict-origin-when-cross-origin"/>}
      </div>}
    </section>)}

    {show('phone') && (<section id="fb-phone" className="rounded-xl border bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between"><div><h2 className="text-xl font-extrabold">الهاتف وQR</h2><p className="text-xs text-slate-500">الرقم خاص بالحساب.</p></div><QrCode className="text-teal-700"/></div>
      {canManage&&<div className="grid gap-5 md:grid-cols-2">
  <div>
    <label className="text-sm font-bold">رقم الهاتف</label>
    <input value={phone} onChange={e=>setPhone(e.target.value)} className="mt-2 w-full rounded-xl border p-3" placeholder="+49 ..."/>
    <div className="mt-2 flex flex-wrap gap-2">
      <button onClick={()=>{const value=phone.trim();if(!value){setNotice('اكتب رقم الهاتف أولاً.');return}localStorage.setItem('sb1_private_phone',value);setPhone(value);setNotice('تم حفظ رقم الهاتف على هذا الحساب.')}} className="rounded-lg bg-teal-700 px-4 py-2 text-sm font-bold text-white active:bg-teal-800">حفظ الرقم</button>
      <button onClick={()=>{const value=phone.trim();if(!value){setNotice('اكتب رقم الهاتف أولاً.');return}localStorage.setItem('sb1_private_phone',value);localStorage.setItem('sb1_phone_linked','true');localStorage.setItem('sb1_phone_linked_at',new Date().toISOString());setPhoneLinked(true);setNotice('تم ربط الهاتف بهذا الحساب.')}} className="rounded-lg border px-4 py-2 text-sm font-bold active:bg-slate-200">{phoneLinked?'الهاتف مربوط ✓':'ربط الهاتف'}</button>
      <button onClick={()=>{navigator.clipboard?.writeText(pairCode);setNotice('تم نسخ رمز الربط.')}} className="rounded-lg border px-4 py-2 text-sm font-bold active:bg-slate-200">نسخ رمز الربط</button>
    </div>
    <div className="mt-3 rounded-xl bg-slate-50 p-3 text-xs">رمز الربط: <b className="tracking-widest">{pairCode}</b><span className="mt-1 block text-slate-500">استخدم الرمز مع QR لربط الهاتف بهذا الحساب.</span></div>
  </div>
  <div className="grid place-items-center rounded-xl bg-slate-50 p-4">
    <img src={'https://api.qrserver.com/v1/create-qr-code/?size=240x240&data='+encodeURIComponent((typeof window!=='undefined'?window.location.href.split('?')[0]:'' )+'?pair='+pairCode)} alt="QR ربط الهاتف" className="h-48 w-48 rounded-xl bg-white p-2"/>
    <span className="mt-2 text-xs text-center">QR حقيقي يفتح صفحة الحساب الحالية مع رمز الربط.</span>
    <button onClick={()=>{try{navigator.share?.({title:'SB1',text:'رمز ربط الهاتف',url:(typeof window!=='undefined'?window.location.href.split('?')[0]:'')+'?pair='+pairCode});setNotice('تم فتح مشاركة QR.')}catch{setNotice('يمكنك مسح QR بالكاميرا لمتابعة الربط.')}}} className="mt-2 rounded-lg bg-teal-50 px-3 py-2 text-xs font-bold text-teal-700">مشاركة رابط QR</button>
  </div>
</div>}
    </section>) }

    {canManage&&show('clone')&&(<section id="fb-clone" className="rounded-xl border bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between"><div><h2 className="text-xl font-extrabold">Clone / Gift</h2><p className="text-xs text-slate-500">ينسخ نوع الحساب والعدد فقط، ثم يمكن تغيير الاسم والصلاحيات.</p></div><Wand2 className="text-teal-700"/></div>
      <div className="grid gap-3 md:grid-cols-4"><select value={cloneType} onChange={e=>setCloneType(e.target.value)} className="rounded-xl border p-3"><option value="client">عميل</option><option value="institution">مؤسسة</option><option value="specialist">أخصائي</option><option value="delivery_worker">عامل توصيل</option><option value="service">خدمات أخرى</option><option value="admin">إداري</option></select><input type="number" min={1} max={50} value={cloneCount} onChange={e=>setCloneCount(Number(e.target.value))} className="rounded-xl border p-3"/><input value={cloneName} onChange={e=>setCloneName(e.target.value)} className="rounded-xl border p-3" placeholder="اسم الصفحة"/><input type="date" value={cloneExpiry} onChange={e=>setCloneExpiry(e.target.value)} className="rounded-xl border p-3"/></div>
      <div className="mt-4 rounded-xl border bg-slate-50 p-4"><div className="mb-3 flex flex-wrap items-center justify-between gap-2"><b>صلاحيات الصفحة المستنسخة — اختر فقط ما تسمح به</b><div className="flex gap-2"><button onClick={()=>setClonePermissions(allPermissionKeys)} className="rounded-lg bg-teal-700 px-3 py-1 text-xs font-bold text-white">تفعيل الكل</button><button onClick={()=>setClonePermissions([])} className="rounded-lg bg-white px-3 py-1 text-xs font-bold">إلغاء الكل</button></div></div>
        <div className="grid gap-3 md:grid-cols-2">{permissionGroups.map(group=><div key={group.title} className="rounded-xl bg-white p-3"><b className="text-sm">{group.title}</b><div className="mt-2 space-y-2">{group.items.map(([key,label])=><label key={key} className="flex items-center gap-2 text-xs"><input type="checkbox" checked={clonePermissions.includes(key)} onChange={e=>setClonePermissions(v=>e.target.checked?[...v,key]:v.filter(x=>x!==key))} className="h-4 w-4"/>{label}</label>)}</div></div>)}</div>
      </div>
      <button onClick={makeClones} className="mt-3 rounded-xl bg-teal-700 px-5 py-2 font-bold text-white">إنشاء الصفحة بالصلاحيات المحددة</button>
      {clones.slice(0,8).map(c=><div key={c.id} className="mt-3 rounded-xl border p-3"><div className="flex justify-between"><b>{c.name}</b><span className="text-xs">{c.type}</span></div><div className="mt-2 text-xs">PIN: <b>{c.pin}</b> • كلمة المرور: <b>{c.password}</b> • <span>الصلاحية حتى: <b>{c.expires||'بدون انتهاء'}</b></span></div><div className="mt-2 flex flex-wrap gap-2"><a href={c.link} target="_blank" rel="noreferrer" className="max-w-full truncate rounded-lg bg-slate-50 px-3 py-2 text-xs font-bold text-teal-700 underline">{c.link}</a><button onClick={()=>navigator.clipboard.writeText(c.link)} className="rounded-lg border px-3 py-2 text-xs font-bold" title="نسخ رابط الصفحة">نسخ الرابط</button></div><button onClick={()=>setShare({title:c.name+' | PIN '+c.pin, url:c.link})} className="mt-2 rounded-lg bg-teal-700 px-3 py-2 text-xs font-bold text-white"><Gift className="inline h-4 w-4 ml-1"/> إرسال</button></div>)}
    </section>) }

    {canManage&&show('settings')&&(<section id="fb-settings" className="rounded-xl border bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between"><div><h2 className="text-xl font-extrabold">إعدادات الصفحة والحساب</h2><p className="mt-1 text-xs text-slate-500">إدارة الخصوصية والمحتوى والإشعارات والوسائط والأمان.</p></div><Settings className="text-teal-700"/></div>
      <div className="mt-5 grid gap-2 sm:grid-cols-3 lg:grid-cols-6">{[['account','الحساب'],['privacy','الخصوصية'],['content','المحتوى'],['notifications','الإشعارات'],['media','الوسائط'],['security','الأمان']].map(([k,l])=><button key={k} onClick={()=>setSettingsSection(k)} className={'rounded-xl border px-3 py-3 text-sm font-bold active:bg-slate-200 '+(settingsSection===k?'bg-teal-700 text-white':'bg-white')}>{l}</button>)}</div>
      <div className="mt-5 rounded-2xl border bg-slate-50 p-5">
        {settingsSection==='account'&&<div className="grid gap-4 md:grid-cols-2"><label className="text-sm font-bold">اسم الصفحة<input value={pageName} readOnly className="mt-2 w-full rounded-xl border bg-white p-3"/></label><label className="text-sm font-bold">لغة الحساب<select value={pageSettings.language} onChange={e=>setPageSettings((s:any)=>({...s,language:e.target.value}))} className="mt-2 w-full rounded-xl border bg-white p-3"><option value="ar">العربية</option><option value="en">English</option><option value="de">Deutsch</option><option value="ru">Русский</option></select></label></div>}
        {settingsSection==='privacy'&&<div className="space-y-3">{[['public','الصفحة عامة'],['showFollowers','إظهار المتابعين'],['showCertificates','إظهار الشهادات للعامة'],['showCourses','إظهار الدورات للعامة'],['showArticles','إظهار المقالات للعامة'],['showVideos','إظهار الفيديوهات للعامة'],['showRecordings','إظهار التسجيلات للعامة'],['showPosts','إظهار المنشورات للعامة'],['showDiary','إظهار المفكرة للعامة'],['allowComments','السماح بالتعليقات'],['allowMessages','السماح بالرسائل']].map(([k,l])=><label key={k} className="flex items-center justify-between rounded-xl bg-white p-4 text-sm font-bold"><span>{l}</span><input type="checkbox" checked={!!(pageSettings as any)[k]} onChange={e=>setPageSettings((s:any)=>({...s,[k]:e.target.checked}))} className="h-5 w-5"/></label>)}</div>}
        {settingsSection==='content'&&<div className="space-y-3">{[['allowStories','السماح بالقصص'],['autoPlayMedia','تشغيل الوسائط عند المرور']].map(([k,l])=><label key={k} className="flex items-center justify-between rounded-xl bg-white p-4 text-sm font-bold"><span>{l}</span><input type="checkbox" checked={!!(pageSettings as any)[k]} onChange={e=>setPageSettings((s:any)=>({...s,[k]:e.target.checked}))} className="h-5 w-5"/></label>)}</div>}
        {settingsSection==='notifications'&&<div className="space-y-3">{[['notifyBookings','إشعارات الحجوزات'],['notifyQuestions','إشعارات الأسئلة'],['notifyLikes','إشعارات الإعجابات'],['notifyMessages','إشعارات الرسائل'],['notifyFollowers','إشعارات المتابعين'],['notifySystem','إشعارات النظام']].map(([k,l])=><label key={k} className="flex items-center justify-between rounded-xl bg-white p-4 text-sm font-bold"><span>{l}</span><input type="checkbox" checked={!!(pageSettings as any)[k]} onChange={e=>setPageSettings((s:any)=>({...s,[k]:e.target.checked}))} className="h-5 w-5"/></label>)}</div>}
        {settingsSection==='media'&&<div className="grid gap-3 md:grid-cols-2"><div className="rounded-xl bg-white p-4"><b>التشغيل عند المرور</b><p className="mt-1 text-xs text-slate-500">الفيديو والريلز والقصة يبدأ بعد الوقوف لمدة ثانية.</p><button onClick={()=>setPageSettings((s:any)=>({...s,autoPlayMedia:!s.autoPlayMedia}))} className="mt-3 rounded-lg bg-teal-50 px-3 py-2 text-xs font-bold text-teal-700">{pageSettings.autoPlayMedia?'مفعل':'متوقف'}</button></div><div className="rounded-xl bg-white p-4"><b>الملفات</b><p className="mt-1 text-xs text-slate-500">رفع الصور والفيديو والصوت والملفات داخل الألبومات.</p><span className="mt-3 inline-block rounded-lg bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700">متاح</span></div></div>}
        {settingsSection==='security'&&<div className="space-y-3"><div className="rounded-xl bg-white p-4"><b>الخصوصية والحماية</b><p className="mt-1 text-xs text-slate-500">يمكنك التحكم في ظهور المحتوى العام، وحماية المحتوى الخاص، وإدارة صلاحيات المالك والمشرف.</p></div><div className="rounded-xl bg-white p-4"><b>المحتوى الخاص</b><p className="mt-1 text-xs text-slate-500">المحتوى المدفوع أو الخاص لا يظهر للعامة إلا وفق صلاحيات المشاهدة والشراء.</p></div></div>}
        <button onClick={()=>{localStorage.setItem('sb1_page_settings_'+pageId,JSON.stringify(pageSettings));window.dispatchEvent(new Event('sb1-settings-change'));setNotice('تم حفظ إعدادات الصفحة.')}} className="mt-4 rounded-xl bg-teal-700 px-5 py-3 font-bold text-white">حفظ الإعدادات</button>
      </div>
    </section>)}

    {storyComposer&&<div className="fixed inset-0 z-[200] grid place-items-center bg-black/60 p-3 sm:p-4" onClick={()=>setStoryComposer(false)}><div className="w-full max-w-md max-h-[82vh] overflow-y-auto rounded-2xl bg-white p-4 shadow-2xl" onClick={e=>e.stopPropagation()}><div className="flex items-center justify-between"><h3 className="text-lg font-extrabold">إنشاء قصة</h3><button onClick={()=>setStoryComposer(false)}><X/></button></div><textarea value={storyText} onChange={e=>setStoryText(e.target.value)} className="mt-3 min-h-20 w-full rounded-xl border bg-slate-50 p-3 text-sm" placeholder="اكتب ما تريد في قصتك..."/><div className="mt-3 grid grid-cols-4 gap-1 rounded-xl bg-slate-100 p-1">{([['media','الوسائط',Film],['emoji','Emoji',Smile],['gif','GIF',Film],['sticker','Sticker',Sticker]] as any[]).map(([k,l,I])=><button key={k} onClick={()=>setStoryComposerPanel(k)} className={'rounded-lg px-2 py-2 text-[11px] font-bold '+(storyComposerPanel===k?'bg-white shadow text-teal-700':'text-slate-600')}><I className="mx-auto mb-1 h-4 w-4"/>{l}</button>)}</div>{storyComposerPanel==='media'&&<><div className="mt-3 flex flex-wrap gap-1 text-[11px] font-bold">{([['library','المكتبة'],['favorites','مفضلتي'],['albums','ألبوماتي']] as any[]).map(([k,l])=><button key={k} onClick={()=>setStoryMediaSource(k)} className={'rounded-lg px-3 py-2 '+(storyMediaSource===k?'bg-teal-700 text-white':'bg-slate-100')}>{l}</button>)}<label className="cursor-pointer rounded-lg bg-slate-100 px-3 py-2"><Upload className="inline h-3 w-3 ml-1"/> من الجهاز<input type="file" accept="image/*,video/*,audio/*,.gif" className="hidden" onChange={e=>{const f=e.target.files?.[0];if(f)addMediaFile(f,true)}}/></label></div>{mediaButtons(true)}{storySelectedMedia&&<>{previewSelected(storySelectedMedia,storyMediaStart,storyMediaEnd)}{(storySelectedMedia.kind==='video'||storySelectedMedia.kind==='audio')&&<div className="mt-2 grid grid-cols-2 gap-2"><label className="rounded-lg border p-2 text-[10px] font-bold">بداية المقطع<input type="range" min="0" max="120" value={storyMediaStart} onChange={e=>setStoryMediaStart(Number(e.target.value))} className="w-full"/></label><label className="rounded-lg border p-2 text-[10px] font-bold">نهاية المقطع<input type="range" min="0" max="120" value={storyMediaEnd||120} onChange={e=>setStoryMediaEnd(Number(e.target.value))} className="w-full"/></label></div>}</>}</>}{storyComposerPanel==='emoji'&&<div className="mt-3 grid max-h-40 grid-cols-8 gap-1 overflow-y-auto rounded-xl border p-2">{stickerSet.map(x=><button key={x} onClick={()=>addTextEmoji(x,true)} className="rounded-lg p-2 text-xl">{x}</button>)}</div>}{storyComposerPanel==='gif'&&<div className="mt-3">{gifSet.length?mediaButtons(true):<label className="block cursor-pointer rounded-xl border border-dashed p-4 text-center text-xs font-bold">+ إضافة GIF<input type="file" accept="image/gif" className="hidden" onChange={e=>{const f=e.target.files?.[0];if(f)addMediaFile(f,true)}}/></label>}</div>}{storyComposerPanel==='sticker'&&<div className="mt-3 grid max-h-40 grid-cols-5 gap-2 overflow-y-auto rounded-xl border p-2">{stickerSet.slice(0,20).map(x=><button key={x} onClick={()=>addTextEmoji(x,true)} className="rounded-xl bg-slate-50 p-3 text-2xl">{x}</button>)}<label className="grid cursor-pointer place-items-center rounded-xl border border-dashed p-3 text-xs font-bold">+ Sticker<input type="file" accept="image/*,.webp,.gif" className="hidden" onChange={e=>{const f=e.target.files?.[0];if(f)addMediaFile(f,true)}}/></label></div>}<button onClick={createStory} className="mt-3 w-full rounded-lg bg-teal-700 px-4 py-3 font-bold text-white">نشر القصة</button></div></div>}
    {composer&&<MediaPublishWizard open={composer} onClose={()=>{setComposer(false);setWizardInitialMedia(null)}} onPublish={publishWizard} pageId={pageId} initialMedia={wizardInitialMedia||undefined}/>}\n    {storyViewer&&<div className="fixed inset-0 z-[210] grid place-items-center bg-black/80 p-4" onClick={()=>setStoryViewer(null)}><div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-slate-950 text-white" onClick={e=>e.stopPropagation()}><button onClick={()=>setStoryViewer(null)} className="absolute left-3 top-3 z-10 rounded-full bg-black/50 p-2"><X/></button>{storyViewer.mediaUrl ? (storyViewer.mediaKind==='video' ? <video src={storyViewer.mediaUrl} controls autoPlay className="max-h-[72vh] w-full bg-black object-contain"/> : <img src={storyViewer.mediaUrl} alt="" className="max-h-[72vh] w-full object-contain"/>) : <div className="grid min-h-[60vh] place-items-center p-8 text-center text-2xl font-extrabold">{storyViewer.text}</div>}<div className="flex items-center justify-between p-4"><div><b>{storyViewer.name}</b><p className="text-xs opacity-70">{storyViewer.text}</p></div><div className="flex gap-2">{<button onClick={()=>saveStoryToFavorites(storyViewer)} className="rounded-lg bg-white/10 px-3 py-2 text-xs font-bold active:bg-white/20"><Bookmark className="inline h-4 w-4 ml-1"/>حفظ</button>}{storyViewer.own&&<button onClick={()=>deleteStory(storyViewer)} className="rounded-lg bg-red-600 px-3 py-2 text-xs font-bold"><Trash2 className="inline h-4 w-4 ml-1"/>حذف</button>}</div></div></div></div>}

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

    {albumViewer&&<div className="fixed inset-0 z-[180] grid place-items-center bg-black/70 p-4" onClick={()=>setAlbumViewer(null)}><div className="w-full max-w-5xl max-h-[90vh] overflow-hidden rounded-2xl bg-white" onClick={e=>e.stopPropagation()}><div className="flex items-center justify-between border-b p-4"><div><b>{albumViewer.name}</b><span className="ms-2 text-xs text-slate-400">{albumViewer.items?.length||0} عنصر</span></div><button onClick={()=>setAlbumViewer(null)}><X/></button></div><div className="grid max-h-[80vh] md:grid-cols-[1fr_280px]"><div className="grid min-h-[420px] place-items-center bg-slate-950 p-4">{albumViewer.items?.[0]?.kind==='image'?<img src={albumViewer.items[0].mediaUrl} className="max-h-[65vh] max-w-full object-contain" alt=""/>:albumViewer.items?.[0]?.kind==='video'?<video src={albumViewer.items[0].mediaUrl} controls className="max-h-[65vh] max-w-full"/>:albumViewer.items?.[0]?.kind==='audio'?<audio src={albumViewer.items[0].mediaUrl} controls className="w-full max-w-xl"/>:<div className="text-white">{albumViewer.items?.[0]?.mediaName||'ملف'}</div>}</div><div className="overflow-y-auto border-s bg-white p-3"><label className="mb-3 flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-teal-50 px-3 py-3 text-sm font-bold text-teal-700"><Upload className="h-4 w-4"/>إضافة من الجهاز<input type="file" multiple className="hidden" onChange={async e=>{const files=Array.from(e.target.files||[]);for(const f of files){await addUploadedToAlbum(albumViewer.id,f);setAlbumViewer({...albumViewer,items:[{id:id(),kind:albumItemKind(f),text:f.name,mediaName:f.name,mediaUrl:'',createdAt:new Date().toISOString()},...(albumViewer.items||[])]})}}}/></label>{(albumViewer.items||[]).map((x:any)=><button key={x.id} onClick={()=>setAlbumViewer({...albumViewer,items:[x,...(albumViewer.items||[]).filter((y:any)=>y.id!==x.id)]})} className="mb-2 flex w-full items-center gap-2 rounded-xl border p-2 text-right"><span className="h-12 w-12 overflow-hidden rounded-lg bg-slate-100">{x.kind==='image'&&x.mediaUrl?<img src={x.mediaUrl} className="h-full w-full object-cover" alt=""/>:<span className="grid h-full place-items-center text-[9px]">{x.kind}</span>}</span><span className="min-w-0 truncate text-xs font-bold">{x.mediaName||x.text}</span></button>)}</div></div></div></div>}
    {likesViewer&&canManage&&<div className="fixed inset-0 z-[185] grid place-items-center bg-black/60 p-4" onClick={()=>setLikesViewer(null)}><div className="w-full max-w-md rounded-2xl bg-white p-5" onClick={e=>e.stopPropagation()}><div className="flex items-center justify-between"><b>من وضع الإعجاب</b><button onClick={()=>setLikesViewer(null)}><X/></button></div><div className="mt-4 space-y-2">{(likesViewer.likedBy||[]).map((u,i)=><div key={i} className="flex items-center gap-3 rounded-xl border p-3"><img src={u.photo||'https://api.dicebear.com/9.x/personas/svg?seed='+encodeURIComponent(u.name)} className="h-9 w-9 rounded-full object-cover" alt=""/><b>{u.name}</b></div>)}{!(likesViewer.likedBy||[]).length&&<p className="py-8 text-center text-sm text-slate-500">لم يسجل إعجاب من هذا الحساب بعد.</p>}</div></div></div>}
    {albumModal&&!albumPicker&&<div className="fixed inset-0 z-[140] grid place-items-center bg-black/60 p-4" onClick={()=>setAlbumModal(false)}><div className="w-full max-w-md rounded-2xl bg-white p-5" onClick={e=>e.stopPropagation()}><div className="flex items-center justify-between"><b className="text-lg">إنشاء ألبوم</b><button onClick={()=>setAlbumModal(false)}><X/></button></div><input autoFocus value={albumName} onChange={e=>setAlbumName(e.target.value)} onKeyDown={e=>e.key==='Enter'&&createAlbum()} className="mt-4 w-full rounded-xl border p-3" placeholder="اسم الألبوم الجديد"/><div className="mt-3 grid grid-cols-2 gap-2"><select value={albumType} onChange={e=>setAlbumType(e.target.value as any)} className="rounded-xl border p-3 text-sm"><option value="all">الكل</option><option value="images">صور</option><option value="videos">فيديو</option><option value="audio">صوت</option><option value="files">ملفات</option></select><button onClick={()=>setNotice('بعد إنشاء الألبوم يمكنك مشاركته للعامة من بطاقة الألبوم.')} className="rounded-xl border p-3 text-sm font-bold">مشاركة عامة</button></div><button onClick={createAlbum} className="mt-3 w-full rounded-xl bg-teal-700 py-3 font-bold text-white active:bg-teal-800">حفظ الألبوم</button></div></div>}
    {albumPicker&&<div className="fixed inset-0 z-[140] grid place-items-center bg-black/60 p-4" onClick={()=>setAlbumPicker(null)}><div className="w-full max-w-md rounded-2xl bg-white p-5" onClick={e=>e.stopPropagation()}>{albumModal?<><div className="flex items-center justify-between"><b>إنشاء ألبوم جديد</b><button onClick={()=>setAlbumModal(false)} title="رجوع"><X/></button></div><p className="mt-2 text-xs text-slate-500">بعد الحفظ سيُضاف المحتوى الحالي إلى الألبوم تلقائياً.</p><input autoFocus value={albumName} onChange={e=>setAlbumName(e.target.value)} onKeyDown={e=>e.key==='Enter'&&createAlbum()} className="mt-4 w-full rounded-xl border p-3" placeholder="اسم الألبوم الجديد"/><div className="mt-3 grid grid-cols-2 gap-2"><select value={albumType} onChange={e=>setAlbumType(e.target.value as any)} className="rounded-xl border p-3 text-sm"><option value="all">الكل</option><option value="images">صور</option><option value="videos">فيديو</option><option value="audio">صوت</option><option value="files">ملفات</option></select></div><button onClick={createAlbum} className="mt-3 w-full rounded-xl bg-teal-700 py-3 font-bold text-white">حفظ وإضافة المحتوى</button></>:<><div className="flex items-center justify-between"><b>إضافة إلى ألبوم</b><button onClick={()=>setAlbumPicker(null)}><X/></button></div>{albums.length===0?<p className="py-6 text-center text-sm text-slate-500">لا توجد ألبومات بعد.</p>:<div className="mt-4 space-y-2">{albums.map(a=><button key={a.id} onClick={()=>addToAlbum(albumPicker,a.id)} className="flex w-full items-center justify-between rounded-xl border p-3 text-right hover:bg-slate-50 active:bg-slate-100"><b>{a.name}</b><span className="text-xs text-slate-400">{a.items?.length||0}</span></button>)}</div>}<button onClick={()=>setAlbumModal(true)} className="mt-3 w-full rounded-xl bg-slate-100 py-3 font-bold active:bg-slate-200">+ إضافة ألبوم</button></>}</div></div>}
    {externalViewer&&<div className="fixed inset-0 z-[220] grid place-items-center bg-black/75 p-4" onClick={()=>setExternalViewer(null)}><div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl" onClick={e=>e.stopPropagation()}><button onClick={()=>setExternalViewer(null)} className="absolute left-3 top-3 z-10 rounded-full bg-black/60 p-2 text-white"><X/></button><div className="bg-slate-950 p-3">{externalViewer.image||externalViewer.thumbnail?<img src={externalViewer.image||externalViewer.thumbnail} alt="" className="mx-auto max-h-[65vh] max-w-full object-contain"/>:externalViewer.embedUrl?<iframe title="معاينة المحتوى" src={externalViewer.embedUrl} className="h-[65vh] w-full border-0"/>:externalViewer.url?<iframe title="معاينة المحتوى" src={externalViewer.url} className="h-[65vh] w-full border-0"/>:<div className="grid h-64 place-items-center text-white">لا توجد معاينة</div>}</div><div className="p-4"><b className="block text-base">{externalViewer.title||'محتوى'}</b><span className="mt-1 block text-xs text-slate-500">{externalViewer.source||socialProvider}</span><div className="mt-3 flex flex-wrap gap-2"><button onClick={()=>favoriteExternal(externalViewer,externalViewer.image||externalViewer.thumbnail?'image':'video')} className="rounded-lg bg-teal-50 px-3 py-2 text-xs font-bold text-teal-700"><Bookmark className="inline h-4 w-4 ml-1"/>مفضلتي</button><button onClick={()=>albumExternal(externalViewer)} className="rounded-lg bg-indigo-50 px-3 py-2 text-xs font-bold text-indigo-700"><Album className="inline h-4 w-4 ml-1"/>إضافة إلى الألبومات</button><button onClick={()=>publishExternalToComposer(externalViewer,'reel')} className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white"><Send className="inline h-4 w-4 ml-1"/>نشر Reel</button><button onClick={()=>publishExternalToComposer(externalViewer,'video')} className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-bold text-white"><Video className="inline h-4 w-4 ml-1"/>منشور فيديو</button><button onClick={()=>publishExternalToComposer(externalViewer,'post')} className="rounded-lg bg-slate-700 px-3 py-2 text-xs font-bold text-white"><Send className="inline h-4 w-4 ml-1"/>منشور عادي</button><button onClick={()=>publishExternalToComposer(externalViewer,'story')} className="rounded-lg bg-amber-500 px-3 py-2 text-xs font-bold text-white"><ImageIcon className="inline h-4 w-4 ml-1"/>قصة</button></div></div></div></div>}
    {reelViewer&&<div className="fixed inset-0 z-[145] grid place-items-center bg-black/85 p-4" onClick={()=>setReelViewer(null)}><div className="relative w-full max-w-xl overflow-hidden rounded-2xl bg-black" onClick={e=>e.stopPropagation()}><button onClick={()=>setReelViewer(null)} className="absolute left-3 top-3 z-10 rounded-full bg-black/60 p-2 text-white"><X/></button>{reelViewer.mediaUrl?<video src={reelViewer.mediaUrl} controls autoPlay className="max-h-[80vh] w-full object-contain"/>:<div className="grid min-h-[65vh] place-items-center p-8 text-center text-2xl font-extrabold text-white">{reelViewer.text}</div>}<div className="flex items-center justify-between bg-slate-950 p-4 text-white"><div><b>{reelViewer.author}</b><p className="mt-1 text-xs text-slate-300">{reelViewer.text}</p></div><button onClick={()=>saveToFavorites(reelViewer)} className="rounded-lg bg-white/10 px-3 py-2 active:bg-white/20"><Bookmark className="inline h-4 w-4 ml-1"/>حفظ</button></div></div></div>}
    {notice&&<div className="fixed bottom-5 left-1/2 z-[130] -translate-x-1/2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white shadow-xl">{notice}<button onClick={()=>setNotice('')} className="mr-3"><CheckCircle2 className="inline h-4 w-4"/></button></div>}
  </div>;
}