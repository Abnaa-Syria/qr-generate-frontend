import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { auditLogService } from '../../services/phase3.service';
import { usePermissions } from '../../hooks/usePermissions';
import Badge from '../../components/ui/Badge';
import Loader from '../../components/ui/Loader';
import Modal from '../../components/ui/Modal';
import Pagination from '../../components/ui/Pagination';

export default function AuditLogsList() {
  const { t, i18n } = useTranslation();
  const { can } = usePermissions();
  const [logs, setLogs] = useState([]);
  const [meta, setMeta] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [module, setModule] = useState('');
  const [selected, setSelected] = useState(null);

  const fetchLogs = async (page = 1) => {
    setLoading(true);
    try {
      const res = await auditLogService.getAll({ page, limit: 20, search, module });
      setLogs(res.data.data || []);
      setMeta(res.data.meta || {});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLogs(1); }, [search, module]);

  const handleExport = () => {
    const token = localStorage.getItem('token');
    fetch(auditLogService.exportUrl({ search, module, lang: i18n.language }), { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.blob())
      .then((blob) => {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `audit-logs-${new Date().toISOString().slice(0, 10)}.xlsx`;
        a.click();
      });
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">{t('auditLogs.title')}</h1>
        {can('audit_logs.export') && <button className="btn btn-primary" onClick={handleExport}>{t('reports.export')}</button>}
      </div>
      <div className="card">
        <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
          <input className="form-control" placeholder={t('common.search')} value={search} onChange={(e) => setSearch(e.target.value)} style={{ flex: 1 }} />
          <input className="form-control" placeholder={t('auditLogs.module')} value={module} onChange={(e) => setModule(e.target.value)} style={{ width: '200px' }} />
        </div>
        {loading ? <Loader /> : (
          <div className="table-container">
            <table className="table">
              <thead><tr><th>{t('auditLogs.action')}</th><th>{t('auditLogs.module')}</th><th>{t('auditLogs.user')}</th><th>{t('common.createdAt')}</th><th>{t('common.actions')}</th></tr></thead>
              <tbody>
                {logs.map((l) => (
                  <tr key={l.id}>
                    <td><Badge variant="info">{l.action}</Badge></td>
                    <td>{l.module}</td>
                    <td>{l.user?.name || '—'}</td>
                    <td>{new Date(l.createdAt).toLocaleString('ar-SA')}</td>
                    <td><button className="btn btn-sm btn-outline" onClick={() => setSelected(l)}>{t('common.view')}</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {meta.totalPages > 1 && <Pagination currentPage={meta.page} totalPages={meta.totalPages} onPageChange={fetchLogs} />}
      </div>
      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title={t('auditLogs.details')}>
        {selected && (
          <div style={{ fontSize: '14px' }}>
            <p><strong>{t('auditLogs.action')}:</strong> {selected.action}</p>
            <p><strong>{t('auditLogs.module')}:</strong> {selected.module}</p>
            <p><strong>{t('auditLogs.user')}:</strong> {selected.user?.name || '—'}</p>
            {selected.description && <p><strong>{t('accessLogs.message')}:</strong> {selected.description}</p>}
            {selected.oldValue && <pre style={{ background: '#f5f5f5', padding: '8px', borderRadius: '4px', overflow: 'auto' }}>{JSON.stringify(selected.oldValue, null, 2)}</pre>}
            {selected.newValue && <pre style={{ background: '#f5f5f5', padding: '8px', borderRadius: '4px', overflow: 'auto' }}>{JSON.stringify(selected.newValue, null, 2)}</pre>}
          </div>
        )}
      </Modal>
    </div>
  );
}
