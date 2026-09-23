import { useEffect, useState } from 'react';
import { Send, CheckCircle, AlertCircle, User, Bot, ArrowRight, CreditCard, Clock, Users } from 'lucide-react';
import { useRouter, parseQuery } from '@/lib/router';
import { useI18n } from '@/lib/i18n';
import { useApp } from '@/i18n/AppContext';
import { CURRENCY_RATES } from '@/types/i18n';
import { supabase, type Specialty, type Doctor } from '@/lib/supabase';
import DoctorCard from '@/components/DoctorCard';
import { demoSpecialties } from '@/lib/demoData';

type PricingTier = {
  id: string;
  name: string;
  name_ar: string;
  description: string;
  description_ar: string;
  duration_days: number;
  specialists_notified: number;
  min_answers: number;
  max_answers: number;
  response_speed: 'standard' | 'fast' | 'instant';
  price_usd: number;
  is_featured: boolean;
};

const fallbackTiers: PricingTier[] = [
  { id: 'basic', name: 'Basic', name_ar: 'الأساسية', description: 'Standard response within 48 hours', description_ar: 'رد قياسي خلال 48 ساعة', duration_days: 7, specialists_notified: 10, min_answers: 1, max_answers: 3, response_speed: 'standard', price_usd: 9, is_featured: false },
  { id: 'plus', name: 'Plus', name_ar: 'المعززة', description: 'Faster responses from more specialists', description_ar: 'ردود أسرع من عدد أكبر من الأخصائيين', duration_days: 14, specialists_notified: 25, min_answers: 2, max_answers: 5, response_speed: 'fast', price_usd: 19, is_featured: true },
  { id: 'premium', name: 'Premium', name_ar: 'المميزة', description: 'Instant response and extended duration', description_ar: 'رد فوري ومدة ممتدة', duration_days: 30, specialists_notified: 50, min_answers: 3, max_answers: 10, response_speed: 'instant', price_usd: 39, is_featured: false },
];

const dataId = () => (typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `sb1-${Date.now()}-${Math.random().toString(36).slice(2)}`);

export default function AskPage() {
  const { path, navigate } = useRouter();
  const { t, specialtyName, lang, dir } = useI18n();
  const { country, formatPrice } = useApp();
  const query = parseQuery(path);
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [tiers, setTiers] = useState<PricingTier[]>(fallbackTiers);
  const [questionType, setQuestionType] = useState<'free' | 'paid'>('free');
  const [selectedTierId, setSelectedTierId] = useState('plus');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [form, setForm] = useState({ author_name: '', age: '', gender: 'ذكر', title: '', body: '' });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [isVirtual, setIsVirtual] = useState(false);
  const [specificDoctorId, setSpecificDoctorId] = useState<string | null>(null);
  const [specificDoctor, setSpecificDoctor] = useState<Doctor | null>(null);
  const [realDoctors, setRealDoctors] = useState<Doctor[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const [{ data: specs }, { data: dbTiers }] = await Promise.all([
          supabase.from('specialties').select('*').order('name'),
          supabase.from('pricing_tiers').select('*').eq('is_active', true).order('sort_order'),
        ]);
        setSpecialties((specs && specs.length ? specs : demoSpecialties) as Specialty[]);
        if (dbTiers?.length) setTiers(dbTiers as PricingTier[]);
      } catch {
        // Keep the page usable with the built-in pricing catalog when the database is unavailable.
      }
      if (query.specialty) setSelectedSpecialty(query.specialty);
      if (query.virtual === '1') setIsVirtual(true);
      if (query.doctor) setSpecificDoctorId(query.doctor);
    })();
  }, [query.specialty, query.virtual, query.doctor]);

  useEffect(() => {
    if (specificDoctorId) {
      supabase.from('doctors').select('*, specialty(*)').eq('id', specificDoctorId).maybeSingle().then(({ data }) => {
        setSpecificDoctor(data);
        if (data?.specialty_id) setSelectedSpecialty(data.specialty?.slug || '');
      }).catch(() => {});
    }
  }, [specificDoctorId]);

  useEffect(() => {
    if (isVirtual && selectedSpecialty) {
      supabase.from('doctors').select('*, specialty(*)').eq('is_virtual', false).order('rating', { ascending: false }).limit(4).then(({ data }) => {
        setRealDoctors(data || []);
      }).catch(() => setRealDoctors([]));
    }
  }, [isVirtual, selectedSpecialty]);

  const selectedTier = tiers.find((tier) => tier.id === selectedTierId) || tiers[0];
  const localAmount = selectedTier ? selectedTier.price_usd * (CURRENCY_RATES[country.currency] ?? 1) : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.author_name.trim() || !form.title.trim() || !form.body.trim() || !selectedSpecialty) {
      setError(t('ask.required'));
      return;
    }
    if (questionType === 'paid' && !selectedTier) {
      setError(lang === 'ar' ? 'اختر باقة مدفوعة أولاً' : 'Please select a paid plan first.');
      return;
    }

    setSubmitting(true);
    try {
      const { data: spec } = await supabase.from('specialties').select('id').eq('slug', selectedSpecialty).maybeSingle();
      const fallbackSpec = demoSpecialties.find((item) => item.slug === selectedSpecialty) || demoSpecialties[0];
      const questionId = dataId();
      let dbQuestionId = '';
      try {
        const { data, error: insertError } = await supabase.from('questions').insert({
          specialty_id: spec?.id || fallbackSpec.id,
          author_name: form.author_name.trim(),
          title: form.title.trim(),
          body: form.body.trim(),
          age: form.age ? parseInt(form.age) : null,
          gender: form.gender,
          status: questionType === 'paid' ? 'pending_payment' : 'pending',
        }).select('id').single();
        if (!insertError && data?.id) dbQuestionId = data.id;
      } catch {
        // Public demo fallback.
      }
      const id = dbQuestionId || questionId;
      const localQuestion = {
        id, specialty_id: fallbackSpec.id, author_name: form.author_name.trim(), title: form.title.trim(), body: form.body.trim(),
        age: form.age ? parseInt(form.age) : null, gender: form.gender, status: questionType === 'paid' ? 'pending_payment' : 'pending',
        views: 0, created_at: new Date().toISOString(), specialty: fallbackSpec, answers: [],
      };
      const existing = JSON.parse(localStorage.getItem('sb1_demo_questions') || '[]');
      localStorage.setItem('sb1_demo_questions', JSON.stringify([localQuestion, ...existing]));

      if (questionType === 'paid') {
        const payment = { id: dataId(), amount: Number(localAmount.toFixed(2)), currency: country.currency, reference_id: id, status: 'pending' };
        const payments = JSON.parse(localStorage.getItem('sb1_demo_payments') || '[]');
        localStorage.setItem('sb1_demo_payments', JSON.stringify([payment, ...payments]));
        if (dbQuestionId) {
          const { error: paymentError } = await supabase.from('payments').insert({
            payer_email: '', payer_name: form.author_name.trim(), amount: payment.amount, currency: country.currency,
            payment_type: 'question', reference_id: id, status: 'pending',
          });
          if (paymentError) throw paymentError;
        }
        navigate(`/payments?type=question&reference=${id}&amount=${payment.amount.toFixed(2)}&currency=${encodeURIComponent(country.currencySymbol)}`);
        return;
      }

      setSuccess(true);
      setTimeout(() => navigate(`/questions/${id}`), 700);
    } catch {
      setError(t('ask.error'));
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center" dir={dir}>
        <div className="card p-10 text-center max-w-md animate-scale-in">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">{t('ask.success')}</h2>
          <p className="text-gray-500">{t('ask.redirecting')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16" dir={dir}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">{t('ask.title')}</h1>
          <p className="text-gray-500">{lang === 'ar' ? 'اختر استشارة مجانية أو باقة مدفوعة بإجابة أسرع وعدد أكبر من الأطباء.' : t('ask.subtitle')}</p>
        </div>

        {isVirtual && (
          <div className="card p-5 mb-6 bg-amber-50 border-amber-200">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0"><Bot className="w-5 h-5 text-amber-600" /></div>
              <div>
                <h3 className="font-bold text-amber-800 text-sm mb-1">{lang === 'ar' ? 'الأخصائي غير متاح حالياً' : 'Specialist currently unavailable'}</h3>
                <p className="text-xs text-amber-700">{lang === 'ar' ? 'سيتم توجيه سؤالك إلى أخصائي حقيقي.' : 'Your question will be directed to a real specialist.'}</p>
              </div>
            </div>
          </div>
        )}

        {specificDoctor && !isVirtual && (
          <div className="card p-4 mb-6 bg-teal-50">
            <p className="text-sm text-teal-700">{lang === 'ar' ? `سيتم توجيه سؤالك إلى: ${specificDoctor.name}` : `Your question will be directed to: ${specificDoctor.name}`}</p>
          </div>
        )}

        {isVirtual && realDoctors.length > 0 && (
          <div className="mb-6">
            <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
              {lang === 'ar' ? 'أخصائيون حقيقيون متاحون' : 'Available Real Specialists'} <ArrowRight className="w-4 h-4 text-teal-600" />
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{realDoctors.map((d) => <DoctorCard key={d.id} doctor={d} />)}</div>
          </div>
        )}

        <div className="card p-5 mb-6">
          <div className="grid grid-cols-2 gap-3">
            <button type="button" onClick={() => setQuestionType('free')} className={`rounded-2xl border-2 p-4 text-start transition ${questionType === 'free' ? 'border-teal-500 bg-teal-50' : 'border-gray-100'}`}>
              <div className="font-bold text-gray-800">{lang === 'ar' ? 'سؤال مجاني' : 'Free question'}</div>
              <div className="text-xs text-gray-500 mt-1">{lang === 'ar' ? 'للحالات العامة' : 'For general questions'}</div>
            </button>
            <button type="button" onClick={() => setQuestionType('paid')} className={`rounded-2xl border-2 p-4 text-start transition ${questionType === 'paid' ? 'border-teal-500 bg-teal-50' : 'border-gray-100'}`}>
              <div className="flex items-center gap-2 font-bold text-gray-800"><CreditCard className="w-4 h-4 text-teal-600" />{lang === 'ar' ? 'سؤال مدفوع' : 'Paid question'}</div>
              <div className="text-xs text-gray-500 mt-1">{lang === 'ar' ? 'أولوية وإجابات أكثر' : 'Priority and more answers'}</div>
            </button>
          </div>
        </div>

        {questionType === 'paid' && (
          <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-3">
            {tiers.map((tier) => (
              <button key={tier.id} type="button" onClick={() => setSelectedTierId(tier.id)} className={`text-start rounded-2xl border-2 p-4 transition ${selectedTierId === tier.id ? 'border-teal-500 bg-teal-50 shadow-sm' : 'border-gray-100 bg-white'}`}>
                {tier.is_featured && <span className="text-[10px] font-bold text-teal-700 bg-teal-100 rounded-full px-2 py-1">{lang === 'ar' ? 'الأكثر طلباً' : 'Featured'}</span>}
                <h3 className="mt-2 font-bold text-gray-800">{lang === 'ar' ? tier.name_ar : tier.name}</h3>
                <div className="mt-1 text-xl font-extrabold text-teal-700">{formatPrice(tier.price_usd)}</div>
                <div className="mt-2 space-y-1 text-xs text-gray-500">
                  <div className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{tier.duration_days} {lang === 'ar' ? 'يوم' : 'days'}</div>
                  <div className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{tier.specialists_notified} {lang === 'ar' ? 'أطباء' : 'specialists'}</div>
                  <div>{tier.min_answers}-{tier.max_answers} {lang === 'ar' ? 'إجابات' : 'answers'}</div>
                </div>
              </button>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit} className="card p-7 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">{t('ask.specialty')} <span className="text-red-500">*</span></label>
            <select value={selectedSpecialty} onChange={(e) => setSelectedSpecialty(e.target.value)} className="input-field cursor-pointer" required>
              <option value="">{t('ask.select_specialty')}</option>
              {specialties.map((spec) => <option key={spec.id} value={spec.slug}>{specialtyName(spec)}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">{t('ask.name')} <span className="text-red-500">*</span></label>
            <div className="relative"><User className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" /><input type="text" value={form.author_name} onChange={(e) => setForm({ ...form, author_name: e.target.value })} placeholder={t('ask.name_placeholder')} className="input-field pr-12" required /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-semibold text-gray-700 mb-2">{t('ask.age')}</label><input type="number" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} min="1" max="120" className="input-field" /></div>
            <div><label className="block text-sm font-semibold text-gray-700 mb-2">{t('ask.gender')}</label><select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })} className="input-field cursor-pointer"><option value="ذكر">{t('ask.male')}</option><option value="أنثى">{t('ask.female')}</option></select></div>
          </div>
          <div><label className="block text-sm font-semibold text-gray-700 mb-2">{t('ask.title_label')} <span className="text-red-500">*</span></label><input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder={t('ask.title_placeholder')} className="input-field" required /></div>
          <div><label className="block text-sm font-semibold text-gray-700 mb-2">{t('ask.body_label')} <span className="text-red-500">*</span></label><textarea value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} placeholder={t('ask.body_placeholder')} rows={6} className="input-field resize-none" required /></div>

          {questionType === 'paid' && selectedTier && (
            <div className="rounded-2xl bg-teal-50 border border-teal-100 p-4 text-sm text-teal-800">
              <div className="flex items-center justify-between gap-3">
                <span className="font-semibold">{lang === 'ar' ? 'المبلغ المستحق' : 'Amount due'}</span>
                <span className="text-lg font-extrabold">{formatPrice(selectedTier.price_usd)}</span>
              </div>
              <p className="mt-1 text-xs text-teal-700">{lang === 'ar' ? 'بعد الإرسال ستنتقل إلى صفحة الدفع. الدفع الحالي يعمل في وضع الاختبار إلى حين ربط مزود دفع فعلي.' : 'You will continue to checkout. Payment is currently in sandbox mode until a live provider is connected.'}</p>
            </div>
          )}

          {error && <div className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm"><AlertCircle className="w-5 h-5 shrink-0" />{error}</div>}
          <div className="bg-teal-50 rounded-xl p-4 text-sm text-teal-700"><p className="font-semibold mb-1">{t('ask.notice_title')}</p><p>{t('ask.notice_body')}</p></div>
          <button type="submit" disabled={submitting} className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
            {submitting ? <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />{t('ask.sending')}</> : <><Send className="w-5 h-5" />{questionType === 'paid' ? (lang === 'ar' ? 'المتابعة إلى الدفع' : 'Continue to payment') : t('ask.submit')}</>}
          </button>
        </form>
      </div>
    </div>
  );
}
