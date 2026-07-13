import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { usePermissions } from '../../hooks/usePermissions';

const REPORT_ITEMS = [
  { key: 'citizenRecords', path: '/reports/citizen-records', icon: '🗂️', permission: 'reports.view' },
  { key: 'documentAccess', path: '/reports/document-access', icon: '📋', permission: 'reports.view' },
  { key: 'branches', path: '/reports/branches', icon: '🏢', permission: 'reports.view' },
  { key: 'employees', path: '/reports/employees', icon: '👥', permission: 'reports.view' },
  { key: 'qrActivity', path: '/reports/qr-activity', icon: '📷', permission: 'reports.view' },
  { key: 'storage', path: '/reports/storage', icon: '💾', permission: 'reports.view' },
  { key: 'security', path: '/reports/security', icon: '🔒', permission: 'reports.view' },
];

export default function ReportsHub() {
  const { t } = useTranslation();
  const { can } = usePermissions();

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">{t('reports.title')}</h1>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px' }}>
        {REPORT_ITEMS.filter((item) => can(item.permission)).map((item) => (
          <Link key={item.key} to={item.path} style={{ textDecoration: 'none' }}>
            <div className="card" style={{ cursor: 'pointer', transition: 'box-shadow 0.2s', height: '100%' }}>
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>{item.icon}</div>
              <h3 style={{ margin: '0 0 8px', color: '#1e3a5f', fontSize: '16px' }}>{t(`reports.${item.key}.title`)}</h3>
              <p style={{ margin: 0, fontSize: '13px', color: '#666' }}>{t(`reports.${item.key}.description`)}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
