import { useState } from 'react';
import { AlertTriangle, X, CheckCircle2 } from 'lucide-react';

export function DemoAccountMark({ className='' }: { className?: string }) {
  return <span className={'inline-block h-3.5 w-3.5 rounded-full bg-yellow-400 ring-2 ring-white shadow-sm '+className} aria-label="حساب تجريبي" title="حساب تجريبي" />;
}

export function DemoTransparencyNotice({ mode='info', onContinue, onClose }: { mode?: 'info'|'purchase'; onContinue?:()=>void; onClose?:()=>void }) {
  const purchase = mode === 'purchase';
  return <div className="fixed inset-0 z-[80] grid place-items-center bg-black/50 p-4" dir="rtl">
    <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
      {onClose && <button onClick={onClose} className="absolute end-3 top-3 rounded-xl p-2 text-gray-400 hover:bg-gray-100"><X className="h-5 w-5"/></button>}
      <div className="flex items-start gap-3">
        <div className="rounded-2xl bg-yellow-100 p-3"><AlertTriangle className="h-6 w-6 text-yellow-600"/></div>
        <div>
          <h2 className="text-xl font-extrabold text-gray-900">{purchase?'تنبيه مهم قبل الشراء':'تنبيه شفاف حول الحسابات التجريبية'}</h2>
          <p className="mt-3 leading-7 text-gray-600">الحسابات التي تظهر بجانب صورتها <span className="inline-block h-3.5 w-3.5 rounded-full bg-yellow-400 align-middle ring-2 ring-white shadow-sm"/> هي حسابات تجريبية وليست أشخاصاً حقيقيين. بعض المنشورات والتعليقات والإجابات المعروضة منها محتوى تجريبي لتوضيح طريقة عمل SB1.</p>
          <p className="mt-3 leading-7 text-gray-700 font-semibold">هذا توضيح مقصود حتى لا نضلل أي مستخدم، ولا نريد تقديم الحسابات التجريبية على أنها أشخاص حقيقيون.</p>
          {purchase && <p className="mt-3 rounded-2xl bg-yellow-50 p-4 text-sm leading-6 text-yellow-900">بمتابعة الشراء، أنت تعرف أن الحسابات التي قد تظهر في التعليقات أو التفاعل ضمن هذه الباقة قد تحمل العلامة الصفراء لأنها تجريبية.</p>}
        </div>
      </div>
      {purchase && onContinue && <button onClick={onContinue} className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-teal-600 px-5 py-3 font-bold text-white"><CheckCircle2 className="h-5 w-5"/>أوافق على هذا التوضيح وأتابع</button>}
    </div>
  </div>;
}
