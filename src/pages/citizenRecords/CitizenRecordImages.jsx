import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { citizenRecordService } from '../../services/citizenRecord.service';
import { usePermissions } from '../../hooks/usePermissions';
import Loader from '../../components/ui/Loader';
import ConfirmDialog from '../../components/ui/ConfirmDialog';

export default function CitizenRecordImages() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();
  const { can } = usePermissions();
  const fileInputRef = useRef();

  const [record, setRecord] = useState(null);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const fetchData = async () => {
    try {
      const [recRes, imgRes] = await Promise.all([
        citizenRecordService.getById(id),
        citizenRecordService.getImages(id),
      ]);
      setRecord(recRes.data.data);
      setImages(imgRes.data.data || []);
    } catch {
      navigate('/citizen-records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [id]);

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 4000);
  };

  const handleUpload = async (files) => {
    if (!files || files.length === 0) return;
    const formData = new FormData();
    Array.from(files).forEach(f => formData.append('images', f));
    setUploading(true);
    try {
      await citizenRecordService.uploadImages(id, formData);
      await fetchData();
      showMessage(t('citizenRecords.images.uploadSuccess'));
    } catch (err) {
      showMessage(err.response?.data?.message || t('common.unexpectedError'), 'error');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await citizenRecordService.deleteImage(id, deleteTarget.id);
      setDeleteTarget(null);
      await fetchData();
      showMessage(t('citizenRecords.images.deleteSuccess'));
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleImportFromScanFolder = async () => {
    setImportLoading(true);
    try {
      const res = await citizenRecordService.importFromScanFolder(id);
      const data = res.data.data;
      await fetchData();
      showMessage(t('citizenRecords.images.importResult', { count: data.imported, skipped: data.skipped }));
    } catch (err) {
      showMessage(err.response?.data?.message || t('common.unexpectedError'), 'error');
    } finally {
      setImportLoading(false);
    }
  };

  const handleGeneratePdf = async () => {
    setPdfLoading(true);
    try {
      await citizenRecordService.generatePdf(id);
      await fetchData();
      showMessage(t('citizenRecords.pdf.generateSuccess'));
    } catch (err) {
      showMessage(err.response?.data?.message || t('common.unexpectedError'), 'error');
    } finally {
      setPdfLoading(false);
    }
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}><Loader /></div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('citizenRecords.images.title')}</h1>
          <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
            {record?.citizenName} — <code>{record?.recordCode}</code>
          </p>
        </div>
        <button className="btn btn-outline" onClick={() => navigate(`/citizen-records/${id}`)}>
          {t('common.back')}
        </button>
      </div>

      {message && (
        <div style={{ marginBottom: '16px', padding: '12px 16px', borderRadius: '8px', background: message.type === 'error' ? '#fde8e8' : '#e8f5e9', border: `1px solid ${message.type === 'error' ? '#f5c6cb' : '#c3e6cb'}`, color: message.type === 'error' ? '#721c24' : '#155724' }}>
          {message.text}
        </div>
      )}

      <div className="card">
        <div style={{ marginBottom: '20px', padding: '16px', background: '#f0f4f8', borderRadius: '8px' }}>
          <p style={{ margin: '0 0 8px', fontWeight: 500, color: '#1e3a5f' }}>{t('citizenRecords.images.instruction')}</p>
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '24px' }}>
          {can('documents.upload_images') && (
            <>
              <label className="btn btn-primary" style={{ cursor: 'pointer' }}>
                {uploading ? '...' : t('citizenRecords.images.upload')}
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/jpeg,image/jpg,image/png,image/webp,image/tiff"
                  style={{ display: 'none' }}
                  onChange={e => handleUpload(e.target.files)}
                  disabled={uploading}
                />
              </label>
              <button className="btn btn-outline" onClick={handleImportFromScanFolder} disabled={importLoading}>
                {importLoading ? '...' : t('citizenRecords.images.importFromFolder')}
              </button>
            </>
          )}
          {can('documents.convert_to_pdf') && images.length > 0 && (
            <button className="btn btn-primary" onClick={handleGeneratePdf} disabled={pdfLoading}>
              {pdfLoading ? '...' : (record?.hasPdf ? t('citizenRecords.pdf.regenerate') : t('citizenRecords.pdf.generate'))}
            </button>
          )}
          {record?.hasPdf && can('documents.view_pdf') && (
            <button className="btn btn-outline" onClick={() => navigate(`/secure-documents/${id}`)}>
              {t('citizenRecords.pdf.view')}
            </button>
          )}
        </div>

        {images.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>📄</div>
            <p>{t('citizenRecords.images.empty')}</p>
          </div>
        ) : (
          <div>
            <p style={{ color: '#666', fontSize: '13px', marginBottom: '16px' }}>{t('citizenRecords.images.count')}: <strong>{images.length}</strong></p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '16px' }}>
              {images.map((img, idx) => (
                <div key={img.id} style={{ border: '1px solid #e0e0e0', borderRadius: '8px', overflow: 'hidden', position: 'relative' }}>
                  <div style={{ background: '#f5f5f5', padding: '4px 8px', fontSize: '12px', color: '#666', display: 'flex', justifyContent: 'space-between' }}>
                    <span>{t('citizenRecords.images.page')} {img.sortOrder}</span>
                    <span style={{ fontSize: '10px' }}>{img.source}</span>
                  </div>
                  <div style={{ padding: '12px', textAlign: 'center', background: '#fafafa', minHeight: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ fontSize: '36px' }}>🖼️</div>
                  </div>
                  <div style={{ padding: '8px', background: '#fff' }}>
                    <p style={{ margin: 0, fontSize: '11px', color: '#888', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{img.imageFileName}</p>
                    {can('documents.upload_images') && (
                      <button
                        className="btn btn-danger btn-sm"
                        style={{ marginTop: '8px', width: '100%', fontSize: '12px' }}
                        onClick={() => setDeleteTarget(img)}
                      >
                        {t('common.delete')}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title={t('citizenRecords.images.deleteConfirm.title')}
        message={t('citizenRecords.images.deleteConfirm.message')}
        confirmLabel={t('common.delete')}
        variant="danger"
        loading={deleteLoading}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
