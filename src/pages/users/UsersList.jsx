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
import UserForm from './UserForm';
import { userService } from '../../services/user.service';
import { branchService } from '../../services/branch.service';
import { roleService } from '../../services/role.service';
import { formatDateTime } from '../../utils/formatDate';

export default function UsersList() {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const [users, setUsers] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [roles, setRoles] = useState([]);
  const [branches, setBranches] = useState([]);
  const [filters, setFilters] = useState({ search: '', roleId: '', branchId: '', status: '', page: 1, limit: 10 });
  const [showForm, setShowForm] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [statusTarget, setStatusTarget] = useState(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const clean = Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== ''));
      const { data } = await userService.getAll(clean);
      setUsers(data.data || []);
      setMeta(data.meta);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  useEffect(() => {
    roleService.getAll({ limit: 100 }).then(({ data }) => setRoles(data.data || []));
    branchService.getAll({ limit: 100 }).then(({ data }) => setBranches(data.data || []));
  }, []);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await userService.delete(deleteTarget.id);
      setDeleteTarget(null);
      fetchUsers();
    } finally {
      setDeleting(false);
    }
  };

  const handleStatusChange = async (user, status) => {
    try {
      await userService.changeStatus(user.id, status);
      fetchUsers();
    } catch {}
    setStatusTarget(null);
  };

  const colName = (item) => language === 'ar' ? item?.nameAr : item?.nameEn;

  return (
    <>
      <Header title={t('users.title')} />
      <div className="page-content">
        <div className="toolbar">
          <div className="toolbar-search">
            <span className="toolbar-search-icon">🔍</span>
            <input
              placeholder={t('users.search')}
              value={filters.search}
              onChange={(e) => setFilters(f => ({ ...f, search: e.target.value, page: 1 }))}
            />
          </div>
          <select className="toolbar-select" value={filters.roleId} onChange={(e) => setFilters(f => ({ ...f, roleId: e.target.value, page: 1 }))}>
            <option value="">{t('users.filterRole')}</option>
            {roles.map(r => <option key={r.id} value={r.id}>{colName(r)}</option>)}
          </select>
          <select className="toolbar-select" value={filters.branchId} onChange={(e) => setFilters(f => ({ ...f, branchId: e.target.value, page: 1 }))}>
            <option value="">{t('users.filterBranch')}</option>
            {branches.map(b => <option key={b.id} value={b.id}>{colName(b)}</option>)}
          </select>
          <select className="toolbar-select" value={filters.status} onChange={(e) => setFilters(f => ({ ...f, status: e.target.value, page: 1 }))}>
            <option value="">{t('users.filterStatus')}</option>
            <option value="ACTIVE">{t('common.active')}</option>
            <option value="INACTIVE">{t('common.inactive')}</option>
            <option value="SUSPENDED">{t('common.suspended')}</option>
          </select>
          <PermissionGuard permission="users.create">
            <button className="btn btn-primary" onClick={() => { setEditUser(null); setShowForm(true); }}>
              + {t('users.addUser')}
            </button>
          </PermissionGuard>
        </div>

        <div className="card" style={{ padding: 0 }}>
          {loading ? <Loader /> : users.length === 0 ? (
            <EmptyState icon="👥" title={t('users.noUsers')} />
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>{t('users.name')}</th>
                    <th>{t('users.email')}</th>
                    <th>{t('users.role')}</th>
                    <th>{t('users.branch')}</th>
                    <th>{t('users.status')}</th>
                    <th>{t('users.lastLogin')}</th>
                    <th>{t('common.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td style={{ fontWeight: 700 }}>{user.name}</td>
                      <td dir="ltr" style={{ textAlign: 'start' }}>{user.email}</td>
                      <td>{colName(user.role) || '—'}</td>
                      <td>{colName(user.branch) || '—'}</td>
                      <td><Badge status={user.status} /></td>
                      <td>{formatDateTime(user.lastLoginAt, language === 'ar' ? 'ar-SA' : 'en-US')}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <PermissionGuard permission="users.update">
                            <button className="btn btn-ghost btn-sm" onClick={() => { setEditUser(user); setShowForm(true); }}>
                              ✏️ {t('common.edit')}
                            </button>
                          </PermissionGuard>
                          <PermissionGuard permission="users.change_status">
                            <select
                              className="toolbar-select"
                              style={{ padding: '5px 10px', fontSize: 12, minWidth: 'auto' }}
                              value={user.status}
                              onChange={(e) => handleStatusChange(user, e.target.value)}
                            >
                              <option value="ACTIVE">{t('common.active')}</option>
                              <option value="INACTIVE">{t('common.inactive')}</option>
                              <option value="SUSPENDED">{t('common.suspended')}</option>
                            </select>
                          </PermissionGuard>
                          <PermissionGuard permission="users.delete">
                            <button className="btn btn-danger btn-sm" onClick={() => setDeleteTarget(user)}>
                              🗑️
                            </button>
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

      <UserForm
        isOpen={showForm}
        onClose={() => { setShowForm(false); setEditUser(null); }}
        onSaved={() => { setShowForm(false); setEditUser(null); fetchUsers(); }}
        user={editUser}
        roles={roles}
        branches={branches}
      />

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        message={t('users.confirmDelete')}
      />
    </>
  );
}
