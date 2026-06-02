import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Language, translations } from './i18n';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  // Try to load language from localStorage, default to 'pt'
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('shigueno_lang');
    if (saved === 'pt' || saved === 'en' || saved === 'es') {
      return saved as Language;
    }
    return 'pt';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('shigueno_lang', lang);
  };

  // Translation helper function
  const t = (key: string): string => {
    const langDict = translations[language] || translations['pt'];
    // Try to get key, otherwise fallback to portuguese, otherwise key itself
    return (langDict as any)[key] || (translations['pt'] as any)[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
