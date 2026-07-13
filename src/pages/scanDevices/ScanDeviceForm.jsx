import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../contexts/LanguageContext';
import Modal from '../../components/ui/Modal';
import { scanDeviceService } from '../../services/scanDevice.service';

export default function ScanDeviceForm({ isOpen, onClose, onSaved, device, branches, allLocations }) {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const isEdit = !!device;
  const [form, setForm] = useState({ branchId: '', scanLocationId: '', nameAr: '', nameEn: '', code: '', deviceType: 'SCANNER', description: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (device) setForm({ branchId: device.branch?.id || '', scanLocationId: device.scanLocation?.id || '', nameAr: device.nameAr || '', nameEn: device.nameEn || '', code: device.code || '', deviceType: device.deviceType || 'SCANNER', description: device.description || '' });
    else setForm({ branchId: '', scanLocationId: '', nameAr: '', nameEn: '', code: '', deviceType: 'SCANNER', description: '' });
    setError('');
  }, [device, isOpen]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const colName = (item) => language === 'ar' ? item?.nameAr : item?.nameEn;
  const filteredLocations = form.branchId ? allLocations.filter(l => l.branch?.id === form.branchId) : allLocations;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const payload = { ...form };
      if (!payload.scanLocationId) delete payload.scanLocationId;
      if (!payload.description) delete payload.description;
      if (isEdit) await scanDeviceService.update(device.id, payload);
      else await scanDeviceService.create({ ...payload, code: payload.code.toUpperCase() });
      onSaved();
    } catch (err) {
      setError(err.response?.data?.message || t('common.error'));
    } finally { setLoading(false); }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? t('scanDevices.editDevice') : t('scanDevices.addDevice')}
      footer={
        <>
          <button className="btn btn-ghost" onClick={onClose} disabled={loading}>{t('common.cancel')}</button>
          <button className="btn btn-primary" form="scan-dev-form" type="submit" disabled={loading}>
            {loading ? t('common.loading') : isEdit ? t('common.update') : t('common.create')}
          </button>
        </>
      }
    >
      {error && <div className="alert alert-error">⚠️ {error}</div>}
      <form id="scan-dev-form" onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div className="form-group">
            <label className="form-label">{t('scanDevices.branch')} *</label>
            <select className="form-control" value={form.branchId} onChange={(e) => set('branchId', e.target.value)} required>
              <option value="">— {t('scanDevices.branch')} —</option>
              {branches.map(b => <option key={b.id} value={b.id}>{colName(b)}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">{t('scanDevices.location')}</label>
            <select className="form-control" value={form.scanLocationId} onChange={(e) => set('scanLocationId', e.target.value)}>
              <option value="">— {t('scanDevices.location')} —</option>
              {filteredLocations.map(l => <option key={l.id} value={l.id}>{colName(l)}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">{t('scanDevices.nameAr')} *</label>
            <input className="form-control" value={form.nameAr} onChange={(e) => set('nameAr', e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="form-label">{t('scanDevices.nameEn')} *</label>
            <input className="form-control" value={form.nameEn} onChange={(e) => set('nameEn', e.target.value)} required dir="ltr" />
          </div>
          {!isEdit && (
            <div className="form-group">
              <label className="form-label">{t('scanDevices.code')} *</label>
              <input className="form-control" value={form.code} onChange={(e) => set('code', e.target.value.toUpperCase())} required dir="ltr" />
            </div>
          )}
          <div className="form-group">
            <label className="form-label">{t('scanDevices.deviceType')}</label>
            <select className="form-control" value={form.deviceType} onChange={(e) => set('deviceType', e.target.value)}>
              <option value="SCANNER">{t('scanDevices.types.SCANNER')}</option>
              <option value="QR_READER">{t('scanDevices.types.QR_READER')}</option>
              <option value="WORKSTATION">{t('scanDevices.types.WORKSTATION')}</option>
            </select>
          </div>
          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label className="form-label">{t('scanDevices.description')}</label>
            <textarea className="form-control" value={form.description} onChange={(e) => set('description', e.target.value)} rows={2} />
          </div>
        </div>
      </form>
    </Modal>
  );
}
