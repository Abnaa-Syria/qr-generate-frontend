import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import './Sidebar.css';

const NAV_ITEMS = [
  { key: 'dashboard', path: '/dashboard', icon: '📊', permission: 'dashboard.view' },
  { key: 'citizenRecords', path: '/citizen-records', icon: '🗂️', permission: 'documents.view' },
  { key: 'citizenSearch', path: '/search', icon: '🔍', permission: 'search.records' },
  { key: 'qrScanner', path: '/scanner', icon: '📷', permission: 'qr.scan' },
  { key: 'accessLogs', path: '/access-logs', icon: '📋', permission: 'access_logs.view' },
  { key: 'reports', path: '/reports', icon: '📈', permission: 'reports.view' },
  { key: 'auditLogs', path: '/audit-logs', icon: '🔍', permission: 'audit_logs.view' },
  { key: 'backups', path: '/backups', icon: '💾', permission: 'backup.view' },
  { key: 'storageManagement', path: '/storage', icon: '🗄️', permission: 'storage.view' },
  { key: 'qrTokens', path: '/qr-tokens', icon: '🔑', permission: 'qr_tokens.view' },
  { key: 'systemActivity', path: '/activity', icon: '📡', permission: 'dashboard.view' },
  { key: 'users', path: '/users', icon: '👥', permission: 'users.view' },
  { key: 'roles', path: '/roles', icon: '🔐', permission: 'roles.view' },
  { key: 'branches', path: '/branches', icon: '🏢', permission: 'branches.view' },
  { key: 'scanLocations', path: '/scan-locations', icon: '📍', permission: 'scan_locations.view' },
  { key: 'scanDevices', path: '/scan-devices', icon: '🖨️', permission: 'scan_devices.view' },
  { key: 'settings', path: '/settings', icon: '⚙️', permission: 'settings.view' },
];

export default function Sidebar() {
  const { t } = useTranslation();
  const { user, logout, hasPermission } = useAuth();
  const { language } = useLanguage();

  const roleName = language === 'ar'
    ? user?.role?.nameAr
    : user?.role?.nameEn;

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">🏛️</div>
        <div className="sidebar-logo-text">
          <div className="sidebar-logo-title">{t('appNameShort')}</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {NAV_ITEMS.map((item) =>
          (hasPermission(item.permission) || user?.role?.key === 'SUPER_ADMIN') ? (
            <NavLink
              key={item.key}
              to={item.path}
              className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
            >
              <span className="sidebar-link-icon">{item.icon}</span>
              <span>{t(`sidebar.${item.key}`)}</span>
            </NavLink>
          ) : null
        )}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-user-avatar">
            {user?.name?.charAt(0) || '?'}
          </div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{user?.name}</div>
            <div className="sidebar-user-role">{roleName}</div>
          </div>
        </div>
        <button className="sidebar-logout" onClick={logout} title={t('sidebar.logout')}>
          <span>🚪</span>
        </button>
      </div>
    </aside>
  );
}
