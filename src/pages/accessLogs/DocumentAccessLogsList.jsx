import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { documentAccessLogService } from '../../services/documentAccessLog.service';
import { branchService } from '../../services/branch.service';
import Badge from '../../components/ui/Badge';
import Pagination from '../../components/ui/Pagination';
import Loader from '../../components/ui/Loader';
import Modal from '../../components/ui/Modal';

const ACTION_COLORS = {
  SEARCH_RECORD: 'info', VIEW_RECORD: 'info', VIEW_DOCUMENT: 'primary',
  QR_SCAN: 'success', INVALID_QR_SCAN: 'danger', DOWNLOAD_PDF: 'warning',
  PRINT_PDF: 'warning', UPLOAD_IMAGE: 'info', DELETE_IMAGE: 'danger',
  CREATE_PDF: 'primary', GENERATE_QR: 'primary', REGENERATE_QR: 'warning',
};

const RESULT_COLORS = {
  SUCCESS: 'success', FAILED: 'danger', FORBIDDEN: 'danger',
  INVALID_QR: 'danger', NOT_FOUND: 'secondary', ARCHIVED_RECORD: 'secondary', DELETED_RECORD: 'danger',
};

export default function DocumentAccessLogsList() {
  const { t } = useTranslation();

  const [logs, setLogs] = useState([]);
  const [meta, setMeta] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ action: '', resultStatus: '', branchId: '', fromDate: '', toDate: '', search: '' });
  const [branches, setBranches] = useState([]);
  const [selectedLog, setSelectedLog] = useState(null);

  const fetchLogs = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const res = await documentAccessLogService.getAll({ ...filters, page, limit: meta.limit });
      setLogs(res.data.data || []);
      setMeta(res.data.meta);
    } catch {
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, [filters, meta.limit]);

  useEffect(() => { fetchLogs(1); }, [filters]);
  useEffect(() => {
    branchService.getAll({ limit: 100 }).then(r => setBranches(r.data.data || []));
  }, []);

  const ACTIONS = ['SEARCH_RECORD', 'VIEW_RECORD', 'VIEW_DOCUMENT', 'QR_SCAN', 'INVALID_QR_SCAN', 'DOWNLOAD_PDF', 'PRINT_PDF', 'UPLOAD_IMAGE', 'DELETE_IMAGE', 'CREATE_PDF', 'GENERATE_QR', 'REGENERATE_QR'];
  const STATUSES = ['SUCCESS', 'FAILED', 'FORBIDDEN', 'INVALID_QR', 'NOT_FOUND', 'ARCHIVED_RECORD', 'DELETED_RECORD'];

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">{t('accessLogs.title')}</h1>
      </div>

      <div className="card">
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '16px' }}>
          <input type="text" className="form-control" placeholder={t('common.search')} style={{ flex: 1, minWidth: '200px' }}
            value={filters.search} onChange={e => setFilters(f => ({ ...f, search: e.target.value }))} />
          <select className="form-control" style={{ minWidth: '160px' }} value={filters.action} onChange={e => setFilters(f => ({ ...f, action: e.target.value }))}>
            <option value="">{t('accessLogs.allActions')}</option>
            {ACTIONS.map(a => <option key={a} value={a}>{t(`accessLogs.actions.${a}`, { defaultValue: a })}</option>)}
          </select>
          <select className="form-control" style={{ minWidth: '160px' }} value={filters.resultStatus} onChange={e => setFilters(f => ({ ...f, resultStatus: e.target.value }))}>
            <option value="">{t('accessLogs.allResults')}</option>
            {STATUSES.map(s => <option key={s} value={s}>{t(`accessLogs.results.${s}`, { defaultValue: s })}</option>)}
          </select>
          {branches.length > 0 && (
            <select className="form-control" style={{ minWidth: '160px' }} value={filters.branchId} onChange={e => setFilters(f => ({ ...f, branchId: e.target.value }))}>
              <option value="">{t('common.allBranches')}</option>
              {branches.map(b => <option key={b.id} value={b.id}>{b.nameAr}</option>)}
            </select>
          )}
          <input type="date" className="form-control" style={{ minWidth: '140px' }} value={filters.fromDate} onChange={e => setFilters(f => ({ ...f, fromDate: e.target.value }))} />
          <input type="date" className="form-control" style={{ minWidth: '140px' }} value={filters.toDate} onChange={e => setFilters(f => ({ ...f, toDate: e.target.value }))} />
        </div>

        {loading ? <Loader /> : logs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
            <p>{t('accessLogs.empty')}</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="table" style={{ fontSize: '13px' }}>
              <thead>
                <tr>
                  <th>{t('accessLogs.action')}</th>
                  <th>{t('accessLogs.result')}</th>
                  <th>{t('accessLogs.record')}</th>
                  <th>{t('accessLogs.user')}</th>
                  <th>{t('accessLogs.branch')}</th>
                  <th>{t('accessLogs.scanDevice')}</th>
                  <th>{t('accessLogs.ip')}</th>
                  <th>{t('common.createdAt')}</th>
                  <th>{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {logs.map(log => (
                  <tr key={log.id}>
                    <td><Badge variant={ACTION_COLORS[log.action] || 'secondary'}>{t(`accessLogs.actions.${log.action}`, { defaultValue: log.action })}</Badge></td>
                    <td><Badge variant={RESULT_COLORS[log.resultStatus] || 'secondary'}>{t(`accessLogs.results.${log.resultStatus}`, { defaultValue: log.resultStatus })}</Badge></td>
                    <td>{log.record ? <><code style={{ fontSize: '11px' }}>{log.record.recordCode}</code><br/><span style={{ color: '#555' }}>{log.record.citizenName}</span></> : '—'}</td>
                    <td>{log.user?.name || '—'}</td>
                    <td>{log.branch?.nameAr || '—'}</td>
                    <td>{log.scanDevice?.nameAr || '—'}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: '11px' }}>{log.ipAddress || '—'}</td>
                    <td>{new Date(log.createdAt).toLocaleString('ar-SA')}</td>
                    <td>
                      <button className="btn btn-sm btn-outline" onClick={() => setSelectedLog(log)}>{t('common.view')}</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {meta.totalPages > 1 && (
          <Pagination currentPage={meta.page} totalPages={meta.totalPages} onPageChange={fetchLogs} />
        )}
      </div>

      <Modal isOpen={!!selectedLog} onClose={() => setSelectedLog(null)} title={t('accessLogs.details.title')}>
        {selectedLog && (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
            <tbody>
              {[
                [t('accessLogs.action'), <Badge variant={ACTION_COLORS[selectedLog.action] || 'secondary'}>{selectedLog.action}</Badge>],
                [t('accessLogs.result'), <Badge variant={RESULT_COLORS[selectedLog.resultStatus] || 'secondary'}>{selectedLog.resultStatus}</Badge>],
                [t('accessLogs.record'), selectedLog.record ? `${selectedLog.record.recordCode} — ${selectedLog.record.citizenName}` : '—'],
                [t('accessLogs.user'), selectedLog.user?.name || '—'],
                [t('accessLogs.branch'), selectedLog.branch?.nameAr || '—'],
                [t('accessLogs.scanLocation'), selectedLog.scanLocation?.nameAr || '—'],
                [t('accessLogs.scanDevice'), selectedLog.scanDevice?.nameAr || '—'],
                [t('accessLogs.ip'), selectedLog.ipAddress || '—'],
                [t('accessLogs.userAgent'), selectedLog.userAgent || '—'],
                [t('common.createdAt'), new Date(selectedLog.createdAt).toLocaleString('ar-SA')],
                [t('accessLogs.message'), selectedLog.message || '—'],
              ].map(([label, value]) => (
                <tr key={label} style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <td style={{ padding: '10px 8px', color: '#666', width: '40%', fontWeight: 500 }}>{label}</td>
                  <td style={{ padding: '10px 8px' }}>{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Modal>
    </div>
  );
}
