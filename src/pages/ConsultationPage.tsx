import { ArrowLeft, FileText, MessageCircle, ShieldCheck, Video } from 'lucide-react';
import { useRouter } from '@/lib/router';
import { useI18n } from '@/lib/i18n';

export default function ConsultationPage() {
  const { navigate } = useRouter();
  const { dir } = useI18n();
  return <div className="min-h-screen bg-gray-50 pt-24 pb-16" dir={dir}>
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
      <button onClick={()=>navigate('/')} className="mb-6 flex items-center gap-2 text-sm text-gray-500"><ArrowLeft className="h-4 w-4"/>الرئيسية</button>
      <div className="mb-8 text-center"><h1 className="text-3xl font-extrabold text-gray-900">استشر طبيباً</h1><p className="mx-auto mt-3 max-w-2xl text-gray-500">اختر الطريقة المناسبة: اكتب مشكلتك ليجيب عليها الأطباء، أو احجز جلسة شخصية بالفيديو مع طبيب تختاره.</p><button onClick={()=>navigate("/academy")} className="mt-5 rounded-xl bg-slate-900 px-5 py-3 font-bold text-white hover:bg-slate-800">الانتقال إلى أكاديمية SB1</button></div>
      <div className="grid gap-6 md:grid-cols-2">
        <article className="card p-7">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50"><FileText className="h-7 w-7 text-teal-600"/></div>
          <h2 className="text-xl font-bold">اكتب مشكلة واحصل على إجابات</h2>
          <p className="mt-2 text-sm leading-7 text-gray-500">اختر التخصص، اكتب الأعراض والتفاصيل، ويمكنك إرفاق صور أو ملفات طبية وفق سياسة الموقع. في السؤال المجاني يوجد حد للنص، أما المدفوع فيتيح شرحاً أطول، مدة بقاء للسؤال، عدد أطباء يصلهم الإشعار، وسرعة استجابة مختلفة.</p>
          <div className="mt-5 flex flex-wrap gap-2 text-xs text-gray-600"><span className="rounded-full bg-gray-100 px-3 py-1">مجاني</span><span className="rounded-full bg-gray-100 px-3 py-1">مدفوع</span><span className="rounded-full bg-gray-100 px-3 py-1">اختيار أفضل 3 إجابات</span></div>
          <button onClick={()=>navigate('/ask')} className="btn-primary mt-6 w-full"><MessageCircle className="inline h-4 w-4"/> ابدأ السؤال</button>
        </article>
        <article className="card p-7">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-50"><Video className="h-7 w-7 text-cyan-600"/></div>
          <h2 className="text-xl font-bold">جلسة شخصية بالفيديو</h2>
          <p className="mt-2 text-sm leading-7 text-gray-500">هذه ليست سؤالاً عاماً. إنها جلسة خاصة مع الطبيب عبر الفيديو، بسعر ومدة يحددهما الطبيب ضمن سياسات المنصة. يمكنك اختيار موعد جاهز، أو إرسال الأوقات المناسبة لك ليقترح الطبيب مواعيد متاحة.</p>
          <ul className="mt-4 space-y-2 text-sm text-gray-600"><li>• صفحة الطبيب الكاملة قبل الحجز</li><li>• جدول المواعيد أو طلب موعد مخصص</li><li>• دفع وحالة حجز واضحة</li><li>• رابط الجلسة يصل قبل الموعد</li></ul>
          <button onClick={()=>navigate('/sessions')} className="btn-primary mt-6 w-full"><Video className="inline h-4 w-4"/> احجز جلسة فيديو</button>
        </article>
      </div>
      <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800"><ShieldCheck className="mb-2 h-5 w-5"/><b>تنبيه:</b> الاستشارات والجلسات لا تغني عن الطوارئ أو الفحص المباشر عند الحاجة، وتخضع لمراجعة وسياسات SB1.</div>
    </div>
  </div>;
}
