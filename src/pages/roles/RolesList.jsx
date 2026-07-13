import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../contexts/LanguageContext';
import Header from '../../components/layout/Header';
import Loader from '../../components/ui/Loader';
import Badge from '../../components/ui/Badge';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import EmptyState from '../../components/ui/EmptyState';
import PermissionGuard from '../../components/layout/PermissionGuard';
import RoleForm from './RoleForm';
import PermissionsMatrix from './PermissionsMatrix';
import { roleService } from '../../services/role.service';

export default function RolesList() {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editRole, setEditRole] = useState(null);
  const [permRole, setPermRole] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchRoles = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await roleService.getAll({ limit: 100 });
      setRoles(data.data || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchRoles(); }, [fetchRoles]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await roleService.delete(deleteTarget.id);
      setDeleteTarget(null);
      fetchRoles();
    } finally {
      setDeleting(false);
    }
  };

  const colName = (item) => language === 'ar' ? item?.nameAr : item?.nameEn;

  return (
    <>
      <Header title={t('roles.title')} />
      <div className="page-content">
        <div className="toolbar">
          <div style={{ flex: 1 }} />
          <PermissionGuard permission="roles.create">
            <button className="btn btn-primary" onClick={() => { setEditRole(null); setShowForm(true); }}>
              + {t('roles.addRole')}
            </button>
          </PermissionGuard>
        </div>

        <div className="card" style={{ padding: 0 }}>
          {loading ? <Loader /> : roles.length === 0 ? (
            <EmptyState icon="🔐" title={t('common.noData')} />
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>{t('roles.nameAr')}</th>
                    <th>{t('roles.nameEn')}</th>
                    <th>{t('roles.key')}</th>
                    <th>{t('roles.usersCount')}</th>
                    <th>{t('roles.permissions')}</th>
                    <th>{t('common.status')}</th>
                    <th>{t('common.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {roles.map((role) => (
                    <tr key={role.id}>
                      <td style={{ fontWeight: 700 }}>{role.nameAr}</td>
                      <td>{role.nameEn}</td>
                      <td><code style={{ fontSize: 12, background: 'var(--gray-100)', padding: '2px 8px', borderRadius: 4 }}>{role.key}</code></td>
                      <td>{role._count?.users ?? 0}</td>
                      <td>
                        <span className="badge badge-primary">{role.permissions?.length || 0}</span>
                        {role.isProtected && <span className="badge badge-active" style={{ marginInlineStart: 6 }}>🔒 {t('roles.protected')}</span>}
                      </td>
                      <td><Badge status={role.status} /></td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <PermissionGuard permission="roles.manage_permissions">
                            <button className="btn btn-ghost btn-sm" onClick={() => setPermRole(role)}>
                              🔐 {t('roles.managePermissions')}
                            </button>
                          </PermissionGuard>
                          {!role.isProtected && (
                            <>
                              <PermissionGuard permission="roles.update">
                                <button className="btn btn-ghost btn-sm" onClick={() => { setEditRole(role); setShowForm(true); }}>✏️</button>
                              </PermissionGuard>
                              <PermissionGuard permission="roles.delete">
                                <button className="btn btn-danger btn-sm" onClick={() => setDeleteTarget(role)}>🗑️</button>
                              </PermissionGuard>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <RoleForm isOpen={showForm} onClose={() => { setShowForm(false); setEditRole(null); }} onSaved={() => { setShowForm(false); setEditRole(null); fetchRoles(); }} role={editRole} />
      {permRole && <PermissionsMatrix role={permRole} onClose={() => { setPermRole(null); fetchRoles(); }} />}
      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} loading={deleting} message={t('roles.confirmDelete')} />
    </>
  );
}
