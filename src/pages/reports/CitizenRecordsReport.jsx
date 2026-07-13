import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { reportService } from '../../services/phase3.service';
import { usePermissions } from '../../hooks/usePermissions';
import Loader from '../../components/ui/Loader';
import Pagination from '../../components/ui/Pagination';

export default function CitizenRecordsReport() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { can } = usePermissions();
  const [data, setData] = useState([]);
  const [summary, setSummary] = useState(null);
  const [meta, setMeta] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');

  const fetchData = async (page = 1) => {
    setLoading(true);
    try {
      const res = await reportService.getCitizenRecords({ page, limit: 20, search, status });
      setData(res.data.data || []);
      setSummary(res.data.meta?.summary);
      setMeta(res.data.meta || {});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(1); }, [search, status]);

  const handleExport = () => {
    const token = localStorage.getItem('token');
    const url = reportService.exportUrl('citizen-records', { search, status, lang: i18n.language });
    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.blob())
      .then((blob) => {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `citizen-records-report-${new Date().toISOString().slice(0, 10)}.xlsx`;
        a.click();
      });
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">{t('reports.citizenRecords.title')}</h1>
        <div style={{ display: 'flex', gap: '8px' }}>
          {can('reports.export') && <button className="btn btn-primary" onClick={handleExport}>{t('reports.export')}</button>}
          <button className="btn btn-outline" onClick={() => navigate('/reports')}>{t('common.back')}</button>
        </div>
      </div>

      <div className="card">
        <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
          <input className="form-control" placeholder={t('common.search')} value={search} onChange={(e) => setSearch(e.target.value)} style={{ flex: 1, minWidth: '200px' }} />
          <select className="form-control" value={status} onChange={(e) => setStatus(e.target.value)} style={{ minWidth: '160px' }}>
            <option value="">{t('common.allStatuses')}</option>
            {['DRAFT', 'ACTIVE', 'ARCHIVED', 'QR_GENERATED', 'PDF_CREATED'].map((s) => <option key={s} value={s}>{t(`citizenRecords.statuses.${s}`)}</option>)}
          </select>
        </div>

        {summary && (
          <div style={{ display: 'flex', gap: '16px', marginBottom: '16px', flexWrap: 'wrap' }}>
            {[{ k: 'total', l: t('common.total') }, { k: 'withPdf', l: 'PDF' }, { k: 'withQr', l: 'QR' }].map(({ k, l }) => (
              <div key={k} style={{ padding: '12px 16px', background: '#f0f4f8', borderRadius: '8px' }}>
                <div style={{ fontSize: '12px', color: '#666' }}>{l}</div>
                <div style={{ fontSize: '20px', fontWeight: 700, color: '#1e3a5f' }}>{summary[k] ?? 0}</div>
              </div>
            ))}
          </div>
        )}

        {loading ? <Loader /> : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>{t('citizenRecords.recordCode')}</th>
                  <th>{t('citizenRecords.citizenName')}</th>
                  <th>{t('citizenRecords.branch')}</th>
                  <th>{t('citizenRecords.status')}</th>
                  <th>{t('common.createdAt')}</th>
                </tr>
              </thead>
              <tbody>
                {data.map((r) => (
                  <tr key={r.id}>
                    <td><code>{r.recordCode}</code></td>
                    <td>{r.citizenName}</td>
                    <td>{r.branch?.nameAr || '—'}</td>
                    <td>{t(`citizenRecords.statuses.${r.status}`)}</td>
                    <td>{new Date(r.createdAt).toLocaleDateString('ar-SA')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {meta.totalPages > 1 && <Pagination currentPage={meta.page} totalPages={meta.totalPages} onPageChange={fetchData} />}
      </div>
    </div>
  );
}
