import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import {
  type LanguageCode,
  type Direction,
  type CountryInfo,
  type TranslationData,
  LANGUAGES,
  ARAB_COUNTRIES,
  COUNTRY_OPTIONS,
  LANGUAGE_DEFAULT_COUNTRY,
  CURRENCY_RATES,
} from '@/types/i18n';
import { translations } from '@/i18n/translations';
import { getDiscountConfig } from '@/lib/adConfig';

interface AppContextValue {
  language: LanguageCode;
  direction: Direction;
  setLanguage: (lang: LanguageCode) => void;
  t: TranslationData;
  isAnonymous: boolean;
  hasSeenDiscount: boolean;
  dismissDiscount: () => void;
  showDiscount: boolean;
  setShowDiscount: (v: boolean) => void;
  country: CountryInfo;
  setCountry: (country: CountryInfo) => void;
  formatPrice: (priceUSD: number) => string;
}

const AppContext = createContext<AppContextValue | null>(null);

const STORAGE_KEYS = {
  language: 'app_language',
  country: 'app_country',
  discountDismissed: 'app_discount_dismissed',
};

function getInitialLanguage(): LanguageCode {
  if (typeof window === 'undefined') return 'ar';
  const stored = localStorage.getItem(STORAGE_KEYS.language) as LanguageCode | null;
  if (stored && LANGUAGES[stored]) return stored;
  return 'ar';
}

function getInitialCountry(): CountryInfo {
  if (typeof window === 'undefined') return ARAB_COUNTRIES.find(c=>c.code==='EG') || ARAB_COUNTRIES[0];
  const stored = localStorage.getItem(STORAGE_KEYS.country);
  if (stored) {
    const found = COUNTRY_OPTIONS.find((c) => c.code === stored);
    if (found) return found;
  }
  return ARAB_COUNTRIES[0];
}

function getInitialDiscountDismissed(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(STORAGE_KEYS.discountDismissed) === 'true';
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>(getInitialLanguage);
  const [country, setCountryState] = useState<CountryInfo>(getInitialCountry);
  const [discountDismissedAt, setDiscountDismissedAt] = useState<number>(() => Number(localStorage.getItem('sb1_discount_dismissed_at') || 0));
  const [discountCloseCount, setDiscountCloseCount] = useState<number>(() => Number(localStorage.getItem('sb1_discount_close_count') || 0));
  const [discountConfig,setDiscountConfig]=useState(getDiscountConfig());
  const [showDiscount, setShowDiscount] = useState<boolean>(false);

  useEffect(()=>{const sync=()=>setDiscountConfig(getDiscountConfig());window.addEventListener('sb1-ad-config-change',sync);return()=>window.removeEventListener('sb1-ad-config-change',sync)},[]);
  const direction: Direction = LANGUAGES[language].direction;

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = direction;
  }, [language, direction]);

  useEffect(() => {
    if (!discountConfig.enabled) { setShowDiscount(false); return; }
    const now=Date.now();
    const cooldownMinutes = discountDismissedAt ? (discountCloseCount <= 1 ? 30 : 60) : 0;
    const cooldown=cooldownMinutes*60000;
    const remaining=Math.max(0,cooldown-(now-discountDismissedAt));
    const delay=discountDismissedAt ? remaining : 2000;
    const timer=setTimeout(()=>setShowDiscount(true),delay);
    return()=>clearTimeout(timer);
  }, [discountConfig.enabled,discountDismissedAt,discountCloseCount]);

  const setLanguage = useCallback((lang: LanguageCode) => {
    setLanguageState(lang);
    const defaultCountryCode = LANGUAGE_DEFAULT_COUNTRY[lang];
    if (defaultCountryCode) {
      const nextCountry = COUNTRY_OPTIONS.find(c=>c.code===defaultCountryCode);
      if (nextCountry) { setCountryState(nextCountry); localStorage.setItem(STORAGE_KEYS.country,nextCountry.code); }
    }
    localStorage.setItem(STORAGE_KEYS.language, lang);
    window.dispatchEvent(new CustomEvent('sb1-language-change', { detail: lang }));
  }, []);

  const setCountry = useCallback((c: CountryInfo) => {
    setCountryState(c);
    localStorage.setItem(STORAGE_KEYS.country, c.code);
  }, []);

  const dismissDiscount = useCallback(() => {
    const now=Date.now();
    setShowDiscount(false);
    const nextCount=discountCloseCount+1;
    setDiscountDismissedAt(now);
    setDiscountCloseCount(nextCount);
    localStorage.setItem('sb1_discount_dismissed_at',String(now));
    localStorage.setItem('sb1_discount_close_count',String(nextCount));
    localStorage.setItem(STORAGE_KEYS.discountDismissed,'true');
  }, []);

  const formatPrice = useCallback(
    (priceUSD: number): string => {
      const rate = CURRENCY_RATES[country.currency] ?? 1;
      const converted = priceUSD * rate;
      const formatted = converted.toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      });
      return `${formatted} ${country.currencySymbol}`;
    },
    [country, language]
  );

  const isAnonymous = typeof window === 'undefined' ? true : !localStorage.getItem('sb1_account_user_id') && !localStorage.getItem('sb1_account_email');

  const value: AppContextValue = {
    language,
    direction,
    setLanguage,
    t: translations[language],
    isAnonymous,
    hasSeenDiscount: Boolean(discountDismissedAt),
    dismissDiscount,
    showDiscount,
    setShowDiscount,
    country,
    setCountry,
    formatPrice,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
