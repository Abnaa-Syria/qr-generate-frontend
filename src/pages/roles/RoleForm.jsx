import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Modal from '../../components/ui/Modal';
import { roleService } from '../../services/role.service';

export default function RoleForm({ isOpen, onClose, onSaved, role }) {
  const { t } = useTranslation();
  const isEdit = !!role;
  const [form, setForm] = useState({ nameAr: '', nameEn: '', key: '', description: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (role) setForm({ nameAr: role.nameAr || '', nameEn: role.nameEn || '', key: role.key || '', description: role.description || '' });
    else setForm({ nameAr: '', nameEn: '', key: '', description: '' });
    setError('');
  }, [role, isOpen]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (isEdit) await roleService.update(role.id, { nameAr: form.nameAr, nameEn: form.nameEn, description: form.description });
      else await roleService.create({ ...form, key: form.key.toUpperCase() });
      onSaved();
    } catch (err) {
      setError(err.response?.data?.message || t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? t('roles.editRole') : t('roles.addRole')}
      footer={
        <>
          <button className="btn btn-ghost" onClick={onClose} disabled={loading}>{t('common.cancel')}</button>
          <button className="btn btn-primary" form="role-form" type="submit" disabled={loading}>
            {loading ? t('common.loading') : isEdit ? t('common.update') : t('common.create')}
          </button>
        </>
      }
    >
      {error && <div className="alert alert-error">⚠️ {error}</div>}
      <form id="role-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">{t('roles.nameAr')} *</label>
          <input className="form-control" value={form.nameAr} onChange={(e) => set('nameAr', e.target.value)} required />
        </div>
        <div className="form-group">
          <label className="form-label">{t('roles.nameEn')} *</label>
          <input className="form-control" value={form.nameEn} onChange={(e) => set('nameEn', e.target.value)} required dir="ltr" />
        </div>
        {!isEdit && (
          <div className="form-group">
            <label className="form-label">{t('roles.key')} *</label>
            <input className="form-control" value={form.key} onChange={(e) => set('key', e.target.value.toUpperCase())} required dir="ltr" placeholder="EXAMPLE_ROLE" />
          </div>
        )}
        <div className="form-group">
          <label className="form-label">{t('roles.description')}</label>
          <textarea className="form-control" value={form.description} onChange={(e) => set('description', e.target.value)} rows={3} />
        </div>
      </form>
    </Modal>
  );
}
