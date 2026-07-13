import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import Header from '../../components/layout/Header';

const QUICK_ACTIONS = [
  { key: 'addCitizenRecord', icon: '➕', color: '#1e3a5f', available: false },
  { key: 'searchRecord', icon: '🔍', color: '#0284c7', available: false },
  { key: 'scanQr', icon: '📷', color: '#16a34a', available: false },
];

export default function EmployeeDashboard() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { language } = useLanguage();

  const branchName = language === 'ar' ? user?.branch?.nameAr : user?.branch?.nameEn;

  return (
    <>
      <Header title={t('dashboard.title')} subtitle={`${t('dashboard.welcome')}, ${user?.name}`} />
      <div className="page-content">
        <div className="page-header">
          <h2 className="page-title">{t('dashboard.welcome')}</h2>
        </div>

        {branchName && (
          <div className="alert alert-info" style={{ marginBottom: 24 }}>
            🏢 {t('dashboard.yourBranch')}: <strong>{branchName}</strong>
          </div>
        )}

        <div className="card" style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--primary-dark)', marginBottom: 20 }}>
            {t('dashboard.quickActions')}
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {QUICK_ACTIONS.map((action) => (
              <div
                key={action.key}
                style={{
                  padding: '24px 16px',
                  borderRadius: 12,
                  border: '2px dashed var(--gray-200)',
                  textAlign: 'center',
                  opacity: action.available ? 1 : 0.5,
                  cursor: action.available ? 'pointer' : 'not-allowed',
                }}
              >
                <div style={{ fontSize: 32, marginBottom: 10 }}>{action.icon}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--gray-700)' }}>
                  {t(`dashboard.${action.key}`)}
                </div>
                {!action.available && (
                  <div style={{ fontSize: 11, color: 'var(--gray-400)', marginTop: 6 }}>
                    {language === 'ar' ? 'قريباً في المرحلة الثانية' : 'Coming in Phase 2'}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--primary-dark)', marginBottom: 16 }}>
            {language === 'ar' ? 'تعليمات السكانر' : 'Scanner Instructions'}
          </h3>
          <div style={{ background: 'var(--gray-50)', borderRadius: 10, padding: 20 }}>
            <p style={{ fontSize: 14, color: 'var(--gray-600)', lineHeight: 1.8 }}>
              {language === 'ar'
                ? '🔄 سيتم تفعيل ميزات السكانر ورفع المستندات وتوليد رموز QR في المرحلة الثانية من النظام.'
                : '🔄 Scanner features, document upload, and QR code generation will be activated in Phase 2 of the system.'}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
