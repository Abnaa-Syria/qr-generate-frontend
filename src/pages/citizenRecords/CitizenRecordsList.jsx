import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { citizenRecordService } from '../../services/citizenRecord.service';
import { branchService } from '../../services/branch.service';
import { useAuth } from '../../hooks/useAuth';
import { usePermissions } from '../../hooks/usePermissions';
import Pagination from '../../components/ui/Pagination';
import Badge from '../../components/ui/Badge';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import Loader from '../../components/ui/Loader';
import EmptyState from '../../components/ui/EmptyState';

const STATUS_COLORS = {
  DRAFT: 'secondary',
  IMAGES_UPLOADED: 'info',
  PDF_CREATED: 'warning',
  QR_GENERATED: 'primary',
  ACTIVE: 'success',
  ARCHIVED: 'secondary',
  DELETED: 'danger',
};

export default function CitizenRecordsList() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { can, isSuperAdmin } = usePermissions();

  const [records, setRecords] = useState([]);
  const [meta, setMeta] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [branches, setBranches] = useState([]);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchRecords = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const res = await citizenRecordService.getAll({
        page, limit: meta.limit, search, branchId: selectedBranch, status: selectedStatus,
      });
      setRecords(res.data.data);
      setMeta(res.data.meta);
    } catch {
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }, [search, selectedBranch, selectedStatus, meta.limit]);

  useEffect(() => {
    fetchRecords(1);
  }, [search, selectedBranch, selectedStatus]);

  useEffect(() => {
    if (isSuperAdmin() || can('branches.view')) {
      branchService.getAll({ limit: 100 }).then(r => setBranches(r.data.data || []));
    }
  }, []);

  const handleDelete = async () => {
    if (!confirmDelete) return;
    setDeleteLoading(true);
    try {
      await citizenRecordService.delete(confirmDelete.id);
      setConfirmDelete(null);
      fetchRecords(meta.page);
    } finally {
      setDeleteLoading(false);
    }
  };

  const statuses = ['DRAFT', 'IMAGES_UPLOADED', 'PDF_CREATED', 'QR_GENERATED', 'ACTIVE', 'ARCHIVED'];

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">{t('citizenRecords.title')}</h1>
        {can('documents.create') && (
          <button className="btn btn-primary" onClick={() => navigate('/citizen-records/create')}>
            + {t('citizenRecords.create')}
          </button>
        )}
      </div>

      <div className="card">
        <div className="filters-row" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '20px' }}>
          <input
            type="text"
            className="form-control"
            placeholder={t('citizenRecords.searchPlaceholder')}
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ flex: '1', minWidth: '200px' }}
          />
          {(isSuperAdmin() || can('branches.view')) && branches.length > 0 && (
            <select className="form-control" style={{ minWidth: '160px' }} value={selectedBranch} onChange={e => setSelectedBranch(e.target.value)}>
              <option value="">{t('common.allBranches')}</option>
              {branches.map(b => <option key={b.id} value={b.id}>{b.nameAr}</option>)}
            </select>
          )}
          <select className="form-control" style={{ minWidth: '160px' }} value={selectedStatus} onChange={e => setSelectedStatus(e.target.value)}>
            <option value="">{t('common.allStatuses')}</option>
            {statuses.map(s => <option key={s} value={s}>{t(`citizenRecords.statuses.${s}`)}</option>)}
          </select>
        </div>

        {loading ? (
          <Loader />
        ) : records.length === 0 ? (
          <EmptyState
            title={t('citizenRecords.empty.title')}
            description={t('citizenRecords.empty.description')}
            action={can('documents.create') ? { label: t('citizenRecords.create'), onClick: () => navigate('/citizen-records/create') } : null}
          />
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>{t('citizenRecords.recordCode')}</th>
                  <th>{t('citizenRecords.citizenName')}</th>
                  <th>{t('citizenRecords.branch')}</th>
                  <th>{t('citizenRecords.status')}</th>
                  <th style={{ textAlign: 'center' }}>{t('citizenRecords.hasImages')}</th>
                  <th style={{ textAlign: 'center' }}>{t('citizenRecords.hasPdf')}</th>
                  <th style={{ textAlign: 'center' }}>{t('citizenRecords.hasQr')}</th>
                  <th>{t('citizenRecords.createdBy')}</th>
                  <th>{t('common.createdAt')}</th>
                  <th>{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {records.map(record => (
                  <tr key={record.id}>
                    <td><code style={{ fontFamily: 'monospace', fontWeight: 600 }}>{record.recordCode}</code></td>
                    <td style={{ fontWeight: 500 }}>{record.citizenName}</td>
                    <td>{record.branch?.nameAr || '—'}</td>
                    <td><Badge variant={STATUS_COLORS[record.status] || 'secondary'}>{t(`citizenRecords.statuses.${record.status}`)}</Badge></td>
                    <td style={{ textAlign: 'center' }}>{record.imagesCount > 0 ? <span style={{ color: '#27ae60' }}>✓ {record.imagesCount}</span> : '—'}</td>
                    <td style={{ textAlign: 'center' }}>{record.hasPdf ? <span style={{ color: '#27ae60' }}>✓</span> : '—'}</td>
                    <td style={{ textAlign: 'center' }}>{record.hasQr ? <span style={{ color: '#27ae60' }}>✓</span> : '—'}</td>
                    <td>{record.createdBy?.name}</td>
                    <td>{new Date(record.createdAt).toLocaleDateString('ar-SA')}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        <button className="btn btn-sm btn-outline" onClick={() => navigate(`/citizen-records/${record.id}`)}>
                          {t('common.view')}
                        </button>
                        {can('documents.edit') && (
                          <button className="btn btn-sm btn-outline" onClick={() => navigate(`/citizen-records/${record.id}/edit`)}>
                            {t('common.edit')}
                          </button>
                        )}
                        {can('documents.upload_images') && (
                          <button className="btn btn-sm btn-outline" onClick={() => navigate(`/citizen-records/${record.id}/images`)}>
                            {t('citizenRecords.images.manage')}
                          </button>
                        )}
                        {can('documents.view_pdf') && record.hasPdf && (
                          <button className="btn btn-sm btn-primary" onClick={() => navigate(`/secure-documents/${record.id}`)}>
                            {t('citizenRecords.viewDocument')}
                          </button>
                        )}
                        {can('documents.delete') && (
                          <button className="btn btn-sm btn-danger" onClick={() => setConfirmDelete(record)}>
                            {t('common.delete')}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {meta.totalPages > 1 && (
          <Pagination
            currentPage={meta.page}
            totalPages={meta.totalPages}
            onPageChange={fetchRecords}
          />
        )}
      </div>

      <ConfirmDialog
        isOpen={!!confirmDelete}
        title={t('citizenRecords.deleteConfirm.title')}
        message={t('citizenRecords.deleteConfirm.message', { name: confirmDelete?.citizenName })}
        confirmLabel={t('common.delete')}
        variant="danger"
        loading={deleteLoading}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
}
