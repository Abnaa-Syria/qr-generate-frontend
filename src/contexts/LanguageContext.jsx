import { createContext, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const { i18n } = useTranslation();
  const [language, setLanguage] = useState(i18n.language?.startsWith('ar') ? 'ar' : i18n.language || 'ar');
  const isRTL = language === 'ar';

  useEffect(() => {
    const lang = i18n.language?.startsWith('ar') ? 'ar' : 'en';
    setLanguage(lang);
    document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
    document.documentElement.setAttribute('lang', lang);
  }, [i18n.language]);

  const toggleLanguage = () => {
    const newLang = language === 'ar' ? 'en' : 'ar';
    i18n.changeLanguage(newLang);
    setLanguage(newLang);
    document.documentElement.setAttribute('dir', newLang === 'ar' ? 'rtl' : 'ltr');
    document.documentElement.setAttribute('lang', newLang);
  };

  return (
    <LanguageContext.Provider value={{ language, isRTL, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}

export default LanguageContext;
