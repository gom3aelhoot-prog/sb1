import { Search, MessageCircle, Users, ArrowLeft, ArrowRight, CreditCard } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { useRouter } from '@/lib/router';

export default function AskAllSpecialistsSection(){
  const {lang,dir}=useI18n(); const {navigate}=useRouter();
  const ar=lang==='ar', ru=lang==='ru', de=lang==='de';
  const t=(a:string,e:string,r?:string,d?:string)=>ar?a:ru?(r||e):de?(d||e):e;
  const steps=[
    {icon:Search,title:t('اختر التخصص','Choose a specialty','Выберите специальность','Fachgebiet wählen'),desc:t('حدد التخصص الذي يناسب سؤالك','Select the specialty that matches your question','Выберите специальность для вашего вопроса','Wählen Sie das passende Fachgebiet')},
    {icon:MessageCircle,title:t('اكتب سؤال','Write your question','Напишите вопрос','Frage schreiben'),desc:t('اكتب تفاصيل حالتك وأرفق الملفات عند الحاجة','Describe your case and attach files when needed','Опишите ситуацию и прикрепите файлы при необходимости','Beschreiben Sie Ihren Fall und fügen Sie bei Bedarf Dateien hinzu')},
    {icon:Users,title:t('احصل على إجابات من جميع الأخصائيين','Get answers from all specialists','Получите ответы от специалистов','Antworten von Spezialisten erhalten'),desc:t('يصل السؤال إلى الأخصائيين المتاحين في التخصص واللغة المختارين','The question is routed to available specialists in the selected specialty and language','Вопрос направляется доступным специалистам выбранной специальности и языка','Die Frage wird an verfügbare Spezialisten des gewählten Fachgebiets und der Sprache weitergeleitet')},
  ];
  return <section dir={dir} className="border-y bg-gradient-to-b from-neutral-50 to-white py-14 lg:py-18">
    <div className="container-x">
      <div className="mx-auto max-w-3xl text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary-200 bg-primary-50 px-4 py-1.5 text-sm font-bold text-primary-700">{t('استشارة جماعية مع الأخصائيين','Specialist question service','Сервис вопросов специалистам','Fragen an Spezialisten')}</div>
        <h2 className="mt-4 text-3xl font-bold text-neutral-900 sm:text-4xl">{t('اختر التخصص، اكتب سؤال، احصل على إجابات من جميع الأخصائيين','Choose a specialty, write a question, get answers from all specialists','Выберите специальность, напишите вопрос и получите ответы специалистов','Fachgebiet wählen, Frage schreiben und Antworten von Spezialisten erhalten')}</h2>
        <p className="mt-3 text-neutral-500">{t('يمكنك البدء مجاناً أو اختيار خدمة مدفوعة للوصول إلى عدد أكبر من الأخصائيين ومدة استجابة مختلفة.','Start for free or choose a paid service with more specialists and different response options.','Начните бесплатно или выберите платную услугу с большим числом специалистов и другой скоростью ответа.','Kostenlos starten oder einen kostenpflichtigen Dienst mit mehr Spezialisten und anderer Antwortzeit wählen.')}</p>
      </div>
      <div className="relative mt-12 grid gap-8 sm:grid-cols-3">
        <div className="pointer-events-none absolute start-[16%] end-[16%] top-8 hidden h-0.5 bg-gradient-to-r from-primary-200 via-secondary-200 to-primary-200 sm:block"/>
        {steps.map((s,i)=>{const Icon=s.icon;return <button key={i} onClick={()=>navigate('/ask')} className="group relative z-10 text-center">
          <div className="relative inline-flex"><div className="flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-primary-200 bg-white shadow-lg transition group-hover:scale-105 group-hover:border-primary-500"><Icon className="h-7 w-7 text-primary-600"/></div><span className="absolute -top-2 -end-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary-600 text-xs font-bold text-white">{i+1}</span></div>
          <h3 className="mt-5 text-base font-bold text-neutral-900">{s.title}</h3><p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-neutral-500">{s.desc}</p>
        </button>})}
      </div>
      <div className="mt-9 flex flex-wrap justify-center gap-3">
        <button onClick={()=>navigate('/ask?mode=free')} className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-6 py-3 font-bold text-white shadow-lg hover:bg-primary-700">{t('ابدأ سؤالاً مجانياً','Ask for free','Задать бесплатный вопрос','Kostenlose Frage stellen')} <ArrowRight className="h-4 w-4 rtl:rotate-180"/></button>
        <button onClick={()=>navigate('/ask?mode=paid')} className="inline-flex items-center gap-2 rounded-xl border border-primary-200 bg-white px-6 py-3 font-bold text-primary-700 shadow-sm hover:bg-primary-50"><CreditCard className="h-4 w-4"/>{t('سؤال مدفوع','Paid question','Платный вопрос','Kostenpflichtige Frage')}</button>
      </div>
    </div>
  </section>;
}
