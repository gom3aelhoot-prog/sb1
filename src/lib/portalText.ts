import type { Language } from '@/lib/i18n';

export type PortalLang = Language;

type Dict = Partial<Record<PortalLang, string>> & { ar: string; ru: string };

export function pt(lang: PortalLang, dict: Dict): string {
  return dict[lang] || dict.en || dict.de || dict.ru || dict.ar;
}

export function isRtl(lang: PortalLang) {
  return lang === 'ar';
}
