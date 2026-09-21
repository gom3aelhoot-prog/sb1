import type { Language } from '@/lib/i18n';

type Localized = Partial<Record<Language, string>> & { ar: string; ru: string; en?: string; de?: string };

export function lt(lang: Language, text: Localized): string {
  return text[lang] || text.en || text.ru || text.ar;
}
