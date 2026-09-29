import { useState, useRef, useEffect } from 'react';
import { Bot, Send, X, Sparkles } from 'lucide-react';
import { useI18n } from '@/lib/i18n';

type Message = { role: 'user' | 'ai'; text: string };

export default function AIChatWidget() {
  const { t, lang, dir } = useI18n();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([{ role: 'ai', text: t('ai.welcome') }]);
    }
  }, [open, messages.length, t]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, thinking]);

  const copy = {
    ar: {
      connected: 'متصل',
      contact: 'عذراً، يمنع تبادل وسائل التواصل أو أرقام الهواتف وفقاً لقواعد الموقع. تم إرسال إشعار للإدارة.',
      restricted: 'عذراً، لا يمكنني المساعدة في هذا الموضوع داخل المساعد الطبي. يرجى استخدام المنصة للمواضيع الصحية والخدمات المتاحة.',
      doctor: 'يمكنك تصفح دليل الأطباء حسب التخصص والمدينة، أو بدء استشارة نصية مجانية، أو حجز جلسة فيديو.',
      course: 'يمكنك زيارة صفحة الدورات التدريبية للاطلاع على الدورات المتاحة والتسجيل فيها.',
      video: 'يمكنك مشاهدة الفيديوهات الطبية أو حجز جلسة فيديو مباشرة من صفحة الجلسات.',
      price: 'الأسعار تختلف حسب الخدمة والدورة. يمكنك فتح صفحة الجلسات أو الدورات للاطلاع على السعر الحالي.',
      symptom: 'للحالات الطبية المحددة، اطرح سؤالك عبر صفحة اسأل طبيباً أو استخدم جلسة الاستشارة. هذه الخدمة لا تغني عن الفحص الطبي المباشر.',
      hello: 'مرحباً بك في سهله وبسيطه! يمكنني مساعدتك في العثور على الأطباء، الاستشارات، الدورات والمحتوى الطبي العام.',
      fallback: 'يمكنني مساعدتك في الأطباء، الاستشارات، الدورات، الفيديوهات والمكتبة. للحالة الطبية المحددة استخدم خدمة اسأل طبيباً.',
    },
    ru: {
      connected: 'Онлайн',
      contact: 'Извините, обмен контактами и номерами телефонов запрещён правилами платформы.',
      restricted: 'Я не могу помочь с этой темой в медицинском помощнике. Используйте платформу для медицинских вопросов и сервисов.',
      doctor: 'Вы можете открыть каталог врачей, отфильтровать по специальности и городу, начать бесплатную текстовую консультацию или забронировать видео.',
      course: 'Откройте раздел курсов, чтобы посмотреть доступные программы и записаться.',
      video: 'Медицинские видео доступны в разделе видео, а видеоконсультацию можно забронировать в разделе сессий.',
      price: 'Стоимость зависит от услуги или курса. Откройте соответствующий раздел, чтобы увидеть актуальную цену.',
      symptom: 'Для конкретной медицинской ситуации используйте раздел «Спросить врача» или консультацию. Помощник не заменяет очный осмотр.',
      hello: 'Здравствуйте! Я помощник Sahla Wa Basita. Помогу найти врачей, консультации, курсы и общую медицинскую информацию.',
      fallback: 'Я могу помочь с врачами, консультациями, курсами, видео и библиотекой. Для конкретной медицинской ситуации используйте «Спросить врача».',
    },
    de: {
      connected: 'Online',
      contact: 'Der Austausch von Kontaktdaten und Telefonnummern ist nach den Plattformregeln nicht erlaubt.',
      restricted: 'Bei diesem Thema kann ich im medizinischen Assistenten nicht helfen. Bitte nutzen Sie die Plattform für medizinische Fragen und Dienste.',
      doctor: 'Sie können das Arztverzeichnis nach Fachgebiet und Stadt durchsuchen, eine kostenlose Textberatung starten oder eine Videositzung buchen.',
      course: 'Öffnen Sie den Kursbereich, um verfügbare Programme zu sehen und sich anzumelden.',
      video: 'Medizinische Videos finden Sie im Videobereich. Eine Videosprechstunde können Sie unter Sitzungen buchen.',
      price: 'Der Preis hängt vom Dienst oder Kurs ab. Im jeweiligen Bereich sehen Sie den aktuellen Preis.',
      symptom: 'Bei konkreten Beschwerden nutzen Sie bitte «Arzt fragen» oder eine Beratung. Der Assistent ersetzt keine persönliche Untersuchung.',
      hello: 'Willkommen bei Sahla Wa Basita! Ich helfe Ihnen bei Ärzten, Beratungen, Kursen und allgemeinen medizinischen Informationen.',
      fallback: 'Ich kann bei Ärzten, Beratungen, Kursen, Videos und der Bibliothek helfen. Für konkrete Beschwerden nutzen Sie «Arzt fragen».',
    },
    en: {
      connected: 'Online',
      contact: 'Sharing contact details or phone numbers is not allowed under the platform rules.',
      restricted: 'I cannot help with that topic in the medical assistant. Please use the platform for medical questions and services.',
      doctor: 'Browse the doctor directory by specialty and city, start a free text consultation, or book a video session.',
      course: 'Open the courses section to see available programs and enroll.',
      video: 'Medical videos are available in the video section, and video consultations can be booked from Sessions.',
      price: 'Pricing depends on the service or course. Open the relevant section to see the current price.',
      symptom: 'For a specific medical situation, use Ask a Doctor or a consultation. This assistant does not replace an in-person medical examination.',
      hello: 'Welcome to Sahla Wa Basita! I can help with doctors, consultations, courses, and general medical information.',
      fallback: 'I can help with doctors, consultations, courses, videos, and the library. For a specific medical situation, use Ask a Doctor.',
    },
  } as const;

  const c = copy[lang as keyof typeof copy] || copy.en;

  const getAIResponse = (userText: string): string => {
    const lower = userText.toLowerCase();
    const contactPatterns = /(\+?\d{7,}|www\.|http|@[a-zA-Z0-9]+\.[a-zA-Z]{2,}|facebook|whatsapp|telegram|viber|skype|instagram|snapchat)/i;
    const restrictedPatterns = /(politics|religion|دين|سياسة|politique|religion|политика|религия)/i;

    if (contactPatterns.test(userText)) return c.contact;
    if (restrictedPatterns.test(userText)) return c.restricted;
    if (lower.includes('doctor') || lower.includes('طبيب') || lower.includes('врач') || lower.includes('arzt') || lower.includes('استشار')) return c.doctor;
    if (lower.includes('course') || lower.includes('دورة') || lower.includes('كورس') || lower.includes('курс') || lower.includes('kurs')) return c.course;
    if (lower.includes('video') || lower.includes('فيديو') || lower.includes('видео') || lower.includes('video')) return c.video;
    if (lower.includes('price') || lower.includes('سعر') || lower.includes('تكلفة') || lower.includes('цена') || lower.includes('preis')) return c.price;
    if (lower.includes('symptom') || lower.includes('مرض') || lower.includes('علاج') || lower.includes('ألم') || lower.includes('боль') || lower.includes('симптом') || lower.includes('schmerz')) return c.symptom;
    if (lower.includes('hello') || lower.includes('hi') || lower.includes('مرحبا') || lower.includes('سلام') || lower.includes('здравствуйте') || lower.includes('привет') || lower.includes('hallo')) return c.hello;
    return c.fallback;
  };

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setMessages((prev) => [...prev, { role: 'user', text: userMsg }]);
    setInput('');
    setThinking(true);
    window.setTimeout(() => {
      setMessages((prev) => [...prev, { role: 'ai', text: getAIResponse(userMsg) }]);
      setThinking(false);
    }, 700);
  };

  return (
    <>
      {!open && (
        <button aria-label={t('ai.assistant')} onClick={() => setOpen(true)} className="group fixed bottom-6 start-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-teal-700 text-white shadow-lg transition hover:scale-105 hover:shadow-xl">
          <Bot className="h-7 w-7" />
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-amber-400"><Sparkles className="h-3 w-3 text-white" /></span>
        </button>
      )}

      {open && (
        <div dir={dir} className="fixed bottom-6 start-6 z-40 flex w-[360px] max-w-[calc(100vw-3rem)] flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-2xl animate-scale-in" style={{ height: '500px', maxHeight: 'calc(100vh - 3rem)' }}>
          <div className="flex items-center justify-between bg-gradient-to-l from-teal-600 to-teal-700 p-4 text-white">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20"><Bot className="h-5 w-5" /></div>
              <div>
                <h3 className="text-sm font-bold">{t('ai.assistant')}</h3>
                <span className="flex items-center gap-1 text-xs text-teal-100"><span className="h-2 w-2 rounded-full bg-green-400" />{c.connected}</span>
              </div>
            </div>
            <button aria-label={t('common.back')} onClick={() => setOpen(false)} className="text-white/80 hover:text-white"><X className="h-5 w-5" /></button>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto bg-gray-50 p-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-start' : 'justify-end'}`}>
                <div className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm ${msg.role === 'user' ? 'bg-teal-600 text-white' : 'border border-gray-100 bg-white text-gray-700 shadow-sm'}`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {thinking && <div className="flex justify-end"><div className="rounded-2xl border border-gray-100 bg-white px-4 py-3 shadow-sm"><div className="flex gap-1"><span className="h-2 w-2 animate-bounce rounded-full bg-teal-400" /><span className="h-2 w-2 animate-bounce rounded-full bg-teal-400 [animation-delay:150ms]" /><span className="h-2 w-2 animate-bounce rounded-full bg-teal-400 [animation-delay:300ms]" /></div></div></div>}
          </div>

          <div className="border-t border-gray-100 bg-white p-3">
            <div className="flex gap-2">
              <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()} placeholder={t('ai.placeholder')} className="input-field flex-1" />
              <button aria-label={t('chat.send')} onClick={handleSend} className="rounded-xl bg-teal-600 p-2.5 text-white transition hover:bg-teal-700"><Send className="h-5 w-5" /></button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
