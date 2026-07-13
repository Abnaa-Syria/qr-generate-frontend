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
import ScanLocationForm from './ScanLocationForm';
import { scanLocationService } from '../../services/scanLocation.service';
import { branchService } from '../../services/branch.service';

export default function ScanLocationsList() {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const [locations, setLocations] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [branches, setBranches] = useState([]);
  const [filters, setFilters] = useState({ search: '', branchId: '', status: '', page: 1, limit: 10 });
  const [showForm, setShowForm] = useState(false);
  const [editLocation, setEditLocation] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchLocations = useCallback(async () => {
    setLoading(true);
    try {
      const clean = Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== ''));
      const { data } = await scanLocationService.getAll(clean);
      setLocations(data.data || []);
      setMeta(data.meta);
    } finally { setLoading(false); }
  }, [filters]);

  useEffect(() => { fetchLocations(); }, [fetchLocations]);
  useEffect(() => { branchService.getAll({ limit: 100 }).then(({ data }) => setBranches(data.data || [])); }, []);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await scanLocationService.delete(deleteTarget.id);
      setDeleteTarget(null);
      fetchLocations();
    } catch (err) { alert(err.response?.data?.message); }
    finally { setDeleting(false); }
  };

  const handleStatusChange = async (loc, status) => {
    try { await scanLocationService.changeStatus(loc.id, status); fetchLocations(); } catch {}
  };

  const colName = (item) => language === 'ar' ? item?.nameAr : item?.nameEn;

  return (
    <>
      <Header title={t('scanLocations.title')} />
      <div className="page-content">
        <div className="toolbar">
          <div className="toolbar-search">
            <span className="toolbar-search-icon">🔍</span>
            <input placeholder={t('common.search')} value={filters.search} onChange={(e) => setFilters(f => ({ ...f, search: e.target.value, page: 1 }))} />
          </div>
          <select className="toolbar-select" value={filters.branchId} onChange={(e) => setFilters(f => ({ ...f, branchId: e.target.value, page: 1 }))}>
            <option value="">{t('branches.title')}</option>
            {branches.map(b => <option key={b.id} value={b.id}>{colName(b)}</option>)}
          </select>
          <select className="toolbar-select" value={filters.status} onChange={(e) => setFilters(f => ({ ...f, status: e.target.value, page: 1 }))}>
            <option value="">{t('common.all')}</option>
            <option value="ACTIVE">{t('common.active')}</option>
            <option value="INACTIVE">{t('common.inactive')}</option>
            <option value="ARCHIVED">{t('common.archived')}</option>
          </select>
          <PermissionGuard permission="scan_locations.create">
            <button className="btn btn-primary" onClick={() => { setEditLocation(null); setShowForm(true); }}>
              + {t('scanLocations.addLocation')}
            </button>
          </PermissionGuard>
        </div>

        <div className="card" style={{ padding: 0 }}>
          {loading ? <Loader /> : locations.length === 0 ? (
            <EmptyState icon="📍" title={t('common.noData')} />
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>{t('scanLocations.nameAr')}</th>
                    <th>{t('scanLocations.nameEn')}</th>
                    <th>{t('scanLocations.code')}</th>
                    <th>{t('scanLocations.branch')}</th>
                    <th>{t('scanLocations.devices')}</th>
                    <th>{t('common.status')}</th>
                    <th>{t('common.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {locations.map((loc) => (
                    <tr key={loc.id}>
                      <td style={{ fontWeight: 700 }}>{loc.nameAr}</td>
                      <td>{loc.nameEn}</td>
                      <td><code style={{ fontSize: 12, background: 'var(--gray-100)', padding: '2px 8px', borderRadius: 4 }}>{loc.code}</code></td>
                      <td>{colName(loc.branch) || '—'}</td>
                      <td>{loc._count?.devices ?? 0}</td>
                      <td>
                        <PermissionGuard permission="scan_locations.change_status" fallback={<Badge status={loc.status} />}>
                          <select className="toolbar-select" style={{ padding: '5px 10px', fontSize: 12, minWidth: 'auto' }} value={loc.status} onChange={(e) => handleStatusChange(loc, e.target.value)}>
                            <option value="ACTIVE">{t('common.active')}</option>
                            <option value="INACTIVE">{t('common.inactive')}</option>
                            <option value="ARCHIVED">{t('common.archived')}</option>
                          </select>
                        </PermissionGuard>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <PermissionGuard permission="scan_locations.update">
                            <button className="btn btn-ghost btn-sm" onClick={() => { setEditLocation(loc); setShowForm(true); }}>✏️</button>
                          </PermissionGuard>
                          <PermissionGuard permission="scan_locations.delete">
                            <button className="btn btn-danger btn-sm" onClick={() => setDeleteTarget(loc)}>🗑️</button>
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

      <ScanLocationForm isOpen={showForm} onClose={() => { setShowForm(false); setEditLocation(null); }} onSaved={() => { setShowForm(false); setEditLocation(null); fetchLocations(); }} location={editLocation} branches={branches} />
      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} loading={deleting} message={t('scanLocations.confirmDelete')} />
    </>
  );
}
