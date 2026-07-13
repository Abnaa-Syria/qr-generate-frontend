import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../contexts/LanguageContext';
import Modal from '../../components/ui/Modal';
import { scanLocationService } from '../../services/scanLocation.service';

export default function ScanLocationForm({ isOpen, onClose, onSaved, location, branches }) {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const isEdit = !!location;
  const [form, setForm] = useState({ branchId: '', nameAr: '', nameEn: '', code: '', description: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (location) setForm({ branchId: location.branch?.id || '', nameAr: location.nameAr || '', nameEn: location.nameEn || '', code: location.code || '', description: location.description || '' });
    else setForm({ branchId: '', nameAr: '', nameEn: '', code: '', description: '' });
    setError('');
  }, [location, isOpen]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const colName = (item) => language === 'ar' ? item?.nameAr : item?.nameEn;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const payload = { ...form };
      if (!payload.description) delete payload.description;
      if (isEdit) await scanLocationService.update(location.id, payload);
      else await scanLocationService.create({ ...payload, code: payload.code.toUpperCase() });
      onSaved();
    } catch (err) {
      setError(err.response?.data?.message || t('common.error'));
    } finally { setLoading(false); }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? t('scanLocations.editLocation') : t('scanLocations.addLocation')}
      footer={
        <>
          <button className="btn btn-ghost" onClick={onClose} disabled={loading}>{t('common.cancel')}</button>
          <button className="btn btn-primary" form="scan-loc-form" type="submit" disabled={loading}>
            {loading ? t('common.loading') : isEdit ? t('common.update') : t('common.create')}
          </button>
        </>
      }
    >
      {error && <div className="alert alert-error">⚠️ {error}</div>}
      <form id="scan-loc-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">{t('scanLocations.branch')} *</label>
          <select className="form-control" value={form.branchId} onChange={(e) => set('branchId', e.target.value)} required>
            <option value="">— {t('scanLocations.branch')} —</option>
            {branches.map(b => <option key={b.id} value={b.id}>{colName(b)}</option>)}
          </select>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div className="form-group">
            <label className="form-label">{t('scanLocations.nameAr')} *</label>
            <input className="form-control" value={form.nameAr} onChange={(e) => set('nameAr', e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="form-label">{t('scanLocations.nameEn')} *</label>
            <input className="form-control" value={form.nameEn} onChange={(e) => set('nameEn', e.target.value)} required dir="ltr" />
          </div>
          {!isEdit && (
            <div className="form-group">
              <label className="form-label">{t('scanLocations.code')} *</label>
              <input className="form-control" value={form.code} onChange={(e) => set('code', e.target.value.toUpperCase())} required dir="ltr" />
            </div>
          )}
          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label className="form-label">{t('scanLocations.description')}</label>
            <textarea className="form-control" value={form.description} onChange={(e) => set('description', e.target.value)} rows={2} />
          </div>
        </div>
      </form>
    </Modal>
  );
}
