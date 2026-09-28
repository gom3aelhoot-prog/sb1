import { useEffect, useState } from 'react';
import { ArrowRight, Star, MapPin, Clock, MessageCircle, GraduationCap, Award, Heart, Users, FileText, Video, BookOpen, Send, BadgeCheck, PenLine, Share2, ExternalLink, Copy, Briefcase as BriefcaseIcon, Settings as SettingsIcon, Bookmark, Archive, Coins, Wallet, Bell, ShieldCheck } from 'lucide-react';
import { useRouter } from '@/lib/router';
import { useI18n } from '@/lib/i18n';
import { supabase, type Doctor, type Question, type SpecialistPost, type PostComment, type Article, type DoctorAudio } from '@/lib/supabase';
import QuestionCard from '@/components/QuestionCard';
import { virtualDoctorsForSpecialty, virtualQuestionsForSpecialty, virtualArticlesForSpecialty, virtualAudioForSpecialty, virtualVideosForSpecialty, virtualCoursesForSpecialty } from '@/lib/catalog';
import { toggleSaved, isSaved, toggleLiked, isLiked, archiveItem, addComment, toggleFollowing, isFollowing as isFollowingVault } from '@/lib/socialVault';

type Tab = 'videos' | 'articles' | 'courses' | 'questions' | 'portfolio' | 'control';

export default function DoctorProfilePage({ id }: { id: string }) {
  const { navigate } = useRouter();
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
  const [activeTab, setActiveTab] = useState<Tab>('videos');
  const [loading, setLoading] = useState(true);
  const [imgError, setImgError] = useState(false);
  const [isFollowing, setIsFollowing] = useState(()=>isFollowingVault(id));
  const [canViewPrivateFinance, setCanViewPrivateFinance] = useState(false);
  const profileAvatar = doctor?.photo_url || ('https://api.dicebear.com/9.x/personas/svg?seed=' + encodeURIComponent(id));
  const [wallet,setWallet] = useState(()=>{try{return JSON.parse(localStorage.getItem('sb1_specialist_wallet')||'{"balance":1250,"points":340,"due":180}')}catch{return {balance:1250,points:340,due:180}}});

  useEffect(() => {
    (async () => {
      try {
        const { data: auth } = await supabase.auth.getUser();
        const user = auth?.user as any;
        const role = user?.user_metadata?.role || localStorage.getItem('sb1_account_role') || '';
        const accountDoctorId = localStorage.getItem('sb1_account_doctor_id') || user?.user_metadata?.doctor_id || '';
        let admin = false;
        if (user?.email) {
          const { data: adminRow } = await supabase.from('admin_users').select('role,is_active').eq('email', user.email).maybeSingle();
          admin = Boolean(adminRow?.is_active && ['owner','moderator','admin','supervisor'].includes(String(adminRow.role).toLowerCase()));
        }
        const isOwner = Boolean(user?.id && accountDoctorId && accountDoctorId === id);
        setCanViewPrivateFinance(Boolean(admin || isOwner || ['owner','moderator','admin','supervisor'].includes(String(role).toLowerCase())));
      } catch { setCanViewPrivateFinance(false); }
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
    { key: 'videos', label: lang==='ar'?'فيديوهاتي وريلز وقصصي':lang==='ru'?'Мои видео, Reels и истории':'My Videos, Reels & Stories', icon: Video },
    { key: 'articles', label: lang==='ar'?'مقالاتي':lang==='ru'?'Мои статьи':'My Articles', icon: BookOpen },
    { key: 'courses', label: lang==='ar'?'الدورات والكورسات':lang==='ru'?'Курсы':'Courses', icon: GraduationCap },
    { key: 'questions', label: lang==='ar'?'الاستشارات والأسئلة السابقة':lang==='ru'?'Консультации и вопросы':'Consultations & Questions', icon: MessageCircle },
    { key: 'portfolio', label: lang==='ar'?'المحفظة والحسابات':lang==='ru'?'Портфолио и счета':'Portfolio & Accounts', icon: BriefcaseIcon },
    { key: 'control', label: lang==='ar'?'الإشعارات والتحكم':lang==='ru'?'Уведомления и управление':'Notifications & Control', icon: SettingsIcon },
  ];

  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <button onClick={() => navigate('/doctors')} className="flex items-center gap-2 text-gray-500 hover:text-teal-600 transition-colors mb-4 mt-4">
          <ArrowRight className="w-4 h-4" />
          {t('common.back')}
        </button>

        {/* Cover + Profile Header */}
        <div className="card overflow-hidden mb-6">
          <div className="h-32 bg-gradient-to-l from-teal-500 via-teal-600 to-teal-700" />
          <div className="px-6 pb-6">
            <div className="flex flex-col md:flex-row gap-4 -mt-12">
              <div className="w-28 h-28 rounded-2xl overflow-hidden bg-gradient-to-br from-teal-100 to-teal-50 flex items-center justify-center shrink-0 ring-4 ring-white mx-auto md:mx-0">
                {!imgError ? (
                  <img src={profileAvatar} alt={doctor.name} className="w-full h-full object-cover" onError={() => setImgError(true)} />
                ) : (
                  <span className="text-4xl font-bold text-teal-600">{doctor.name.replace('د. ', '').charAt(0)}</span>
                )}
              </div>
              <div className="flex-1 text-center md:text-right pt-2">
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

        {/* SB1 profile sharing / external social platforms */}
        <div className="card p-5 mb-6 bg-gradient-to-l from-white to-teal-50">
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-xl bg-teal-100 flex items-center justify-center shrink-0"><Share2 className="w-5 h-5 text-teal-700"/></div>
            <div className="flex-1">
              <h2 className="font-extrabold text-gray-800">تابع الأخصائي على SB1</h2>
              <p className="text-sm text-gray-500 mt-1">يمكن للأخصائي مشاركة رابط صفحته على منصات التواصل الأخرى. لا نستخدم أو نقلد واجهات تلك المنصات ولا ننشر بالنيابة عنها.</p>
              <div className="flex flex-wrap gap-2 mt-4">
                <button onClick={shareProfile} className="rounded-xl bg-teal-600 text-white px-4 py-2 text-sm font-semibold flex items-center gap-2"><Share2 className="w-4 h-4"/>مشاركة</button>
                <button onClick={async()=>{await navigator.clipboard?.writeText(window.location.href);alert('تم نسخ رابط صفحة SB1')}} className="rounded-xl border bg-white px-4 py-2 text-sm font-semibold flex items-center gap-2"><Copy className="w-4 h-4"/>نسخ الرابط</button>
                
                <a target="_blank" rel="noreferrer" href={`https://t.me/share/url?url=${encodeURIComponent(window.location.origin+'/doctors/'+id)}&text=${encodeURIComponent('تابع '+doctor.name+' على SB1')}`} className="rounded-xl border bg-white px-4 py-2 text-sm font-semibold flex items-center gap-2"><ExternalLink className="w-4 h-4"/>Telegram</a>
              </div>
            </div>
          </div>
        </div>

        {canViewPrivateFinance && <div className="sticky top-16 z-20 mb-4 rounded-2xl border bg-slate-900 text-white shadow-lg">
          <div className="grid grid-cols-3 divide-x divide-white/10">
            <div className="p-3 text-center"><Wallet className="mx-auto h-5 w-5"/><span className="mt-1 block text-[11px] text-white/60">رصيد الأموال</span><b>{wallet.balance} USD</b></div>
            <div className="p-3 text-center"><Coins className="mx-auto h-5 w-5"/><span className="mt-1 block text-[11px] text-white/60">محفظة النقاط</span><b>{wallet.points}</b></div>
            <div className="p-3 text-center"><BadgeCheck className="mx-auto h-5 w-5"/><span className="mt-1 block text-[11px] text-white/60">المستحقات</span><b>{wallet.due} USD</b></div>
          </div>
          <div className="border-t border-white/10 px-4 py-2 text-center text-[11px] text-white/65">هذه البيانات مالية خاصة. لا يراها إلا صاحب الحساب والمشرفون والإدارة.</div>
        </div>}

        {/* Tabs */}
        <div className="flex gap-1 mb-6 border-b border-gray-100 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all border-b-2 ${activeTab === tab.key ? 'text-teal-600 border-teal-600' : 'text-gray-500 border-transparent hover:text-teal-600'}`}>
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        {activeTab === 'videos' && (
          <div className="space-y-4">
            {posts.map((post) => (
              <div key={post.id} className="card p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 font-bold text-sm">{doctor.name.charAt(0)}</div>
                  <div>
                    <p className="font-semibold text-sm text-gray-800">{doctor.name}</p>
                    <p className="text-xs text-gray-400">{new Date(post.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-700 mb-3">{post.body}</p>
                <div className="flex gap-2 mb-3"><button onClick={()=>toggleSaved({id:post.id,kind:post.video_url?'reel':'post',title:post.body,body:post.body,author:doctor.name,created_at:post.created_at})} className="rounded-lg bg-slate-50 px-3 py-2 text-xs"><Bookmark className="inline h-4 w-4 me-1"/>{isSaved(post.id)?'محفوظ':'حفظ'}</button><button onClick={()=>{archiveItem({id:post.id,kind:post.video_url?'reel':'post',title:post.body,body:post.body,author:doctor.name,created_at:post.created_at});setPosts(x=>x.filter(y=>y.id!==post.id))}} className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700"><Archive className="inline h-4 w-4 me-1"/>أرشفة خاصة</button></div>
                {post.image_url && <img src={post.image_url} alt="" className="w-full rounded-xl mb-3 max-h-96 object-cover" />}
                {post.video_url && <video src={post.video_url} controls className="w-full rounded-xl mb-3" />}
                <div className="flex items-center gap-4 text-sm text-gray-500 pb-3 border-b border-gray-50">
                  <button onClick={() => handleLike(post.id)} className="flex items-center gap-1.5 hover:text-rose-500 transition-colors">
                    <Heart className={`w-4 h-4 ${likedPosts.has(post.id) ? 'fill-rose-500 text-rose-500' : ''}`} />
                    {(post.likes_count || 0) + (likedPosts.has(post.id) ? 1 : 0)}
                  </button>
                  <span className="flex items-center gap-1.5"><MessageCircle className="w-4 h-4" />{(comments[post.id] || []).length}</span>
                </div>
                <div className="space-y-2 mt-3">
                  {(comments[post.id] || []).map((c) => (
                    <div key={c.id} className="flex gap-2">
                      <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500 flex-shrink-0">{c.author_name.charAt(0)}</div>
                      <div className="bg-gray-50 rounded-xl px-3 py-2 flex-1">
                        <p className="text-xs font-semibold text-gray-700">{c.author_name}</p>
                        <p className="text-sm text-gray-600">{c.body}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 mt-3">
                  <input
                    type="text"
                    value={commentInputs[post.id] || ''}
                    onChange={(e) => setCommentInputs((prev) => ({ ...prev, [post.id]: e.target.value }))}
                    onKeyDown={(e) => e.key === 'Enter' && handleComment(post.id)}
                    placeholder={t('profile.comment_placeholder')}
                    className="flex-1 px-3 py-2 rounded-xl border border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none text-sm"
                  />
                  <button onClick={() => handleComment(post.id)} className="bg-teal-600 text-white p-2 rounded-xl"><Send className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
            {posts.length === 0 && <p className="text-center text-gray-400 py-8">{t('common.loading')}</p>}
          </div>
        )}

        {activeTab === 'videos' && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {posts.filter((p) => p.video_url).map((p) => (
              <div key={p.id} className="card overflow-hidden">
                <video src={p.video_url || undefined} controls className="w-full aspect-[9/16] object-cover" />
                <div className="p-3"><p className="text-xs text-gray-600 line-clamp-2">{p.body}</p></div>
              </div>
            ))}
            {posts.filter((p) => p.video_url).length === 0 && <p className="text-center text-gray-400 py-8 col-span-full">{t('common.loading')}</p>}
          </div>
        )}

        {activeTab === 'videos' && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {posts.slice(0,5).map((p,i)=><button key={p.id} onClick={()=>setActiveTab('videos')} className="relative overflow-hidden rounded-2xl aspect-[3/5] bg-gradient-to-br from-teal-600 to-cyan-500 text-white p-4 text-start shadow-sm">
              {p.image_url&&<img src={p.image_url} alt="" className="absolute inset-0 h-full w-full object-cover opacity-70"/>}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"/>
              <span className="relative z-10 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white text-teal-700 font-bold">{i+1}</span>
              <span className="absolute bottom-3 start-3 end-3 z-10 text-xs font-semibold">{p.body}</span>
            </button>)}
          </div>
        )}

        {activeTab === 'articles' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {articles.map((a) => (
              <div key={a.id} className="card p-5 hover:shadow-lg transition-all cursor-pointer" onClick={() => navigate(`/articles/${a.id}`)}>
                {a.image_url && <img src={a.image_url} alt="" className="w-full h-32 rounded-xl object-cover mb-3" />}
                <h3 className="font-bold text-gray-800 text-sm mb-1">{a.title}</h3>
                <p className="text-xs text-gray-500 line-clamp-2">{a.excerpt}</p><button onClick={(e)=>{e.stopPropagation();toggleSaved({id:a.id,kind:'article',title:a.title,body:a.excerpt,author:doctor.name,created_at:a.created_at})}} className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-xs"><Bookmark className="inline h-4 w-4 me-1"/>{isSaved(a.id)?'محفوظ':'حفظ المقال'}</button>
              </div>
            ))}
            {articles.length === 0 && <p className="text-center text-gray-400 py-8 col-span-full">{t('common.loading')}</p>}
          </div>
        )}

        {activeTab === 'courses' && (
          <div className="grid gap-4 md:grid-cols-2">{virtualCoursesForSpecialty(doctor.specialty?.slug||'',lang,6).map(c=><div key={c.id} className="card p-5"><h3 className="font-bold">{c.title}</h3><p className="mt-2 text-sm text-gray-500">{c.description}</p><div className="mt-3 flex justify-between"><b>{c.price} USD</b><button onClick={()=>navigate('/courses/'+c.id)} className="rounded-xl bg-teal-700 px-3 py-2 text-white">فتح الدورة</button></div></div>)}</div>
        )}

        {activeTab === 'questions' && (
          <div className="space-y-4">{questions.map(q=><QuestionCard key={q.id} question={q}/>)}<a href={'/questions?specialty='+(doctor.specialty?.slug||'')} className="inline-block rounded-xl bg-teal-700 px-4 py-2 text-white font-bold">كل الأسئلة والإجابات</a></div>
        )}

        {canViewPrivateFinance && activeTab === 'portfolio' && (
          <div className="grid gap-4 md:grid-cols-3"><div className="card p-5"><Wallet className="text-teal-600"/><b className="block mt-3">الرصيد</b><strong>{wallet.balance} USD</strong></div><div className="card p-5"><Coins className="text-indigo-600"/><b className="block mt-3">النقاط</b><strong>{wallet.points}</strong></div><div className="card p-5"><BadgeCheck className="text-amber-500"/><b className="block mt-3">المستحقات</b><strong>{wallet.due} USD</strong></div><div className="card p-5 md:col-span-3"><b>أدوات الأخصائي</b><div className="mt-3 flex flex-wrap gap-2"><button onClick={()=>navigate('/specialist/packages')} className="rounded-xl bg-teal-50 px-4 py-2 text-teal-700">باقات المتابعة</button><button onClick={()=>navigate('/specialist/studio')} className="rounded-xl bg-indigo-50 px-4 py-2 text-indigo-700">استوديو الأخصائي</button><button onClick={()=>navigate('/wallet')} className="rounded-xl bg-slate-100 px-4 py-2">المحفظة</button></div></div></div>
        )}

        {canViewPrivateFinance && activeTab === 'control' && (
          <div className="grid gap-4 md:grid-cols-2"><a href="/notifications/private" className="card p-5"><Bell className="text-teal-600"/><b className="block mt-2">الإشعارات الخاصة</b></a><a href="/settings" className="card p-5"><SettingsIcon className="text-indigo-600"/><b className="block mt-2">إعدادات الحساب والتحكم</b></a><a href="/specialist/content" className="card p-5"><PenLine className="text-amber-600"/><b className="block mt-2">نشر وإدارة المحتوى</b></a><a href="/specialist/studio" className="card p-5"><ShieldCheck className="text-emerald-600"/><b className="block mt-2">الإيموجي والبادجات</b></a></div>
        )}

        {/* CTA */}
        <div className="card p-6 mt-6 bg-gradient-to-l from-teal-50 to-white">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h3 className="font-bold text-gray-800 mb-1">{lang === 'ar' ? 'لديك سؤال لهذا الأخصائي؟' : 'Have a question?'}</h3>
              <p className="text-gray-500 text-sm">{lang === 'ar' ? 'اطرح سؤالك واحصل على إجابة احترافية' : 'Ask and get a professional answer'}</p>
            </div>
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
  );
}
