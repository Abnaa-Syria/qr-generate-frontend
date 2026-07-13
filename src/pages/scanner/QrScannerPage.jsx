import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { scannerService } from '../../services/scanner.service';
import { branchService } from '../../services/branch.service';
import { scanLocationService } from '../../services/scanLocation.service';
import { scanDeviceService } from '../../services/scanDevice.service';
import { useAuth } from '../../hooks/useAuth';
import Badge from '../../components/ui/Badge';

const STORAGE_KEY = 'qr_scanner_prefs';
const MAX_RECENT = 5;

function loadPrefs() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; } catch { return {}; }
}
function savePrefs(prefs) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
}

export default function QrScannerPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const inputRef = useRef();

  const prefs = loadPrefs();
  const [qrValue, setQrValue] = useState('');
  const [branchId, setBranchId] = useState(prefs.branchId || user?.branchId || '');
  const [scanLocationId, setScanLocationId] = useState(prefs.scanLocationId || '');
  const [scanDeviceId, setScanDeviceId] = useState(prefs.scanDeviceId || '');
  const [deviceName, setDeviceName] = useState(prefs.deviceName || '');
  const [branches, setBranches] = useState([]);
  const [locations, setLocations] = useState([]);
  const [devices, setDevices] = useState([]);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [recentScans, setRecentScans] = useState([]);

  useEffect(() => {
    branchService.getAll({ limit: 100 }).then(r => setBranches(r.data.data || []));
    if (inputRef.current) inputRef.current.focus();
  }, []);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'F2') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  useEffect(() => {
    if (branchId) {
      scanLocationService.getAll({ branchId, limit: 100 }).then(r => setLocations(r.data.data || []));
    } else {
      setLocations([]);
      setScanLocationId('');
    }
  }, [branchId]);

  useEffect(() => {
    if (branchId) {
      scanDeviceService.getAll({ branchId, scanLocationId: scanLocationId || undefined, limit: 100 }).then(r => setDevices(r.data.data || []));
    } else {
      setDevices([]);
      setScanDeviceId('');
    }
  }, [branchId, scanLocationId]);

  const handleScan = async () => {
    if (!qrValue.trim()) return;
    savePrefs({ branchId, scanLocationId, scanDeviceId, deviceName });
    setScanning(true);
    setResult(null);
    const scannedValue = qrValue.trim();
    try {
      const res = await scannerService.verifyQr({
        qrValue: scannedValue,
        branchId: branchId || null,
        scanLocationId: scanLocationId || null,
        scanDeviceId: scanDeviceId || null,
        deviceName: deviceName || null,
      });
      const scanResult = res.data;
      setResult(scanResult);
      setRecentScans((prev) => [
        {
          id: Date.now(),
          success: scanResult.success,
          status: scanResult.data?.resultStatus || (scanResult.success ? 'SUCCESS' : 'FAILED'),
          message: scanResult.message,
          recordCode: scanResult.data?.record?.recordCode,
          citizenName: scanResult.data?.record?.citizenName,
          at: new Date().toISOString(),
        },
        ...prev,
      ].slice(0, MAX_RECENT));
    } catch (err) {
      const failResult = { success: false, message: err.response?.data?.message || t('common.unexpectedError'), data: { resultStatus: err.response?.data?.data?.resultStatus || 'FAILED' } };
      setResult(failResult);
      setRecentScans((prev) => [
        { id: Date.now(), success: false, status: failResult.data.resultStatus, message: failResult.message, at: new Date().toISOString() },
        ...prev,
      ].slice(0, MAX_RECENT));
    } finally {
      setScanning(false);
      setQrValue('');
      setTimeout(() => { if (inputRef.current) inputRef.current.focus(); }, 100);
    }
  };

  const handleKeyDown = (e) => { if (e.key === 'Enter') handleScan(); };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">{t('scanner.title')}</h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Scanner Setup */}
        <div className="card">
          <h3 style={{ margin: '0 0 16px', color: '#1e3a5f', fontSize: '15px' }}>{t('scanner.setup')}</h3>
          <div className="form-group">
            <label className="form-label">{t('scanner.branch')}</label>
            <select className="form-control" value={branchId} onChange={e => setBranchId(e.target.value)}>
              <option value="">{t('common.select')}</option>
              {branches.map(b => <option key={b.id} value={b.id}>{b.nameAr}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">{t('scanner.scanLocation')}</label>
            <select className="form-control" value={scanLocationId} onChange={e => setScanLocationId(e.target.value)} disabled={!branchId}>
              <option value="">{t('common.optional')}</option>
              {locations.map(l => <option key={l.id} value={l.id}>{l.nameAr}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">{t('scanner.scanDevice')}</label>
            <select className="form-control" value={scanDeviceId} onChange={e => setScanDeviceId(e.target.value)} disabled={!branchId}>
              <option value="">{t('common.optional')}</option>
              {devices.map(d => <option key={d.id} value={d.id}>{d.nameAr}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">{t('scanner.deviceName')}</label>
            <input type="text" className="form-control" value={deviceName} onChange={e => setDeviceName(e.target.value)} placeholder={t('scanner.deviceNamePlaceholder')} />
          </div>
        </div>

        {/* QR Input */}
        <div className="card">
          <h3 style={{ margin: '0 0 8px', color: '#1e3a5f', fontSize: '15px' }}>{t('scanner.scanQr')}</h3>
          <p style={{ margin: '0 0 16px', fontSize: '13px', color: '#666' }}>{t('scanner.scanInstruction')}</p>
          <p style={{ margin: '0 0 12px', fontSize: '12px', color: '#888' }}>{t('scanner.shortcutHint')}</p>
          <div style={{ position: 'relative', marginBottom: '16px' }}>
            <input
              ref={inputRef}
              type="text"
              className="form-control"
              placeholder={t('scanner.qrPlaceholder')}
              value={qrValue}
              onChange={e => setQrValue(e.target.value)}
              onKeyDown={handleKeyDown}
              style={{ fontSize: '16px', padding: '16px', letterSpacing: '1px' }}
              autoFocus
            />
          </div>
          <button className="btn btn-primary" style={{ width: '100%', padding: '14px', fontSize: '16px' }} onClick={handleScan} disabled={scanning || !qrValue.trim()}>
            {scanning ? t('scanner.verifying') : t('scanner.verify')}
          </button>
        </div>
      </div>

      {/* Result */}
      {result && (
        <div className="card" style={{ marginTop: '20px', border: `2px solid ${result.success ? '#27ae60' : '#e74c3c'}` }}>
          {result.success ? (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <span style={{ fontSize: '32px' }}>✅</span>
                <div>
                  <h3 style={{ margin: 0, color: '#1e7e34', fontSize: '18px' }}>{t('scanner.result.success')}</h3>
                  <p style={{ margin: 0, color: '#666', fontSize: '13px' }}>{new Date().toLocaleString('ar-SA')}</p>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                {[
                  [t('citizenRecords.citizenName'), result.data?.record?.citizenName],
                  [t('citizenRecords.recordCode'), result.data?.record?.recordCode],
                  [t('citizenRecords.branch'), result.data?.record?.branch?.nameAr],
                  [t('citizenRecords.createdBy'), result.data?.record?.createdBy?.name],
                ].map(([label, value]) => (
                  <div key={label} style={{ padding: '12px', background: '#f9f9f9', borderRadius: '8px' }}>
                    <p style={{ margin: '0 0 4px', fontSize: '12px', color: '#888' }}>{label}</p>
                    <p style={{ margin: 0, fontWeight: 600 }}>{value || '—'}</p>
                  </div>
                ))}
              </div>
              {result.data?.viewerUrl && (
                <button className="btn btn-primary" onClick={() => navigate(result.data.viewerUrl.replace('/secure-documents/', '/secure-documents/'))}>
                  {t('scanner.openDocument')}
                </button>
              )}
            </div>
          ) : (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <span style={{ fontSize: '32px' }}>❌</span>
                <div>
                  <h3 style={{ margin: 0, color: '#c0392b', fontSize: '18px' }}>{t('scanner.result.failed')}</h3>
                  <p style={{ margin: 0, color: '#666', fontSize: '13px' }}>{new Date().toLocaleString('ar-SA')}</p>
                </div>
              </div>
              <p style={{ color: '#c0392b', fontWeight: 500, marginBottom: '8px' }}>{result.message}</p>
              <Badge variant="danger">
                {t(`scanner.statuses.${result.data?.resultStatus}`, { defaultValue: t(`accessLogs.results.${result.data?.resultStatus}`, { defaultValue: result.data?.resultStatus || 'FAILED' }) })}
              </Badge>
            </div>
          )}
        </div>
      )}

      {recentScans.length > 0 && (
        <div className="card" style={{ marginTop: '20px' }}>
          <h3 style={{ margin: '0 0 16px', color: '#1e3a5f', fontSize: '15px' }}>{t('scanner.recentScans')}</h3>
          <div className="table-container">
            <table className="table" style={{ fontSize: '13px' }}>
              <thead>
                <tr>
                  <th>{t('accessLogs.result')}</th>
                  <th>{t('citizenRecords.recordCode')}</th>
                  <th>{t('citizenRecords.citizenName')}</th>
                  <th>{t('accessLogs.message')}</th>
                  <th>{t('common.createdAt')}</th>
                </tr>
              </thead>
              <tbody>
                {recentScans.map((scan) => (
                  <tr key={scan.id}>
                    <td>
                      <Badge variant={scan.success ? 'success' : 'danger'}>
                        {t(`scanner.statuses.${scan.status}`, { defaultValue: t(`accessLogs.results.${scan.status}`, { defaultValue: scan.status }) })}
                      </Badge>
                    </td>
                    <td>{scan.recordCode || '—'}</td>
                    <td>{scan.citizenName || '—'}</td>
                    <td>{scan.message || '—'}</td>
                    <td>{new Date(scan.at).toLocaleString('ar-SA')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
