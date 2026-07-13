import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../contexts/LanguageContext';
import './Header.css';

export default function Header({ title, subtitle }) {
  const { t } = useTranslation();
  const { language, toggleLanguage } = useLanguage();

  return (
    <header className="header">
      <div className="header-left">
        <h1 className="header-title">{title}</h1>
        {subtitle && <p className="header-subtitle">{subtitle}</p>}
      </div>
      <div className="header-right">
        <button className="lang-toggle" onClick={toggleLanguage}>
          <span className="lang-flag">{language === 'ar' ? '🇸🇦' : '🇬🇧'}</span>
          <span>{language === 'ar' ? t('common.arabic') : t('common.english')}</span>
        </button>
      </div>
    </header>
  );
}
