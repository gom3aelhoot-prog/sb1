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
  const isQuestionCheckout = query.type === 'question' && !!query.reference;
  const [loading, setLoading] = useState(isQuestionCheckout);
  const [paying, setPaying] = useState(false);
  const [paid, setPaid] = useState(false);
  const [error, setError] = useState('');
  const [payment, setPayment] = useState<{ id: string; amount: number; currency: string; reference_id: string; status: string } | null>(null);

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
      if (fetchError || !data) setError(lang === 'ar' ? 'تعذر تحميل عملية الدفع.' : 'Unable to load the payment.');
      else {
        setPayment(data);
        setPaid(data.status === 'paid');
      }
      setLoading(false);
    })().catch(() => {
      setError(lang === 'ar' ? 'تعذر الاتصال بخدمة الدفع.' : 'Payment service is unavailable.');
      setLoading(false);
    });
  }, [isQuestionCheckout, query.reference, lang]);

  const completeSandboxPayment = async () => {
    if (!payment) return;
    setPaying(true);
    setError('');
    const { error: paymentError } = await supabase.from('payments').update({ status: 'paid' }).eq('id', payment.id);
    if (paymentError) {
      setError(lang === 'ar' ? 'تعذر تأكيد الدفع. تأكد من إعداد قاعدة البيانات.' : 'Could not confirm the payment. Check the database configuration.');
      setPaying(false);
      return;
    }
    const { error: questionError } = await supabase.from('questions').update({ status: 'pending' }).eq('id', payment.reference_id);
    if (questionError) {
      setError(lang === 'ar' ? 'تم تسجيل الدفع لكن تعذر تحديث السؤال.' : 'Payment was recorded but the question status could not be updated.');
      setPaying(false);
      return;
    }
    setPaid(true);
    setPaying(false);
  };

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
              <button disabled={paying || !payment} onClick={completeSandboxPayment} className="btn-primary w-full mt-5 flex items-center justify-center gap-2 disabled:opacity-50">
                <CreditCard className="w-5 h-5" />{paying ? (lang === 'ar' ? 'جاري التأكيد...' : 'Confirming...') : (lang === 'ar' ? 'تأكيد الدفع التجريبي' : 'Confirm sandbox payment')}
              </button>
            </div>
          )}
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
