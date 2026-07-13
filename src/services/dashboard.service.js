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
