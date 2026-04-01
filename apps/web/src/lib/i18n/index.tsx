'use client';

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { en, type Translations } from './en';
import { nl } from './nl';

export type Locale = 'en' | 'nl';

const translations: Record<Locale, Translations> = { en, nl };

/** Create a proxy that logs missing i18n keys and falls back to English */
function createI18nProxy(locale: Locale): Translations {
  const target = translations[locale];
  const fallback = translations['en'];

  function wrap(obj: Record<string, unknown>, fb: Record<string, unknown>, path: string): unknown {
    return new Proxy(obj, {
      get(t, prop: string) {
        const val = t[prop];
        const fbVal = fb[prop];
        if (val === undefined || val === null) {
          console.error(`[i18n-missing] key=${path ? path + '.' : ''}${prop}`);
          return fbVal;
        }
        if (typeof val === 'object' && val !== null && typeof fbVal === 'object' && fbVal !== null) {
          return wrap(val as Record<string, unknown>, fbVal as Record<string, unknown>, path ? `${path}.${prop}` : prop);
        }
        return val;
      },
    });
  }

  return wrap(target as unknown as Record<string, unknown>, fallback as unknown as Record<string, unknown>, '') as unknown as Translations;
}

interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: Translations;
}

const I18nContext = createContext<I18nContextValue>({
  locale: 'en',
  setLocale: () => {},
  t: en,
});

const STORAGE_KEY = 'reels-locale';

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en');

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'nl' || stored === 'en') {
      setLocaleState(stored);
    }
  }, []);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem(STORAGE_KEY, newLocale);
    document.documentElement.lang = newLocale;
  }, []);

  return (
    <I18nContext.Provider value={{ locale, t: createI18nProxy(locale), setLocale }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}

export { type Translations };
