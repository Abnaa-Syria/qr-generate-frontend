import { useLanguage } from '../../contexts/LanguageContext';
import { useTranslation } from 'react-i18next';

export default function LanguageSwitcher() {
  const { language, toggleLanguage } = useLanguage();
  const { t } = useTranslation();

  return (
    <button className="lang-toggle" onClick={toggleLanguage}>
      {language === 'ar' ? '🇬🇧 English' : '🇸🇦 العربية'}
    </button>
  );
}
