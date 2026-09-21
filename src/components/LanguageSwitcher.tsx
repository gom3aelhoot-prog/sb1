import { Globe2, Check, ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useI18n, type Language } from '@/lib/i18n';

const languages: { code: Language; label: string; flag: string }[] = [
  { code: 'ar', label: 'العربية', flag: '🇸🇾' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { code: 'ru', label: 'Русский', flag: '🇷🇺' },
  { code: 'uz', label: 'Oʻzbekcha', flag: '🇺🇿' },
  { code: 'hy', label: 'Հայերեն', flag: '🇦🇲' },
  { code: 'tg', label: 'Тоҷикӣ', flag: '🇹🇯' },
  { code: 'uk', label: 'Українська', flag: '🇺🇦' },
  { code: 'az', label: 'Azərbaycan', flag: '🇦🇿' },
  { code: 'am', label: 'አማርኛ', flag: '🇪🇹' },
  { code: 'ka', label: 'ქართული', flag: '🇬🇪' },
];

export default function LanguageSwitcher() {
  const { lang, setLang, dir } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  const current = languages.find((item) => item.code === lang) ?? languages[0];

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:border-primary-200 hover:bg-primary-50"
      >
        <Globe2 className="h-4 w-4 text-primary-600" />
        <span className="text-base">{current.flag}</span>
        <span className="hidden sm:inline">{current.label}</span>
        <span className="sm:hidden">{current.code.toUpperCase()}</span>
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div
          className={`absolute top-full z-50 mt-2 w-72 rounded-2xl border border-gray-200 bg-white p-2 shadow-2xl ${dir === 'rtl' ? 'end-0' : 'start-0'}`}
        >
          <div className="px-3 pb-2 pt-2">
            <p className="text-sm font-bold text-gray-900">{lang === 'ar' ? 'اختيار اللغة' : lang === 'ru' ? 'Выберите язык' : lang === 'de' ? 'Sprache wählen' : 'Select language'}</p>
            <p className="mt-1 text-xs text-gray-500">{lang === 'ar' ? 'تتغير واجهة المنصة فوراً' : lang === 'ru' ? 'Интерфейс меняется сразу' : lang === 'de' ? 'Die Oberfläche ändert sich sofort' : 'The interface changes instantly'}</p>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {languages.map((item) => (
              <button
                key={item.code}
                type="button"
                onClick={() => { setLang(item.code); setOpen(false); }}
                className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm transition ${lang === item.code ? 'bg-primary-50 font-semibold text-primary-700' : 'text-gray-700 hover:bg-gray-50'}`}
              >
                <span className="flex items-center gap-3">
                  <span className="text-lg">{item.flag}</span>
                  <span>{item.label}</span>
                </span>
                {lang === item.code && <Check className="h-4 w-4 text-primary-600" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
