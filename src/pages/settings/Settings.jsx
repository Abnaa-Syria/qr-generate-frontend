import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../contexts/LanguageContext';
import Header from '../../components/layout/Header';
import Loader from '../../components/ui/Loader';
import { settingService } from '../../services/setting.service';
import PermissionGuard from '../../components/layout/PermissionGuard';

export default function Settings() {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const [settings, setSettings] = useState([]);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    settingService.getAll().then(({ data }) => {
      const s = data.data || [];
      setSettings(s);
      const f = {};
      s.forEach(item => { f[item.key] = item.value || ''; });
      setForm(f);
    }).finally(() => setLoading(false));
  }, []);

  const groupMap = {};
  settings.forEach(s => {
    if (!groupMap[s.group]) groupMap[s.group] = [];
    groupMap[s.group].push(s);
  });

  const handleSave = async (group) => {
    setSaving(true);
    setSuccess(false);
    setError('');
    try {
      const groupSettings = groupMap[group] || [];
      const payload = groupSettings.map(s => ({ key: s.key, value: form[s.key] }));
      await settingService.bulkUpdate(payload);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.response?.data?.message || t('common.error'));
    } finally {
      setSaving(false);
    }
  };

  const getLabel = (setting) => language === 'ar' ? setting.labelAr : setting.labelEn;

  if (loading) return <><Header title={t('settings.title')} /><Loader /></>;

  return (
    <>
      <Header title={t('settings.title')} />
      <div className="page-content">
        {success && <div className="alert alert-success">✅ {t('settings.saved')}</div>}
        {error && <div className="alert alert-error">⚠️ {error}</div>}

        {Object.entries(groupMap).map(([group, groupSettings]) => (
          <div key={group} className="card" style={{ marginBottom: 24 }}>
            <div className="card-header">
              <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--primary-dark)' }}>
                {t(`settings.groups.${group}`) || group}
              </h3>
              <PermissionGuard permission="settings.manage">
                <button className="btn btn-primary btn-sm" onClick={() => handleSave(group)} disabled={saving}>
                  {saving ? t('common.loading') : t('settings.save')}
                </button>
              </PermissionGuard>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
              {groupSettings.map((setting) => (
                <div key={setting.key} className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">{getLabel(setting)}</label>
                  {setting.type === 'BOOLEAN' ? (
                    <select
                      className="form-control"
                      value={form[setting.key] || 'false'}
                      onChange={(e) => setForm(f => ({ ...f, [setting.key]: e.target.value }))}
                    >
                      <option value="true">{language === 'ar' ? 'مفعّل' : 'Enabled'}</option>
                      <option value="false">{language === 'ar' ? 'معطّل' : 'Disabled'}</option>
                    </select>
                  ) : (
                    <input
                      className="form-control"
                      value={form[setting.key] || ''}
                      onChange={(e) => setForm(f => ({ ...f, [setting.key]: e.target.value }))}
                      dir={setting.type === 'NUMBER' ? 'ltr' : undefined}
                    />
                  )}
                  <div style={{ fontSize: 11, color: 'var(--gray-400)', marginTop: 4, direction: 'ltr', textAlign: 'start' }}>{setting.key}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
