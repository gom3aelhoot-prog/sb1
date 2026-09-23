import type { Language } from '@/lib/i18n';

export type LocalizedRecord = Record<string, unknown>;

/**
 * Resolves multilingual content from either dedicated *_<lang> columns or
 * a JSONB `translations` object of the form:
 * { "ru": { "title": "...", "description": "..." }, ... }
 * Falls back safely to the base field.
 */
export function localizedField<T extends LocalizedRecord>(
  item: T | null | undefined,
  field: string,
  lang: Language,
  fallback = ''
): string {
  if (!item) return fallback;
  const record = item as Record<string, unknown>;

  const translations = record.translations;
  if (translations && typeof translations === 'object' && !Array.isArray(translations)) {
    const byLanguage = (translations as Record<string, unknown>)[lang];
    if (byLanguage && typeof byLanguage === 'object' && !Array.isArray(byLanguage)) {
      const value = (byLanguage as Record<string, unknown>)[field];
      if (typeof value === 'string' && value.trim()) return value;
    }
  }

  const candidates = [
    `${field}_${lang}`,
    lang === 'ar' ? field : `${field}_ar`,
    field,
  ];

  for (const key of candidates) {
    const value = record[key];
    if (typeof value === 'string' && value.trim()) return value;
  }

  return fallback;
}
