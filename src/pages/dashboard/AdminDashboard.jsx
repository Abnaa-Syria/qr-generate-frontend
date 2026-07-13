import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { dashboardService } from '../../services/dashboard.service';
import Header from '../../components/layout/Header';
import Loader from '../../components/ui/Loader';
import Badge from '../../components/ui/Badge';
import { formatDateTime } from '../../utils/formatDate';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const OVERVIEW_STATS = [
  { key: 'totalRecords', icon: '📋' },
  { key: 'activeRecords', icon: '✅' },
  { key: 'recordsWithPdf', icon: '📄' },
  { key: 'recordsWithQr', icon: '📷' },
  { key: 'totalSearches', icon: '🔍' },
  { key: 'totalQrScans', icon: '📡' },
  { key: 'totalViews', icon: '👁️' },
  { key: 'todayAccess', icon: '📊' },
];

export default function AdminDashboard() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { language } = useLanguage();
  const [overview, setOverview] = useState(null);
  const [docStats, setDocStats] = useState(null);
  const [accessChart, setAccessChart] = useState(null);
  const [alerts, setAlerts] = useState(null);
  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      dashboardService.getOverview(),
      dashboardService.getDocumentStats(),
      dashboardService.getAccessChart(),
      dashboardService.getSecurityAlerts(),
      dashboardService.getRecentActivity(),
    ]).then(([ov, ds, ac, al, act]) => {
      setOverview(ov.data.data);
      setDocStats(ds.data.data);
      setAccessChart(ac.data.data);
      setAlerts(al.data.data);
      setActivity(act.data.data);
    }).finally(() => setLoading(false));
  }, []);

  const branchName = language === 'ar' ? overview?.currentUser?.branch?.nameAr : overview?.currentUser?.branch?.nameEn;
  const roleName = language === 'ar' ? overview?.currentUser?.role?.nameAr : overview?.currentUser?.role?.nameEn;

  if (loading) return <><Header title={t('dashboard.title')} /><Loader /></>;

  const statusChartData = (docStats?.byStatus || []).map((s) => ({
    name: t(`citizenRecords.statuses.${s.status}`, { defaultValue: s.status }),
    count: s.count,
  }));

  const qrScanData = (accessChart?.QR_SCAN || []).slice(-14);

  return (
    <>
      <Header title={t('dashboard.title')} subtitle={`${t('dashboard.welcome')}, ${user?.name}`} />
      <div className="page-content">
        <div className="page-header">
          <h2 className="page-title">{t('dashboard.overview')}</h2>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            {branchName && <span style={{ fontSize: 13, color: 'var(--gray-500)' }}>🏢 {branchName}</span>}
            {roleName && <span style={{ fontSize: 13, color: 'var(--gray-500)' }}>🔐 {roleName}</span>}
          </div>
        </div>

        {alerts?.alerts?.length > 0 && (
          <div style={{ marginBottom: '20px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {alerts.alerts.map((a) => (
              <div key={a.type} style={{ padding: '10px 16px', background: '#fff3cd', border: '1px solid #ffc107', borderRadius: '8px', fontSize: '13px' }}>
                ⚠️ {t(`dashboard.alerts.${a.type}`, { count: a.count, defaultValue: a.type })}
              </div>
            ))}
          </div>
        )}

        <div className="stats-grid">
          {OVERVIEW_STATS.map(({ key, icon }) => (
            <div key={key} className="stat-card">
              <div className="stat-icon">{icon}</div>
              <div className="stat-info">
                <div className="stat-value">{overview?.[key] ?? 0}</div>
                <div className="stat-label">{t(`dashboard.${key}`, { defaultValue: key })}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginTop: 24 }}>
          <div className="card">
            <h3 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 800, color: 'var(--primary-dark)' }}>{t('dashboard.recordsByStatus')}</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={statusChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#1e3a5f" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="card">
            <h3 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 800, color: 'var(--primary-dark)' }}>{t('dashboard.qrScansOverTime')}</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={qrScanData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#27ae60" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginTop: 24 }}>
          <div className="card">
            <h3 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 800 }}>{t('auditLogs.title')}</h3>
            {(activity?.recentAuditLogs || []).map((log) => (
              <div key={log.id} style={{ padding: '10px 0', borderBottom: '1px solid var(--gray-100)', display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <Badge variant="info">{log.action}</Badge>
                  <div style={{ fontSize: 12, color: 'var(--gray-500)', marginTop: 4 }}>{log.user?.name} • {log.module}</div>
                </div>
                <div style={{ fontSize: 11, color: 'var(--gray-400)' }}>{formatDateTime(log.createdAt, language === 'ar' ? 'ar-SA' : 'en-US')}</div>
              </div>
            ))}
          </div>
          <div className="card">
            <h3 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 800 }}>{t('accessLogs.title')}</h3>
            {(activity?.recentAccessLogs || []).map((log) => (
              <div key={log.id} style={{ padding: '10px 0', borderBottom: '1px solid var(--gray-100)', display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <Badge variant="primary">{log.action}</Badge>
                  <div style={{ fontSize: 12, color: 'var(--gray-500)', marginTop: 4 }}>{log.user?.name}</div>
                </div>
                <div style={{ fontSize: 11, color: 'var(--gray-400)' }}>{formatDateTime(log.createdAt, language === 'ar' ? 'ar-SA' : 'en-US')}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
