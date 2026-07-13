import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { qrTokenService } from '../../services/phase3.service';
import { usePermissions } from '../../hooks/usePermissions';
import Badge from '../../components/ui/Badge';
import Loader from '../../components/ui/Loader';
import Pagination from '../../components/ui/Pagination';

const STATUS_VARIANT = { ACTIVE: 'success', REVOKED: 'danger', EXPIRED: 'secondary' };

export default function QrTokensList() {
  const { t } = useTranslation();
  const { can } = usePermissions();
  const [tokens, setTokens] = useState([]);
  const [meta, setMeta] = useState({});
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');

  const fetchTokens = async (page = 1) => {
    setLoading(true);
    try {
      const res = await qrTokenService.getAll({ page, limit: 20, status });
      setTokens(res.data.data || []);
      setMeta(res.data.meta || {});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTokens(1); }, [status]);

  const handleRevoke = async (id) => {
    await qrTokenService.revoke(id);
    fetchTokens(meta.page || 1);
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">{t('qrTokens.title')}</h1>
      </div>
      <div className="card">
        <div style={{ marginBottom: '16px' }}>
          <select className="form-control" style={{ width: '200px' }} value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">{t('common.allStatuses')}</option>
            {['ACTIVE', 'REVOKED', 'EXPIRED'].map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        {loading ? <Loader /> : (
          <div className="table-container">
            <table className="table">
              <thead><tr><th>{t('citizenRecords.recordCode')}</th><th>{t('qrTokens.tokenHash')}</th><th>{t('common.status')}</th><th>{t('qrTokens.createdBy')}</th><th>{t('common.createdAt')}</th><th>{t('common.actions')}</th></tr></thead>
              <tbody>
                {tokens.map((tok) => (
                  <tr key={tok.id}>
                    <td>{tok.record?.recordCode || '—'}</td>
                    <td><code>{tok.tokenHashPartial}</code></td>
                    <td><Badge variant={STATUS_VARIANT[tok.status] || 'secondary'}>{tok.status}</Badge></td>
                    <td>{tok.createdBy?.name}</td>
                    <td>{new Date(tok.createdAt).toLocaleString('ar-SA')}</td>
                    <td>
                      {can('qr_tokens.revoke') && tok.status === 'ACTIVE' && (
                        <button className="btn btn-sm btn-danger" onClick={() => handleRevoke(tok.id)}>{t('qrTokens.revoke')}</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {meta.totalPages > 1 && <Pagination currentPage={meta.page} totalPages={meta.totalPages} onPageChange={fetchTokens} />}
      </div>
    </div>
  );
}
