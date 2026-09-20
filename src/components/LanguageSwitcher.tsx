import { useState, useRef, useEffect, type ReactNode } from 'react';
import { ChevronDown, Check, Globe, MapPin, X } from 'lucide-react';
import { useApp } from '@/i18n/AppContext';
import {
  LANGUAGES,
  ARAB_COUNTRIES,
  type LanguageCode,
  type CountryInfo,
} from '@/types/i18n';

export function LanguageSwitcher() {
  const { language, setLanguage, t, country, setCountry } = useApp();
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'language' | 'country'>('language');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-neutral-700 transition-all hover:bg-neutral-100"
        aria-label={t.language.selectLanguage}
      >
        <Globe className="h-4 w-4 text-primary-600" />
        <span className="hidden sm:inline">{LANGUAGES[language].nativeName}</span>
        <span className="sm:hidden">{language.toUpperCase()}</span>
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute end-0 top-full z-50 mt-2 w-80 origin-top-right rounded-2xl border border-neutral-200 bg-white p-2 shadow-2xl shadow-neutral-900/10 animate-scale-in">
          {/* Tabs */}
          <div className="flex gap-1 rounded-xl bg-neutral-100 p-1 mb-2">
            <button
              onClick={() => setActiveTab('language')}
              className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                activeTab === 'language'
                  ? 'bg-white text-primary-700 shadow-sm'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <Globe className="inline h-4 w-4 me-1" />
              {t.language.selectLanguage}
            </button>
            {language === 'ar' && (
              <button
                onClick={() => setActiveTab('country')}
                className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                  activeTab === 'country'
                    ? 'bg-white text-primary-700 shadow-sm'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                <MapPin className="inline h-4 w-4 me-1" />
                {t.language.selectCountry}
              </button>
            )}
          </div>

          {activeTab === 'language' ? (
            <div className="max-h-72 overflow-y-auto scrollbar-thin">
              {(Object.keys(LANGUAGES) as LanguageCode[]).map((code) => {
                const lang = LANGUAGES[code];
                return (
                  <button
                    key={code}
                    onClick={() => {
                      setLanguage(code);
                      if (code !== 'ar') setActiveTab('language');
                    }}
                    className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm transition-all ${
                      language === code
                        ? 'bg-primary-50 text-primary-700 font-semibold'
                        : 'text-neutral-700 hover:bg-neutral-50'
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <span className="text-xl">{lang.flag}</span>
                      <span>{lang.nativeName}</span>
                    </span>
                    {language === code && <Check className="h-4 w-4 text-primary-600" />}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="max-h-72 overflow-y-auto scrollbar-thin">
              <div className="px-3 py-2 text-xs font-medium text-neutral-500 uppercase tracking-wide">
                {t.language.region}
              </div>
              {ARAB_COUNTRIES.map((c: CountryInfo) => (
                <button
                  key={c.code}
                  onClick={() => {
                    setCountry(c);
                  }}
                  className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm transition-all ${
                    country.code === c.code
                      ? 'bg-primary-50 text-primary-700 font-semibold'
                      : 'text-neutral-700 hover:bg-neutral-50'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <span className="text-xl">{c.flag}</span>
                    <span>{t.countries[c.nameKey] || c.nameKey}</span>
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="text-xs text-neutral-500">{c.currencySymbol}</span>
                    {country.code === c.code && <Check className="h-4 w-4 text-primary-600" />}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function MobileLanguageSwitcher({ onClose }: { onClose?: () => void }) {
  const { language, setLanguage, t, country, setCountry } = useApp();
  const [activeTab, setActiveTab] = useState<'language' | 'country'>('language');

  return (
    <div className="space-y-3">
      <div className="flex gap-1 rounded-xl bg-neutral-100 p-1">
        <button
          onClick={() => setActiveTab('language')}
          className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
            activeTab === 'language' ? 'bg-white text-primary-700 shadow-sm' : 'text-neutral-600'
          }`}
        >
          {t.language.selectLanguage}
        </button>
        {language === 'ar' && (
          <button
            onClick={() => setActiveTab('country')}
            className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
              activeTab === 'country' ? 'bg-white text-primary-700 shadow-sm' : 'text-neutral-600'
            }`}
          >
            {t.language.selectCountry}
          </button>
        )}
      </div>

      {activeTab === 'language' ? (
        <div className="grid grid-cols-2 gap-2">
          {(Object.keys(LANGUAGES) as LanguageCode[]).map((code) => {
            const lang = LANGUAGES[code];
            return (
              <button
                key={code}
                onClick={() => {
                  setLanguage(code);
                  onClose?.();
                }}
                className={`flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm transition-all ${
                  language === code
                    ? 'bg-primary-50 text-primary-700 font-semibold ring-1 ring-primary-200'
                    : 'text-neutral-700 hover:bg-neutral-50 ring-1 ring-neutral-200'
                }`}
              >
                <span className="text-lg">{lang.flag}</span>
                <span className="truncate">{lang.nativeName}</span>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="max-h-64 overflow-y-auto scrollbar-thin space-y-1">
          {ARAB_COUNTRIES.map((c) => (
            <button
              key={c.code}
              onClick={() => {
                setCountry(c);
                onClose?.();
              }}
              className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm transition-all ${
                country.code === c.code
                  ? 'bg-primary-50 text-primary-700 font-semibold'
                  : 'text-neutral-700 hover:bg-neutral-50'
              }`}
            >
              <span className="flex items-center gap-3">
                <span className="text-xl">{c.flag}</span>
                <span>{t.countries[c.nameKey] || c.nameKey}</span>
              </span>
              <span className="text-xs text-neutral-500">{c.currencySymbol}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
