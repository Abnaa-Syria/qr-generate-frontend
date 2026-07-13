import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Modal from '../../components/ui/Modal';
import Loader from '../../components/ui/Loader';
import { roleService } from '../../services/role.service';

export default function PermissionsMatrix({ role, onClose }) {
  const { t } = useTranslation();
  const [grouped, setGrouped] = useState({});
  const [selected, setSelected] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!role) return;
    setLoading(true);
    roleService.getPermissions().then(({ data }) => {
      setGrouped(data.data.grouped || {});
    }).catch(() => {}).finally(() => setLoading(false));

    const currentPerms = new Set((role.permissions || []).map(p => p.id));
    setSelected(currentPerms);
  }, [role]);

  const toggle = (id) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleModule = (perms, checked) => {
    setSelected(prev => {
      const next = new Set(prev);
      perms.forEach(p => checked ? next.add(p.id) : next.delete(p.id));
      return next;
    });
  };

  const isModuleAll = (perms) => perms.every(p => selected.has(p.id));
  const isModuleSome = (perms) => perms.some(p => selected.has(p.id));

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      await roleService.updatePermissions(role.id, [...selected]);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || t('common.error'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen={!!role}
      onClose={onClose}
      title={`${t('roles.managePermissions')} — ${role?.nameAr}`}
      size="xl"
      footer={
        <>
          <button className="btn btn-ghost" onClick={onClose} disabled={saving}>{t('common.cancel')}</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? t('common.loading') : t('roles.savePermissions')}
          </button>
        </>
      }
    >
      {error && <div className="alert alert-error">⚠️ {error}</div>}
      {loading ? <Loader /> : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {Object.entries(grouped).map(([module, perms]) => (
            <div key={module} style={{ border: '1px solid var(--gray-200)', borderRadius: 10, overflow: 'hidden' }}>
              <div style={{ background: 'var(--gray-50)', padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--gray-200)' }}>
                <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--primary-dark)' }}>
                  {t(`permissions.${module}`) || module}
                </span>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={isModuleAll(perms)}
                    ref={el => { if (el) el.indeterminate = !isModuleAll(perms) && isModuleSome(perms); }}
                    onChange={(e) => toggleModule(perms, e.target.checked)}
                  />
                  {isModuleAll(perms) ? t('roles.deselectAll') : t('roles.selectAll')}
                </label>
              </div>
              <div style={{ padding: '8px 14px' }}>
                {perms.map(perm => (
                  <label key={perm.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0', cursor: 'pointer', borderBottom: '1px solid var(--gray-50)' }}>
                    <input
                      type="checkbox"
                      checked={selected.has(perm.id)}
                      onChange={() => toggle(perm.id)}
                    />
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--gray-800)' }}>{perm.nameAr}</div>
                      <div style={{ fontSize: 11, color: 'var(--gray-500)', direction: 'ltr', textAlign: 'start' }}>{perm.key}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
}
