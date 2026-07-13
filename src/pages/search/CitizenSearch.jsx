import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { searchService } from '../../services/search.service';
import { branchService } from '../../services/branch.service';
import { usePermissions } from '../../hooks/usePermissions';
import Badge from '../../components/ui/Badge';
import Pagination from '../../components/ui/Pagination';

const STATUS_COLORS = {
  DRAFT: 'secondary', IMAGES_UPLOADED: 'info', PDF_CREATED: 'warning',
  QR_GENERATED: 'primary', ACTIVE: 'success', ARCHIVED: 'secondary',
};

export default function CitizenSearch() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { can, isSuperAdmin } = usePermissions();

  const [query, setQuery] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [results, setResults] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [branches, setBranches] = useState([]);

  React.useEffect(() => {
    if (isSuperAdmin() || can('branches.view')) {
      branchService.getAll({ limit: 100 }).then(r => setBranches(r.data.data || []));
    }
  }, []);

  const handleSearch = async (page = 1) => {
    setLoading(true);
    setSearched(true);
    try {
      const res = await searchService.searchRecords({
        q: query, branchId: selectedBranch, status: selectedStatus, page, limit: 10,
      });
      setResults(res.data.data || []);
      setMeta(res.data.meta);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => { if (e.key === 'Enter') handleSearch(); };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">{t('search.title')}</h1>
      </div>

      <div className="card">
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '16px' }}>
          <input
            type="text"
            className="form-control"
            placeholder={t('search.placeholder')}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
            style={{ flex: '2', minWidth: '250px' }}
          />
          {branches.length > 0 && (
            <select className="form-control" value={selectedBranch} onChange={e => setSelectedBranch(e.target.value)} style={{ minWidth: '160px' }}>
              <option value="">{t('common.allBranches')}</option>
              {branches.map(b => <option key={b.id} value={b.id}>{b.nameAr}</option>)}
            </select>
          )}
          <select className="form-control" value={selectedStatus} onChange={e => setSelectedStatus(e.target.value)} style={{ minWidth: '140px' }}>
            <option value="">{t('common.allStatuses')}</option>
            {['ACTIVE', 'QR_GENERATED', 'PDF_CREATED', 'IMAGES_UPLOADED', 'DRAFT'].map(s => (
              <option key={s} value={s}>{t(`citizenRecords.statuses.${s}`)}</option>
            ))}
          </select>
          <button className="btn btn-primary" onClick={() => handleSearch()} disabled={loading}>
            {loading ? '...' : t('search.search')}
          </button>
        </div>

        {searched && !loading && results.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>🔍</div>
            <p>{t('search.noResults')}</p>
          </div>
        )}

        {!searched && !loading && (
          <div style={{ textAlign: 'center', padding: '40px', color: '#aaa' }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>🔍</div>
            <p>{t('search.enterQuery')}</p>
          </div>
        )}

        {results.length > 0 && (
          <>
            {results.length > 1 && (
              <div style={{ marginBottom: '12px', padding: '10px 14px', background: '#fff3cd', border: '1px solid #ffc107', borderRadius: '8px', fontSize: '13px', color: '#856404' }}>
                {t('search.multipleResults', { count: meta?.total })}
              </div>
            )}
            <div style={{ display: 'grid', gap: '12px' }}>
              {results.map(record => (
                <div key={record.id} style={{ border: '1px solid #e0e0e0', borderRadius: '10px', padding: '16px', background: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                      <code style={{ fontFamily: 'monospace', fontSize: '13px', fontWeight: 700, color: '#1e3a5f' }}>{record.recordCode}</code>
                      <Badge variant={STATUS_COLORS[record.status] || 'secondary'}>{t(`citizenRecords.statuses.${record.status}`)}</Badge>
                    </div>
                    <h3 style={{ margin: '0 0 4px', fontSize: '16px', fontWeight: 600 }}>{record.citizenName}</h3>
                    <p style={{ margin: 0, fontSize: '13px', color: '#666' }}>
                      {record.branch?.nameAr} · {t('citizenRecords.createdBy')}: {record.createdBy?.name} · {new Date(record.createdAt).toLocaleDateString('ar-SA')}
                    </p>
                    <div style={{ marginTop: '8px', display: 'flex', gap: '8px' }}>
                      {record.hasPdf && <span style={{ fontSize: '11px', background: '#e8f5e9', color: '#2e7d32', padding: '2px 8px', borderRadius: '4px' }}>PDF ✓</span>}
                      {record.hasQr && <span style={{ fontSize: '11px', background: '#e3f2fd', color: '#1565c0', padding: '2px 8px', borderRadius: '4px' }}>QR ✓</span>}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn btn-outline btn-sm" onClick={() => navigate(`/citizen-records/${record.id}`)}>
                      {t('common.view')}
                    </button>
                    {record.hasPdf && record.allowedActions?.viewPdf && (
                      <button className="btn btn-primary btn-sm" onClick={() => navigate(`/secure-documents/${record.id}`)}>
                        {t('citizenRecords.viewDocument')}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {meta?.totalPages > 1 && (
              <Pagination currentPage={meta.page} totalPages={meta.totalPages} onPageChange={handleSearch} />
            )}
          </>
        )}
      </div>
    </div>
  );
}
