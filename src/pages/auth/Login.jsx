import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import './Login.css';

export default function Login() {
  const { t } = useTranslation();
  const { login } = useAuth();
  const { language, toggleLanguage } = useLanguage();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) { setError(t('common.required')); return; }
    setLoading(true);
    setError('');
    try {
      const user = await login(email, password);
      const adminRoles = ['SUPER_ADMIN', 'ADMIN'];
      if (adminRoles.includes(user.role?.key)) {
        navigate('/dashboard', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    } catch (err) {
      setError(err.response?.data?.message || t('login.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-bg">
        <div className="login-bg-shape" />
        <div className="login-bg-shape login-bg-shape-2" />
      </div>

      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <div className="login-logo">🏛️</div>
            <h1 className="login-title">{t('login.title')}</h1>
            <p className="login-subtitle">{t('login.subtitle')}</p>
          </div>

          {error && (
            <div className="alert alert-error">
              <span>⚠️</span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label className="form-label">{t('login.email')}</label>
              <input
                type="email"
                className="form-control"
                placeholder={t('login.emailPlaceholder')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                dir="ltr"
              />
            </div>

            <div className="form-group">
              <label className="form-label">{t('login.password')}</label>
              <div className="login-pass-wrapper">
                <input
                  type={showPass ? 'text' : 'password'}
                  className="form-control"
                  placeholder={t('login.passwordPlaceholder')}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="login-show-pass"
                  onClick={() => setShowPass(!showPass)}
                >
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-primary login-btn" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
                  {t('login.loading')}
                </>
              ) : t('login.submit')}
            </button>
          </form>

          <div className="login-footer">
            <button className="lang-toggle" onClick={toggleLanguage}>
              {language === 'ar' ? '🇬🇧 English' : '🇸🇦 العربية'}
            </button>
          </div>
        </div>

        <div className="login-info">
          <div className="login-info-logo">🔐</div>
          <h2 className="login-info-title">{t('login.infoTitle')}</h2>
          <p className="login-info-desc">{t('login.infoDesc')}</p>
          <div className="login-features">
            {[
              { icon: '🔒', text: t('login.featureEncryption') },
              { icon: '📂', text: t('login.featureArchiving') },
              { icon: '🏢', text: t('login.featureBranches') },
              { icon: '📊', text: t('login.featureReports') },
            ].map((f) => (
              <div key={f.text} className="login-feature">
                <span>{f.icon}</span>
                <span>{f.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
