import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { citizenRecordService } from '../../services/citizenRecord.service';
import { secureDocumentService } from '../../services/secureDocument.service';
import { usePermissions } from '../../hooks/usePermissions';
import Badge from '../../components/ui/Badge';
import Loader from '../../components/ui/Loader';

const STATUS_COLORS = { ACTIVE: 'success', QR_GENERATED: 'primary', PDF_CREATED: 'warning' };

export default function SecureDocumentViewer() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();
  const { can } = usePermissions();

  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pdfUrl, setPdfUrl] = useState('');
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [printLoading, setPrintLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    citizenRecordService.getById(id)
      .then(async (res) => {
        const data = res.data.data;
        if (cancelled) return;
        setRecord(data);
        if (!data.hasPdf) return;
        const pdfRes = await secureDocumentService.viewPdfBlob(id);
        if (cancelled) return;
        const objectUrl = URL.createObjectURL(new Blob([pdfRes.data], { type: 'application/pdf' }));
        setPdfUrl((prev) => {
          if (prev) URL.revokeObjectURL(prev);
          return objectUrl;
        });
      })
      .catch(() => { if (!cancelled) navigate('/citizen-records'); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => {
      cancelled = true;
      setPdfUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return '';
      });
    };
  }, [id, navigate]);

  const handleDownload = async () => {
    setDownloadLoading(true);
    try {
      const res = await secureDocumentService.downloadPdf(id);
      const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = record?.pdfFileName || 'document.pdf';
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert(err.response?.data?.message || t('common.unexpectedError'));
    } finally {
      setDownloadLoading(false);
    }
  };

  const handlePrint = async () => {
    setPrintLoading(true);
    try {
      await secureDocumentService.logPrint(id);
    } catch {}
    const iframe = document.getElementById('pdf-frame');
    if (iframe) {
      iframe.contentWindow.print();
    }
    setPrintLoading(false);
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}><Loader /></div>;
  if (!record) return null;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">{record.citizenName}</h1>
          <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
            <code>{record.recordCode}</code>
            {' · '}
            <Badge variant={STATUS_COLORS[record.status] || 'secondary'}>{t(`citizenRecords.statuses.${record.status}`)}</Badge>
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {can('documents.download_pdf') && (
            <button className="btn btn-outline" onClick={handleDownload} disabled={downloadLoading}>
              {downloadLoading ? '...' : t('documents.download')}
            </button>
          )}
          {can('documents.print_pdf') && (
            <button className="btn btn-outline" onClick={handlePrint} disabled={printLoading}>
              {printLoading ? '...' : t('documents.print')}
            </button>
          )}
          <button className="btn btn-outline" onClick={() => navigate(-1)}>{t('common.back')}</button>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '16px', padding: '12px 20px' }}>
        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', fontSize: '13px', color: '#555' }}>
          {[
            [t('citizenRecords.branch'), record.branch?.nameAr],
            [t('citizenRecords.createdBy'), record.createdBy?.name],
            [t('common.createdAt'), new Date(record.createdAt).toLocaleDateString('ar-SA')],
          ].map(([label, value]) => (
            <div key={label}>
              <span style={{ color: '#888' }}>{label}: </span>
              <strong>{value || '—'}</strong>
            </div>
          ))}
        </div>
      </div>

      {record.hasPdf ? (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <iframe
            id="pdf-frame"
            src={pdfUrl}
            title={record.pdfFileName}
            style={{ width: '100%', height: '80vh', border: 'none', display: 'block' }}
          />
        </div>
      ) : (
        <div className="card" style={{ textAlign: 'center', padding: '60px', color: '#888' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>📄</div>
          <p>{t('citizenRecords.pdf.notGenerated')}</p>
          <button className="btn btn-outline" onClick={() => navigate(`/citizen-records/${id}`)}>
            {t('citizenRecords.details.goToRecord')}
          </button>
        </div>
      )}
    </div>
  );
}
