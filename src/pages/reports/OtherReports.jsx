import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { reportService } from '../../services/phase3.service';
import Loader from '../../components/ui/Loader';

function SimpleReportPage({ titleKey, fetchFn, columns }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFn().then((res) => setData(res.data.data || [])).finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">{t(titleKey)}</h1>
        <button className="btn btn-outline" onClick={() => navigate('/reports')}>{t('common.back')}</button>
      </div>
      <div className="card">
        {loading ? <Loader /> : (
          <div className="table-container">
            <table className="table">
              <thead><tr>{columns.map((c) => <th key={c.key}>{t(c.label)}</th>)}</tr></thead>
              <tbody>
                {data.map((row, i) => (
                  <tr key={row.id || i}>
                    {columns.map((c) => <td key={c.key}>{c.render ? c.render(row) : row[c.key] ?? '—'}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export function BranchesReport() {
  return (
    <SimpleReportPage
      titleKey="reports.branches.title"
      fetchFn={() => reportService.getBranches()}
      columns={[
        { key: 'name', label: 'reports.columns.branch', render: (r) => r.nameAr },
        { key: 'records', label: 'reports.columns.records' },
        { key: 'scans', label: 'reports.columns.scans' },
        { key: 'views', label: 'reports.columns.views' },
      ]}
    />
  );
}

export function EmployeesReport() {
  return (
    <SimpleReportPage
      titleKey="reports.employees.title"
      fetchFn={() => reportService.getEmployees()}
      columns={[
        { key: 'name', label: 'reports.columns.employee' },
        { key: 'recordsCreated', label: 'reports.columns.records' },
        { key: 'views', label: 'reports.columns.views' },
        { key: 'qrScans', label: 'reports.columns.scans' },
      ]}
    />
  );
}

export function QrActivityReport() {
  return (
    <SimpleReportPage
      titleKey="reports.qrActivity.title"
      fetchFn={() => reportService.getQrActivity({})}
      columns={[
        { key: 'recordCode', label: 'citizenRecords.recordCode' },
        { key: 'citizenName', label: 'citizenRecords.citizenName' },
        { key: 'totalScans', label: 'reports.columns.scans' },
        { key: 'invalidAttempts', label: 'reports.columns.invalidQr' },
      ]}
    />
  );
}

export function StorageReport() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    reportService.getStorage().then((res) => setData(res.data.data)).finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">{t('reports.storage.title')}</h1>
        <button className="btn btn-outline" onClick={() => navigate('/reports')}>{t('common.back')}</button>
      </div>
      <div className="card">
        {loading ? <Loader /> : data && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '16px' }}>
            {Object.entries(data.formatted || {}).map(([k, v]) => (
              <div key={k} style={{ padding: '16px', background: '#f0f4f8', borderRadius: '8px' }}>
                <div style={{ fontSize: '12px', color: '#666' }}>{t(`storage.${k}`)}</div>
                <div style={{ fontSize: '18px', fontWeight: 700 }}>{v}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function SecurityReport() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    reportService.getSecurity().then((res) => setData(res.data.data)).finally(() => setLoading(false));
  }, []);

  const metrics = data ? [
    { key: 'invalidQr', label: 'reports.columns.invalidQr' },
    { key: 'forbidden', label: 'reports.columns.forbidden' },
    { key: 'archivedAttempts', label: 'reports.columns.archivedAttempts' },
    { key: 'deletedAttempts', label: 'reports.columns.deletedAttempts' },
  ] : [];

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">{t('reports.security.title')}</h1>
        <button className="btn btn-outline" onClick={() => navigate('/reports')}>{t('common.back')}</button>
      </div>
      <div className="card">
        {loading ? <Loader /> : data && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '16px' }}>
            {metrics.map(({ key, label }) => (
              <div key={key} style={{ padding: '16px', background: '#f0f4f8', borderRadius: '8px' }}>
                <div style={{ fontSize: '12px', color: '#666' }}>{t(label)}</div>
                <div style={{ fontSize: '24px', fontWeight: 700 }}>{data[key] ?? 0}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function DocumentAccessReport() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    reportService.getDocumentAccess({ page: 1, limit: 50 }).then((res) => {
      setData(res.data.data || []);
      setSummary(res.data.meta?.summary);
    }).finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">{t('reports.documentAccess.title')}</h1>
        <button className="btn btn-outline" onClick={() => navigate('/reports')}>{t('common.back')}</button>
      </div>
      <div className="card">
        {summary && <p style={{ marginBottom: '16px' }}>{t('common.total')}: <strong>{summary.total}</strong> | Invalid QR: <strong>{summary.invalidQrCount}</strong></p>}
        {loading ? <Loader /> : (
          <div className="table-container">
            <table className="table">
              <thead><tr><th>{t('accessLogs.action')}</th><th>{t('accessLogs.result')}</th><th>{t('accessLogs.user')}</th><th>{t('common.createdAt')}</th></tr></thead>
              <tbody>
                {data.map((l) => (
                  <tr key={l.id}>
                    <td>{t(`accessLogs.actions.${l.action}`, { defaultValue: l.action })}</td>
                    <td>{l.resultStatus}</td>
                    <td>{l.user?.name}</td>
                    <td>{new Date(l.createdAt).toLocaleString('ar-SA')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
