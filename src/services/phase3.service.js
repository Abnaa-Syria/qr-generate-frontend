import api from '../config/api';

export const dashboardService = {
  getOverview: () => api.get('/dashboard/overview'),
  getDocumentStats: (params) => api.get('/dashboard/document-stats', { params }),
  getAccessChart: (params) => api.get('/dashboard/access-chart', { params }),
  getBranchStats: () => api.get('/dashboard/branch-stats'),
  getEmployeeActivity: () => api.get('/dashboard/employee-activity'),
  getSecurityAlerts: () => api.get('/dashboard/security-alerts'),
  getRecentActivity: () => api.get('/dashboard/recent-activity'),
};

export const reportService = {
  getCitizenRecords: (params) => api.get('/reports/citizen-records', { params }),
  getDocumentAccess: (params) => api.get('/reports/document-access', { params }),
  getBranches: () => api.get('/reports/branches'),
  getEmployees: () => api.get('/reports/employees'),
  getQrActivity: (params) => api.get('/reports/qr-activity', { params }),
  getStorage: () => api.get('/reports/storage'),
  getSecurity: () => api.get('/reports/security'),
  exportUrl: (type, params = {}) => {
    const qs = new URLSearchParams(params).toString();
    const base = api.defaults.baseURL || 'http://localhost:5000/api';
    return `${base}/reports/export/${type}${qs ? `?${qs}` : ''}`;
  },
};

export const auditLogService = {
  getAll: (params) => api.get('/audit-logs', { params }),
  getById: (id) => api.get(`/audit-logs/${id}`),
  exportUrl: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    const base = api.defaults.baseURL || 'http://localhost:5000/api';
    return `${base}/audit-logs/export${qs ? `?${qs}` : ''}`;
  },
};

export const backupService = {
  getAll: () => api.get('/backups'),
  create: (data) => api.post('/backups/create', data),
  delete: (id) => api.delete(`/backups/${id}`),
  downloadUrl: (id) => `${api.defaults.baseURL || 'http://localhost:5000/api'}/backups/${id}/download`,
};

export const storageService = {
  getOverview: () => api.get('/storage/overview'),
  getOrphanFiles: () => api.get('/storage/orphan-files'),
  cleanupTemp: () => api.post('/storage/cleanup-temp'),
};

export const qrTokenService = {
  getAll: (params) => api.get('/qr-tokens', { params }),
  getById: (id) => api.get(`/qr-tokens/${id}`),
  revoke: (id) => api.patch(`/qr-tokens/${id}/revoke`),
  activate: (id) => api.patch(`/qr-tokens/${id}/activate`),
};

export const activityService = {
  getSystemActivity: () => api.get('/activity'),
};
