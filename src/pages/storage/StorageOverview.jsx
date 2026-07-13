import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { storageService } from '../../services/phase3.service';
import { usePermissions } from '../../hooks/usePermissions';
import Loader from '../../components/ui/Loader';

export default function StorageOverview() {
  const { t } = useTranslation();
  const { can } = usePermissions();
  const [overview, setOverview] = useState(null);
  const [orphans, setOrphans] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cleaning, setCleaning] = useState(false);

  useEffect(() => {
    Promise.all([storageService.getOverview(), storageService.getOrphanFiles()])
      .then(([ov, orph]) => { setOverview(ov.data.data); setOrphans(orph.data.data); })
      .finally(() => setLoading(false));
  }, []);

  const handleCleanup = async () => {
    setCleaning(true);
    try {
      await storageService.cleanupTemp();
      const ov = await storageService.getOverview();
      setOverview(ov.data.data);
    } finally {
      setCleaning(false);
    }
  };

  if (loading) return <div style={{ padding: '60px' }}><Loader /></div>;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">{t('storage.title')}</h1>
        {can('storage.cleanup') && (
          <button className="btn btn-outline" onClick={handleCleanup} disabled={cleaning}>
            {cleaning ? '...' : t('storage.cleanupTemp')}
          </button>
        )}
      </div>
      <div className="card" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '16px' }}>
          {overview?.formatted && Object.entries(overview.formatted).map(([k, v]) => (
            <div key={k} style={{ padding: '16px', background: '#f0f4f8', borderRadius: '8px' }}>
              <div style={{ fontSize: '12px', color: '#666' }}>{t(`storage.${k}`)}</div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: '#1e3a5f' }}>{v}</div>
            </div>
          ))}
        </div>
      </div>
      {overview?.largestRecords?.length > 0 && (
        <div className="card" style={{ marginBottom: '20px' }}>
          <h3 style={{ margin: '0 0 16px' }}>{t('storage.largestRecords')}</h3>
          <div className="table-container">
            <table className="table">
              <thead><tr><th>{t('citizenRecords.recordCode')}</th><th>{t('citizenRecords.citizenName')}</th><th>PDF</th></tr></thead>
              <tbody>
                {overview.largestRecords.map((r) => (
                  <tr key={r.id}><td>{r.recordCode}</td><td>{r.citizenName}</td><td>{r.pdfSize ? `${(r.pdfSize / 1024).toFixed(1)} KB` : '—'}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {orphans && (
        <div className="card">
          <h3 style={{ margin: '0 0 8px' }}>{t('storage.orphanFiles')}</h3>
          <p style={{ color: '#666', fontSize: '13px' }}>{t('storage.orphanSummary', { orphan: orphans.orphanCount, missing: orphans.missingCount })}</p>
        </div>
      )}
    </div>
  );
}
