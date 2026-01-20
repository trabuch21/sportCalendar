import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import esTranslations from './locales/es.json';
import enTranslations from './locales/en.json';

type Language = 'es' | 'en';

type Translations = typeof esTranslations;

interface I18nContextType {
  language: Language;
  locale: Language;
  setLanguage: (lang: Language) => void;
  setLocale: (lang: Language) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

const translations: Record<Language, Translations> = {
  es: esTranslations,
  en: enTranslations,
};

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    // Get from localStorage or default to Spanish
    const saved = localStorage.getItem('language') as Language;
    return saved && (saved === 'es' || saved === 'en') ? saved : 'es';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = (key: string, vars?: Record<string, string | number>): string => {
    const keys = key.split('.');
    let value: any = translations[language];
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        // Fallback to Spanish if key not found
        value = translations.es;
        for (const k2 of keys) {
          if (value && typeof value === 'object' && k2 in value) {
            value = value[k2];
          } else {
            return key; // Return key if not found
          }
        }
        break;
      }
    }
    
    let result = typeof value === 'string' ? value : key;
    
    // Replace variables if provided
    if (vars && typeof result === 'string') {
      Object.entries(vars).forEach(([varKey, varValue]) => {
        result = result.replace(new RegExp(`{{${varKey}}}`, 'g'), String(varValue));
      });
    }
    
    return result;
  };

  return (
    <I18nContext.Provider value={{ language, locale: language, setLanguage, setLocale: setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within I18nProvider');
  }
  return context;
}
