import type { LanguageCode, TranslationData } from '@/types/i18n';
import ar from './translations/ar';
import en from './translations/en';
import de from './translations/de';
import am from './translations/am';
import ru from './translations/ru';
import uz from './translations/uz';
import hy from './translations/hy';
import tg from './translations/tg';
import uk from './translations/uk';
import az from './translations/az';
import ka from './translations/ka';
// Fallback UI dictionaries for the newly enabled locales; platform pages use their full locale dictionaries.

export const translations: Record<LanguageCode, TranslationData> = {
  ar,
  en,
  de,
  am,
  ru,
  uz,
  hy,
  tg,
  uk,
  az,
  ka,
  en: ar,
  de: ar,
  am: ar,
};

export type { TranslationData, LanguageCode };
