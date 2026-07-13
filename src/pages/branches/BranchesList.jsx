import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../contexts/LanguageContext';
import Header from '../../components/layout/Header';
import Loader from '../../components/ui/Loader';
import Badge from '../../components/ui/Badge';
import Pagination from '../../components/ui/Pagination';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import EmptyState from '../../components/ui/EmptyState';
import PermissionGuard from '../../components/layout/PermissionGuard';
import BranchForm from './BranchForm';
import { branchService } from '../../services/branch.service';

export default function BranchesList() {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const [branches, setBranches] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ search: '', status: '', page: 1, limit: 10 });
  const [showForm, setShowForm] = useState(false);
  const [editBranch, setEditBranch] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchBranches = useCallback(async () => {
    setLoading(true);
    try {
      const clean = Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== ''));
      const { data } = await branchService.getAll(clean);
      setBranches(data.data || []);
      setMeta(data.meta);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchBranches(); }, [fetchBranches]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await branchService.delete(deleteTarget.id);
      setDeleteTarget(null);
      fetchBranches();
    } catch (err) {
      alert(err.response?.data?.message);
    } finally {
      setDeleting(false);
    }
  };

  const handleStatusChange = async (branch, status) => {
    try {
      await branchService.changeStatus(branch.id, status);
      fetchBranches();
    } catch {}
  };

  const colName = (item) => language === 'ar' ? item?.nameAr : item?.nameEn;

  return (
    <>
      <Header title={t('branches.title')} />
      <div className="page-content">
        <div className="toolbar">
          <div className="toolbar-search">
            <span className="toolbar-search-icon">🔍</span>
            <input placeholder={t('common.search')} value={filters.search} onChange={(e) => setFilters(f => ({ ...f, search: e.target.value, page: 1 }))} />
          </div>
          <select className="toolbar-select" value={filters.status} onChange={(e) => setFilters(f => ({ ...f, status: e.target.value, page: 1 }))}>
            <option value="">{t('common.all')}</option>
            <option value="ACTIVE">{t('common.active')}</option>
            <option value="INACTIVE">{t('common.inactive')}</option>
            <option value="ARCHIVED">{t('common.archived')}</option>
          </select>
          <PermissionGuard permission="branches.create">
            <button className="btn btn-primary" onClick={() => { setEditBranch(null); setShowForm(true); }}>
              + {t('branches.addBranch')}
            </button>
          </PermissionGuard>
        </div>

        <div className="card" style={{ padding: 0 }}>
          {loading ? <Loader /> : branches.length === 0 ? (
            <EmptyState icon="🏢" title={t('common.noData')} />
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>{t('branches.nameAr')}</th>
                    <th>{t('branches.nameEn')}</th>
                    <th>{t('branches.code')}</th>
                    <th>{t('branches.city')}</th>
                    <th>{t('branches.users')}</th>
                    <th>{t('branches.records')}</th>
                    <th>{t('common.status')}</th>
                    <th>{t('common.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {branches.map((branch) => (
                    <tr key={branch.id}>
                      <td style={{ fontWeight: 700 }}>{branch.nameAr}</td>
                      <td>{branch.nameEn}</td>
                      <td><code style={{ fontSize: 12, background: 'var(--gray-100)', padding: '2px 8px', borderRadius: 4 }}>{branch.code}</code></td>
                      <td>{branch.city || '—'}</td>
                      <td>{branch._count?.users ?? 0}</td>
                      <td>{branch._count?.records ?? 0}</td>
                      <td>
                        <PermissionGuard permission="branches.change_status" fallback={<Badge status={branch.status} />}>
                          <select
                            className="toolbar-select"
                            style={{ padding: '5px 10px', fontSize: 12, minWidth: 'auto' }}
                            value={branch.status}
                            onChange={(e) => handleStatusChange(branch, e.target.value)}
                          >
                            <option value="ACTIVE">{t('common.active')}</option>
                            <option value="INACTIVE">{t('common.inactive')}</option>
                            <option value="ARCHIVED">{t('common.archived')}</option>
                          </select>
                        </PermissionGuard>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <PermissionGuard permission="branches.update">
                            <button className="btn btn-ghost btn-sm" onClick={() => { setEditBranch(branch); setShowForm(true); }}>✏️</button>
                          </PermissionGuard>
                          <PermissionGuard permission="branches.delete">
                            <button className="btn btn-danger btn-sm" onClick={() => setDeleteTarget(branch)}>🗑️</button>
                          </PermissionGuard>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <Pagination meta={meta} onPageChange={(p) => setFilters(f => ({ ...f, page: p }))} />
            </div>
          )}
        </div>
      </div>

      <BranchForm isOpen={showForm} onClose={() => { setShowForm(false); setEditBranch(null); }} onSaved={() => { setShowForm(false); setEditBranch(null); fetchBranches(); }} branch={editBranch} />
      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} loading={deleting} message={t('branches.confirmDelete')} />
    </>
  );
}
