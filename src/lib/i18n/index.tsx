'use client';

import { createContext, useCallback, useContext, useMemo } from 'react';
import { en, type TranslationKey } from './en';
import { fa } from './fa';
import { useSettings } from '@/stores/settings';

type Dict = Record<string, string>;

const catalogs: Record<string, Dict> = { en: en as unknown as Dict, fa };

/** LocaleText = a content string that ships both languages. */
export interface LocaleText {
  en: string;
  fa?: string;
}

const FA_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];

/** Latin digits → Persian digits (for UI display when lang=fa). */
export function toFaDigits(s: string): string {
  return s.replace(/\d/g, (d) => FA_DIGITS[Number(d)]);
}

/** Resolve a bilingual content string for the active language. */
export function txText(text: LocaleText | undefined | null, lang: string): string {
  if (!text) return '';
  return lang === 'fa' && text.fa ? text.fa : text.en;
}

interface I18nCtx {
  lang: string;
  t: (key: TranslationKey | string, vars?: Record<string, string | number>) => string;
  /** resolve LocaleText content strings (lessons, challenges, projects) */
  tx: (text: LocaleText | undefined | null) => string;
}

const Ctx = createContext<I18nCtx>({ lang: 'fa', t: (k) => String(k), tx: () => '' });

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const lang = useSettings((s) => s.language);
  const t = useCallback(
    (key: TranslationKey | string, vars?: Record<string, string | number>) => {
      const dict = catalogs[lang] ?? catalogs.en;
      let s = dict[key] ?? (catalogs.en as Dict)[key] ?? key;
      if (vars) {
        for (const [k, v] of Object.entries(vars)) {
          s = s.replaceAll(`{${k}}`, String(v));
        }
      }
      return lang === 'fa' ? toFaDigits(s) : s;
    },
    [lang],
  );
  const tx = useCallback((text: LocaleText | undefined | null) => txText(text, lang), [lang]);
  const value = useMemo(() => ({ lang, t, tx }), [lang, t, tx]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useI18n() {
  return useContext(Ctx);
}

export type { TranslationKey };
