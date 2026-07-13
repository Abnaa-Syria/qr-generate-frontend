import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { citizenRecordService } from '../../services/citizenRecord.service';
import { usePermissions } from '../../hooks/usePermissions';
import Badge from '../../components/ui/Badge';
import Loader from '../../components/ui/Loader';

const STATUS_COLORS = {
  DRAFT: 'secondary', IMAGES_UPLOADED: 'info', PDF_CREATED: 'warning',
  QR_GENERATED: 'primary', ACTIVE: 'success', ARCHIVED: 'secondary', DELETED: 'danger',
};

const WORKFLOW_STEPS = ['DRAFT', 'IMAGES_UPLOADED', 'PDF_CREATED', 'QR_GENERATED', 'ACTIVE'];

function WorkflowStep({ label, active, done }) {
  const color = done ? '#27ae60' : active ? '#1e3a5f' : '#ccc';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <div style={{ width: 28, height: 28, borderRadius: '50%', background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '12px', fontWeight: 700 }}>
        {done ? '✓' : ''}
      </div>
      <span style={{ color, fontWeight: active || done ? 600 : 400, fontSize: '13px' }}>{label}</span>
    </div>
  );
}

export default function CitizenRecordDetails() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();
  const { can } = usePermissions();

  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState('');
  const [qrPreviewUrl, setQrPreviewUrl] = useState('');
  const [qrPreviewLoading, setQrPreviewLoading] = useState(false);
  const [qrPreviewError, setQrPreviewError] = useState(false);

  const fetchRecord = async () => {
    try {
      const res = await citizenRecordService.getSummary(id);
      setRecord(res.data.data);
    } catch {
      navigate('/citizen-records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRecord(); }, [id]);

  useEffect(() => {
    if (!record?.hasQr) {
      setQrPreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return '';
      });
      setQrPreviewError(false);
      return undefined;
    }

    let cancelled = false;

    const loadQrPreview = async () => {
      setQrPreviewLoading(true);
      setQrPreviewError(false);
      try {
        const res = await citizenRecordService.downloadQrBlob(id);
        if (cancelled) return;
        const objectUrl = URL.createObjectURL(new Blob([res.data], { type: 'image/png' }));
        setQrPreviewUrl((prev) => {
          if (prev) URL.revokeObjectURL(prev);
          return objectUrl;
        });
      } catch {
        if (!cancelled) {
          setQrPreviewUrl((prev) => {
            if (prev) URL.revokeObjectURL(prev);
            return '';
          });
          setQrPreviewError(true);
        }
      } finally {
        if (!cancelled) setQrPreviewLoading(false);
      }
    };

    loadQrPreview();

    return () => {
      cancelled = true;
      setQrPreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return '';
      });
    };
  }, [id, record?.hasQr, record?.updatedAt]);

  const handleGeneratePdf = async () => {
    setActionLoading('pdf');
    try {
      await citizenRecordService.generatePdf(id);
      await fetchRecord();
    } catch (err) {
      alert(err.response?.data?.message || t('common.unexpectedError'));
    } finally {
      setActionLoading('');
    }
  };

  const handleGenerateQr = async (regenerate = false) => {
    setActionLoading('qr');
    try {
      if (regenerate) {
        await citizenRecordService.regenerateQr(id);
      } else {
        await citizenRecordService.generateQr(id);
      }
      await fetchRecord();
    } catch (err) {
      alert(err.response?.data?.message || t('common.unexpectedError'));
    } finally {
      setActionLoading('');
    }
  };

  const handleDownloadQr = async () => {
    try {
      const res = await citizenRecordService.downloadQrBlob(id);
      const url = URL.createObjectURL(new Blob([res.data], { type: 'image/png' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `${record?.recordCode || 'qr'}-qr.png`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert(err.response?.data?.message || t('common.unexpectedError'));
    }
  };

  const handleLifecycle = async (action) => {
    setActionLoading(action);
    try {
      await citizenRecordService[action](id);
      await fetchRecord();
    } catch (err) {
      alert(err.response?.data?.message || t('common.unexpectedError'));
    } finally {
      setActionLoading('');
    }
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}><Loader /></div>;
  if (!record) return null;

  const currentStepIndex = WORKFLOW_STEPS.indexOf(record.status);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">{record.citizenName}</h1>
          <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
            <code style={{ fontFamily: 'monospace' }}>{record.recordCode}</code>
            {' · '}
            <Badge variant={STATUS_COLORS[record.status]}>{t(`citizenRecords.statuses.${record.status}`)}</Badge>
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {can('documents.edit') && <button className="btn btn-outline" onClick={() => navigate(`/citizen-records/${id}/edit`)}>{t('common.edit')}</button>}
          {can('documents.archive') && record.status !== 'ARCHIVED' && record.status !== 'DELETED' && (
            <button className="btn btn-outline" onClick={() => handleLifecycle('archive')} disabled={!!actionLoading}>
              {actionLoading === 'archive' ? '...' : t('citizenRecords.lifecycle.archive')}
            </button>
          )}
          {can('documents.restore') && record.status === 'ARCHIVED' && (
            <button className="btn btn-primary" onClick={() => handleLifecycle('restore')} disabled={!!actionLoading}>
              {actionLoading === 'restore' ? '...' : t('citizenRecords.lifecycle.restore')}
            </button>
          )}
          {can('documents.mark_active') && record.status !== 'ACTIVE' && record.status !== 'DELETED' && record.hasQr && (
            <button className="btn btn-primary" onClick={() => handleLifecycle('markActive')} disabled={!!actionLoading}>
              {actionLoading === 'markActive' ? '...' : t('citizenRecords.lifecycle.markActive')}
            </button>
          )}
          {can('documents.mark_draft') && record.status !== 'DRAFT' && record.status !== 'DELETED' && (
            <button className="btn btn-outline" onClick={() => handleLifecycle('markDraft')} disabled={!!actionLoading}>
              {actionLoading === 'markDraft' ? '...' : t('citizenRecords.lifecycle.markDraft')}
            </button>
          )}
          <button className="btn btn-outline" onClick={() => navigate('/citizen-records')}>{t('common.back')}</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Info Card */}
        <div className="card">
          <h3 style={{ margin: '0 0 16px', color: '#1e3a5f', fontSize: '15px' }}>{t('citizenRecords.details.info')}</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
            <tbody>
              {[
                [t('citizenRecords.branch'), record.branch?.nameAr || '—'],
                [t('citizenRecords.createdBy'), record.createdBy?.name],
                [t('common.createdAt'), new Date(record.createdAt).toLocaleDateString('ar-SA')],
                [t('citizenRecords.images.count'), record.imagesCount],
              ].map(([label, value]) => (
                <tr key={label}>
                  <td style={{ padding: '8px 0', color: '#666', width: '40%' }}>{label}</td>
                  <td style={{ padding: '8px 0', fontWeight: 500 }}>{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Workflow Card */}
        <div className="card">
          <h3 style={{ margin: '0 0 16px', color: '#1e3a5f', fontSize: '15px' }}>{t('citizenRecords.details.workflow')}</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {WORKFLOW_STEPS.map((step, idx) => (
              <WorkflowStep
                key={step}
                label={t(`citizenRecords.statuses.${step}`)}
                done={idx < currentStepIndex}
                active={idx === currentStepIndex}
              />
            ))}
          </div>
        </div>

        {/* Images Card */}
        <div className="card">
          <h3 style={{ margin: '0 0 16px', color: '#1e3a5f', fontSize: '15px' }}>{t('citizenRecords.images.title')}</h3>
          <p style={{ fontSize: '13px', color: '#666' }}>{t('citizenRecords.images.count')}: <strong>{record.imagesCount}</strong></p>
          {can('documents.upload_images') && (
            <button className="btn btn-primary btn-sm" onClick={() => navigate(`/citizen-records/${id}/images`)}>
              {t('citizenRecords.images.manage')}
            </button>
          )}
        </div>

        {/* PDF Card */}
        <div className="card">
          <h3 style={{ margin: '0 0 16px', color: '#1e3a5f', fontSize: '15px' }}>{t('citizenRecords.pdf.title')}</h3>
          {record.hasPdf ? (
            <div>
              <p style={{ fontSize: '13px', color: '#666', marginBottom: '12px' }}>
                {record.pdfFileName} — {record.pdfSize ? `${(record.pdfSize / 1024).toFixed(1)} KB` : ''}
              </p>
              <div style={{ display: 'flex', gap: '8px' }}>
                {can('documents.view_pdf') && (
                  <button className="btn btn-primary btn-sm" onClick={() => navigate(`/secure-documents/${id}`)}>
                    {t('citizenRecords.pdf.view')}
                  </button>
                )}
                {can('documents.convert_to_pdf') && (
                  <button className="btn btn-outline btn-sm" onClick={handleGeneratePdf} disabled={actionLoading === 'pdf'}>
                    {actionLoading === 'pdf' ? '...' : t('citizenRecords.pdf.regenerate')}
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div>
              <p style={{ fontSize: '13px', color: '#888', marginBottom: '12px' }}>{t('citizenRecords.pdf.notGenerated')}</p>
              {can('documents.convert_to_pdf') && (
                <button className="btn btn-primary btn-sm" onClick={handleGeneratePdf} disabled={actionLoading === 'pdf' || record.imagesCount === 0}>
                  {actionLoading === 'pdf' ? '...' : t('citizenRecords.pdf.generate')}
                </button>
              )}
              {record.imagesCount === 0 && <p style={{ fontSize: '11px', color: '#888', marginTop: '8px' }}>{t('citizenRecords.pdf.uploadFirst')}</p>}
            </div>
          )}
        </div>

        {/* QR Card */}
        <div className="card" style={{ gridColumn: '1 / -1' }}>
          <h3 style={{ margin: '0 0 8px', color: '#1e3a5f', fontSize: '15px' }}>{t('citizenRecords.qr.title')}</h3>
          <p style={{ fontSize: '12px', color: '#888', margin: '0 0 16px' }}>{t('citizenRecords.qr.securityNote')}</p>

          <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
            {record.hasQr && (
              <div style={{ border: '1px solid #e0e0e0', borderRadius: '8px', padding: '8px', background: '#fafafa', minWidth: 136, minHeight: 136, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {qrPreviewLoading ? (
                  <Loader />
                ) : qrPreviewUrl ? (
                  <img
                    src={qrPreviewUrl}
                    alt="QR Code"
                    style={{ width: 120, height: 120, display: 'block' }}
                  />
                ) : qrPreviewError ? (
                  <span style={{ fontSize: '12px', color: '#c0392b', textAlign: 'center', padding: '8px' }}>
                    {t('citizenRecords.qr.previewError')}
                  </span>
                ) : null}
              </div>
            )}
            <div>
              {!record.hasQr && <p style={{ fontSize: '13px', color: '#888', marginBottom: '12px' }}>{t('citizenRecords.qr.notGenerated')}</p>}
              {!record.hasPdf && <p style={{ fontSize: '11px', color: '#e67e22', marginBottom: '8px' }}>{t('citizenRecords.qr.needsPdf')}</p>}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {can('documents.generate_qr') && record.hasPdf && !record.hasQr && (
                  <button className="btn btn-primary btn-sm" onClick={() => handleGenerateQr(false)} disabled={actionLoading === 'qr'}>
                    {actionLoading === 'qr' ? '...' : t('citizenRecords.qr.generate')}
                  </button>
                )}
                {can('documents.generate_qr') && record.hasQr && (
                  <button className="btn btn-outline btn-sm" onClick={() => handleGenerateQr(true)} disabled={actionLoading === 'qr'}>
                    {actionLoading === 'qr' ? '...' : t('citizenRecords.qr.regenerate')}
                  </button>
                )}
                {record.hasQr && (
                  <button className="btn btn-outline btn-sm" onClick={handleDownloadQr}>
                    {t('citizenRecords.qr.download')}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Access Logs */}
        {record.recentLogs && record.recentLogs.length > 0 && (
          <div className="card" style={{ gridColumn: '1 / -1' }}>
            <h3 style={{ margin: '0 0 16px', color: '#1e3a5f', fontSize: '15px' }}>{t('accessLogs.recentActivity')}</h3>
            <div className="table-container">
              <table className="table" style={{ fontSize: '13px' }}>
                <thead>
                  <tr>
                    <th>{t('accessLogs.action')}</th>
                    <th>{t('accessLogs.user')}</th>
                    <th>{t('common.createdAt')}</th>
                  </tr>
                </thead>
                <tbody>
                  {record.recentLogs.map(log => (
                    <tr key={log.id}>
                      <td><Badge variant="info">{t(`accessLogs.actions.${log.action}`, { defaultValue: log.action })}</Badge></td>
                      <td>{log.user?.name || '—'}</td>
                      <td>{new Date(log.createdAt).toLocaleString('ar-SA')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
