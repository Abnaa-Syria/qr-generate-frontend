import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { citizenRecordService } from '../../services/citizenRecord.service';
import { branchService } from '../../services/branch.service';
import { useAuth } from '../../hooks/useAuth';
import { usePermissions } from '../../hooks/usePermissions';

export default function CitizenRecordForm() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;
  const { user } = useAuth();
  const { isSuperAdmin } = usePermissions();

  const [form, setForm] = useState({ citizenName: '', branchId: '' });
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const canSelectBranch = isSuperAdmin();

  useEffect(() => {
    if (canSelectBranch) {
      branchService.getAll({ limit: 100 }).then(r => setBranches(r.data.data || []));
    }
    if (isEdit) {
      setLoading(true);
      citizenRecordService.getById(id).then(r => {
        const record = r.data.data;
        setForm({ citizenName: record.citizenName, branchId: record.branchId || '' });
      }).finally(() => setLoading(false));
    }
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    const newErrors = {};
    if (!form.citizenName.trim()) newErrors.citizenName = t('citizenRecords.errors.nameRequired');
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }

    setSaving(true);
    try {
      const payload = { citizenName: form.citizenName.trim() };
      if (canSelectBranch && form.branchId) payload.branchId = form.branchId;

      if (isEdit) {
        await citizenRecordService.update(id, payload);
      } else {
        const res = await citizenRecordService.create(payload);
        const newId = res.data.data.id;
        navigate(`/citizen-records/${newId}`);
        return;
      }
      navigate(`/citizen-records/${id}`);
    } catch (err) {
      if (err.response?.data?.errors) {
        const errs = {};
        err.response.data.errors.forEach(e => { errs[e.field] = e.message; });
        setErrors(errs);
      } else {
        setErrors({ general: err.response?.data?.message || t('common.unexpectedError') });
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="page-loading"><div className="loader-spinner large" /></div>;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">{isEdit ? t('citizenRecords.edit') : t('citizenRecords.create')}</h1>
        <button className="btn btn-outline" onClick={() => navigate(-1)}>{t('common.back')}</button>
      </div>

      <div className="card" style={{ maxWidth: '600px' }}>
        {errors.general && (
          <div className="alert alert-danger" style={{ marginBottom: '16px', padding: '12px', background: '#fde8e8', border: '1px solid #f5c6cb', borderRadius: '8px', color: '#721c24' }}>
            {errors.general}
          </div>
        )}

        {!isEdit && (
          <div className="alert alert-info" style={{ marginBottom: '16px', padding: '12px', background: '#e8f4fd', border: '1px solid #bee5eb', borderRadius: '8px', color: '#0c5460' }}>
            {t('citizenRecords.createNote')}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label required">{t('citizenRecords.citizenName')}</label>
            <input
              type="text"
              className={`form-control ${errors.citizenName ? 'is-invalid' : ''}`}
              value={form.citizenName}
              onChange={e => setForm({ ...form, citizenName: e.target.value })}
              placeholder={t('citizenRecords.citizenNamePlaceholder')}
              autoFocus
            />
            {errors.citizenName && <span className="form-error">{errors.citizenName}</span>}
          </div>

          {canSelectBranch && (
            <div className="form-group">
              <label className="form-label">{t('citizenRecords.branch')}</label>
              <select
                className="form-control"
                value={form.branchId}
                onChange={e => setForm({ ...form, branchId: e.target.value })}
              >
                <option value="">{t('citizenRecords.selectBranch')}</option>
                {branches.map(b => <option key={b.id} value={b.id}>{b.nameAr}</option>)}
              </select>
            </div>
          )}

          {!canSelectBranch && user?.branch && (
            <div className="form-group">
              <label className="form-label">{t('citizenRecords.branch')}</label>
              <input type="text" className="form-control" value={user.branch?.nameAr || ''} disabled />
            </div>
          )}

          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? <span className="loader-spinner small" /> : (isEdit ? t('common.save') : t('citizenRecords.create'))}
            </button>
            <button type="button" className="btn btn-outline" onClick={() => navigate(-1)}>{t('common.cancel')}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
