import { useEffect, useState } from 'react';
import { ArrowRight, Home, Star, MapPin, Clock, MessageCircle, GraduationCap, Award, Heart, Users, FileText, Video, BookOpen, Send, BadgeCheck, PenLine, Share2, ExternalLink, Copy, Briefcase as BriefcaseIcon, Settings as SettingsIcon, Bookmark, Archive, Coins, Wallet, Bell, ShieldCheck, Library, Plus, X, Upload, CalendarDays as CalendarDaysIcon } from 'lucide-react';
import { useRouter } from '@/lib/router';
import { getRole } from '@/lib/access';
import PageProfileTools from '@/components/PageProfileTools';
import FavoritesPage from '@/pages/FavoritesPage';
import { useI18n } from '@/lib/i18n';
import { supabase, type Doctor, type Question, type SpecialistPost, type PostComment, type Article, type DoctorAudio } from '@/lib/supabase';
import QuestionCard from '@/components/QuestionCard';
import { virtualDoctorsForSpecialty, virtualQuestionsForSpecialty, virtualArticlesForSpecialty, virtualAudioForSpecialty, virtualVideosForSpecialty, virtualCoursesForSpecialty } from '@/lib/catalog';
import { toggleSaved, isSaved, toggleLiked, isLiked, archiveItem, addComment, toggleFollowing, isFollowing as isFollowingVault, getSaved } from '@/lib/socialVault';

type Tab = 'home' | 'sessions' | 'articles' | 'questions' | 'recordings' | 'courses' | 'certificates' | 'portfolio';
type MainSection = 'home' | 'favorites' | 'albums' | 'social' | 'phone' | 'settings' | 'clone' | 'wallet';


function StoryBar({pageId,canManage}:{pageId:string;canManage:boolean}) {
  type S={id:string;name:string;text:string;mediaUrl?:string;mediaKind?:'image'|'video';own?:boolean;expiresAt:string};
  const [stories,setStories]=useState<S[]>(()=>{try{return JSON.parse(localStorage.getItem('sb1_fb_stories_'+pageId)||'[]')}catch{return[]}});
  const [viewer,setViewer]=useState<S|null>(null),[compose,setCompose]=useState(false),[text,setText]=useState(''),[file,setFile]=useState<File|null>(null),[url,setUrl]=useState(''),[video,setVideo]=useState(false);
  useEffect(()=>{if(file){const u=URL.createObjectURL(file);setUrl(u);return()=>URL.revokeObjectURL(u)}setUrl('')},[file]);
  useEffect(()=>{try{localStorage.setItem('sb1_fb_stories_'+pageId,JSON.stringify(stories))}catch{}},[stories,pageId]);
  const demo=['د. ليان','د. أحمد','مركز الحياة','سارة','محمد'];
  const visible=[...stories.filter(s=>new Date(s.expiresAt)>new Date()),...demo.map((name,i)=>({id:'story-demo-'+i,name,text:['معلومة جديدة','جلسة تعليمية','سؤال وجواب','فيديو جديد','تسجيل جديد'][i],expiresAt:new Date(Date.now()+86400000).toISOString()} as S))];
  const create=()=>{if(!text.trim()&&!url)return;const s:S={id:'story-'+Date.now(),name:'قصتي',text:text.trim(),mediaUrl:url||undefined,mediaKind:video?'video':'image',own:true,expiresAt:new Date(Date.now()+86400000).toISOString()};setStories(v=>[s,...v]);setText('');setFile(null);setCompose(false);setViewer(s)};
  return <>
    <div className="mb-4 rounded-xl border bg-white p-3 shadow-sm"><div className="flex gap-3 overflow-x-auto pb-1" dir="rtl">
      {canManage&&<button onClick={()=>setCompose(true)} className="min-w-[112px] overflow-hidden rounded-xl border bg-slate-50"><div className="grid h-28 place-items-center bg-gradient-to-br from-teal-600 to-teal-800 text-white"><Plus className="h-8 w-8"/></div><div className="p-2 text-center text-xs font-bold">قصتك</div></button>}
      {visible.map(s=><button key={s.id} onClick={()=>setViewer(s)} className="min-w-[112px] overflow-hidden rounded-xl border bg-white text-right"><div className="relative grid h-28 place-items-center overflow-hidden bg-gradient-to-br from-slate-800 to-teal-900 text-white">{s.mediaUrl?(s.mediaKind==='video'?<video src={s.mediaUrl} className="h-full w-full object-cover"/>:<img src={s.mediaUrl} className="h-full w-full object-cover" alt=""/>):<span className="p-3 text-xs font-bold">{s.text}</span>}<span className="absolute bottom-2 right-2 rounded-full bg-white px-2 py-1 text-[10px] font-bold text-slate-800">{s.name}</span></div></button>)}
    </div></div>
    {compose&&<div className="fixed inset-0 z-[100] grid place-items-center bg-black/60 p-4" onClick={()=>setCompose(false)}><div className="w-full max-w-lg rounded-2xl bg-white p-5" onClick={e=>e.stopPropagation()}><div className="flex items-center justify-between"><b className="text-lg">قصتي</b><button onClick={()=>setCompose(false)}><X/></button></div><textarea value={text} onChange={e=>setText(e.target.value)} className="mt-4 min-h-28 w-full rounded-xl border p-3" placeholder="اكتب قصتك..."/><label className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-sm font-bold"><Upload className="h-4 w-4"/> صورة أو فيديو<input type="file" accept="image/*,video/*" className="hidden" onChange={e=>{const f=e.target.files?.[0]||null;setFile(f);setVideo(!!f?.type.startsWith('video/'))}}/></label><button onClick={create} className="mt-3 w-full rounded-xl bg-teal-700 py-3 font-bold text-white">نشر</button></div></div>}
    {viewer&&<div className="fixed inset-0 z-[110] grid place-items-center bg-black/80 p-4" onClick={()=>setViewer(null)}><div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-slate-950 text-white" onClick={e=>e.stopPropagation()}><button onClick={()=>setViewer(null)} className="absolute left-3 top-3 z-10 rounded-full bg-black/50 p-2"><X/></button>{viewer.mediaUrl?(viewer.mediaKind==='video'?<video src={viewer.mediaUrl} controls autoPlay className="max-h-[72vh] w-full bg-black object-contain"/>:<img src={viewer.mediaUrl} alt="" className="max-h-[72vh] w-full object-contain"/>):<div className="grid min-h-[55vh] place-items-center p-8 text-center text-2xl font-extrabold">{viewer.text}</div>}<div className="p-4"><b>{viewer.name}</b><p className="mt-1 text-xs opacity-70">{viewer.text}</p></div></div></div>}
  </>;
}

export default function DoctorProfilePage({ id }: { id: string }) {
  const { navigate } = useRouter();
  const role = getRole();
  const previewOwner = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('preview_owner') === '1';
  const canManagePage = role === 'owner' || role === 'moderator' || localStorage.getItem('sb1_page_owner_id') === id || localStorage.getItem('sb1_is_page_owner') === 'true' || previewOwner;
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
  const [mainSection, setMainSection] = useState<MainSection>('home');
  const [loading, setLoading] = useState(true);
  const [imgError, setImgError] = useState(false);
  const [coverUrl,setCoverUrl]=useState(()=>localStorage.getItem('sb1_cover_'+id)||'');
  const [coverChooser,setCoverChooser]=useState(false);
  const [showFollowers,setShowFollowers]=useState(false);
  const [followers,setFollowers]=useState(()=>[
    {id:'catalog-doctor-ar-clinical-psychology-2',name:'د. ليان',online:true},
    {id:'catalog-doctor-ar-clinical-psychology-3',name:'د. أحمد',online:true},
    {id:'catalog-doctor-ar-clinical-psychology-4',name:'سارة',online:false},
    {id:'catalog-doctor-ar-clinical-psychology-5',name:'محمد',online:true},
    {id:'catalog-doctor-ar-clinical-psychology-6',name:'مركز الحياة',online:false},
  ]);
  const [isFollowing, setIsFollowing] = useState(()=>isFollowingVault(id));
  const profileAvatar = doctor?.photo_url || ('https://api.dicebear.com/9.x/personas/svg?seed=' + encodeURIComponent(id));
  const savedCoverImages=getSaved().filter(x=>x.kind==='image'&&x.url).map(x=>x.url as string);
  const selectMain=(section:MainSection)=>{setMainSection(section);setTimeout(()=>document.getElementById('profile-tabs')?.scrollIntoView({behavior:'smooth',block:'start'}),0)};
  const saveCover=(url:string)=>{setCoverUrl(url);localStorage.setItem('sb1_cover_'+id,url);setCoverChooser(false)};
  const [wallet,setWallet] = useState(()=>{try{return JSON.parse(localStorage.getItem('sb1_specialist_wallet')||'{"balance":1250,"points":340,"due":180}')}catch{return {balance:1250,points:340,due:180}}});

  useEffect(() => {
    (async () => {
      const { data: doc } = await supabase.from('doctors').select('*, specialty(*)').eq('id', id).maybeSingle();
      let resolved = doc as Doctor | null;
      if (!resolved && id.startsWith('catalog-doctor-')) {
        const parts=id.split('-');
        const langCode=parts[2] || lang;
        const slug=parts.slice(3,-1).join('-');
        resolved = virtualDoctorsForSpecialty(slug, langCode, 10).find(d=>d.id===id) || null;
      }
      if (resolved) {
        setDoctor(resolved);
        const doc = resolved;
        if (doc.is_virtual) {
          const slug=doc.specialty?.slug||'';
          setQuestions(virtualQuestionsForSpecialty(slug,lang,8));
          setArticles(virtualArticlesForSpecialty(slug,lang,5));
          setAudios(virtualAudioForSpecialty(slug,lang,4));
          setPosts(Array.from({length:5},(_,i)=>({id:`virtual-post-${id}-${i+1}`,doctor_id:id,body:lang==='ar'?`منشور تعليمي من ${doc.name} حول ${doc.specialty?.name||'التخصص'}.`:`Educational post from ${doc.name} about ${doc.specialty?.name||'the specialty'}.`,image_url:null,video_url:i===1?'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4':null,post_type:i===1?'reel':'post',views:200+i*70,likes_count:30+i*11,comments_count:3+i,created_at:new Date(Date.now()-i*86400000).toISOString(),doctor:doc})) as SpecialistPost[]);
          setDiary([]); setComments({}); setLoading(false); return;
        }
        const { data: ans } = await supabase.from('answers').select('question_id').eq('doctor_id', id);
        if (ans && ans.length > 0) {
          const qIds = ans.map((a) => a.question_id);
          const { data: qs } = await supabase.from('questions').select('*, specialty(*), answers(*)').in('id', qIds).order('created_at', { ascending: false });
          setQuestions(qs || []);
        }
        const { data: p } = await supabase.from('specialist_posts').select('*').eq('doctor_id', id).order('created_at', { ascending: false }).limit(20);
        const demoPosts = doc.is_virtual ? Array.from({length:4},(_,i)=>({id:`virtual-post-${id}-${i+1}`,doctor_id:id,body:lang==='ar'?`منشور تجريبي من ${doc.name}: معلومة تثقيفية عامة مرتبطة بتخصصي.`:`Educational demo post from ${doc.name} about the specialty.`,image_url:null,video_url:i===1?'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4':null,post_type:i===1?'reel':'post',views:200+i*70,likes_count:30+i*11,comments_count:3+i,created_at:new Date(Date.now()-i*86400000).toISOString(),doctor:doc})) as SpecialistPost[] : [];
        setPosts(p && p.length ? p : demoPosts);
        const { data: d } = await supabase.from('specialist_diary').select('id, title, body, created_at').eq('doctor_id', id).eq('is_public', true).order('created_at', { ascending: false }).limit(10);
        setDiary(d || []);
        const { data: arts } = await supabase.from('articles').select('*, specialty(*)').eq('doctor_id', id).order('created_at', { ascending: false }).limit(10);
        setArticles(arts || []);
        const { data: aud } = await supabase.from('doctor_audio').select('*, specialty(*)').eq('doctor_id', id).order('created_at', { ascending: false }).limit(10);
        setAudios(aud || []);
        if (p && p.length > 0) {
          const pIds = p.map((x) => x.id);
          const { data: cs } = await supabase.from('post_comments').select('*').in('post_id', pIds).order('created_at');
          const cMap: Record<string, PostComment[]> = {};
          (cs || []).forEach((c) => { (cMap[c.post_id] = cMap[c.post_id] || []).push(c); });
          setComments(cMap);
        }
      }
      setLoading(false);
    })();
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

  const tabs: { key: Tab; label: string; icon: typeof FileText }[] = [
    { key:'home', label:lang==='ar'?'الرئيسية':'Home', icon:Home },
    { key:'sessions', label:lang==='ar'?'جلساتي':'My Sessions', icon:Video },
    { key:'articles', label:lang==='ar'?'مقالتي':'My Articles', icon:BookOpen },
    { key:'questions', label:lang==='ar'?'الأسئلة المجابة':'Answered Questions', icon:MessageCircle },
    { key:'recordings', label:lang==='ar'?'تسجيلاتي':'My Recordings', icon:Video },
    { key:'courses', label:lang==='ar'?'الدورات والكورسات':'Courses', icon:GraduationCap },
    { key:'certificates', label:lang==='ar'?'شهاداتي':'My Certificates', icon:Award },
  ];

  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="max-w-6xl mx-auto px-3 sm:px-5 lg:px-8">
        <button onClick={() => navigate('/doctors')} className="flex items-center gap-2 text-gray-500 hover:text-teal-600 transition-colors mb-4 mt-4">
          <ArrowRight className="w-4 h-4" />
          {t('common.back')}
        </button>

        <div className="mb-2 min-h-[58px] rounded-xl border border-dashed border-slate-200 bg-slate-50/60" aria-label="مساحة إعلانية" />

        <aside className="fixed top-24 bottom-6 z-40 hidden w-60 xl:block end-4 2xl:end-8 overflow-y-auto" aria-label="قائمة SB1 الرئيسية">
          <div className="space-y-2">
            {canSeePrivate&&<button onClick={()=>selectMain('wallet')} className="flex w-full items-center gap-2 rounded-xl bg-black px-4 py-3 text-sm font-extrabold text-white shadow-sm active:bg-slate-900"><Wallet className="h-4 w-4"/>الحساب والمحفظة</button>}
            {canManagePage&&<button onClick={()=>selectMain('clone')} className="flex w-full items-center gap-2 rounded-xl bg-emerald-100 px-4 py-3 text-sm font-extrabold text-emerald-800 shadow-sm active:bg-emerald-200"><Copy className="h-4 w-4"/>الاستنساخ</button>}
            <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
              <button onClick={()=>selectMain('home')} className="flex w-full items-center gap-2 border-b px-4 py-3 text-sm font-bold hover:bg-slate-50 active:bg-slate-200"><Home className="h-4 w-4"/>الرئيسية</button>
              <button onClick={()=>selectMain('favorites')} className="flex w-full items-center gap-2 border-b px-4 py-3 text-sm font-bold hover:bg-slate-50 active:bg-slate-200"><Heart className="h-4 w-4"/>مفضلتي</button>
              <button onClick={()=>selectMain('albums')} className="flex w-full items-center gap-2 border-b px-4 py-3 text-sm font-bold hover:bg-slate-50 active:bg-slate-200"><Library className="h-4 w-4"/>الألبومات</button>
              <button onClick={()=>selectMain('social')} className="flex w-full items-center gap-2 border-b px-4 py-3 text-sm font-bold hover:bg-slate-50 active:bg-slate-200"><ExternalLink className="h-4 w-4"/>منصات التواصل</button>
              <button onClick={()=>selectMain('phone')} className="flex w-full items-center gap-2 border-b px-4 py-3 text-sm font-bold hover:bg-slate-50 active:bg-slate-200"><Share2 className="h-4 w-4"/>الهاتف وQR</button>
              {canManagePage&&<button onClick={()=>selectMain('settings')} className="flex w-full items-center gap-2 px-4 py-3 text-sm font-bold hover:bg-slate-50 active:bg-slate-200"><SettingsIcon className="h-4 w-4"/>الإعدادات</button>}
            </div>
            <div className="mt-3 rounded-xl border bg-white p-3 shadow-sm">
              <button onClick={()=>setShowFollowers(v=>!v)} className="flex w-full items-center justify-between active:bg-slate-100 rounded-lg p-1">
                <span className="text-sm font-extrabold">المتابعون</span><span className="text-xs text-slate-400">{doctor.follower_count||followers.length}</span>
              </button>
              <div className="mt-3 flex flex-wrap gap-2">
                {followers.slice(0,showFollowers?followers.length:5).map(f=><button key={f.id} title={f.name} onClick={()=>navigate('/doctors/'+f.id)} className="relative grid h-9 w-9 place-items-center rounded-full bg-emerald-100 text-xs font-extrabold text-emerald-800 ring-2 ring-white shadow-sm active:bg-emerald-200">{f.name.replace('د. ','').charAt(0)}{f.online&&<span className="absolute -bottom-0.5 -left-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500"/>}</button>)}
              </div>
              {showFollowers&&<div className="mt-3 space-y-1 border-t pt-2">{followers.map(f=><button key={f.id} onClick={()=>navigate('/doctors/'+f.id)} className="flex w-full items-center gap-2 rounded-lg p-2 text-right text-xs font-bold hover:bg-slate-50 active:bg-slate-100"><span className="grid h-7 w-7 place-items-center rounded-full bg-emerald-100 text-emerald-800">{f.name.replace('د. ','').charAt(0)}</span>{f.name}</button>)}</div>}
            </div>
          </div>
        </aside>
        <div className="xl:me-[17rem] min-w-0">
          <div className="mb-2"><StoryBar pageId={id} canManage={canManagePage} /></div>
        {/* Cover + Profile Header */}
        <div className="card overflow-hidden mb-6">
          <div className="relative h-32 overflow-hidden bg-gradient-to-l from-teal-500 via-teal-600 to-teal-700">{coverUrl&&<img src={coverUrl} alt="" className="h-full w-full object-cover"/>}{canManagePage&&<div className="absolute bottom-3 left-3 flex gap-2"><label className="cursor-pointer rounded-lg bg-black/60 px-3 py-2 text-xs font-bold text-white backdrop-blur active:bg-black/70">تغيير الغلاف<input type="file" accept="image/*" className="hidden" onChange={e=>{const f=e.target.files?.[0];if(f){const u=URL.createObjectURL(f);saveCover(u)}}}/></label><button onClick={()=>setCoverChooser(true)} className="rounded-lg bg-black/60 px-3 py-2 text-xs font-bold text-white backdrop-blur active:bg-black/70">من المفضلة</button></div>}</div>
          <div className="px-6 pb-6">
            <div className="flex flex-col md:flex-row gap-4 -mt-12">
              <div className="w-28 h-28 rounded-2xl overflow-hidden bg-gradient-to-br from-teal-100 to-teal-50 flex items-center justify-center shrink-0 ring-4 ring-white mx-auto md:mx-0">
                {!imgError ? (
                  <img src={profileAvatar} alt={doctor.name} className="w-full h-full object-cover" onError={() => setImgError(true)} />
                ) : (
                  <span className="text-4xl font-bold text-teal-600">{doctor.name.replace('د. ', '').charAt(0)}</span>
                )}
              </div>
              <div className="flex-1 text-center md:text-right pt-2"><div className="mb-1 text-[10px] font-bold text-slate-400">الصورة الرسمية للأخصائي</div>
                <div className="flex items-center justify-center md:justify-start gap-2">
                  <h1 className="text-xl font-bold text-gray-800">{doctor.name}</h1>
                  {doctor.is_verified && <BadgeCheck className="w-5 h-5 text-teal-500" />}
                </div>
                {doctor.specialty && <p className="text-teal-600 font-medium text-sm">{specialtyName(doctor.specialty)}</p>}
                <div className="flex flex-wrap justify-center md:justify-start gap-3 text-xs text-gray-500 mt-2">
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
                <button onClick={shareProfile} className="px-6 py-2.5 rounded-xl border border-teal-200 text-teal-700 bg-teal-50 font-semibold text-sm flex items-center justify-center gap-2">
                  <Share2 className="w-4 h-4" /> مشاركة صفحة SB1
                </button>
              </div>
            </div>
            {doctor.bio && <p className="text-sm text-gray-600 mt-4 leading-relaxed">{doctor.bio}</p>}
          </div>
        </div>

        <div id="profile-tabs" className="mb-5 overflow-x-auto rounded-xl border bg-white shadow-sm">
          <div className="flex min-w-max items-center" dir={lang==='ar'?'rtl':'ltr'}>
            {tabs.map((tab,i)=>{const Icon=tab.icon;return <button key={tab.label+'-'+i} onClick={()=>{setMainSection('home');setActiveTab(tab.key)}} className={`flex items-center gap-2 border-e px-4 py-3 text-sm font-bold transition ${activeTab===tab.key?'bg-teal-50 text-teal-700':'text-slate-600 hover:bg-slate-50 hover:text-teal-700'}`}><Icon className="h-4 w-4"/>{tab.label}</button>})}
            <button onClick={()=>navigate('/notifications/private')} className="flex items-center gap-2 px-4 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-teal-700"><Bell className="h-4 w-4"/>إشعارات</button>
          </div>
        </div>
        {mainSection === 'wallet' && canSeePrivate && (
          <div className="mb-5 grid gap-4 md:grid-cols-3">
            <div className="card p-5"><Wallet className="text-teal-600"/><b className="block mt-3">الرصيد</b><strong>{wallet.balance} USD</strong></div>
            <div className="card p-5"><Coins className="text-indigo-600"/><b className="block mt-3">النقاط</b><strong>{wallet.points}</strong></div>
            <div className="card p-5"><BadgeCheck className="text-amber-500"/><b className="block mt-3">المستحقات</b><strong>{wallet.due} USD</strong></div>
          </div>
        )}
        {mainSection === 'favorites' && <FavoritesPage />}
        {mainSection === 'home' && activeTab === 'home' && (
          <PageProfileTools canManage={canManagePage} pageId={id} pageName={doctor.name} seedPosts={posts} hideStories focusSection="home" />
        )}
        {mainSection === 'albums' && <PageProfileTools canManage={canManagePage} pageId={id} pageName={doctor.name} seedPosts={posts} focusSection="albums" />}
        {mainSection === 'social' && <PageProfileTools canManage={canManagePage} pageId={id} pageName={doctor.name} seedPosts={posts} focusSection="social" />}
        {mainSection === 'phone' && <PageProfileTools canManage={canManagePage} pageId={id} pageName={doctor.name} seedPosts={posts} focusSection="phone" />}
        {mainSection === 'settings' && canManagePage && <PageProfileTools canManage={canManagePage} pageId={id} pageName={doctor.name} seedPosts={posts} focusSection="settings" />}
        {mainSection === 'clone' && canManagePage && <PageProfileTools canManage={canManagePage} pageId={id} pageName={doctor.name} seedPosts={posts} focusSection="clone" />}

        {mainSection === 'home' && activeTab === 'sessions' && (
          <div className="card p-5"><div className="mb-4 flex items-center justify-between"><div><h2 className="text-xl font-extrabold">جلساتي</h2><p className="text-xs text-slate-500">الجلسات المجانية التي تمت مع المتابعين، وليست فيديوهات.</p></div><CalendarDaysIcon className="text-teal-700"/></div><div className="space-y-3">{(diary.length?diary:Array.from({length:4},(_,i)=>({id:'demo-session-'+i,title:'جلسة مجانية '+(i+1),body:'جلسة تعريفية مجانية مع المتابعين',created_at:new Date(Date.now()-i*86400000).toISOString()}))).map((s:any)=><article key={s.id} className="rounded-xl border bg-white p-4"><div className="flex items-center justify-between gap-3"><div><b>{s.title||'جلسة مجانية'}</b><p className="mt-1 text-xs text-slate-500">{s.body}</p></div><span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">مجانية</span></div><div className="mt-2 text-xs text-slate-400">{new Date(s.created_at).toLocaleDateString()}</div></article>)}</div></div>
        )}
        {mainSection === 'home' && activeTab === 'recordings' && (
          <div className="card p-5"><h2 className="text-xl font-extrabold mb-4">تسجيلاتي</h2>{audios.length ? <div className="space-y-3">{audios.map(a=><div key={a.id} className="rounded-xl border p-4"><div className="flex items-center justify-between gap-3"><div><b>{a.title}</b><p className="mt-1 text-xs text-slate-500">{a.description}</p></div><Bookmark className="h-4 w-4 text-teal-700"/></div><audio src={a.audio_url} controls className="mt-3 w-full"/><button onClick={()=>toggleSaved({id:a.id,kind:'recording',title:a.title,body:a.description,author:doctor.name,url:a.audio_url,created_at:a.created_at})} className="mt-2 rounded-lg bg-slate-50 px-3 py-2 text-xs font-bold active:bg-slate-200">حفظ في مفضلتي</button></div>)}</div> : <p className="text-slate-500">لا توجد تسجيلات منشورة بعد.</p>}</div>
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
            {virtualCoursesForSpecialty(doctor.specialty?.slug||'',lang,6).map(c=><div key={c.id} className="card p-5"><h3 className="font-bold">{c.title}</h3><p className="mt-2 text-sm text-gray-500">{c.description}</p><div className="mt-3 flex justify-between"><b>{c.price} USD</b><button onClick={()=>navigate('/courses/'+c.id)} className="rounded-xl bg-teal-700 px-3 py-2 text-white">فتح الدورة</button></div></div>)}
          </div>
        )}

        {activeTab === 'questions' && (
          <div className="space-y-4">
            {questions.map(q=><QuestionCard key={q.id} question={q}/>)}
            <a href={'/questions?specialty='+(doctor.specialty?.slug||'')} className="inline-block rounded-xl bg-teal-700 px-4 py-2 text-white font-bold">كل الأسئلة والإجابات</a>
          </div>
        )}

          <button onClick={() => navigate(`/ask?specialty=${doctor.specialty?.slug || ''}`)} className="btn-primary flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              {t('hero.ask_now')}
            </button>
          </div>
        </div>

        {questions.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">{lang === 'ar' ? 'الأسئلة المجابة' : 'Answered Questions'}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {questions.map((q) => <QuestionCard key={q.id} question={q} />)}
            </div>
          </div>
        )}
      </div>
      </div>
    </div>
  );
}
