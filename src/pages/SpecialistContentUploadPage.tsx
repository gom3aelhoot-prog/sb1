import { useEffect, useState } from 'react';
import { Upload, FileText, Video, Headphones, BookOpen, Clock, ShieldCheck, Sparkles, Search, Image as ImageIcon, BadgeCheck, MessageCircle, TrendingUp, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useI18n } from '@/lib/i18n';
import { specialtyCatalog } from '@/lib/catalog';
import { moderateAndLog } from '@/lib/questionEconomy';

export default function SpecialistContentUploadPage() {
  const { lang, dir } = useI18n();
  const [type, setType] = useState('article');
  const [contentLanguage, setContentLanguage] = useState(lang);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [price, setPrice] = useState('0');
  const [offerDays, setOfferDays] = useState('30');
  const [file, setFile] = useState<File | null>(null);
  const [cover, setCover] = useState<File | null>(null);
  const [userId, setUserId] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const [coverSearch, setCoverSearch] = useState('');
  const [coverImages, setCoverImages] = useState<any[]>([]);
  const [selectedCover, setSelectedCover] = useState<any>(null);
  const [mediaTab, setMediaTab] = useState<'covers'|'emoji'|'badges'>('covers');
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiOutput, setAiOutput] = useState('');
  const [aiBusy, setAiBusy] = useState(false);
  const [freeAnswered, setFreeAnswered] = useState(0);

  useEffect(() => {
    const first = specialtyCatalog(lang)[0];
    setSpecialty(first?.slug || '');
    supabase.auth.getUser().then((r: any) => setUserId(r.data?.user?.id || ''));
    setFreeAnswered(Number(localStorage.getItem('sb1_free_answers_count') || 0));
  }, [lang]);

  useEffect(() => {
    const loadCovers = async () => {
      try {
        let q: any = supabase.from('content_image_library').select('*').limit(48);
        const selected = specialtyCatalog(contentLanguage).find(x => x.slug === specialty);
        if (selected?.id) q = q.eq('specialty_id', selected.id);
        if (coverSearch) q = q.ilike('search_text', '%' + coverSearch.replace(/[%_]/g, '') + '%');
        const { data } = await q;
        if (data?.length) {
          setCoverImages(data);
          return;
        }
      } catch {}
      setCoverImages(Array.from({ length: 24 }, (_, i) => ({
        id: 'demo-cover-' + i,
        image_url: 'https://loremflickr.com/600/400/medical,health?lock=' + (i + 1),
        title: 'SB1 medical cover ' + (i + 1),
        search_text: specialty,
      })));
    };
    loadCovers();
  }, [specialty, coverSearch, lang]);


  const mediaImages = Array.from({length: 72}, (_, i) => ({ id: 'bank-' + (i + 1), title: 'Medical Media ' + (i + 1), image_url: 'https://images.unsplash.com/photo-' + ['1576091160399-112ba8d25d1d','1579684385127-1ef15d508118','1584982751601-97dcc096659c','1532938911079-1b06ac7ceec7','1584515933487-779824d29309','1559757175-0eb30cd8c063'][i % 6] + '?auto=format&fit=crop&w=1200&q=90', search_text: 'medical health ' + i }));
  const medicalBadges = ['🩺','❤️','🫀','🧠','🫁','🦷','👁️','🧬','🧪','💊','🏥','🚑','🩻','🔬','🩹','🧑‍⚕️','👩‍⚕️','🧑‍🔬','🧘','💚','⭐','🏅','✅','🛡️'];
  const badgeNames = ['طبيب معتمد','أخصائي موثق','محتوى طبي','رعاية موثوقة','مجيب مجاني','خبير التخصص','محتوى مميز','كاتب طبي','مدرب معتمد','مركز موثق','مؤسسة صحية','شريك SB1'];
  const runAI = async (kind: 'article'|'reel'|'reply') => {
    setAiBusy(true); setAiOutput(''); await new Promise(r => setTimeout(r, 450));
    const topic = aiPrompt.trim() || title || 'موضوع طبي'; const spec = specialty || 'التخصص الطبي';
    const out = kind === 'article' ? 'عنوان مقترح: ' + topic + '\n\nمقدمة: محتوى تثقيفي عام حول ' + spec + ' يشرح الفكرة بلغة واضحة.\n\nالنقاط الرئيسية:\n• تعريف مبسط\n• الأعراض والعلامات الشائعة\n• متى يجب طلب المساعدة الطبية\n• نصائح عامة مبنية على مصادر موثوقة\n\nتنبيه: المحتوى تثقيفي ولا يغني عن التشخيص.' : kind === 'reel' ? 'فكرة ريلز 45 ثانية عن ' + spec + ': سؤال جذاب، ثلاث معلومات قصيرة، خطأ شائع، ثم دعوة لمتابعة الأخصائي. الموضوع: ' + topic : 'رد مقترح: أشكرك على سؤالك. قد تكون الأسباب متعددة ولا يمكن تأكيد التشخيص من الرسائل وحدها. اذكر مدة الأعراض والأدوية والأعراض المصاحبة، واطلب تقييماً طبياً عند وجود علامات مقلقة.';
    setAiOutput(out); setAiBusy(false);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setMsg('');
    try {
      const moderation = await moderateAndLog('content_upload', userId, title + '\n' + description, userId);
      if (!moderation.allowed) throw new Error('المحتوى يخالف سياسة SB1 ولا يمكن رفعه.');

      let filePath: string | null = null;
      let coverPath: string | null = null;

      if (file) {
        const max = type === 'video' ? 20 * 1024 * 1024 * 1024 : type === 'audio' ? 5 * 1024 * 1024 * 1024 : 10 * 1024 * 1024 * 1024;
        if (file.size > max) throw new Error('حجم الملف أكبر من الحد المسموح لهذا النوع.');
        const bucketMap: Record<string, string> = {
          video: 'sb1-videos',
          audio: 'sb1-audio',
          book: 'sb1-books',
          article: 'specialist-content',
        };
        const bucket = bucketMap[type] || 'specialist-content';
        filePath = (userId || 'anonymous') + '/' + Date.now() + '-' + file.name;
        let uploaded = await supabase.storage.from(bucket).upload(filePath, file, { upsert: false, contentType: file.type || undefined });
        if (uploaded.error && bucket !== 'specialist-content') {
          uploaded = await supabase.storage.from('specialist-content').upload(filePath, file, { upsert: false, contentType: file.type || undefined });
        }
        if (uploaded.error) throw uploaded.error;
      }

      if (cover) {
        coverPath = (userId || 'anonymous') + '/covers-' + Date.now() + '-' + cover.name;
        const uploadedCover = await supabase.storage.from('specialist-content').upload(coverPath, cover, { upsert: false, contentType: cover.type || undefined });
        if (uploadedCover.error) throw uploadedCover.error;
      }

      const selected = specialtyCatalog(lang).find(x => x.slug === specialty);
      const payload = {
        specialist_id: userId || null,
        content_type: type,
        title,
        description,
        specialty_id: selected?.id || null,
        language: contentLanguage,
        price: Number(price) || 0,
        offer_duration_days: Number(offerDays) || 30,
        cover_library_id: selectedCover?.id || null,
        platform_share: 50,
        specialist_share: 50,
        file_path: filePath,
        cover_path: coverPath || selectedCover?.image_url || null,
        status: 'pending',
      };

      const { error } = await supabase.from('content_submissions').insert(payload);
      if (error) throw error;

      setMsg('تم إرسال المحتوى للمراجعة. لن يظهر للمستخدمين قبل موافقة إدارة SB1.');
      setTitle('');
      setDescription('');
      setFile(null);
      setCover(null);
      setSelectedCover(null);
    } catch (err: any) {
      setMsg(err?.message || 'تعذر إرسال المحتوى');
    } finally {
      setBusy(false);
    }
  };

  const Icon = type === 'article' ? FileText : type === 'video' ? Video : type === 'audio' ? Headphones : BookOpen;

  return (
    <div dir={dir} className="min-h-screen bg-gray-50 pt-24 pb-16">
      <div className="mx-auto max-w-3xl px-4">
        <div className="rounded-3xl bg-white border p-7 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-teal-50 p-3"><Icon className="h-7 w-7 text-teal-700" /></div>
            <div>
              <h1 className="text-2xl font-extrabold">رفع محتوى للأخصائي</h1>
              <p className="text-sm text-gray-500">المحتوى يحدد لغته عند الرفع ويخضع لمراجعة إدارة SB1.</p>
            </div>
          </div>

          <div className="mb-5 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border bg-teal-50 p-4"><TrendingUp className="h-5 w-5 text-teal-700"/><b className="mt-2 block">نشاط وظهور الحساب</b><p className="mt-1 text-xs text-gray-600">أجبت على {freeAnswered} سؤالاً مجانياً. استمر في الإجابة لرفع نشاط الملف.</p></div>
            <div className="md:col-span-2 rounded-2xl border bg-white p-4">
              <div className="flex items-center gap-2 font-extrabold"><Sparkles className="h-5 w-5 text-purple-600"/>المساعد الذكي للأخصائي</div>
              <textarea value={aiPrompt} onChange={e=>setAiPrompt(e.target.value)} className="input-field mt-3 w-full min-h-20" placeholder="موضوع المقال أو الريلز أو الرد…"/>
              <div className="mt-2 flex flex-wrap gap-2"><button type="button" onClick={()=>runAI('article')} disabled={aiBusy} className="rounded-xl bg-purple-50 px-3 py-2 text-xs font-bold text-purple-700">توليد مقال</button><button type="button" onClick={()=>runAI('reel')} disabled={aiBusy} className="rounded-xl bg-pink-50 px-3 py-2 text-xs font-bold text-pink-700">فكرة ريلز</button><button type="button" onClick={()=>runAI('reply')} disabled={aiBusy} className="rounded-xl bg-blue-50 px-3 py-2 text-xs font-bold text-blue-700">صياغة رد</button></div>
              {aiOutput&&<pre className="mt-3 whitespace-pre-wrap rounded-xl bg-gray-50 p-3 text-xs leading-6">{aiOutput}</pre>}
              <p className="mt-2 text-[11px] text-gray-500">المساعد يولد مسودة أولية؛ يجب مراجعتها طبياً قبل النشر.</p>
            </div>
          </div>
          <div className="mb-5 rounded-2xl border bg-white p-5">
            <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="font-extrabold">بنك الميديا والبادجات</h2><p className="text-xs text-gray-500">أغلفة وصور وإيموجي وشارات صحية جاهزة.</p></div><div className="relative"><Search className="absolute start-3 top-3 h-4 w-4 text-gray-400"/><input value={coverSearch} onChange={e=>setCoverSearch(e.target.value)} className="input-field ps-9" placeholder="بحث…"/></div></div>
            <div className="mt-3 flex gap-2"><button type="button" onClick={()=>setMediaTab('covers')} className={'rounded-xl px-3 py-2 text-xs font-bold '+(mediaTab==='covers'?'bg-teal-700 text-white':'bg-gray-100')}>الأغلفة</button><button type="button" onClick={()=>setMediaTab('emoji')} className={'rounded-xl px-3 py-2 text-xs font-bold '+(mediaTab==='emoji'?'bg-teal-700 text-white':'bg-gray-100')}>الإيموجي الطبي</button><button type="button" onClick={()=>setMediaTab('badges')} className={'rounded-xl px-3 py-2 text-xs font-bold '+(mediaTab==='badges'?'bg-teal-700 text-white':'bg-gray-100')}>البادجات</button></div>
            {mediaTab==='covers'&&<div className="mt-3 grid grid-cols-3 gap-2 md:grid-cols-6">{mediaImages.filter(x=>!coverSearch||x.search_text.includes(coverSearch.toLowerCase())).slice(0,36).map(x=><button type="button" key={x.id} onClick={()=>setSelectedCover(x)} className={'overflow-hidden rounded-xl border '+(selectedCover?.id===x.id?'ring-2 ring-teal-600':'')}><img src={x.image_url} className="h-20 w-full object-cover"/><span className="block p-1 text-[9px]">{x.title}</span></button>)}</div>}
            {mediaTab==='emoji'&&<div className="mt-3 grid grid-cols-8 gap-2 md:grid-cols-12">{medicalBadges.map((x,i)=><button type="button" key={i} onClick={()=>setTitle(v=>v+' '+x)} className="grid aspect-square place-items-center rounded-xl bg-gray-50 text-2xl hover:bg-teal-50">{x}</button>)}</div>}
            {mediaTab==='badges'&&<div className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-4">{badgeNames.map((x,i)=><button type="button" key={x} onClick={()=>setDescription(v=>v+' ['+x+']')} className="rounded-xl border bg-teal-50 p-3 text-start text-xs font-bold"><BadgeCheck className="mb-1 h-5 w-5 text-teal-700"/>{x}</button>)}</div>}
          </div>
          <div className="mt-5 rounded-2xl bg-amber-50 p-4 text-sm text-amber-800">
            <Clock className="inline h-4 w-4 me-1" /> المحتوى يدخل «قيد المراجعة» ولا يظهر للجمهور قبل الموافقة.
          </div>

          <form onSubmit={submit} className="mt-6 space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {[['article', 'مقال'], ['video', 'فيديو'], ['audio', 'تسجيل صوتي'], ['book', 'كتاب']].map(([value, label]) => (
                <button type="button" key={value} onClick={() => setType(value)} className={`rounded-xl px-3 py-3 border font-bold ${type === value ? 'bg-teal-600 text-white' : 'bg-white'}`}>
                  {label}
                </button>
              ))}
            </div>

            <input required value={title} onChange={e => setTitle(e.target.value)} className="input-field w-full" placeholder="عنوان المحتوى" />
            <textarea value={description} onChange={e => setDescription(e.target.value)} className="input-field w-full min-h-28" placeholder="الوصف" />

            <div><label className="text-sm font-bold">لغة المحتوى</label><select required value={contentLanguage} onChange={e=>{setContentLanguage(e.target.value as typeof lang);setSpecialty(specialtyCatalog(e.target.value)[0]?.slug||'')}} className="input-field w-full mt-1">{[['ar','العربية'],['en','English'],['ru','Русский'],['de','Deutsch'],['uk','Українська'],['uz','O‘zbekcha'],['hy','Հայերեն'],['tg','Тоҷикӣ'],['az','Azərbaycanca'],['am','አማርኛ'],['ka','ქართული']].map(([v,l])=><option key={v} value={v}>{l}</option>)}</select><p className="mt-1 text-xs text-gray-500">سيظهر المحتوى للمستخدمين الذين اختاروا هذه اللغة.</p></div><select required value={specialty} onChange={e => setSpecialty(e.target.value)} className="input-field w-full">
              {specialtyCatalog(lang).map(s => <option key={s.slug} value={s.slug}>{s.name}</option>)}
            </select>

            <div className="grid md:grid-cols-2 gap-3">
              <div><label className="text-sm font-bold">السعر (0 = مجاني)</label><input type="number" min="0" step="0.01" value={price} onChange={e => setPrice(e.target.value)} className="input-field w-full mt-1" /></div>
              <div><label className="text-sm font-bold">مدة العرض بالأيام</label><input type="number" min="1" value={offerDays} onChange={e => setOfferDays(e.target.value)} className="input-field w-full mt-1" /></div>
            </div>

            <div><label className="text-sm font-bold">ملف المحتوى</label><input required type="file" onChange={e => setFile(e.target.files?.[0] || null)} className="mt-2 w-full" /></div>

            <div className="rounded-2xl border p-4">
              <label className="text-sm font-bold">صورة الغلاف</label>
              <input type="file" accept="image/*" onChange={e => { setCover(e.target.files?.[0] || null); setSelectedCover(null); }} className="mt-2 w-full" />
              <input value={coverSearch} onChange={e => setCoverSearch(e.target.value)} className="input-field w-full mt-3" placeholder="ابحث في مكتبة الصور حسب التخصص" />
              <div className="mt-3 grid grid-cols-3 sm:grid-cols-6 gap-2 max-h-72 overflow-auto">
                {coverImages.map(img => (
                  <button type="button" key={img.id} onClick={() => { setSelectedCover(img); setCover(null); }} className={`overflow-hidden rounded-xl border-2 ${selectedCover?.id === img.id ? 'border-teal-600' : 'border-transparent'}`}>
                    <img src={img.image_url} alt={img.title || ''} className="h-20 w-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-xl bg-gray-50 p-4 text-sm">
              <ShieldCheck className="inline h-4 w-4 text-teal-600 me-1" /> بعد اعتماد المحتوى وإتمام البيع تطبق نسبة المنصة والأخصائي المسجلة في النظام.
            </div>

            {msg && <div className="rounded-xl bg-teal-50 text-teal-800 p-4">{msg}</div>}
            <button disabled={busy} className="btn-primary w-full flex items-center justify-center gap-2">
              <Upload className="h-5 w-5" /> {busy ? 'جارٍ الإرسال…' : 'إرسال للمراجعة'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
