import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../contexts/LanguageContext';
import Modal from '../../components/ui/Modal';
import { userService } from '../../services/user.service';

export default function UserForm({ isOpen, onClose, onSaved, user, roles, branches }) {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const isEdit = !!user;

  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', roleId: '', branchId: '', status: 'ACTIVE' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({ name: user.name || '', email: user.email || '', password: '', phone: user.phone || '', roleId: user.role?.id || '', branchId: user.branch?.id || '', status: user.status || 'ACTIVE' });
    } else {
      setForm({ name: '', email: '', password: '', phone: '', roleId: '', branchId: '', status: 'ACTIVE' });
    }
    setError('');
  }, [user, isOpen]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const payload = { ...form };
      if (isEdit && !payload.password) delete payload.password;
      if (!payload.branchId) delete payload.branchId;
      if (!payload.phone) delete payload.phone;

      if (isEdit) await userService.update(user.id, payload);
      else await userService.create(payload);
      onSaved();
    } catch (err) {
      setError(err.response?.data?.message || t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const colName = (item) => language === 'ar' ? item?.nameAr : item?.nameEn;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? t('users.editUser') : t('users.createUser')}
      footer={
        <>
          <button className="btn btn-ghost" onClick={onClose} disabled={loading}>{t('common.cancel')}</button>
          <button className="btn btn-primary" form="user-form" type="submit" disabled={loading}>
            {loading ? t('common.loading') : isEdit ? t('common.update') : t('common.create')}
          </button>
        </>
      }
    >
      {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>⚠️ {error}</div>}
      <form id="user-form" onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label className="form-label">{t('users.name')} *</label>
            <input className="form-control" value={form.name} onChange={(e) => set('name', e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="form-label">{t('users.email')} *</label>
            <input className="form-control" type="email" value={form.email} onChange={(e) => set('email', e.target.value)} required dir="ltr" />
          </div>
          <div className="form-group">
            <label className="form-label">{t('users.phone')}</label>
            <input className="form-control" value={form.phone} onChange={(e) => set('phone', e.target.value)} dir="ltr" />
          </div>
          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label className="form-label">{t('users.password')}{!isEdit && ' *'}</label>
            <input className="form-control" type="password" value={form.password} onChange={(e) => set('password', e.target.value)} required={!isEdit} placeholder={isEdit ? t('common.loading') + '...' : ''} />
          </div>
          <div className="form-group">
            <label className="form-label">{t('users.role')} *</label>
            <select className="form-control" value={form.roleId} onChange={(e) => set('roleId', e.target.value)} required>
              <option value="">{t('users.filterRole')}</option>
              {roles.map(r => <option key={r.id} value={r.id}>{colName(r)}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">{t('users.branch')}</label>
            <select className="form-control" value={form.branchId} onChange={(e) => set('branchId', e.target.value)}>
              <option value="">{t('users.filterBranch')}</option>
              {branches.map(b => <option key={b.id} value={b.id}>{colName(b)}</option>)}
            </select>
          </div>
          {isEdit && (
            <div className="form-group">
              <label className="form-label">{t('common.status')}</label>
              <select className="form-control" value={form.status} onChange={(e) => set('status', e.target.value)}>
                <option value="ACTIVE">{t('common.active')}</option>
                <option value="INACTIVE">{t('common.inactive')}</option>
                <option value="SUSPENDED">{t('common.suspended')}</option>
              </select>
            </div>
          )}
        </div>
      </form>
    </Modal>
  );
}
