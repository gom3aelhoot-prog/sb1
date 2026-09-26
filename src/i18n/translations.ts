import type { LanguageCode, TranslationData } from '@/types/i18n';
import ar from './translations/ar';
import ru from './translations/ru';
import uz from './translations/uz';
import hy from './translations/hy';
import tg from './translations/tg';
import uk from './translations/uk';
import az from './translations/az';
import ka from './translations/ka';
// English and German use the shared platform translation fallback until dedicated legacy dictionaries are added.
const en = ar as TranslationData;
const de = ar as TranslationData;

export const translations: Record<LanguageCode, TranslationData> = {
  ar,
  ru,
  uz,
  hy,
  tg,
  uk,
  az,
  ka,
  en,
  de,
};

export type { TranslationData, LanguageCode };
