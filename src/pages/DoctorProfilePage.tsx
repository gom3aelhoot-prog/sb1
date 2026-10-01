import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Home, Star, MapPin, Clock, MessageCircle, GraduationCap, Award, Heart, Users, FileText, Video, BookOpen, Send, BadgeCheck, PenLine, Share2, ExternalLink, Copy, Briefcase as BriefcaseIcon, Settings as SettingsIcon, Bookmark, Archive, Coins, Wallet, Bell, ShieldCheck, Library, Plus, X, Upload, CalendarDays as CalendarDaysIcon, CalendarClock } from 'lucide-react';
import { useRouter } from '@/lib/router';
import { getRole } from '@/lib/access';
import PageProfileTools from '@/components/PageProfileTools';
import FavoritesPage from '@/pages/FavoritesPage';
import { useI18n } from '@/lib/i18n';
import { supabase, type Doctor, type Question, type SpecialistPost, type PostComment, type Article, type DoctorAudio } from '@/lib/supabase';
import QuestionCard from '@/components/QuestionCard';
import { getAppointments } from '@/lib/appointments';
import { getDoctorAvailability } from '@/lib/appointmentConfig';
import { virtualDoctorsForSpecialty, virtualQuestionsForSpecialty, virtualArticlesForSpecialty, virtualAudioForSpecialty, virtualVideosForSpecialty, virtualCoursesForSpecialty } from '@/lib/catalog';
import { toggleSaved, isSaved, toggleLiked, isLiked, archiveItem, addComment, toggleFollowing, isFollowing as isFollowingVault, getSaved } from '@/lib/socialVault';

type Tab = 'home' | 'sessions' | 'articles' | 'questions' | 'recordings' | 'courses' | 'certificates' | 'portfolio';
type MainSection = 'home' | 'favorites' | 'albums' | 'social' | 'phone' | 'settings' | 'clone' | 'wallet' | 'work';


function StoryBar({pageId,canManage,pageAvatar,ownOnly=false}:{pageId:string;canManage:boolean;pageAvatar?:string;ownOnly?:boolean}) {
  type S={id:string;name:string;text:string;mediaUrl?:string;mediaKind?:'image'|'video';own?:boolean;authorPhoto?:string;expiresAt:string};
  const [stories,setStories]=useState<S[]>(()=>{try{return JSON.parse(localStorage.getItem('sb1_fb_stories_'+pageId)||'[]')}catch{return[]}});
  const [viewer,setViewer]=useState<S|null>(null),[compose,setCompose]=useState(false),[text,setText]=useState(''),[file,setFile]=useState<File|null>(null),[url,setUrl]=useState(''),[video,setVideo]=useState(false);
  useEffect(()=>{if(file){const u=URL.createObjectURL(file);setUrl(u)}else setUrl('')},[file]);
  useEffect(()=>{try{localStorage.setItem('sb1_fb_stories_'+pageId,JSON.stringify(stories))}catch{}},[stories,pageId]);
  const demo=['د. ليان','د. أحمد','مركز الحياة','سارة','محمد'];
  const demoImages=['https://randomuser.me/api/portraits/women/44.jpg','https://randomuser.me/api/portraits/men/32.jpg','https://randomuser.me/api/portraits/women/68.jpg','https://randomuser.me/api/portraits/men/75.jpg','https://randomuser.me/api/portraits/women/65.jpg'];
  const demoVideo='https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4';
  const visible=[...(ownOnly?stories.filter(s=>s.own):stories.filter(s=>new Date(s.expiresAt)>new Date())),...(ownOnly?[]:demo.map((name,i)=>({id:'story-demo-'+i,name,text:['معلومة جديدة','جلسة تعليمية','سؤال وجواب','فيديو جديد','تسجيل جديد'][i],mediaUrl:i===1||i===4?demoVideo:demoImages[i],mediaKind:i===1||i===4?'video':'image',expiresAt:new Date(Date.now()+86400000).toISOString()} as S)))];
  const [storyViews,setStoryViews]=useState<Record<string,number>>({});
  const storyHoverTimers=useRef<Record<string,number>>({});
  const storyHover=(storyId:string,videoEl?:HTMLVideoElement)=>{if(videoEl)videoEl.play().catch(()=>{});if(storyHoverTimers.current[storyId])return;storyHoverTimers.current[storyId]=window.setTimeout(()=>{setStoryViews(v=>({...v,[storyId]:(v[storyId]||0)+1}));delete storyHoverTimers.current[storyId]},1000)};
  const storyHoverStop=(storyId:string,videoEl?:HTMLVideoElement)=>{if(storyHoverTimers.current[storyId]){window.clearTimeout(storyHoverTimers.current[storyId]);delete storyHoverTimers.current[storyId]}if(videoEl){videoEl.pause();videoEl.currentTime=0}};
  const create=()=>{if(!text.trim()&&!url)return;const s:S={id:'story-'+Date.now(),name:'قصتي',text:text.trim(),mediaUrl:url||undefined,mediaKind:video?'video':'image',own:true,authorPhoto:pageAvatar,expiresAt:new Date(Date.now()+86400000).toISOString()};setStories(v=>[s,...v]);setText('');setFile(null);setCompose(false);setViewer(s)};
  return <>
    <div className="mb-1 bg-transparent p-0"><div className="flex gap-3 overflow-x-auto pb-1" dir="rtl">
      {canManage&&<button onClick={()=>setCompose(true)} className="min-w-[104px] overflow-hidden rounded-xl bg-slate-50"><div className="grid h-28 place-items-center bg-gradient-to-br from-teal-600 to-teal-800 text-white"><Plus className="h-8 w-8"/></div><div className="p-2 text-center text-xs font-bold">قصتك</div></button>}
      {visible.map(s=><button key={s.id} onClick={()=>setViewer(s)} className="min-w-[104px] overflow-hidden rounded-xl bg-white text-right"><div className="relative grid h-28 place-items-center overflow-hidden bg-slate-900 text-white">{s.mediaUrl?(s.mediaKind==='video'?<video src={s.mediaUrl} muted playsInline className="h-full w-full object-cover" onMouseEnter={e=>storyHover(s.id,e.currentTarget)} onMouseLeave={e=>storyHoverStop(s.id,e.currentTarget)}/>:<img src={s.mediaUrl} className="h-full w-full object-cover" alt=""/>):<span className="p-3 text-xs font-bold">{s.text}</span>}<span className="absolute bottom-2 right-2 rounded-full bg-white px-2 py-1 text-[10px] font-bold text-slate-800">{s.name}</span><span className="absolute bottom-2 left-2 rounded-full bg-black/55 px-2 py-1 text-[9px] font-bold text-white">{storyViews[s.id]||0} مشاهدة</span></div></button>)}
    </div></div>
    {compose&&<div className="fixed inset-0 z-[100] grid place-items-center bg-black/60 p-4" onClick={()=>setCompose(false)}><div className="w-full max-w-lg rounded-2xl bg-white p-5" onClick={e=>e.stopPropagation()}><div className="flex items-center justify-between"><b className="text-lg">قصتي</b><button onClick={()=>setCompose(false)}><X/></button></div><textarea value={text} onChange={e=>setText(e.target.value)} className="mt-4 min-h-28 w-full rounded-xl border p-3" placeholder="اكتب قصتك..."/><label className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-sm font-bold"><Upload className="h-4 w-4"/> صورة أو فيديو<input type="file" accept="image/*,video/*" className="hidden" onChange={e=>{const f=e.target.files?.[0]||null;setFile(f);setVideo(!!f?.type.startsWith('video/'))}}/></label><button onClick={create} className="mt-3 w-full rounded-xl bg-teal-700 py-3 font-bold text-white">نشر</button></div></div>}
    {viewer&&<div className="fixed inset-0 z-[110] grid place-items-center bg-black/80 p-4" onClick={()=>setViewer(null)}><div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-slate-950 text-white" onClick={e=>e.stopPropagation()}><button onClick={()=>setViewer(null)} className="absolute left-3 top-3 z-10 rounded-full bg-black/50 p-2"><X/></button>{viewer.mediaUrl?(viewer.mediaKind==='video'?<video src={viewer.mediaUrl} controls autoPlay className="max-h-[72vh] w-full bg-black object-contain"/>:<img src={viewer.mediaUrl} alt="" className="max-h-[72vh] w-full object-contain"/>):<div className="grid min-h-[55vh] place-items-center p-8 text-center text-2xl font-extrabold">{viewer.text}</div>}<div className="p-4"><b>{viewer.name}</b><p className="mt-1 text-xs opacity-70">{viewer.text}</p></div></div></div>}
  </>;
}

export default function DoctorProfilePage({ id }: { id: string }) {
  const { navigate } = useRouter();
  const role = getRole();
  const actualRole = typeof window !== 'undefined' ? localStorage.getItem('sb1_account_role') : null;
  const previewRole = typeof window !== 'undefined' ? localStorage.getItem('sb1_preview_role') : null;
  const accountUserId = typeof window !== 'undefined' ? localStorage.getItem('sb1_account_user_id') : null;
  const pageOwnerId = typeof window !== 'undefined' ? localStorage.getItem('sb1_page_owner_id') : null;
  const isAccountOwner = !previewRole && !!pageOwnerId && !!accountUserId && pageOwnerId === id && pageOwnerId === accountUserId;
  const isModerator = !previewRole && actualRole === 'moderator';
  const canManagePage = isAccountOwner || isModerator;
  const canSeePrivate = canManagePage;
  const { t, specialtyName, lang } = useI18n();
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [posts, setPosts] = useState<SpecialistPost[]>([]);
  const [diary, setDiary] = useState<{ id: string; title: string | null; body: string; created_at: string }[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [audios, setAudios] = useState<DoctorAudio[]>([]);
  const [comments, setComments] = useState<Record<string, PostComment[]>>({});
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [profileNavPinned, setProfileNavPinned] = useState(false);
  const profileNavPinY = useRef<number | null>(null);
  const profileTabsRef = useRef<HTMLDivElement | null>(null);
  const [mainSection, setMainSection] = useState<MainSection>('home');
  const [loading, setLoading] = useState(true);
  const [imgError, setImgError] = useState(false);
  const [coverUrl,setCoverUrl]=useState(()=>localStorage.getItem('sb1_cover_'+id)||'');
  const [coverChooser,setCoverChooser]=useState(false);
  const [showFollowers,setShowFollowers]=useState(false);
  const [unreadNotifications,setUnreadNotifications]=useState(()=>{const v=localStorage.getItem('sb1_unread_notifications');return v===null?3:Number(v||'0')});
  const [bellAnimating,setBellAnimating]=useState(false);
  const [notificationOpen,setNotificationOpen]=useState(false);
  const [notifications,setNotifications]=useState(()=>[
    {id:'n1',title:'جلسة جديدة',body:'تمت إضافة جلسة مجانية جديدة إلى صفحتك.',time:'منذ 5 دقائق',read:false},
    {id:'n2',title:'إعجاب جديد',body:'أحد المتابعين أعجب بأحد منشوراتك.',time:'منذ 12 دقيقة',read:false},
    {id:'n3',title:'سؤال جديد',body:'وصل سؤال جديد ويمكنك فتحه من قسم الأسئلة.',time:'منذ 20 دقيقة',read:false}
  ]);
  const [followers,setFollowers]=useState(()=>[
    {id:'catalog-doctor-ar-clinical-psychology-2',name:'د. ليان',online:true,photo:'https://randomuser.me/api/portraits/women/44.jpg'},
    {id:'catalog-doctor-ar-clinical-psychology-3',name:'د. أحمد',online:true,photo:'https://randomuser.me/api/portraits/men/32.jpg'},
    {id:'catalog-doctor-ar-clinical-psychology-4',name:'سارة',online:false,photo:'https://randomuser.me/api/portraits/women/68.jpg'},
    {id:'catalog-doctor-ar-clinical-psychology-5',name:'محمد',online:true,photo:'https://randomuser.me/api/portraits/men/75.jpg'},
    {id:'catalog-doctor-ar-clinical-psychology-6',name:'مركز الحياة',online:false,photo:'https://randomuser.me/api/portraits/women/65.jpg'},
  ]);
  const [isFollowing, setIsFollowing] = useState(()=>isFollowingVault(id));
  const profileAvatar = doctor?.photo_url || ('https://api.dicebear.com/9.x/personas/svg?seed=' + encodeURIComponent(id));
  const savedCoverImages=getSaved().filter(x=>x.kind==='image'&&x.url).map(x=>x.url as string);
  const selectMain=(section:MainSection)=>{setMainSection(section);setActiveTab('home');setTimeout(()=>document.getElementById('profile-tabs')?.scrollIntoView({behavior:'smooth',block:'start'}),0)};
  useEffect(()=>{
    const onNotification=()=>{setNotifications(v=>[{id:'n-'+Date.now(),title:'إشعار جديد',body:'لديك إشعار جديد في صفحة الأخصائي.',time:'الآن',read:false},...v]);setUnreadNotifications(v=>{const next=v+1;localStorage.setItem('sb1_unread_notifications',String(next));return next});setBellAnimating(true);window.setTimeout(()=>setBellAnimating(false),15000)};
    const onStorage=(e:StorageEvent)=>{if(e.key==='sb1_unread_notifications'){const next=Number(e.newValue||'0');if(next>unreadNotifications){setBellAnimating(true);window.setTimeout(()=>setBellAnimating(false),15000)}setUnreadNotifications(next)}};
    window.addEventListener('sb1:new-notification',onNotification as EventListener);window.addEventListener('storage',onStorage);return()=>{window.removeEventListener('sb1:new-notification',onNotification as EventListener);window.removeEventListener('storage',onStorage)};
  },[unreadNotifications]);
  useEffect(()=>{const t=window.setInterval(()=>setWorkNow(Date.now()),1000);return()=>window.clearInterval(t)},[]);
  useEffect(()=>{const sync=()=>{const items=getAppointments().filter(a=>a.doctorId===id&&(a.status==='accepted'||a.status==='pending')).map(a=>({id:a.id,title:'جلسة مع '+a.patientName,client:a.patientName,startsAt:a.scheduledAt?new Date(a.scheduledAt).getTime():0,endsAt:a.scheduledAt?new Date(a.scheduledAt).getTime()+a.durationMinutes*60000:0,status:a.status==='accepted'?'محجوزة':'بانتظار القبول'}));setWorkSessions(items)};sync();window.addEventListener('sb1-appointments-change',sync);return()=>window.removeEventListener('sb1-appointments-change',sync)},[id]);
  useEffect(()=>{
    const onBooking=(e:Event)=>{const d=(e as CustomEvent).detail||{};const item={id:d.id||'booking-'+Date.now(),title:d.title||'جلسة جديدة محجوزة',client:d.client||'متابع جديد',startsAt:d.startsAt||Date.now()+2*3600000,endsAt:d.endsAt||Date.now()+3*3600000,status:'محجوزة'};setWorkSessions(v=>{const n=[item,...v];localStorage.setItem('sb1_work_schedule_'+id,JSON.stringify(n));return n});setNotifications(v=>[{id:'booking-notification-'+Date.now(),title:'حجز جديد',body:'تم حجز موعد جلسة جديدة في جدول أعمالك.',time:'الآن',read:false},...v]);setUnreadNotifications(v=>{const n=v+1;localStorage.setItem('sb1_unread_notifications',String(n));return n});setBellAnimating(true);window.setTimeout(()=>setBellAnimating(false),15000)};
    window.addEventListener('sb1:booking-created',onBooking as EventListener);return()=>window.removeEventListener('sb1:booking-created',onBooking as EventListener)
  },[id]);
  const saveCover=(url:string)=>{setCoverUrl(url);localStorage.setItem('sb1_cover_'+id,url);setCoverChooser(false)};
  const [wallet,setWallet] = useState<any>({balance:0,points:0,due:0});
  const [walletLedger,setWalletLedger]=useState<any[]|null>(null);
  const [walletLedgerTitle,setWalletLedgerTitle]=useState('حركة المحفظة');
  useEffect(()=>{supabase.from('sb1_wallets').select('*').eq('account_key',localStorage.getItem('sb1_account_user_id')||'guest').maybeSingle().then(({data})=>{if(data)setWallet({balance:Number(data.balance||0),points:Number(data.rewards_points||0),due:0})})},[]);
  const [workNow,setWorkNow]=useState(Date.now());
  const openWalletLedger=async(kind:'points'|'due'|'balance')=>{const key=localStorage.getItem('sb1_account_user_id')||'guest';const [{data:walletTx},{data:creditTx},{data:penalties}]=await Promise.all([supabase.from('sb1_wallet_transactions').select('*').eq('account_key',key).order('created_at',{ascending:false}).limit(100),supabase.from('sb1_credit_transactions').select('*').eq('account_key',key).order('created_at',{ascending:false}).limit(100),supabase.from('provider_penalties').select('*').eq('provider_id',id).order('created_at',{ascending:false}).limit(100)]);let rows:any[]=[...(walletTx||[]).map(x=>({...x,source:'المحفظة',reason:x.description||x.transaction_type,value:x.amount,currency:x.currency_code||'USD'})),...(creditTx||[]).map(x=>({...x,source:'النقاط',reason:x.transaction_type,value:x.units, currency:'points'})),...(penalties||[]).map(x=>({...x,source:'العقوبات',reason:x.reason,value:-Math.abs(x.points||0),currency:'points'}))];if(kind==='points')rows=rows.filter(x=>x.currency==='points'||x.source==='النقاط'||x.source==='العقوبات');if(kind==='due')rows=rows.filter(x=>Number(x.value)<0||x.source==='العقوبات');setWalletLedgerTitle(kind==='points'?'عمليات النقاط والعقوبات':kind==='due'?'المستحقات والخصومات':'حركة الأموال');setWalletLedger(rows);};
  const [demoWorkStart]=useState(()=>{const k='sb1_demo_work_start_'+id;const old=Number(localStorage.getItem(k)||0);if(old>0)return old;const next=Date.now()+2*3600000;localStorage.setItem(k,String(next));return next});
  const [workSessions,setWorkSessions]=useState(()=>readWorkSchedule(id));
  const [openWorkQuestions,setOpenWorkQuestions]=useState(()=>[
    {id:'wq1',title:'كيف أتعامل مع القلق المستمر؟',closesAt:Date.now()+4*3600000},
    {id:'wq2',title:'هل اضطراب النوم يحتاج تقييماً؟',closesAt:Date.now()+7*3600000}
  ]);
  const [availableSlots,setAvailableSlots]=useState(['اليوم 18:00','غداً 11:00','غداً 16:30']);
  const [sessionDate,setSessionDate]=useState(()=>{const x=new Date();return x.getFullYear()+'-'+String(x.getMonth()+1).padStart(2,'0')+'-'+String(x.getDate()).padStart(2,'0')});
  function readWorkSchedule(page:string){
    try{return JSON.parse(localStorage.getItem('sb1_work_schedule_'+page)||'[]')}catch{return []}
  }

  useEffect(()=>{
    const measure=()=>{
      const el=profileTabsRef.current;
      if(!el) return;
      profileNavPinY.current=el.getBoundingClientRect().top+window.scrollY;
      setProfileNavPinned(window.scrollY>=profileNavPinY.current);
    };
    const onScroll=()=>{
      if(profileNavPinY.current===null) measure();
      else setProfileNavPinned(window.scrollY>=profileNavPinY.current);
    };
    const timer=window.setTimeout(measure,50);
    window.addEventListener('scroll',onScroll,{passive:true});
    window.addEventListener('resize',measure);
    return()=>{window.clearTimeout(timer);window.removeEventListener('scroll',onScroll);window.removeEventListener('resize',measure)};
  },[]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setDoctor(null);
    setImgError(false);
    setQuestions([]);
    setPosts([]);
    setDiary([]);
    setArticles([]);
    setAudios([]);
    setComments({});

    (async () => {
      try {
        const { data: doc } = await supabase.from('doctors').select('*, specialty(*)').eq('id', id).maybeSingle();
        let resolved = doc as Doctor | null;
        if (!resolved && id.startsWith('catalog-doctor-')) {
          const parts=id.split('-');
          const langCode=parts[2] || lang;
          const slug=parts.slice(3,-1).join('-');
          resolved = virtualDoctorsForSpecialty(slug, langCode, 10).find(d=>d.id===id) || null;
        }

        if (cancelled) return;

        if (resolved) {
          setDoctor(resolved);
          const currentDoctor = resolved;
          if (currentDoctor.is_virtual) {
            const slug=currentDoctor.specialty?.slug||'';
            setQuestions(virtualQuestionsForSpecialty(slug,lang,8));
            setArticles(virtualArticlesForSpecialty(slug,lang,5));
            setAudios(virtualAudioForSpecialty(slug,lang,4));
            setPosts(Array.from({length:5},(_,i)=>({
              id:`virtual-post-${id}-${i+1}`,
              doctor_id:id,
              body:lang==='ar'?`منشور تعليمي من ${currentDoctor.name} حول ${currentDoctor.specialty?.name||'التخصص'}.`:`Educational post from ${currentDoctor.name} about ${currentDoctor.specialty?.name||'the specialty'}.`,
              image_url:null,
              video_url:i===1?'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4':null,
              post_type:i===1?'reel':'post',
              views:200+i*70,
              likes_count:30+i*11,
              comments_count:3+i,
              created_at:new Date(Date.now()-i*86400000).toISOString(),
              doctor:currentDoctor
            })) as SpecialistPost[]);
            setDiary([]);
            setComments({});
            if (!cancelled) setLoading(false);
            return;
          }

          const { data: ans } = await supabase.from('answers').select('question_id').eq('doctor_id', id);
          if (cancelled) return;
          if (ans && ans.length > 0) {
            const qIds = ans.map((a) => a.question_id);
            const { data: qs } = await supabase.from('questions').select('*, specialty(*), answers(*)').in('id', qIds).order('created_at', { ascending: false });
            if (cancelled) return;
            setQuestions(qs || []);
          }

          const { data: p } = await supabase.from('specialist_posts').select('*').eq('doctor_id', id).order('created_at', { ascending: false }).limit(20);
          if (cancelled) return;
          const demoPosts = currentDoctor.is_virtual ? Array.from({length:4},(_,i)=>({
            id:`virtual-post-${id}-${i+1}`,
            doctor_id:id,
            body:lang==='ar'?`منشور تجريبي من ${currentDoctor.name}: معلومة تثقيفية عامة مرتبطة بتخصصي.`:`Educational demo post from ${currentDoctor.name} about the specialty.`,
            image_url:null,
            video_url:i===1?'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4':null,
            post_type:i===1?'reel':'post',
            views:200+i*70,
            likes_count:30+i*11,
            comments_count:3+i,
            created_at:new Date(Date.now()-i*86400000).toISOString(),
            doctor:currentDoctor
          })) as SpecialistPost[] : [];
          setPosts(p && p.length ? p : demoPosts);

          const { data: d } = await supabase.from('specialist_diary').select('id, title, body, created_at').eq('doctor_id', id).eq('is_public', true).order('created_at', { ascending: false }).limit(10);
          if (cancelled) return;
          setDiary(d || []);

          const { data: arts } = await supabase.from('articles').select('*, specialty(*)').eq('doctor_id', id).order('created_at', { ascending: false }).limit(10);
          if (cancelled) return;
          setArticles(arts || []);

          const { data: aud } = await supabase.from('doctor_audio').select('*, specialty(*)').eq('doctor_id', id).order('created_at', { ascending: false }).limit(10);
          if (cancelled) return;
          setAudios(aud || []);

          if (p && p.length > 0) {
            const pIds = p.map((x) => x.id);
            const { data: cs } = await supabase.from('post_comments').select('*').in('post_id', pIds).order('created_at');
            if (cancelled) return;
            const cMap: Record<string, PostComment[]> = {};
            (cs || []).forEach((comment) => { (cMap[comment.post_id] = cMap[comment.post_id] || []).push(comment); });
            setComments(cMap);
          }
        }
      } catch (error) {
        console.error('SB1 specialist profile load failed', error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [id, lang]);

  const handleLike = (postId: string) => {
    setLikedPosts((prev) => { const n = new Set(prev); if (n.has(postId)) n.delete(postId); else n.add(postId); return n; });
    const post=posts.find(p=>p.id===postId); if(post) toggleLiked({id:post.id,kind:post.video_url?'reel':'post',title:post.body,body:post.body,author:doctor?.name,created_at:post.created_at});
  };

  const handleComment = async (postId: string) => {
    const text = commentInputs[postId]?.trim();
    if (!text) return;
    const name = localStorage.getItem('chat_name') || 'مستخدم';
    const { data } = await supabase.from('post_comments').insert({ post_id: postId, author_name: name, body: text }).select().single();
    if (data) {
      setComments((prev) => ({ ...prev, [postId]: [...(prev[postId] || []), data] }));
    }
    addComment(postId,text);
    setCommentInputs((prev) => ({ ...prev, [postId]: '' }));
  };

  const handleFollow = () => { const next=toggleFollowing(id); setIsFollowing(next.includes(id)); };
  const shareProfile = async () => { const url = window.location.origin + '/doctors/' + id; try { if (navigator.share) await navigator.share({ title: doctor?.name || 'SB1', text: `تابع صفحة ${doctor?.name || 'الأخصائي'} على SB1`, url }); else { await navigator.clipboard.writeText(url); alert('تم نسخ رابط صفحة الأخصائي'); } } catch {} };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 animate-pulse">
          <div className="h-6 bg-gray-100 rounded w-32 mb-6" />
          <div className="card p-8"><div className="flex gap-6"><div className="w-32 h-32 rounded-2xl bg-gray-100" /><div className="flex-1"><div className="h-8 bg-gray-100 rounded w-48 mb-3" /><div className="h-5 bg-gray-100 rounded w-32 mb-3" /></div></div></div>
        </div>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 text-lg mb-4">{t('common.not_found')}</p>
          <button onClick={() => navigate('/doctors')} className="btn-primary">{t('common.back')}</button>
        </div>
      </div>
    );
  }

  const nextWorkStart=workSessions.filter((x:any)=>x.status==='accepted'&&x.startsAt>workNow).sort((a:any,b:any)=>a.startsAt-b.startsAt)[0]?.startsAt || 0;
  const workCountdown=Math.max(0,nextWorkStart-workNow);
  const dateKey=(value:string|number)=>{const x=new Date(value);return x.getFullYear()+'-'+String(x.getMonth()+1).padStart(2,'0')+'-'+String(x.getDate()).padStart(2,'0')};
  const filteredDiary=diary.filter(s=>dateKey(s.created_at)===sessionDate);
  const demoDiary=Array.from({length:7},(_,i)=>({id:'demo-session-'+i,title:'جلسة مجانية '+(i+1),body:'جلسة تعريفية مجانية مع المتابعين',created_at:new Date(Date.now()+i*86400000).toISOString()}));
  const demoScheduledSessions=Array.from({length:14},(_,i)=>{const starts=new Date(Date.now()+(i+1)*86400000);starts.setHours(10+(i%6),i%2?30:0,0,0);return {id:'demo-booking-'+i,title:'جلسة محجوزة '+(i+1),client:['محمد','سارة','أحمد','ليان'][i%4],startsAt:starts.getTime(),endsAt:starts.getTime()+3600000,status:'محجوزة'}});
  const visibleDiary=diary.length?filteredDiary:demoDiary.filter(s=>dateKey(s.created_at)===sessionDate);
  const scheduledSource=workSessions;
  const selectedWorkSessions=scheduledSource.filter((s:any)=>dateKey(s.startsAt)===sessionDate);
  const workMinutes=Math.floor(workCountdown/60000);
  const workHours=Math.floor(workMinutes/60);
  const workMins=workMinutes%60;
  const workUrgent=workCountdown<=50*60000;
  const configuredAvailability=getDoctorAvailability(id);
  const workRed=workCountdown<=60*60000;
  const tabs: { key: Tab; label: string; icon: typeof FileText }[] = [
    { key:'home', label:lang==='ar'?'الرئيسية':'Home', icon:Home },
    { key:'sessions', label:lang==='ar'?'جلساتي':'My Sessions', icon:Video },
    { key:'articles', label:lang==='ar'?'مقالتي':'My Articles', icon:BookOpen },
    { key:'questions', label:lang==='ar'?'الأسئلة':'Questions', icon:MessageCircle },
    { key:'recordings', label:lang==='ar'?'تسجيلاتي':'My Recordings', icon:Video },
    { key:'courses', label:lang==='ar'?'الدورات والكورسات':'Courses', icon:GraduationCap },
    { key:'certificates', label:lang==='ar'?'شهاداتي':'My Certificates', icon:Award },
    { key:'portfolio', label:lang==='ar'?'منشوراتي':'My Posts', icon:FileText },
  ];

  return (
    <div className="min-h-screen pt-2 pb-16"><style>{`@keyframes sb1bell{0%,100%{transform:rotate(0)}25%{transform:rotate(10deg)}75%{transform:rotate(-10deg)}}@keyframes sb1pulse{0%,100%{transform:scale(1);filter:hue-rotate(0deg)}50%{transform:scale(1.18);filter:hue-rotate(260deg)}}`}</style>
      <div className="max-w-6xl mx-auto px-3 sm:px-5 lg:px-8">
        <button onClick={() => navigate('/doctors')} className="hidden items-center gap-2 text-gray-500 hover:text-teal-600 transition-colors mb-2 mt-1 xl:flex">
          <ArrowRight className="w-4 h-4" />
          {t('common.back')}
        </button>

        <div className="relative" dir="rtl">
        <aside className={`${profileNavPinned ? "fixed top-0 start-4" : "absolute top-0 start-4"} z-[60] hidden max-h-[calc(100vh-1rem)] w-[15rem] overflow-y-auto border-s-slate-900 bg-white ps-4 pe-1 shadow-sm xl:block`} aria-label="قائمة SB1 الرئيسية">
          <div className="space-y-2">
            {canSeePrivate&&<button onClick={()=>selectMain('wallet')} className="flex w-full items-center gap-2 rounded-xl bg-black px-4 py-3 text-sm font-extrabold text-white shadow-sm active:bg-slate-900"><Wallet className="h-4 w-4 text-amber-300"/>الحساب والمحفظة</button>}
            {canManagePage&&<button onClick={()=>selectMain('clone')} className="flex w-full items-center gap-2 rounded-xl bg-emerald-100 px-4 py-3 text-sm font-extrabold text-emerald-800 shadow-sm active:bg-emerald-200"><Copy className="h-4 w-4 text-emerald-700"/>الاستنساخ</button>}
            {canSeePrivate&&<button onClick={()=>selectMain('work')} className="flex w-full items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-extrabold text-slate-800 shadow-sm hover:bg-slate-50 active:bg-slate-200"><span className="flex items-center gap-2"><CalendarClock className="h-4 w-4 text-indigo-600"/>جدول أعمالي</span><span className={`rounded-full px-2 py-1 font-mono text-[11px] font-black ${workUrgent?'animate-[sb1pulse_.55s_ease-in-out_infinite] text-red-600':workRed?'text-red-600':'text-black'}`}>{workHours}:{String(workMins).padStart(2,'0')}</span></button>}
            {canSeePrivate&&<div className="overflow-hidden rounded-xl border bg-white shadow-sm">
              <button onClick={()=>selectMain('home')} className="flex w-full items-center gap-2 border-b px-4 py-3 text-sm font-bold hover:bg-slate-50 active:bg-slate-200"><Home className="h-4 w-4 text-teal-600"/>الرئيسية</button>
              <button onClick={()=>selectMain('favorites')} className="flex w-full items-center gap-2 border-b px-4 py-3 text-sm font-bold hover:bg-slate-50 active:bg-slate-200"><Heart className="h-4 w-4 text-rose-500"/>مفضلتي</button>
              <button onClick={()=>selectMain('albums')} className="flex w-full items-center gap-2 border-b px-4 py-3 text-sm font-bold hover:bg-slate-50 active:bg-slate-200"><Library className="h-4 w-4 text-indigo-500"/>الألبومات</button>
              <button onClick={()=>selectMain('social')} className="flex w-full items-center gap-2 border-b px-4 py-3 text-sm font-bold hover:bg-slate-50 active:bg-slate-200"><ExternalLink className="h-4 w-4 text-sky-500"/>منصات التواصل</button>
              <button onClick={()=>selectMain('phone')} className="flex w-full items-center gap-2 border-b px-4 py-3 text-sm font-bold hover:bg-slate-50 active:bg-slate-200"><Share2 className="h-4 w-4 text-violet-500"/>الهاتف وQR</button>
              {canManagePage&&<button onClick={()=>selectMain('settings')} className="flex w-full items-center gap-2 px-4 py-3 text-sm font-bold hover:bg-slate-50 active:bg-slate-200"><SettingsIcon className="h-4 w-4 text-slate-600"/>الإعدادات</button>}
            </div>}
            <div className="mt-3 rounded-xl border bg-white p-3 shadow-sm">
              <button onClick={()=>{setShowFollowers(true);setMainSection('home');setTimeout(()=>document.getElementById('followers-list')?.scrollIntoView({behavior:'smooth',block:'start'}),50)}} title="عرض جميع المتابعين" className="flex w-full items-center justify-between active:bg-slate-100 rounded-lg p-1">
                <span className="text-sm font-extrabold">المتابعون</span><span className="text-xs text-slate-400">{doctor.follower_count||followers.length}</span>
              </button>
              <div className="mt-3 flex flex-wrap gap-2">
                {followers.filter(f=>f.online).slice(0,5).map(f=><button key={f.id} title={f.name} onClick={()=>navigate('/doctors/'+f.id)} className="relative h-9 w-9 overflow-hidden rounded-full bg-slate-100 ring-2 ring-white shadow-sm active:opacity-80"><img src={f.photo} alt={f.name} className="h-full w-full object-cover"/>{f.online&&<span className="absolute -bottom-0.5 -left-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500"/>}</button>)}
              </div>
              {showFollowers&&<div className="mt-3 space-y-1 border-t pt-2">{followers.map(f=><button key={f.id} onClick={()=>navigate('/doctors/'+f.id)} className="flex w-full items-center gap-2 rounded-lg p-2 text-right text-xs font-bold hover:bg-slate-50 active:bg-slate-100"><img src={'https://api.dicebear.com/9.x/personas/svg?seed='+encodeURIComponent(f.id)} alt={f.name} className="h-7 w-7 rounded-full object-cover"/>{f.name}</button>)}</div>}
            </div>
            <div className="mt-3 rounded-xl border bg-white p-3 text-center shadow-sm">
              <p className="mb-2 text-xs font-extrabold text-slate-700">QR الصفحة</p>
              <img src={'https://api.qrserver.com/v1/create-qr-code/?size=180x180&data='+encodeURIComponent((import.meta.env.VITE_PUBLIC_SITE_URL||window.location.origin).replace(/\/$/,'')+'/doctors/'+id)} alt="QR" className="mx-auto h-36 w-36 rounded-lg"/>
              <p className="mt-2 text-[10px] text-slate-400">ظاهر دائماً تحت المتابعين</p>
            </div>
          </div>
        </aside>
        <div className="min-w-0 xl:ps-[17rem]">
        {/* Profile Header — keep the existing profile design; green cover removed as requested */}
        <div className="card mb-2 border-teal-900 bg-teal-700 text-white">
          <div className="px-6 py-5">
            <div className="flex flex-col md:flex-row gap-4 mt-0 pt-4">
              <div className="w-28 h-28 rounded-2xl overflow-hidden bg-gradient-to-br from-teal-100 to-teal-50 flex items-center justify-center shrink-0 ring-4 ring-white mx-auto md:mx-0">
                {!imgError ? (
                  <img src={profileAvatar} alt={doctor.name} className="w-full h-full object-cover" onError={() => setImgError(true)} />
                ) : (
                  <span className="text-4xl font-bold text-teal-600">{doctor.name.replace('د. ', '').charAt(0)}</span>
                )}
              </div>
              <div className="flex-1 text-center md:text-right pt-2"><div className="mb-1 text-[10px] font-bold text-slate-400">الصورة الرسمية للأخصائي</div>
                <div className="flex items-center justify-center md:justify-start gap-2">
                  <h1 className="text-xl font-bold text-white">{doctor.name}</h1>
                  {doctor.is_verified && <BadgeCheck className="w-5 h-5 text-teal-500" />}
                </div>
                {doctor.specialty && <p className="text-emerald-300 font-medium text-sm">{specialtyName(doctor.specialty)}</p>}
                <div className="flex flex-wrap justify-center md:justify-start gap-3 text-xs text-slate-300 mt-2">
                  <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />{Number(doctor.rating).toFixed(1)}</span>
                  <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-teal-500" />{doctor.city}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-teal-500" />{doctor.experience_years} {lang === 'ar' ? 'سنوات' : ''}</span>
                  <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5 text-teal-500" />{doctor.follower_count || 0} {t('profile.followers')}</span>
                </div>
              </div>
              <div className="flex flex-col gap-2 justify-center">
                <button onClick={handleFollow} className={`px-6 py-2.5 rounded-xl font-semibold text-sm transition-all ${isFollowing ? 'bg-gray-100 text-gray-600' : 'bg-teal-600 text-white hover:bg-teal-700'}`}>
                  {isFollowing ? t('profile.following') : t('profile.follow')}
                </button>
                <div className="flex items-center justify-center gap-2"><button onClick={shareProfile} className="px-6 py-2.5 rounded-xl border border-teal-200 text-teal-700 bg-teal-50 font-semibold text-sm flex items-center justify-center gap-2">
                  <Share2 className="w-4 h-4" /> مشاركة صفحة SB1
                </button><div className="relative">
  <button onClick={()=>setNotificationOpen(v=>!v)} aria-label="الإشعارات" className={`relative grid h-11 w-11 place-items-center rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-600 transition ${unreadNotifications>0?'text-red-600 border-red-200 bg-red-50':''} ${bellAnimating?'animate-[sb1bell_.5s_ease-in-out_infinite]':''}`}><Bell className="h-5 w-5"/>{unreadNotifications>0&&<span className="absolute -right-1 -top-1 grid min-h-5 min-w-5 place-items-center rounded-full bg-red-600 px-1 text-[10px] font-extrabold text-white">{unreadNotifications}</span>}</button>
  {notificationOpen&&<div className="absolute left-0 top-12 z-[160] w-80 max-w-[80vw] overflow-hidden rounded-2xl border bg-white text-right shadow-xl">
    <div className="flex items-center justify-between border-b px-4 py-3"><b>الإشعارات</b><button onClick={()=>{setNotifications(v=>v.map(n=>({...n,read:true})));setUnreadNotifications(0);localStorage.setItem('sb1_unread_notifications','0')}} className="text-[11px] font-bold text-teal-700">قراءة الكل</button></div>
    <div className="max-h-80 overflow-y-auto">
      {notifications.map(n=><button key={n.id} onClick={()=>{setNotifications(v=>v.map(x=>x.id===n.id?{...x,read:true}:x));setUnreadNotifications(v=>Math.max(0,v-(n.read?0:1)));localStorage.setItem('sb1_unread_notifications',String(Math.max(0,unreadNotifications-(n.read?0:1))))}} className={`flex w-full gap-3 border-b px-4 py-3 text-right hover:bg-slate-50 ${n.read?'bg-white':'bg-emerald-50/60'}`}>
        <span className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${n.read?'bg-slate-300':'bg-red-500'}`}/>
        <span className="min-w-0"><b className="block text-sm">{n.title}</b><span className="mt-1 block text-xs text-slate-600">{n.body}</span><span className="mt-1 block text-[10px] text-slate-400">{n.time}</span></span>
      </button>)}
    </div>
  </div>}
</div></div>
              </div>
            </div>
            {doctor.bio && <p className="text-sm text-slate-200 mt-4 leading-relaxed">{doctor.bio}</p>}
          </div>
        </div>
        <div className="my-3 border-b-2 border-black" aria-hidden="true" />

        <div className="mb-5 min-h-[58px] w-full"><div ref={profileTabsRef} id="profile-tabs" className={`${profileNavPinned ? "fixed inset-x-0 top-0 z-50" : "relative z-50"} w-full overflow-hidden border bg-white shadow-sm`}><div className="mx-auto max-w-6xl px-3 sm:px-5 lg:px-8"><div className="xl:ps-[17rem]"><div className="grid w-full grid-cols-8" dir={lang==='ar'?'rtl':'ltr'}>
          {tabs.map((tab,i)=>{const Icon=tab.icon;const colors=['text-teal-600','text-rose-500','text-indigo-500','text-amber-500','text-sky-500','text-violet-500','text-emerald-500','text-blue-600'];return <button key={tab.label+'-'+i} onClick={()=>{setMainSection('home');setActiveTab(tab.key)}} className={`min-w-0 border-e px-1 py-2 text-[11px] font-bold leading-4 transition active:bg-slate-200 ${activeTab===tab.key?'bg-teal-50 text-teal-800':'text-slate-600 hover:bg-slate-50'}`}>
              <span className="flex min-w-0 flex-col items-center justify-center gap-0.5 text-center"><Icon className={`h-4 w-4 ${colors[i]}`}/><span className="break-words">{tab.label}</span></span>
            </button>})}
          </div></div></div></div></div>
        <div className="mb-3">{mainSection === 'home' && activeTab === 'home' && <StoryBar pageId={id} canManage={canManagePage} pageAvatar={profileAvatar} />} {mainSection === 'home' && activeTab === 'portfolio' && <StoryBar pageId={id} canManage={canManagePage} pageAvatar={profileAvatar} ownOnly />}</div>
        {mainSection === 'home' && showFollowers && (
          <section id="followers-list" className="mb-5 rounded-xl border bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between"><div><h2 className="text-xl font-extrabold">المتابعون</h2><p className="mt-1 text-xs text-slate-500">مرتبة أبجدياً، مع تمييز المتاحين الآن.</p></div><button onClick={()=>setShowFollowers(false)} className="rounded-lg border px-3 py-1 text-xs font-bold">إغلاق</button></div>
            <div className="mt-4 space-y-2">
              {[...followers].sort((a,b)=>a.name.localeCompare(b.name,'ar')).map(f=><button key={f.id} onClick={()=>navigate('/doctors/'+f.id)} className="flex w-full items-center gap-3 rounded-xl border p-3 text-right hover:bg-slate-50 active:bg-slate-100">
                <span className="relative"><img src={f.photo} alt={f.name} className="h-11 w-11 rounded-full object-cover"/><span className={'absolute -bottom-0.5 -left-0.5 h-3 w-3 rounded-full border-2 border-white '+(f.online?'bg-emerald-500':'bg-slate-400')} title={f.online?'متصل الآن':'غير متصل'}/></span>
                <span className="flex-1"><b>{f.name}</b><span className="block text-xs text-slate-500">{f.online?'متصل الآن':'غير متصل'}</span></span>
              </button>)}
            </div>
          </section>
        )}

        {mainSection === 'work' && canSeePrivate && (
          <section className="mb-5 rounded-xl border bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div><h2 className="text-xl font-extrabold">جدول أعمالي</h2><p className="mt-1 text-xs text-slate-500">جلساتك الحالية، الأسئلة المفتوحة، والمواعيد المتاحة القادمة.</p></div>
              <CalendarClock className="text-indigo-600"/>
            </div>
            <div className="mt-4 grid gap-4 lg:grid-cols-3">
              <div className="rounded-xl border bg-slate-50 p-4">
                <b>الجلسات الحالية والقادمة</b>
                <div className="mt-3 space-y-2">
                  {(workSessions).map((s:any)=>{
                    const remaining=Math.max(0,s.startsAt-workNow); const mins=Math.floor(remaining/60000); const hh=Math.floor(mins/60); const mm=mins%60; const urgent=remaining<=50*60000; const red=remaining<=60*60000;
                    return <button key={s.id} onClick={()=>navigate('/appointments')} className="w-full rounded-xl border bg-white p-3 text-right hover:bg-slate-50 active:bg-slate-100">
                      <div className="flex items-start justify-between gap-2"><div><b className="text-sm">{s.title}</b><p className="mt-1 text-xs text-slate-500">{s.client} · {new Date(s.startsAt).toLocaleString('ar')}</p></div><span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-700">{s.status}</span></div>
                      <div className="mt-3 flex items-center justify-between gap-2"><span className="text-xs text-slate-500">الوقت المتبقي</span><span className={`font-mono text-sm font-black ${urgent?'animate-[sb1pulse_.55s_ease-in-out_infinite] text-red-600':red?'text-red-600':'text-black'}`}>{hh}:{String(mm).padStart(2,'0')}</span></div>
                      {urgent&&<div className="mt-1 text-[10px] font-bold text-red-600">اقترب موعد الجلسة — المنبه مفعل</div>}
                    </button>
                  })}
                </div>
              </div>
              <div className="rounded-xl border bg-slate-50 p-4">
                <b>أسئلتي المفتوحة</b>
                <div className="mt-3 space-y-2">{openWorkQuestions.map(q=>{const r=Math.max(0,q.closesAt-workNow);return <button key={q.id} onClick={()=>navigate('/questions/'+q.id)} className="w-full rounded-xl border bg-white p-3 text-right hover:bg-slate-50 active:bg-slate-100"><b className="text-sm">{q.title}</b><p className="mt-1 text-[10px] text-slate-500">يغلق: {new Date(q.closesAt).toLocaleString('ar')} · متبقٍ {Math.floor(r/3600000)}س {Math.floor((r%3600000)/60000)}د</p></button>})}</div>
              </div>
              <div className="rounded-xl border bg-slate-50 p-4">
                <div className="flex items-center justify-between"><b>المواعيد المتاحة</b><button onClick={()=>navigate('/specialist-appointments')} title="فتح مفكرة المواعيد والأسعار" className="rounded-lg bg-indigo-50 px-2 py-1 text-xs font-bold text-indigo-700 active:bg-indigo-100">فتح المفكرة</button></div>
                <div className="mt-3 space-y-2">{configuredAvailability.map((slot:any)=><div key={slot.id} className="flex items-center justify-between rounded-lg bg-white p-2 text-sm"><span>{new Date(slot.start).toLocaleString('ar')} — {new Date(slot.end).toLocaleTimeString('ar',{hour:'2-digit',minute:'2-digit'})}</span><span className="font-bold text-teal-700">{slot.price} USD</span></div>)}{configuredAvailability.length===0&&<div className="rounded-lg bg-white p-3 text-xs text-slate-500">لا توجد مواعيد متاحة مسجلة حالياً. افتح المفكرة لإضافة التاريخ والوقت والسعر.</div>}</div>
              </div>
            </div>
            
          </section>
        )}

        {mainSection === 'wallet' && canSeePrivate && (
          <div className="mb-5 grid gap-4 md:grid-cols-3">
            <button onClick={()=>openWalletLedger('balance')} className="card p-5 text-right active:bg-slate-100"><Wallet className="text-teal-600"/><b className="block mt-3">الرصيد</b><strong>{wallet.balance} USD</strong><span className="block mt-2 text-xs text-teal-700">عرض العمليات الحقيقية</span></button>
            <button onClick={()=>openWalletLedger('points')} className="card p-5 text-right active:bg-slate-100"><Coins className="text-indigo-600"/><b className="block mt-3">النقاط</b><strong>{wallet.points}</strong><span className="block mt-2 text-xs text-teal-700">عرض السبب والعملية والعقوبة</span></button>
            <button onClick={()=>openWalletLedger('due')} className="card p-5 text-right active:bg-slate-100"><BadgeCheck className="text-amber-500"/><b className="block mt-3">المستحقات</b><strong>{wallet.due} USD</strong><span className="block mt-2 text-xs text-teal-700">عرض العمليات والاستحقاق</span></button>
          </div>
        )}
        {walletLedger&&<div className="fixed inset-0 z-[220] grid place-items-center bg-black/60 p-4" onClick={()=>setWalletLedger(null)}><div className="w-full max-w-2xl max-h-[80vh] overflow-hidden rounded-2xl bg-white" onClick={e=>e.stopPropagation()}><div className="flex items-center justify-between border-b p-4"><b>{walletLedgerTitle}</b><button onClick={()=>setWalletLedger(null)}><X/></button></div><div className="max-h-[68vh] overflow-y-auto p-4 space-y-2">{walletLedger.length?walletLedger.map((x:any,i)=><div key={x.id||i} className="rounded-xl border bg-slate-50 p-3"><div className="flex items-center justify-between gap-3"><b>{x.reason}</b><strong>{x.value} {x.currency}</strong></div><div className="mt-1 text-xs text-slate-500">{x.source} · {x.created_at?new Date(x.created_at).toLocaleString():''}</div>{x.severity&&<div className="mt-1 text-xs text-red-600">العقوبة: {x.severity} · النقاط: {Math.abs(x.points||0)}</div>}</div>):<p className="py-10 text-center text-slate-500">لا توجد عمليات مسجلة لهذا النوع في النظام.</p>}</div></div></div>}
        {mainSection === 'favorites' && <FavoritesPage />}
        {mainSection === 'home' && activeTab === 'home' && (
          <PageProfileTools canManage={canManagePage} pageId={id} pageName={doctor.name} pageAvatar={profileAvatar} seedPosts={posts} hideStories focusSection="home" />
        )}
        {mainSection === 'albums' && <PageProfileTools canManage={canManagePage} pageId={id} pageName={doctor.name} pageAvatar={profileAvatar} seedPosts={posts} focusSection="albums" />}
        {mainSection === 'social' && <PageProfileTools canManage={canManagePage} pageId={id} pageName={doctor.name} pageAvatar={profileAvatar} seedPosts={posts} focusSection="social" />}
        {mainSection === 'phone' && <PageProfileTools canManage={canManagePage} pageId={id} pageName={doctor.name} pageAvatar={profileAvatar} seedPosts={posts} focusSection="phone" />}
        {mainSection === 'settings' && canManagePage && <PageProfileTools canManage={canManagePage} pageId={id} pageName={doctor.name} pageAvatar={profileAvatar} seedPosts={posts} focusSection="settings" />}
        {mainSection === 'clone' && canManagePage && <PageProfileTools canManage={canManagePage} pageId={id} pageName={doctor.name} pageAvatar={profileAvatar} seedPosts={posts} focusSection="clone" />}

        {mainSection === 'home' && activeTab === 'sessions' && (
          <div className="card p-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div><h2 className="text-xl font-extrabold">جلساتي</h2><p className="text-xs text-slate-500">اختر تاريخ الجلسة من التقويم لتظهر جلسات ذلك اليوم.</p></div>
              <div className="flex items-center gap-2 rounded-xl border bg-white px-3 py-2">
                <CalendarDaysIcon className="h-5 w-5 text-teal-700"/>
                <input type="date" value={sessionDate} onChange={e=>setSessionDate(e.target.value)} className="bg-transparent text-sm font-bold outline-none"/>
              </div>
            </div>
            {selectedWorkSessions.length>0&&<div className="mb-4 rounded-xl border border-indigo-100 bg-indigo-50 p-3"><b className="text-sm">مواعيد هذا التاريخ</b><div className="mt-2 space-y-2">{selectedWorkSessions.map((s:any)=><div key={s.id} className="flex items-center justify-between rounded-lg bg-white p-3"><div><b>{s.title}</b><p className="text-xs text-slate-500">{s.client} · {new Date(s.startsAt).toLocaleString('ar')}</p></div><span className="text-xs font-bold text-indigo-700">{s.status}</span></div>)}</div></div>}
            <div className="space-y-3">
              {visibleDiary.map((s:any)=><article key={s.id} className="rounded-xl border bg-white p-4"><div className="flex items-center justify-between gap-3"><div><b>{s.title||'جلسة مجانية'}</b><p className="mt-1 text-xs text-slate-500">{s.body}</p></div><div className="flex items-center gap-2"><span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">مجانية</span><button onClick={()=>toggleSaved({id:s.id,kind:'session',title:s.title||'جلسة',body:s.body,author:doctor.name,created_at:s.created_at})} className="rounded-lg bg-slate-50 p-2 text-teal-700" aria-label="إضافة إلى مفضلتي"><Bookmark className="h-4 w-4"/></button></div></div><div className="mt-2 text-xs text-slate-400">{new Date(s.created_at).toLocaleDateString()}</div></article>)}
              {!selectedWorkSessions.length&&!visibleDiary.length&&<div className="rounded-xl border border-dashed p-8 text-center text-sm text-slate-400">لا توجد جلسات في هذا التاريخ.</div>}
            </div>
          </div>
        )}
        {mainSection === 'home' && activeTab === 'recordings' && (
          <div className="card p-5"><h2 className="text-xl font-extrabold mb-4">تسجيلاتي</h2>{audios.length ? <div className="space-y-3">{audios.map(a=><div key={a.id} className="rounded-xl border p-4"><div className="flex items-center justify-between gap-3"><div><b>{a.title}</b><p className="mt-1 text-xs text-slate-500">{a.description}</p></div><Bookmark className="h-4 w-4 text-teal-700"/></div><audio src={a.audio_url} controls className="mt-3 w-full"/><button onClick={()=>toggleSaved({id:a.id,kind:'recording',title:a.title,body:a.description,author:doctor.name,url:a.audio_url,created_at:a.created_at})} className="mt-2 rounded-lg bg-slate-50 px-3 py-2 text-xs font-bold active:bg-slate-200">حفظ في مفضلتي</button></div>)}</div> : <p className="text-slate-500">لا توجد تسجيلات منشورة بعد.</p>}</div>
        )}
        {mainSection === 'home' && activeTab === 'portfolio' && (
          <PageProfileTools canManage={canManagePage} pageId={id} pageName={doctor.name} pageAvatar={profileAvatar} seedPosts={posts} focusSection="home" onlyOwn hideStories />
        )}
        {mainSection === 'home' && activeTab === 'certificates' && (
          <div className="card p-5"><h2 className="text-xl font-extrabold mb-4">شهاداتي</h2><div className="grid gap-3 md:grid-cols-2"><div className="rounded-xl border p-4"><Award className="text-teal-700"/><b className="mt-2 block">شهادات الاعتماد والإنجاز</b><p className="mt-1 text-sm text-slate-500">تظهر هنا الشهادات المرتبطة بصفحة الأخصائي.</p></div></div></div>
        )}

        {activeTab === 'articles' && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {articles.map((a) => (
              <div key={a.id} className="card p-5 hover:shadow-lg transition-all cursor-pointer" onClick={() => navigate(`/articles/${a.id}`)}>
                {a.image_url && <img src={a.image_url} alt="" className="w-full h-32 rounded-xl object-cover mb-3" />}
                <h3 className="font-bold text-gray-800 text-sm mb-1">{a.title}</h3>
                <p className="text-xs text-gray-500 line-clamp-2">{a.excerpt}</p>
                <button onClick={(e)=>{e.stopPropagation();toggleSaved({id:a.id,kind:'article',title:a.title,body:a.excerpt,author:doctor.name,created_at:a.created_at})}} className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-xs"><Bookmark className="inline h-4 w-4 me-1"/>{isSaved(a.id)?'محفوظ':'حفظ المقال'}</button>
              </div>
            ))}
            {articles.length === 0 && <p className="text-center text-gray-400 py-8 col-span-full">{t('common.loading')}</p>}
          </div>
        )}

        {activeTab === 'courses' && (
          <div className="grid gap-4 md:grid-cols-2">
            {virtualCoursesForSpecialty(doctor.specialty?.slug||'',lang,6).map(c=><div key={c.id} className="card p-5"><h3 className="font-bold">{c.title}</h3><p className="mt-2 text-sm text-gray-500">{c.description}</p><div className="mt-3 flex items-center justify-between gap-2"><b>{c.price} USD</b><div className="flex items-center gap-2"><button onClick={()=>toggleSaved({id:c.id,kind:'course',title:c.title,body:c.description,created_at:new Date().toISOString()})} className="rounded-lg bg-slate-50 p-2 text-teal-700" aria-label="إضافة إلى مفضلتي"><Bookmark className="h-4 w-4"/></button><button onClick={()=>navigate('/courses/'+c.id)} className="rounded-xl bg-teal-700 px-3 py-2 text-white">فتح الدورة</button></div></div></div>)}
          </div>
        )}

        {activeTab === 'questions' && (
          <div className="space-y-4">
            {(questions.length?questions:Array.from({length:6},(_,i)=>({id:'demo-question-'+i,title:['كيف أتعامل مع القلق؟','هل اضطراب النوم يحتاج تقييماً؟','متى أطلب استشارة متخصصة؟','هل الجلسة الأولى مدفوعة؟','كيف أدعم أحد أفراد الأسرة؟','ما الفرق بين الحزن والقلق؟'][i],body:'سؤال توضيحي تجريبي لعرض شكل الأسئلة المجانية والمدفوعة.',answer:'إجابة نموذجية من الأخصائي.',created_at:new Date(Date.now()-i*86400000).toISOString(),is_paid:i%2===1,price:i%2===1?25:0})) as any[]).map((q:any)=><div key={q.id} className="rounded-xl border bg-white p-3"><div className="mb-2 flex items-center justify-between gap-2"><span className={`rounded-full px-2 py-1 text-[10px] font-bold ${q.is_paid||q.price>0?'bg-amber-50 text-amber-700':'bg-emerald-50 text-emerald-700'}`}>{q.is_paid||q.price>0?'مدفوع':'مجاني'}</span>{(q.price||0)>0&&<span className="text-xs font-bold text-slate-500">{q.price} USD</span>}</div><QuestionCard question={q}/><button onClick={()=>toggleSaved({id:q.id,kind:'question',title:q.title||q.question||q.body||'سؤال',body:q.answer||q.body,author:doctor.name,created_at:q.created_at||new Date().toISOString()})} className="mt-2 rounded-lg bg-slate-50 px-3 py-2 text-xs font-bold text-teal-700 active:bg-slate-200" aria-label="إضافة إلى مفضلتي"><Bookmark className="inline h-4 w-4 me-1"/>مفضلتي</button></div>)}
            <a href={'/questions?specialty='+(doctor.specialty?.slug||'')} className="inline-block rounded-xl bg-teal-700 px-4 py-2 text-white font-bold">كل الأسئلة</a>
          </div>
        )}

      </div>
      </div>
      </div>
    </div>
  );
}
