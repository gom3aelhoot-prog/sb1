import { useEffect, useState } from 'react';
import { CreditCard, Globe2, LockKeyhole, WalletCards, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { useRouter, parseQuery } from '@/lib/router';
import { supabase } from '@/lib/supabase';
import { lt } from '@/lib/featureText';

const providers = [
  { name: 'العالم العربي', items: ['بطاقة بنكية', 'تحويل مصرفي', 'محافظ إلكترونية'] },
  { name: 'مصر', items: ['فوري', 'بطاقة بنكية', 'محافظ إلكترونية'] },
  { name: 'روسيا وآسيا الوسطى', items: ['بطاقة بنكية', 'تحويل مصرفي', 'محافظ إلكترونية'] },
];

export default function PaymentsPage() {
  const { lang } = useI18n();
  const { path, navigate } = useRouter();
  const query = parseQuery(path);
  const isAppointmentCheckout = query.type === 'appointment' && !!query.reference;
  const appointmentAmount = Number(query.amount || 0);
  const completeAppointmentSandbox = () => {
    if (!query.reference) return;
    const draft = localStorage.getItem('sb1_pending_appointment_'+query.reference);
    if (!draft) { setError(lang === 'ar' ? 'انتهت بيانات الحجز.' : 'Booking draft not found.'); return; }
    localStorage.setItem('sb1_paid_appointment_'+query.reference, '1');
    setPaid(true);
    navigate('/appointments/book?'+new URLSearchParams({doctor:'',reference:query.reference,paid:'1'}).toString());
  };
  const startAppointmentCheckout = async () => {
    setCheckoutLoading(true); setError('');
    try {
      const response = await fetch('/api/create-checkout',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({amount:appointmentAmount,currency:query.currency||'usd',description:'SB1 video consultation',reference_id:query.reference})});
      const data = await response.json(); if(!response.ok||!data.url) throw new Error(data.error||'Checkout unavailable'); window.location.href=data.url;
    } catch { setError(lang==='ar'?'الدفع المباشر غير مفعّل على هذا النشر. يمكنك استخدام وضع الاختبار.':'Live checkout is not configured on this deployment. Use sandbox mode.'); }
    finally { setCheckoutLoading(false); }
  };
  const isQuestionCheckout = query.type === 'question' && !!query.reference;
  const [loading, setLoading] = useState(isQuestionCheckout);
  const [paying, setPaying] = useState(false);
  const [paid, setPaid] = useState(false);
  const [error, setError] = useState('');
  const [payment, setPayment] = useState<{ id: string; amount: number; currency: string; reference_id: string; status: string } | null>(null);
  const [liveCheckout, setLiveCheckout] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  useEffect(() => {
    if (!isQuestionCheckout) return;
    (async () => {
      const { data, error: fetchError } = await supabase
        .from('payments')
        .select('id, amount, currency, reference_id, status')
        .eq('reference_id', query.reference)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (data) {
        setPayment(data);
        setPaid(data.status === 'paid');
      } else {
        const localPayments = JSON.parse(localStorage.getItem('sb1_demo_payments') || '[]') as Array<{ id:string; amount:number; currency:string; reference_id:string; status:string }>;
        const localPayment = localPayments.find((item) => item.reference_id === query.reference);
        if (localPayment) {
          setPayment(localPayment);
          setPaid(localPayment.status === 'paid');
        } else if (fetchError) {
          setError(lang === 'ar' ? 'تعذر تحميل عملية الدفع.' : 'Unable to load the payment.');
        }
      }
      setLoading(false);
    })().catch(() => {
      setError(lang === 'ar' ? 'تعذر الاتصال بخدمة الدفع.' : 'Payment service is unavailable.');
      setLoading(false);
    });
  }, [isQuestionCheckout, query.reference, lang]);

  const startLiveCheckout = async () => {
    if (!payment) return;
    setCheckoutLoading(true);
    setError('');
    try {
      const response = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          amount: payment.amount,
          currency: payment.currency,
          description: 'SB1 medical question',
          reference_id: payment.reference_id,
        }),
      });
      const data = await response.json();
      if (!response.ok || !data.url) throw new Error(data.error || 'Checkout unavailable');
      window.location.href = data.url;
    } catch (e) {
      setLiveCheckout(false);
      setError(lang === 'ar' ? 'الدفع المباشر غير مفعّل بعد. يمكنك استخدام وضع الاختبار.' : 'Live checkout is not configured yet. You can use sandbox mode.');
    } finally {
      setCheckoutLoading(false);
    }
  };

  const completeSandboxPayment = async () => {
    if (!payment) return;
    setPaying(true);
    setError('');
    const { error: paymentError } = await supabase.from('payments').update({ status: 'paid' }).eq('id', payment.id);
    const localPayments = JSON.parse(localStorage.getItem('sb1_demo_payments') || '[]') as Array<{ id:string; amount:number; currency:string; reference_id:string; status:string }>;
    const localIndex = localPayments.findIndex((item) => item.id === payment.id);
    if (localIndex >= 0) {
      localPayments[localIndex].status = 'paid';
      localStorage.setItem('sb1_demo_payments', JSON.stringify(localPayments));
      const localQuestions = JSON.parse(localStorage.getItem('sb1_demo_questions') || '[]') as Array<{ id:string; status:string }>;
      const qIndex = localQuestions.findIndex((item) => item.id === payment.reference_id);
      if (qIndex >= 0) {
        localQuestions[qIndex].status = 'pending';
        localStorage.setItem('sb1_demo_questions', JSON.stringify(localQuestions));
      }
    }
    if (paymentError && localIndex < 0) {
      setError(lang === 'ar' ? 'تعذر تأكيد الدفع. تأكد من إعداد قاعدة البيانات.' : 'Could not confirm the payment. Check the database configuration.');
      setPaying(false);
      return;
    }
    if (!paymentError) {
      const { error: questionError } = await supabase.from('questions').update({ status: 'pending' }).eq('id', payment.reference_id);
      if (questionError && localIndex < 0) {
        setError(lang === 'ar' ? 'تم تسجيل الدفع لكن تعذر تحديث السؤال.' : 'Payment was recorded but the question status could not be updated.');
        setPaying(false);
        return;
      }
    }
    setPayment({ ...payment, status: 'paid' });
    setPaid(true);
    setPaying(false);
  };

  if (isAppointmentCheckout) {
    return <div className="min-h-screen pt-24 pb-16 bg-gray-50"><div className="max-w-2xl mx-auto px-4"><div className="card p-7"><div className="text-center"><CreditCard className="mx-auto w-14 h-14 text-teal-600"/><h1 className="mt-4 text-3xl font-extrabold">الدفع المسبق للجلسة</h1><p className="mt-2 text-gray-500">بعد الدفع فقط يتم إرسال طلب الحجز إلى الأخصائي.</p></div><div className="mt-6 rounded-2xl bg-teal-50 p-5 text-center"><p className="text-sm text-teal-700">قيمة الجلسة</p><p className="text-4xl font-extrabold text-teal-800">{appointmentAmount} {query.currency?.toUpperCase()||'USD'}</p></div>{error&&<p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}<button onClick={startAppointmentCheckout} disabled={checkoutLoading} className="btn-primary w-full mt-5">{checkoutLoading?'جاري فتح بوابة الدفع...':'فتح بوابة الدفع الآمن'}</button><button onClick={completeAppointmentSandbox} className="w-full mt-3 rounded-xl border py-3 text-sm font-bold text-gray-600">تأكيد الدفع التجريبي ثم إرسال الحجز</button><p className="mt-4 text-xs text-gray-400 text-center">وضع الاختبار لا يخصم أموالاً حقيقية.</p></div></div></div>;
  }

  if (isQuestionCheckout) {
    return (
      <div className="min-h-screen pt-24 pb-16 bg-gray-50">
        <div className="max-w-2xl mx-auto px-4">
          <div className="text-center mb-7">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-teal-100 flex items-center justify-center"><CreditCard className="w-7 h-7 text-teal-700" /></div>
            <h1 className="mt-4 text-3xl font-extrabold text-gray-800">{lang === 'ar' ? 'دفع السؤال الطبي' : 'Medical question checkout'}</h1>
            <p className="mt-2 text-gray-500">{lang === 'ar' ? 'دفع آمن مع الاحتفاظ بحالة الطلب والسؤال.' : 'Secure checkout with payment and question status tracking.'}</p>
          </div>

          {loading ? (
            <div className="card p-8 animate-pulse"><div className="h-5 bg-gray-100 rounded w-1/2 mb-4" /><div className="h-12 bg-gray-100 rounded" /></div>
          ) : paid ? (
            <div className="card p-8 text-center">
              <CheckCircle2 className="mx-auto w-16 h-16 text-green-500" />
              <h2 className="mt-4 text-2xl font-bold text-gray-800">{lang === 'ar' ? 'تم تسجيل الدفع' : 'Payment recorded'}</h2>
              <p className="mt-2 text-gray-500">{lang === 'ar' ? 'تم تفعيل السؤال وإرساله إلى مسار الإجابة.' : 'Your question has been activated and moved to the answering flow.'}</p>
              <button className="btn-primary mt-6" onClick={() => navigate(`/questions/${payment?.reference_id}`)}>{lang === 'ar' ? 'عرض السؤال' : 'View question'}</button>
            </div>
          ) : (
            <div className="card p-7">
              <div className="rounded-2xl bg-teal-50 border border-teal-100 p-5 flex items-center justify-between">
                <div><p className="text-sm text-teal-700">{lang === 'ar' ? 'إجمالي الدفع' : 'Total'}</p><p className="text-3xl font-extrabold text-teal-800">{payment?.amount} {query.currency || payment?.currency}</p></div>
                <ShieldCheck className="w-10 h-10 text-teal-600" />
              </div>
              <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                <strong>{lang === 'ar' ? 'وضع الاختبار' : 'Sandbox mode'}</strong>
                <p className="mt-1">{lang === 'ar' ? 'لا يتم خصم أموال حقيقية في هذه المرحلة. عند إضافة مفاتيح مزود الدفع، تتحول هذه الخطوة إلى Checkout فعلي.' : 'No real money is charged in this stage. Once a live payment provider is configured, this step becomes a real checkout.'}</p>
              </div>
              {error && <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
              <button type="button" onClick={() => setLiveCheckout(true)} className="btn-primary w-full mt-5 flex items-center justify-center gap-2">
                <CreditCard className="w-5 h-5" />{lang === 'ar' ? 'الدفع الآمن عبر مزود الدفع' : 'Pay securely'}
              </button>
              {liveCheckout && <button type="button" disabled={checkoutLoading} onClick={startLiveCheckout} className="btn-secondary w-full mt-2 disabled:opacity-50">{checkoutLoading ? (lang === 'ar' ? 'جاري فتح الدفع...' : 'Opening checkout...') : (lang === 'ar' ? 'فتح بوابة الدفع' : 'Open payment gateway')}</button>}
              <button type="button" disabled={paying || !payment} onClick={completeSandboxPayment} className="w-full mt-2 text-sm text-gray-500 underline disabled:opacity-50">
                {paying ? (lang === 'ar' ? 'جاري التأكيد...' : 'Confirming...') : (lang === 'ar' ? 'استخدام وضع الاختبار' : 'Use sandbox mode')}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  const subscriptionAmount = Number(query.amount || 0);
  const isSubscriptionCheckout = query.type === 'subscription' && subscriptionAmount > 0;

  const startGenericCheckout = async () => {
    setCheckoutLoading(true);
    setError('');
    try {
      const response = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ amount: subscriptionAmount, currency: 'usd', description: `SB1 subscription ${query.plan || ''}`, reference_id: query.plan || 'subscription' }),
      });
      const data = await response.json();
      if (!response.ok || !data.url) throw new Error(data.error || 'Checkout unavailable');
      window.location.href = data.url;
    } catch {
      setError(lang === 'ar' ? 'بوابة الدفع المباشر غير مفعّلة على هذا النشر. يمكنك العودة واختيار وضع الاختبار.' : 'Live checkout is not configured on this deployment yet.');
    } finally { setCheckoutLoading(false); }
  };

  if (isSubscriptionCheckout) {
    return (
      <div className="min-h-screen pt-24 pb-16 bg-gray-50">
        <div className="max-w-xl mx-auto px-4">
          <div className="card p-8 text-center">
            <ShieldCheck className="mx-auto w-14 h-14 text-teal-600" />
            <h1 className="mt-4 text-2xl font-bold text-gray-800">{lang === 'ar' ? 'اشتراك SB1' : 'SB1 Subscription'}</h1>
            <p className="mt-2 text-gray-500">{lang === 'ar' ? `الخطة: ${query.plan || ''} — المبلغ: ${subscriptionAmount} USD` : `Plan: ${query.plan || ''} — ${subscriptionAmount} USD`}</p>
            {error && <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
            <button onClick={startGenericCheckout} disabled={checkoutLoading} className="btn-primary w-full mt-6 disabled:opacity-50">{checkoutLoading ? (lang === 'ar' ? 'جاري فتح الدفع...' : 'Opening checkout...') : (lang === 'ar' ? 'الدفع الآمن' : 'Pay securely')}</button>
            <p className="mt-4 text-xs text-gray-400">{lang === 'ar' ? 'إذا لم يتم إعداد مزود الدفع بعد، ستظهر رسالة الإعداد بدلاً من خصم أي مبلغ.' : 'If the provider is not configured, no money is charged.'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <CreditCard className="mx-auto w-12 h-12 text-teal-600" />
          <h1 className="mt-4 text-3xl font-extrabold text-gray-800">{lt(lang, { ar: 'الدفع لمرة واحدة', ru: 'Разовая оплата', en: 'One-time Payments', de: 'Einmalzahlung' })}</h1>
          <p className="mt-2 text-gray-500">{lt(lang, { ar: 'شراء كورس أو امتحان أو جلسة بدون اشتراك شهري.', ru: 'Покупка курса, экзамена или сессии без ежемесячной подписки.', en: 'Buy a course, exam or session without a monthly subscription.', de: 'Kurs, Prüfung oder Sitzung ohne Monatsabo kaufen.' })}</p>
        </div>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {providers.map((p) => (
            <div key={p.name} className="card p-6">
              <div className="flex items-center gap-3"><Globe2 className="w-6 h-6 text-teal-600" /><h2 className="font-bold text-gray-800">{p.name}</h2></div>
              <div className="mt-4 space-y-2">{p.items.map((item) => <button key={item} onClick={() => navigate('/courses')} className="w-full rounded-xl border p-3 text-left text-sm hover:border-teal-400 hover:bg-teal-50">{item}</button>)}</div>
            </div>
          ))}
        </div>
        <div className="mt-7 rounded-3xl bg-white border p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div><h2 className="font-bold text-gray-800">{lt(lang, { ar: 'حماية الدفع', ru: 'Безопасность оплаты', en: 'Payment Security', de: 'Zahlungssicherheit' })}</h2><p className="mt-1 text-sm text-gray-500">{lt(lang, { ar: 'واجهة الدفع تعمل الآن بوضع الاختبار، مع حفظ عمليات الدفع في قاعدة البيانات.', ru: 'Платежи работают в тестовом режиме и сохраняются в базе.', en: 'Payments currently run in sandbox mode and are recorded in the database.', de: 'Zahlungen laufen derzeit im Sandbox-Modus und werden in der Datenbank protokolliert.' })}</p></div>
            <div className="rounded-2xl bg-teal-50 p-4 text-teal-700"><LockKeyhole className="w-6 h-6" /></div>
          </div>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <button onClick={() => navigate('/courses')} className="btn-primary"><WalletCards className="w-4 h-4" />{lt(lang, { ar: 'اختر كورسًا', ru: 'Выбрать курс', en: 'Choose a course', de: 'Kurs wählen' })}</button>
          <button onClick={() => navigate('/exams')} className="btn-secondary">{lt(lang, { ar: 'اختبار تدريبي', ru: 'Тренировочный экзамен', en: 'Practice exam', de: 'Übungsprüfung' })}</button>
        </div>
      </div>
    </div>
  );
}
