import { useEffect, useState } from 'react';
import { ArrowRight, Home, Star, MapPin, Clock, MessageCircle, GraduationCap, Award, Heart, Users, FileText, Video, BookOpen, Send, BadgeCheck, PenLine, Share2, ExternalLink, Copy, Briefcase as BriefcaseIcon, Settings as SettingsIcon, Bookmark, Archive, Coins, Wallet, Bell, ShieldCheck } from 'lucide-react';
import { useRouter } from '@/lib/router';
import { getRole } from '@/lib/access';
import PageProfileTools from '@/components/PageProfileTools';
import { useI18n } from '@/lib/i18n';
import { supabase, type Doctor, type Question, type SpecialistPost, type PostComment, type Article, type DoctorAudio } from '@/lib/supabase';
import QuestionCard from '@/components/QuestionCard';
import { virtualDoctorsForSpecialty, virtualQuestionsForSpecialty, virtualArticlesForSpecialty, virtualAudioForSpecialty, virtualVideosForSpecialty, virtualCoursesForSpecialty } from '@/lib/catalog';
import { toggleSaved, isSaved, toggleLiked, isLiked, archiveItem, addComment, toggleFollowing, isFollowing as isFollowingVault } from '@/lib/socialVault';

type Tab = 'home' | 'articles' | 'questions' | 'courses' | 'portfolio';

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
  const [loading, setLoading] = useState(true);
  const [imgError, setImgError] = useState(false);
  const [isFollowing, setIsFollowing] = useState(()=>isFollowingVault(id));
  const profileAvatar = doctor?.photo_url || ('https://api.dicebear.com/9.x/personas/svg?seed=' + encodeURIComponent(id));
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
    { key: 'home', label: lang==='ar'?'الرئيسية':lang==='ru'?'Главная':'Home', icon: Home },
    { key: 'articles', label: lang==='ar'?'مقالاتي':lang==='ru'?'Мои статьи':'My Articles', icon: BookOpen },
    { key: 'questions', label: lang==='ar'?'الأسئلة المجابة':lang==='ru'?'Отвеченные вопросы':'Answered Questions', icon: MessageCircle },
    { key: 'courses', label: lang==='ar'?'الدورات والكورسات':lang==='ru'?'Курсы':'Courses', icon: GraduationCap },
    ...(canSeePrivate ? [{ key: 'portfolio' as Tab, label: lang==='ar'?'الحسابات والمال':lang==='ru'?'Счета и финансы':'Accounts & Money', icon: BriefcaseIcon }] : []),
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

        {/* Main profile navigation — directly under the green profile header */}
        <div className="mb-5 overflow-x-auto rounded-xl border bg-white shadow-sm">
          <div className="flex min-w-max">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-bold transition-all ${activeTab === tab.key ? 'border-teal-600 bg-teal-50 text-teal-700' : 'border-transparent text-gray-500 hover:bg-gray-50 hover:text-teal-700'}`}>
                  <Icon className="h-4 w-4" />{tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {activeTab === 'home' && (
          <PageProfileTools canManage={canManagePage} pageId={id} pageName={doctor.name} seedPosts={posts} />
        )}

        {canSeePrivate && activeTab === 'portfolio' && (
          <div className="mb-5 grid gap-4 md:grid-cols-3">
            <div className="card p-5"><Wallet className="text-teal-600"/><b className="block mt-3">الرصيد</b><strong>{wallet.balance} USD</strong></div>
            <div className="card p-5"><Coins className="text-indigo-600"/><b className="block mt-3">النقاط</b><strong>{wallet.points}</strong></div>
            <div className="card p-5"><BadgeCheck className="text-amber-500"/><b className="block mt-3">المستحقات</b><strong>{wallet.due} USD</strong></div>
          </div>
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
