import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { activityService } from '../../services/phase3.service';
import Loader from '../../components/ui/Loader';

export default function SystemActivity() {
  const { t } = useTranslation();
  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    activityService.getSystemActivity().then((res) => setActivity(res.data.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ padding: '60px' }}><Loader /></div>;

  return (
    <div>
      <div className="page-header"><h1 className="page-title">{t('activity.title')}</h1></div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div className="card">
          <h3 style={{ margin: '0 0 16px' }}>{t('auditLogs.title')}</h3>
          {(activity?.recentAuditLogs || []).map((log) => (
            <div key={log.id} style={{ padding: '10px 0', borderBottom: '1px solid #eee', fontSize: '13px' }}>
              <strong>{log.action}</strong> — {log.user?.name} — {new Date(log.createdAt).toLocaleString('ar-SA')}
            </div>
          ))}
        </div>
        <div className="card">
          <h3 style={{ margin: '0 0 16px' }}>{t('accessLogs.title')}</h3>
          {(activity?.recentAccessLogs || []).map((log) => (
            <div key={log.id} style={{ padding: '10px 0', borderBottom: '1px solid #eee', fontSize: '13px' }}>
              <strong>{log.action}</strong> — {log.user?.name} — {new Date(log.createdAt).toLocaleString('ar-SA')}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
