import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Modal from '../../components/ui/Modal';
import { branchService } from '../../services/branch.service';

export default function BranchForm({ isOpen, onClose, onSaved, branch }) {
  const { t } = useTranslation();
  const isEdit = !!branch;
  const [form, setForm] = useState({ nameAr: '', nameEn: '', code: '', address: '', city: '', phone: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (branch) setForm({ nameAr: branch.nameAr || '', nameEn: branch.nameEn || '', code: branch.code || '', address: branch.address || '', city: branch.city || '', phone: branch.phone || '' });
    else setForm({ nameAr: '', nameEn: '', code: '', address: '', city: '', phone: '' });
    setError('');
  }, [branch, isOpen]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const payload = { ...form };
      if (!payload.address) delete payload.address;
      if (!payload.city) delete payload.city;
      if (!payload.phone) delete payload.phone;

      if (isEdit) await branchService.update(branch.id, payload);
      else await branchService.create({ ...payload, code: payload.code.toUpperCase() });
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
      title={isEdit ? t('branches.editBranch') : t('branches.addBranch')}
      footer={
        <>
          <button className="btn btn-ghost" onClick={onClose} disabled={loading}>{t('common.cancel')}</button>
          <button className="btn btn-primary" form="branch-form" type="submit" disabled={loading}>
            {loading ? t('common.loading') : isEdit ? t('common.update') : t('common.create')}
          </button>
        </>
      }
    >
      {error && <div className="alert alert-error">⚠️ {error}</div>}
      <form id="branch-form" onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div className="form-group">
            <label className="form-label">{t('branches.nameAr')} *</label>
            <input className="form-control" value={form.nameAr} onChange={(e) => set('nameAr', e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="form-label">{t('branches.nameEn')} *</label>
            <input className="form-control" value={form.nameEn} onChange={(e) => set('nameEn', e.target.value)} required dir="ltr" />
          </div>
          {!isEdit && (
            <div className="form-group">
              <label className="form-label">{t('branches.code')} *</label>
              <input className="form-control" value={form.code} onChange={(e) => set('code', e.target.value.toUpperCase())} required dir="ltr" placeholder="MAIN" />
            </div>
          )}
          <div className="form-group">
            <label className="form-label">{t('branches.city')}</label>
            <input className="form-control" value={form.city} onChange={(e) => set('city', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">{t('branches.phone')}</label>
            <input className="form-control" value={form.phone} onChange={(e) => set('phone', e.target.value)} dir="ltr" />
          </div>
          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label className="form-label">{t('branches.address')}</label>
            <textarea className="form-control" value={form.address} onChange={(e) => set('address', e.target.value)} rows={2} />
          </div>
        </div>
      </form>
    </Modal>
  );
}
