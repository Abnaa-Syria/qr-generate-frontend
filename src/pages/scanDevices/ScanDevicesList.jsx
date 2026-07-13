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
import ScanDeviceForm from './ScanDeviceForm';
import { scanDeviceService } from '../../services/scanDevice.service';
import { branchService } from '../../services/branch.service';
import { scanLocationService } from '../../services/scanLocation.service';

export default function ScanDevicesList() {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const [devices, setDevices] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [branches, setBranches] = useState([]);
  const [allLocations, setAllLocations] = useState([]);
  const [filters, setFilters] = useState({ search: '', branchId: '', scanLocationId: '', status: '', page: 1, limit: 10 });
  const [showForm, setShowForm] = useState(false);
  const [editDevice, setEditDevice] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchDevices = useCallback(async () => {
    setLoading(true);
    try {
      const clean = Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== ''));
      const { data } = await scanDeviceService.getAll(clean);
      setDevices(data.data || []);
      setMeta(data.meta);
    } finally { setLoading(false); }
  }, [filters]);

  useEffect(() => { fetchDevices(); }, [fetchDevices]);
  useEffect(() => {
    branchService.getAll({ limit: 100 }).then(({ data }) => setBranches(data.data || []));
    scanLocationService.getAll({ limit: 100 }).then(({ data }) => setAllLocations(data.data || []));
  }, []);

  const handleDelete = async () => {
    setDeleting(true);
    try { await scanDeviceService.delete(deleteTarget.id); setDeleteTarget(null); fetchDevices(); }
    catch (err) { alert(err.response?.data?.message); }
    finally { setDeleting(false); }
  };

  const handleStatusChange = async (dev, status) => {
    try { await scanDeviceService.changeStatus(dev.id, status); fetchDevices(); } catch {}
  };

  const colName = (item) => language === 'ar' ? item?.nameAr : item?.nameEn;

  const filteredLocations = filters.branchId
    ? allLocations.filter(l => l.branch?.id === filters.branchId)
    : allLocations;

  return (
    <>
      <Header title={t('scanDevices.title')} />
      <div className="page-content">
        <div className="toolbar">
          <div className="toolbar-search">
            <span className="toolbar-search-icon">🔍</span>
            <input placeholder={t('common.search')} value={filters.search} onChange={(e) => setFilters(f => ({ ...f, search: e.target.value, page: 1 }))} />
          </div>
          <select className="toolbar-select" value={filters.branchId} onChange={(e) => setFilters(f => ({ ...f, branchId: e.target.value, scanLocationId: '', page: 1 }))}>
            <option value="">{t('branches.title')}</option>
            {branches.map(b => <option key={b.id} value={b.id}>{colName(b)}</option>)}
          </select>
          <select className="toolbar-select" value={filters.scanLocationId} onChange={(e) => setFilters(f => ({ ...f, scanLocationId: e.target.value, page: 1 }))}>
            <option value="">{t('scanLocations.title')}</option>
            {filteredLocations.map(l => <option key={l.id} value={l.id}>{colName(l)}</option>)}
          </select>
          <select className="toolbar-select" value={filters.status} onChange={(e) => setFilters(f => ({ ...f, status: e.target.value, page: 1 }))}>
            <option value="">{t('common.all')}</option>
            <option value="ACTIVE">{t('common.active')}</option>
            <option value="INACTIVE">{t('common.inactive')}</option>
            <option value="ARCHIVED">{t('common.archived')}</option>
          </select>
          <PermissionGuard permission="scan_devices.create">
            <button className="btn btn-primary" onClick={() => { setEditDevice(null); setShowForm(true); }}>
              + {t('scanDevices.addDevice')}
            </button>
          </PermissionGuard>
        </div>

        <div className="card" style={{ padding: 0 }}>
          {loading ? <Loader /> : devices.length === 0 ? (
            <EmptyState icon="🖨️" title={t('common.noData')} />
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>{t('scanDevices.nameAr')}</th>
                    <th>{t('scanDevices.code')}</th>
                    <th>{t('scanDevices.deviceType')}</th>
                    <th>{t('scanDevices.branch')}</th>
                    <th>{t('scanDevices.location')}</th>
                    <th>{t('common.status')}</th>
                    <th>{t('common.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {devices.map((dev) => (
                    <tr key={dev.id}>
                      <td style={{ fontWeight: 700 }}>{language === 'ar' ? dev.nameAr : dev.nameEn}</td>
                      <td><code style={{ fontSize: 12, background: 'var(--gray-100)', padding: '2px 8px', borderRadius: 4 }}>{dev.code}</code></td>
                      <td><span className="badge badge-primary">{t(`scanDevices.types.${dev.deviceType}`)}</span></td>
                      <td>{colName(dev.branch) || '—'}</td>
                      <td>{colName(dev.scanLocation) || '—'}</td>
                      <td>
                        <PermissionGuard permission="scan_devices.change_status" fallback={<Badge status={dev.status} />}>
                          <select className="toolbar-select" style={{ padding: '5px 10px', fontSize: 12, minWidth: 'auto' }} value={dev.status} onChange={(e) => handleStatusChange(dev, e.target.value)}>
                            <option value="ACTIVE">{t('common.active')}</option>
                            <option value="INACTIVE">{t('common.inactive')}</option>
                            <option value="ARCHIVED">{t('common.archived')}</option>
                          </select>
                        </PermissionGuard>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <PermissionGuard permission="scan_devices.update">
                            <button className="btn btn-ghost btn-sm" onClick={() => { setEditDevice(dev); setShowForm(true); }}>✏️</button>
                          </PermissionGuard>
                          <PermissionGuard permission="scan_devices.delete">
                            <button className="btn btn-danger btn-sm" onClick={() => setDeleteTarget(dev)}>🗑️</button>
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

      <ScanDeviceForm isOpen={showForm} onClose={() => { setShowForm(false); setEditDevice(null); }} onSaved={() => { setShowForm(false); setEditDevice(null); fetchDevices(); }} device={editDevice} branches={branches} allLocations={allLocations} />
      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} loading={deleting} message={t('scanDevices.confirmDelete')} />
    </>
  );
}
