import { useState } from 'react';
import { Search, Stethoscope, Brain, ArrowRight, ArrowLeft, Sparkles, Video, Star, MessageCircle, ListFilter, X } from 'lucide-react';
import { useApp } from '@/i18n/AppContext';
import { useI18n } from '@/lib/i18n';
import { useRouter } from '@/lib/router';

const copy:any = {
  ar:{search:'ابحث عن طبيب أو تخصص',searchBtn:'بحث',ask:'اسأل سؤالاً الآن',consult:'احجز الاستشارة الآن',specialties:'التخصصات',askTitle:'كيف تريد طرح السؤال؟',free:'مجاني',paid:'مدفوع',consultTitle:'اختر طريقة الاستشارة',doctor:'اختار الطبيب',custom:'طلب جلسة بمواصفاتك الخاصة',freeSession:'جلسة مجانية',book:'احجز الآن',owner:'دكتور جمال نادي',online:'استشارة طبية أونلاين',price:'25 USD'},
  en:{search:'Search for a doctor or specialty',searchBtn:'Search',ask:'Ask a question now',consult:'Book a consultation now',specialties:'Specialties',askTitle:'How would you like to ask?',free:'Free',paid:'Paid',consultTitle:'Choose consultation type',doctor:'Choose a doctor',custom:'Request a custom session',freeSession:'Free session',book:'Book now',owner:'Dr. James',online:'Online medical consultation',price:'25 USD'},
  ru:{search:'Найдите врача или специальность',searchBtn:'Поиск',ask:'Задать вопрос',consult:'Записаться на консультацию',specialties:'Специальности',askTitle:'Как задать вопрос?',free:'Бесплатно',paid:'Платно',consultTitle:'Выберите способ консультации',doctor:'Выбрать врача',custom:'Запросить индивидуальную сессию',freeSession:'Бесплатная сессия',book:'Записаться',owner:'ДОКТОР ДЖЕЙМС',online:'Онлайн-медицинская консультация',price:'25 USD'},
  de:{search:'Arzt oder Fachgebiet suchen',searchBtn:'Suchen',ask:'Jetzt Frage stellen',consult:'Jetzt Beratung buchen',specialties:'Fachgebiete',askTitle:'Wie möchten Sie fragen?',free:'Kostenlos',paid:'Kostenpflichtig',consultTitle:'Beratungsart wählen',doctor:'Arzt auswählen',custom:'Individuelle Sitzung anfragen',freeSession:'Kostenlose Sitzung',book:'Buchen',owner:'Dr. James',online:'Online medizinische Beratung',price:'25 USD'},
  uk:{search:'Знайти лікаря або спеціальність',searchBtn:'Пошук',ask:'Поставити запитання',consult:'Записатися на консультацію',specialties:'Спеціальності',askTitle:'Як поставити запитання?',free:'Безкоштовно',paid:'Платно',consultTitle:'Оберіть тип консультації',doctor:'Обрати лікаря',custom:'Індивідуальна сесія',freeSession:'Безкоштовна сесія',book:'Записатися',owner:'Доктор Джеймс',online:'Онлайн-медична консультація',price:'25 USD'},
  uz:{search:'Shifokor yoki mutaxassislikni qidiring',searchBtn:'Qidirish',ask:'Hozir savol bering',consult:'Maslahatga yoziling',specialties:'Mutaxassisliklar',askTitle:'Savolni qanday berasiz?',free:'Bepul',paid:'Pullik',consultTitle:'Maslahat turini tanlang',doctor:'Shifokorni tanlang',custom:'Maxsus sessiya so‘rash',freeSession:'Bepul sessiya',book:'Yozilish',owner:'Doktor Jeyms',online:'Onlayn tibbiy maslahat',price:'25 USD'},
  hy:{search:'Փնտրել բժշկի կամ մասնագիտություն',searchBtn:'Որոնել',ask:'Հարց տալ հիմա',consult:'Ամրագրել խորհրդատվություն',specialties:'Մասնագիտություններ',askTitle:'Ինչպե՞ս տալ հարցը',free:'Անվճար',paid:'Վճարովի',consultTitle:'Ընտրեք խորհրդատվության տեսակը',doctor:'Ընտրել բժշկին',custom:'Անհատական սեանսի հարցում',freeSession:'Անվճար սեանս',book:'Ամրագրել',owner:'Դոկտոր Ջեյմս',online:'Առցանց բժշկական խորհրդատվություն',price:'25 USD'},
  tg:{search:'Духтур ё ихтисосро ҷӯед',searchBtn:'Ҷустуҷӯ',ask:'Ҳоло савол диҳед',consult:'Машваратро фармоиш диҳед',specialties:'Ихтисосҳо',askTitle:'Чӣ гуна савол медиҳед?',free:'Ройгон',paid:'Пулакӣ',consultTitle:'Навъи машваратро интихоб кунед',doctor:'Интихоби духтур',custom:'Дархости ҷаласаи махсус',freeSession:'Ҷаласаи ройгон',book:'Фармоиш',owner:'Доктор Ҷеймс',online:'Машварати тиббии онлайн',price:'25 USD'},
  az:{search:'Həkim və ya ixtisas axtarın',searchBtn:'Axtar',ask:'İndi sual verin',consult:'Məsləhətə yazılın',specialties:'İxtisaslar',askTitle:'Sualı necə vermək istəyirsiniz?',free:'Pulsuz',paid:'Ödənişli',consultTitle:'Məsləhət növünü seçin',doctor:'Həkim seçin',custom:'Fərdi sessiya sorğusu',freeSession:'Pulsuz sessiya',book:'Rezerv et',owner:'Doktor Ceyms',online:'Onlayn tibbi məsləhət',price:'25 USD'},
  am:{search:'ዶክተር ወይም ስፔሻሊቲ ይፈልጉ',searchBtn:'ፈልግ',ask:'አሁን ጥያቄ ይጠይቁ',consult:'አሁን ምክክር ይያዙ',specialties:'ስፔሻሊቲዎች',askTitle:'ጥያቄውን እንዴት ይጠይቃሉ?',free:'ነጻ',paid:'የሚከፈልበት',consultTitle:'የምክክር አይነት ይምረጡ',doctor:'ዶክተር ይምረጡ',custom:'የግል ሴሽን ይጠይቁ',freeSession:'ነጻ ሴሽን',book:'ይያዙ',owner:'ዶክተር ጄምስ',online:'የመስመር ላይ የሕክምና ምክክር',price:'25 USD'},
  ka:{search:'მოძებნეთ ექიმი ან სპეციალობა',searchBtn:'ძიება',ask:'დასვით კითხვა',consult:'დაჯავშნეთ კონსულტაცია',specialties:'სპეციალობები',askTitle:'როგორ გსურთ კითხვის დასმა?',free:'უფასო',paid:'ფასიანი',consultTitle:'აირჩიეთ კონსულტაციის ტიპი',doctor:'აირჩიეთ ექიმი',custom:'მორგებული სესიის მოთხოვნა',freeSession:'უფასო სესია',book:'დაჯავშნა',owner:'დოქტორი ჯეიმსი',online:'ონლაინ სამედიცინო კონსულტაცია',price:'25 USD'}
};

export function Hero() {
  const { direction } = useApp();
  const { lang, dir } = useI18n();
  const { navigate } = useRouter();
  const c = copy[lang] || copy.en;
  const [query,setQuery] = useState('');
  const [modal,setModal] = useState<'ask'|'consult'|null>(null);
  const ArrowIcon = direction === 'rtl' ? ArrowLeft : ArrowRight;

  const search = () => {
    const q=query.trim();
    navigate(q ? '/search?q='+encodeURIComponent(q) : '/search');
  };

  return <section id="home" dir={dir} className="relative overflow-hidden bg-gradient-to-b from-primary-50/50 via-white to-white">
    <div className="absolute inset-0 pointer-events-none overflow-hidden"><div className="absolute -top-40 -end-40 h-96 w-96 rounded-full bg-primary-100/40 blur-3xl"/><div className="absolute top-20 -start-40 h-80 w-80 rounded-full bg-secondary-100/40 blur-3xl"/></div>
    <div className="container-x relative py-14 lg:py-20">
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        <div className="text-center lg:text-start">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary-200 bg-primary-50/80 px-4 py-1.5 text-sm font-medium text-primary-700"><Sparkles className="h-4 w-4"/>{c.consult}</div>
          <h1 className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight text-neutral-900">SB1</h1>
          <p className="mt-4 text-lg text-neutral-600">{lang==='ar'?'منصة طبية متعددة اللغات للاستشارات والمحتوى والمرافق الصحية.':lang==='ru'?'Медицинская платформа для консультаций, контента и медицинских учреждений.':lang==='de'?'Mehrsprachige Plattform für medizinische Beratung, Inhalte und Einrichtungen.': 'Multilingual medical platform for consultations, content and healthcare facilities.'}</p>
          <form onSubmit={(e)=>{e.preventDefault();search();}} className="mt-8 max-w-2xl mx-auto lg:mx-0">
            <div className="relative">
              <Search className="pointer-events-none absolute start-4 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400"/>
              <input value={query} onChange={e=>setQuery(e.target.value)} placeholder={c.search} className="w-full rounded-2xl border border-neutral-200 bg-white py-4 ps-12 pe-28 text-sm shadow-lg outline-none focus:border-primary-400 focus:ring-4 focus:ring-primary-100/50"/>
              <button type="submit" className="absolute end-2 top-1/2 -translate-y-1/2 rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white">{c.searchBtn}</button>
            </div>
          </form>
          <div className="mt-7 flex flex-wrap justify-center lg:justify-start gap-3">
            <button onClick={()=>setModal('consult')} className="btn-primary flex items-center gap-2"><Video className="h-5 w-5"/>{c.consult}</button>
            <button onClick={()=>setModal('ask')} className="btn-secondary flex items-center gap-2"><MessageCircle className="h-5 w-5"/>{c.ask}</button>
            <button onClick={()=>navigate('/specialties')} className="btn-secondary flex items-center gap-2"><ListFilter className="h-5 w-5"/>{c.specialties}</button>
          </div>
          <div className="mt-5 text-sm text-neutral-500">{lang==='ar'?'اختر الإجراء المطلوب مباشرة دون قوائم تخصصات إضافية.':'Choose the action you need directly without extra specialty shortcuts.'}</div>
        </div>

        <div className="relative hidden lg:block">
          <div className="rounded-3xl bg-gradient-to-br from-primary-500 to-secondary-600 p-2 shadow-2xl shadow-primary-500/20">
            <div className="rounded-2xl bg-white p-6">
              <div className="flex items-center gap-4">
                <img src="/jamal-james.jpg" alt={c.owner} className="h-20 w-20 rounded-2xl object-cover border-4 border-primary-50"/>
                <div className="min-w-0"><h3 className="text-xl font-bold text-neutral-900">{c.owner}</h3><p className="text-sm text-neutral-500">{c.online}</p><div className="mt-1 flex items-center gap-1 text-amber-500"><Star className="h-3.5 w-3.5 fill-current"/>4.9 <span className="text-xs text-neutral-400">(320)</span></div></div>
              </div>
              <div className="mt-5 rounded-xl bg-primary-50 px-4 py-3 flex items-center justify-between"><span className="flex items-center gap-2 text-sm font-medium text-primary-700"><Video className="h-4 w-4"/>{lang==='ar'?'احجز الآن':c.book}</span><span className="font-bold text-primary-700">{c.price}</span></div>
              <button onClick={()=>setModal('consult')} className="mt-4 w-full rounded-xl bg-primary-600 text-white py-3 font-bold flex items-center justify-center gap-2"><ArrowIcon className="h-4 w-4"/>{c.book}</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    {modal && <div className="fixed inset-0 z-[80] grid place-items-center bg-black/50 p-4" onClick={()=>setModal(null)}>
      <div dir={dir} className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl" onClick={e=>e.stopPropagation()}>
        <div className="flex items-center justify-between"><h2 className="text-xl font-extrabold">{modal==='ask'?c.askTitle:c.consultTitle}</h2><button onClick={()=>setModal(null)} className="rounded-xl p-2 hover:bg-gray-100"><X className="h-5 w-5"/></button></div>
        <div className="mt-5 grid gap-3">
          {modal==='ask' ? <>
            <button onClick={()=>navigate('/ask?mode=free')} className="rounded-2xl border p-5 text-start hover:border-primary-400 hover:bg-primary-50"><div className="font-extrabold">{c.free}</div><div className="mt-1 text-sm text-gray-500">{lang==='ar'?'اسأل سؤالاً مجانياً ضمن النظام التجريبي.':'Ask a free question in the demo system.'}</div></button>
            <button onClick={()=>navigate('/ask?mode=paid')} className="rounded-2xl border p-5 text-start hover:border-primary-400 hover:bg-primary-50"><div className="font-extrabold">{c.paid}</div><div className="mt-1 text-sm text-gray-500">{lang==='ar'?'سؤال مدفوع يصل إلى الأخصائيين حسب التخصص.':'A paid question routed to specialists by specialty.'}</div></button>
          </> : <>
            <button onClick={()=>navigate('/choose-doctor')} className="rounded-2xl border p-5 text-start hover:border-primary-400 hover:bg-primary-50"><div className="font-extrabold">{c.doctor}</div><div className="mt-1 text-sm text-gray-500">{lang==='ar'?'اختيار أخصائي وطريقة الاستشارة.':'Choose a specialist and consultation method.'}</div></button>
            <button onClick={()=>navigate('/appointments/book')} className="rounded-2xl border p-5 text-start hover:border-primary-400 hover:bg-primary-50"><div className="font-extrabold">{c.custom}</div><div className="mt-1 text-sm text-gray-500">{lang==='ar'?'حدد التخصص والوقت والمواصفات المطلوبة.':'Specify specialty, time and session requirements.'}</div></button>
            <button onClick={()=>navigate('/specialist-sessions')} className="rounded-2xl border p-5 text-start hover:border-primary-400 hover:bg-primary-50"><div className="font-extrabold">{c.freeSession}</div><div className="mt-1 text-sm text-gray-500">{lang==='ar'?'اعرض الجلسات المجانية المتاحة.':'View available free sessions.'}</div></button>
          </>}
        </div>
      </div>
    </div>}
  </section>;
}