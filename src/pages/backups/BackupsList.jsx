import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { backupService } from '../../services/phase3.service';
import { usePermissions } from '../../hooks/usePermissions';
import Loader from '../../components/ui/Loader';
import ConfirmDialog from '../../components/ui/ConfirmDialog';

export default function BackupsList() {
  const { t } = useTranslation();
  const { can } = usePermissions();
  const [backups, setBackups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchBackups = () => {
    setLoading(true);
    backupService.getAll().then((res) => setBackups(res.data.data || [])).finally(() => setLoading(false));
  };

  useEffect(() => { fetchBackups(); }, []);

  const handleCreate = async () => {
    setCreating(true);
    try {
      await backupService.create({ includeFiles: false });
      fetchBackups();
    } finally {
      setCreating(false);
    }
  };

  const handleDownload = (id, fileName) => {
    const token = localStorage.getItem('token');
    fetch(backupService.downloadUrl(id), { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.blob())
      .then((blob) => {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = fileName;
        a.click();
      });
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await backupService.delete(deleteTarget.id);
    setDeleteTarget(null);
    fetchBackups();
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">{t('backups.title')}</h1>
        {can('backup.create') && (
          <button className="btn btn-primary" onClick={handleCreate} disabled={creating}>
            {creating ? '...' : t('backups.create')}
          </button>
        )}
      </div>
      <div className="card" style={{ marginBottom: '16px', padding: '12px 16px', background: '#fff3cd', border: '1px solid #ffc107' }}>
        <p style={{ margin: 0, fontSize: '13px', color: '#856404' }}>{t('backups.noPasswordsNote')}</p>
      </div>
      <div className="card">
        {loading ? <Loader /> : backups.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#888', padding: '40px' }}>{t('backups.empty')}</p>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead><tr><th>{t('backups.fileName')}</th><th>{t('backups.type')}</th><th>{t('backups.size')}</th><th>{t('backups.createdBy')}</th><th>{t('common.createdAt')}</th><th>{t('common.actions')}</th></tr></thead>
              <tbody>
                {backups.map((b) => (
                  <tr key={b.id}>
                    <td>{b.fileName}</td>
                    <td>{b.type}</td>
                    <td>{b.fileSize ? `${(b.fileSize / 1024).toFixed(1)} KB` : '—'}</td>
                    <td>{b.createdBy?.name}</td>
                    <td>{new Date(b.createdAt).toLocaleString('ar-SA')}</td>
                    <td style={{ display: 'flex', gap: '6px' }}>
                      {can('backup.download') && <button className="btn btn-sm btn-outline" onClick={() => handleDownload(b.id, b.fileName)}>{t('documents.download')}</button>}
                      {can('backup.delete') && <button className="btn btn-sm btn-danger" onClick={() => setDeleteTarget(b)}>{t('common.delete')}</button>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <ConfirmDialog isOpen={!!deleteTarget} title={t('backups.deleteConfirm')} message={deleteTarget?.fileName} confirmLabel={t('common.delete')} variant="danger" onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />
    </div>
  );
}
